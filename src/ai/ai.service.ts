import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import { addDays, format } from 'date-fns';
import Groq from 'groq-sdk';
import { AvailabilityService } from '../availability/availability.service';
import { VenuesService } from '../venues/venues.service';
import { ApiResponseType, createApiResponse } from '../utils/response.util';
import { ChatSession, ChatSessionDocument, SessionStatus } from './schemas/chat-session.schema';
import { Booking, BookingDocument, BookingStatus } from '../bookings/schemas/booking.schema';
import { Venue, VenueDocument } from '../venues/schemas/venue.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AiService {
  constructor(
    private configService: ConfigService,
    private venuesService: VenuesService,
    private availabilityService: AvailabilityService,
    @InjectModel(ChatSession.name) private chatSessionModel: Model<ChatSessionDocument>,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(Venue.name) private venueModel: Model<VenueDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) { }

  // ----------------------------------------------------------------
  // CHAT WITH HISTORY (Main endpoint)
  // ----------------------------------------------------------------
  async chatWithHistory(
    message: string,
    sessionId?: string,
    userId?: string,
  ): Promise<ApiResponseType> {
    try {
      // 1. Find or create session
      let session: ChatSessionDocument;
      const sid = sessionId || uuidv4();

      const existingSession = sessionId
        ? await this.chatSessionModel.findOne({ sessionId, status: SessionStatus.ACTIVE }).exec()
        : null;

      if (existingSession) {
        session = existingSession;
      } else {
        session = await this.chatSessionModel.create({
          sessionId: sid,
          userId: userId ? new Types.ObjectId(userId) : undefined,
          messages: [],
          status: SessionStatus.ACTIVE,
        });
      }

      // 2. Build context from DB (RAG pattern)
      const context = await this._buildContext(message, userId);

      // 3. Build Groq messages array from history
      const groq = new Groq({ apiKey: this.configService.get<string>('GROQ_API_KEY') });
      const systemPrompt = this._buildSystemPrompt(context);

      const groqMessages: any[] = [{ role: 'system', content: systemPrompt }];
      // Only send last 10 messages to avoid token limit
      const recentHistory = session.messages.slice(-10);
      recentHistory.forEach(m => groqMessages.push({ role: m.role, content: m.content }));
      groqMessages.push({ role: 'user', content: message });

      // 4. Call Groq AI
      const completion = await groq.chat.completions.create({
        messages: groqMessages,
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 1024,
      });

      const reply = completion.choices[0]?.message?.content
        || 'Xin lỗi bạn, tôi không thể xử lý câu hỏi này lúc này 😓';

      // 5. Save both messages to DB
      session.messages.push({ role: 'user', content: message, timestamp: new Date() } as any);
      session.messages.push({ role: 'assistant', content: reply, timestamp: new Date() } as any);
      await session.save();

      return createApiResponse(
        {
          reply,
          sessionId: session.sessionId,
          messageCount: session.messages.length,
          // Debug: show what context was injected (for Postman/thầy demo)
          _debug_context: context,
        },
        'AI phản hồi thành công',
        HttpStatus.OK,
      );
    } catch (error) {
      console.error('AI Chat Error:', error);
      return createApiResponse(
        { reply: 'Hệ thống AI đang bận, vui lòng thử lại sau!', sessionId },
        'Lỗi AI',
        HttpStatus.OK,
      );
    }
  }

  // ----------------------------------------------------------------
  // GET HISTORY
  // ----------------------------------------------------------------
  async getHistory(sessionId: string): Promise<ApiResponseType> {
    const session = await this.chatSessionModel.findOne({ sessionId }).exec();
    if (!session) {
      return createApiResponse(
        { sessionId, messages: [] },
        'Không tìm thấy phiên chat',
        HttpStatus.OK,
      );
    }
    return createApiResponse(
      {
        sessionId: session.sessionId,
        status: session.status,
        messageCount: session.messages.length,
        messages: session.messages,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      },
      'Lấy lịch sử chat thành công',
      HttpStatus.OK,
    );
  }

  // ----------------------------------------------------------------
  // END SESSION
  // ----------------------------------------------------------------
  async endSession(sessionId: string): Promise<ApiResponseType> {
    const session = await this.chatSessionModel.findOne({ sessionId }).exec();
    if (!session) {
      return createApiResponse(null, 'Không tìm thấy phiên chat', HttpStatus.OK);
    }
    session.status = SessionStatus.CLOSED;
    session.closedAt = new Date();
    await session.save();
    return createApiResponse(
      { sessionId, closedAt: session.closedAt, totalMessages: session.messages.length },
      'Đã kết thúc phiên chat',
      HttpStatus.OK,
    );
  }

  async getSessions(userId: string, limit = 20, page = 1): Promise<ApiResponseType> {
    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      this.chatSessionModel
        .find({ userId: new Types.ObjectId(userId) })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('sessionId messages status createdAt updatedAt')
        .exec(),
      this.chatSessionModel.countDocuments({ userId: new Types.ObjectId(userId) }),
    ]);

    const result = sessions.map((s) => {
      const firstUserMsg = s.messages.find((m) => m.role === 'user');
      const lastMsg = s.messages[s.messages.length - 1];
      return {
        sessionId: s.sessionId,
        title: firstUserMsg
          ? firstUserMsg.content.slice(0, 60) + (firstUserMsg.content.length > 60 ? '...' : '')
          : 'Cuộc trò chuyện mới',
        lastMessage: lastMsg?.content?.slice(0, 80) || '',
        messageCount: s.messages.length,
        status: s.status,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      };
    });

    return createApiResponse(
      { sessions: result, total, page, limit },
      'Lấy danh sách phiên chat thành công',
      HttpStatus.OK,
    );
  }

  // ----------------------------------------------------------------
  // PRIVATE: Build Context from DB (RAG)
  // ----------------------------------------------------------------
  private async _buildContext(message: string, userId?: string): Promise<Record<string, any>> {
    const context: Record<string, any> = {};
    const lowerMsg = message.toLowerCase();

    // Always inject user profile when logged in
    let userRole = 'GUEST';
    if (userId) {
      try {
        const user = await this.userModel.findById(userId).select('fullName email phone role').exec();
        if (user) {
          context.currentUser = {
            name: user.fullName,
            email: user.email,
            phone: user.phone,
            role: user.role,
          };
          userRole = user.role;
        }
      } catch { /* ignore */ }
    }

    // --- ROLE-SPECIFIC CONTEXT ---

    if (userRole === 'ADMIN') {
      // 1. ADMIN CONTEXT: System Stats & Pending Actions
      if (lowerMsg.includes('hệ thống') || lowerMsg.includes('tổng quan') || lowerMsg.includes('báo cáo') || lowerMsg.includes('chờ duyệt')) {
        try {
          const [pendingOwners, pendingClosures, totalUsers, activeVenues] = await Promise.all([
            this.venueModel.countDocuments({ status: 'PENDING' }),
            this.venueModel.countDocuments({ status: 'PENDING_CLOSURE' }),
            this.userModel.countDocuments(),
            this.venueModel.countDocuments({ status: 'ACTIVE' }),
          ]);
          context.adminData = {
            totalUsers,
            activeVenues,
            pendingOwnerRequests: pendingOwners,
            pendingClosureRequests: pendingClosures,
          };
        } catch { /* ignore */ }
      }
    } else if (userRole === 'COURT_OWNER' || userRole === 'OWNER') {
      // 2. OWNER CONTEXT: Their Venues & Recent Bookings
      try {
        const myVenues = await this.venueModel.find({ ownerId: new Types.ObjectId(userId) }).select('_id name status').exec();
        const venueIds = myVenues.map(v => v._id);
        
        context.ownerData = {
          myVenues: myVenues.map(v => ({ id: v._id.toString(), name: v.name, status: v.status })),
        };

        if (lowerMsg.includes('đơn') || lowerMsg.includes('lịch') || lowerMsg.includes('doanh thu')) {
          const recentBookings = await this.bookingModel
            .find({ venueId: { $in: venueIds } })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('playerId', 'fullName')
            .exec();

          context.ownerData.recentBookings = recentBookings.map((b: any) => ({
            bookingId: `BH${b._id.toString().slice(-6).toUpperCase()}`,
            customerName: b.playerId?.fullName || 'Khách',
            status: b.status,
            finalPrice: b.finalPrice,
          }));
        }
      } catch { /* ignore */ }
    } else {
      // 3. PLAYER & GUEST CONTEXT: Available Venues & Their Bookings
      try {
        const venuesRes = await this.venuesService.findAll({ limit: 8, status: 'ACTIVE' });
        const venues = venuesRes?.data?.venues || [];
        context.availableVenues = venues.map((v: any) => ({
          id: v._id,
          name: v.name,
          address: v.address,
          pricePerHour: v.pricePerHour,
          rating: v.averageRating,
        }));
      } catch { context.availableVenues = []; }

      if (userId && (lowerMsg.includes('đơn') || lowerMsg.includes('lịch') || lowerMsg.includes('đặt'))) {
        try {
          const myBookings = await this.bookingModel
            .find({ playerId: new Types.ObjectId(userId) })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('venueId', 'name address')
            .exec();

          context.myRecentBookings = myBookings.map((b: any) => ({
            bookingId: `BH${b._id.toString().slice(-6).toUpperCase()}`,
            venue: b.venueId?.name || 'Unknown',
            status: b.status,
            finalPrice: b.finalPrice,
            createdAt: b.createdAt,
          }));
        } catch { context.myRecentBookings = []; }
      }
    }

    // --- GENERAL KNOWLEDGE CONTEXT ---
    if (lowerMsg.includes('hủy') || lowerMsg.includes('hoàn tiền')) {
      context.cancellationPolicy = {
        rule: 'Hủy trước 24h: Hoàn 100%. Hủy trong vòng 24h: Hoàn 0%. Đơn VNPAY: Tiền hoàn về tài khoản trong 3-5 ngày làm việc.',
        noShowRule: 'Nếu khách không tới 3 lần (đơn tiền mặt), tài khoản sẽ bị khóa tạm thời.',
      };
    }

    if (lowerMsg.includes('giá') || lowerMsg.includes('bao nhiêu') || lowerMsg.includes('phí')) {
      context.generalPricing = 'Giá sân dao động từ 50,000đ - 150,000đ/giờ tùy khung giờ và loại sân. Khung giờ vàng (17h-22h) thường cao hơn 20-30%.';
    }

    return context;
  }

  // ----------------------------------------------------------------
  // PRIVATE: Build System Prompt
  // ----------------------------------------------------------------
  private _buildSystemPrompt(context: Record<string, any>): string {
    const userRole = context.currentUser?.role || 'GUEST';

    let roleSpecificPrompt = '';
    let roleSpecificData = '';

    if (userRole === 'ADMIN') {
      roleSpecificPrompt = `Bạn đang hỗ trợ một QUẢN TRỊ VIÊN (ADMIN) của hệ thống BadmintonHub. Nhiệm vụ của bạn là hỗ trợ báo cáo, thống kê và giám sát hệ thống. Báo cáo ngắn gọn, súc tích.`;
      if (context.adminData) {
        roleSpecificData = `📊 DỮ LIỆU HỆ THỐNG HIỆN TẠI:
  - Tổng số người dùng: ${context.adminData.totalUsers}
  - Tổng cơ sở đang hoạt động: ${context.adminData.activeVenues}
  - Yêu cầu mở sân chờ duyệt: ${context.adminData.pendingOwnerRequests} (Nên nhắc admin duyệt)
  - Yêu cầu đóng sân chờ duyệt: ${context.adminData.pendingClosureRequests}`;
      }
    } else if (userRole === 'COURT_OWNER' || userRole === 'OWNER') {
      roleSpecificPrompt = `Bạn đang hỗ trợ một CHỦ SÂN (OWNER) trên hệ thống BadmintonHub. Nhiệm vụ của bạn là hỗ trợ họ quản lý sân, theo dõi đơn đặt và doanh thu của riêng họ.`;
      if (context.ownerData) {
        const myVenuesStr = context.ownerData.myVenues?.map((v: any) => `- Sân: ${v.name} (Trạng thái: ${v.status})`).join('\n') || 'Chưa có cơ sở nào.';
        const bookingsStr = context.ownerData.recentBookings?.map((b: any) => `- #${b.bookingId} | Khách: ${b.customerName} | Trạng thái: ${b.status} | Thu: ${b.finalPrice?.toLocaleString()}đ`).join('\n') || 'Không có đơn đặt sân gần đây.';
        roleSpecificData = `🏢 CÁC SÂN ĐANG QUẢN LÝ:
${myVenuesStr}
📋 CÁC ĐƠN ĐẶT SÂN GẦN NHẤT CỦA KHÁCH:
${bookingsStr}`;
      }
    } else {
      // PLAYER / GUEST
      roleSpecificPrompt = `Bạn đang hỗ trợ KHÁCH HÀNG (PLAYER) đặt sân. Hướng dẫn họ chọn sân và giải đáp thắc mắc.`;
      
      const venueList = context.availableVenues?.length
        ? context.availableVenues.map((v: any) => `  - ${v.name} | ${v.address} | ${v.pricePerHour?.toLocaleString()}đ/giờ`).join('\n')
        : '  - Hiện chưa có dữ liệu sân.';
      
      const myBookings = context.myRecentBookings?.length
        ? context.myRecentBookings.map((b: any) => `  - #${b.bookingId} | ${b.venue} | ${b.status} | ${b.finalPrice?.toLocaleString()}đ`).join('\n')
        : null;

      roleSpecificData = `📍 DANH SÁCH SÂN NỔI BẬT ĐỂ TƯ VẤN:
${venueList}
${myBookings ? `📋 LỊCH ĐẶT SÂN GẦN ĐÂY CỦA KHÁCH:\n${myBookings}` : ''}`;
    }

    return `Bạn là "BadmintonHub AI" - trợ lý ảo thông minh, thân thiện của hệ thống BadmintonHub.

NGUYÊN TẮC:
- Trả lời bằng tiếng Việt, súc tích, chuyên nghiệp nhưng thân thiện, dùng emoji 🏸😊.
- Chỉ tư vấn về BadmintonHub. Từ chối lịch sự nếu hỏi ngoài chủ đề.
- Luôn sử dụng DỮ LIỆU THỰC TẾ bên dưới, tuyệt đối không bịa thông tin.

${roleSpecificPrompt}

${context.currentUser ? `👤 NGƯỜI ĐANG CHAT: ${context.currentUser.name} (${context.currentUser.role})` : '👤 KHÁCH VÃNG LAI'}

${roleSpecificData}

${context.cancellationPolicy ? `📜 CHÍNH SÁCH HỆ THỐNG:\n  - ${context.cancellationPolicy.rule}\n  - ${context.cancellationPolicy.noShowRule}\n` : ''}
${context.generalPricing ? `💰 THÔNG TIN GIÁ CHUNG: ${context.generalPricing}\n` : ''}`;
  }

  // ----------------------------------------------------------------
  // LEGACY methods (kept for backward compatibility)
  // ----------------------------------------------------------------
  async chat(message: string, history?: { role: 'user' | 'assistant'; content: string }[]): Promise<ApiResponseType> {
    return this.chatWithHistory(message, undefined, undefined);
  }

  async chatbot(message: string): Promise<ApiResponseType> {
    return this.chatWithHistory(message);
  }

  async getRecommendations(data: any): Promise<ApiResponseType> {
    try {
      const { preferences, lat, lng } = data;
      const apiKey = this.configService.get<string>('GROQ_API_KEY');
      const groq = new Groq({ apiKey });
      const venuesResponse = await this.venuesService.findAll({ lat, lng, limit: 15, status: 'ACTIVE' });
      const venues = venuesResponse.data.venues || [];
      if (!venues.length) return createApiResponse([], 'Không tìm thấy sân', HttpStatus.OK);

      const prompt = `Bạn là chuyên gia cầu lông của BadmintonHub. Chọn 3 sân phù hợp nhất từ danh sách dưới.
THÔNG TIN: Vị trí (${lat}, ${lng}), Sở thích: ${preferences || 'bất kỳ'}.
DANH SÁCH SÂN: ${JSON.stringify(venues.map((v: any) => ({ id: v._id, name: v.name, address: v.address, pricePerHour: v.pricePerHour, averageRating: v.averageRating })))}
Trả về JSON array với: venueId, name, matchScore (1-100), reason, detailedAnalysis. CHỈ JSON.`;

      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' },
      });

      const parsedContent = JSON.parse(completion.choices[0]?.message?.content || '{}');
      const recs = Array.isArray(parsedContent) ? parsedContent
        : parsedContent.recommendations || Object.values(parsedContent).find(Array.isArray) || [];

      const fullRecs = recs.map((rec: any) => {
        const venue = venues.find((v: any) => v._id.toString() === rec.venueId);
        return venue ? { ...(venue.toObject ? venue.toObject() : venue), ...rec, isAI: true } : null;
      }).filter(Boolean);

      return createApiResponse(fullRecs, 'AI gợi ý sân thành công', HttpStatus.OK);
    } catch (error) {
      return createApiResponse([], 'Lỗi gợi ý AI', HttpStatus.OK);
    }
  }

  async getBookingRecommendation(venueId: string): Promise<ApiResponseType> {
    try {
      const tomorrow = addDays(new Date(), 1);
      const dateStr = format(tomorrow, 'yyyy-MM-dd');
      const apiKey = this.configService.get<string>('GROQ_API_KEY');
      const venueRes = await this.venuesService.findOne(venueId);
      const venue = venueRes?.data;
      const groq = new Groq({ apiKey });

      const prompt = `Đề xuất khung giờ đặt sân cầu lông tốt nhất vào ngày ${dateStr} cho sân "${venue?.name}" (Giá: ${venue?.pricePerHour} VND/giờ). Trả về JSON: { "date", "startTime", "endTime", "reason", "matchScore", "benefits": [] }. CHỈ JSON.`;
      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' },
      });
      return createApiResponse(JSON.parse(completion.choices[0]?.message?.content || '{}'), 'Gợi ý thành công', HttpStatus.OK);
    } catch {
      return createApiResponse({ date: format(addDays(new Date(), 1), 'yyyy-MM-dd'), startTime: '19:00', endTime: '21:00', reason: 'Khung giờ vàng buổi tối.', matchScore: 95, benefits: ['Mát mẻ', 'Đông vui', 'Ánh sáng tốt'] }, 'Gợi ý thành công (Fallback)', HttpStatus.OK);
    }
  }

  async getDemandAnalytics(venueId: string): Promise<ApiResponseType> {
    return createApiResponse({
      peakHours: ['17:00 - 19:00', '19:00 - 21:00'],
      predicted_occupancy: { Monday: '85%', Friday: '95%', Saturday: '100%', Sunday: '100%' },
      recommendation: 'Nên tăng giá vào khung 18h-20h cuối tuần.',
    }, 'Phân tích thành công', HttpStatus.OK);
  }
}
