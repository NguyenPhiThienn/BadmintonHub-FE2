import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { addDays, format } from 'date-fns';
import Groq from 'groq-sdk';
import { AvailabilityService } from '../availability/availability.service';
import { ApiResponseType, createApiResponse } from '../utils/response.util';
import { VenuesService } from '../venues/venues.service';

@Injectable()
export class AiService {
  constructor(
    private configService: ConfigService,
    private venuesService: VenuesService,
    private availabilityService: AvailabilityService,
  ) { }

  async getBookingRecommendation(venueId: string): Promise<ApiResponseType> {
    try {
      const tomorrow = addDays(new Date(), 1);
      const dateStr = format(tomorrow, 'yyyy-MM-dd');

      const apiKey = this.configService.get<string>('GROQ_API_KEY');

      if (!apiKey) {
        throw new Error('GROQ_API_KEY is missing');
      }

      // 1. Fetch Venue Info
      const venueRes = await this.venuesService.findOne(venueId);
      const venue = venueRes?.data;

      if (!venue) {
        throw new Error('Venue not found');
      }

      // 2. Call Groq
      const groq = new Groq({ apiKey });
      const prompt = `
        Bạn là một chuyên gia về cầu lông và trợ lý AI thông minh của ứng dụng BadmintonHub.
        Hãy đề xuất một khung giờ đặt sân tuyệt vời nhất vào ngày mai (${dateStr}) cho sân "${venue.name}" (Địa chỉ: ${venue.address}, Giá tham khảo: ${venue.pricePerHour} VND/giờ).
        Sân hiện có ${venue.available} sân trống.
        Đánh giá của sân: ${venue.averageRating} sao.

        Yêu cầu:
        1. Trả về JSON với định dạng sau:
        {
          "date": "${dateStr}",
          "startTime": "HH:00",
          "endTime": "HH:00",
          "reason": "Giải thích RẤT CHI TIẾT (khoảng 3-4 câu) tại sao khung giờ này lại tuyệt vời. Phân tích về thời tiết, không khí sân, trải nghiệm chơi cầu lông.",
          "matchScore": Điểm từ 90 đến 99,
          "benefits": [
            "Lợi ích 1 (rất chi tiết, phân tích rõ ràng, khoảng 15-20 chữ)",
            "Lợi ích 2 (rất chi tiết, phân tích rõ ràng, khoảng 15-20 chữ)",
            "Lợi ích 3 (rất chi tiết, phân tích rõ ràng, khoảng 15-20 chữ)"
          ]
        }
        2. Thời gian bắt đầu (startTime) và kết thúc (endTime) phải cách nhau đúng 1 hoặc 2 tiếng. (VD: 18:00 - 20:00).
        3. Văn phong chuyên nghiệp, thu hút, tạo cảm hứng cho người chơi.
        4. CHỈ TRẢ VỀ JSON, KHÔNG CÓ TEXT NÀO KHÁC.
      `;

      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" }
      });

      const content = chatCompletion.choices[0]?.message?.content;
      if (!content) throw new Error('Empty response from Groq');

      const recommendation = JSON.parse(content);

      return createApiResponse(recommendation, 'AI đề xuất khung giờ đặt sân thành công', HttpStatus.OK);
    } catch (error) {
      console.error('AI Booking Recommendation Error:', error);

      // Fallback
      const tomorrow = addDays(new Date(), 1);
      const dateStr = format(tomorrow, 'yyyy-MM-dd');
      return createApiResponse({
        date: dateStr,
        startTime: '19:00',
        endTime: '21:00',
        reason: 'Khung giờ vàng 19:00 - 21:00 luôn là sự lựa chọn hàng đầu của các lông thủ. Sau một ngày làm việc và học tập, đây là lúc cơ thể cần được vận động để giải tỏa căng thẳng. Không khí tại sân lúc này cực kỳ nhộn nhịp, hệ thống đèn chiếu sáng được bật tối đa để đảm bảo chất lượng trận đấu.',
        matchScore: 98,
        benefits: [
          'Thời tiết buổi tối vô cùng mát mẻ, không còn cái nóng oi bức, giúp bạn duy trì thể lực lâu hơn trên sân.',
          'Sân đông vui, nhộn nhịp, tạo cảm hứng thi đấu cực lớn và dễ dàng tìm kiếm đối tác giao lưu trình độ cao.',
          'Ánh sáng nhân tạo hoạt động 100% công suất mang lại tầm nhìn hoàn hảo nhất cho các pha cầu nhanh và đập cầu.'
        ]
      }, 'AI đề xuất khung giờ đặt sân thành công (Mock)', HttpStatus.OK);
    }
  }

  async getRecommendations(data: any): Promise<ApiResponseType> {
    try {
      const { preferences, lat, lng } = data;
      const apiKey = this.configService.get<string>('GROQ_API_KEY');

      if (!apiKey) {
        console.error('AI Recommendation Error: GROQ_API_KEY is missing');
        return this.getMockRecommendations();
      }

      const groq = new Groq({ apiKey });
      const venuesResponse = await this.venuesService.findAll({
        lat,
        lng,
        limit: 15,
        status: 'ACTIVE'
      });

      const venues = venuesResponse.data.venues;

      if (!venues || venues.length === 0) {
        console.log('AI Recommendation: No active venues found in DB');
        return createApiResponse([], 'Không tìm thấy sân nào để gợi ý', HttpStatus.OK);
      }

      console.log(`AI Recommendation: Analyzing ${venues.length} venues via Groq...`);

      const prompt = `
        Bạn là một chuyên gia về cầu lông và trợ lý AI của ứng dụng BadmintonHub.
        Dựa trên thông tin người dùng và danh sách các sân dưới đây, hãy chọn ra 3 sân phù hợp nhất và đưa ra phân tích chi tiết.

        THÔNG TIN NGƯỜI DÙNG:
        - Vị trí hiện tại (lat, lng): ${lat}, ${lng}
        - Sở thích: ${preferences || 'Không có sở thích cụ thể'}

        DANH SÁCH CÁC SÂN HIỆN CÓ (Dữ liệu thật):
        ${JSON.stringify(venues.map(v => ({
        id: v._id,
        name: v.name,
        address: v.address,
        pricePerHour: v.pricePerHour,
        description: v.description,
        averageRating: v.averageRating,
        distance: v.distance
      })), null, 2)}

        YÊU CẦU QUAN TRỌNG:
        1. Trả về kết quả dưới dạng JSON array.
        2. Mỗi phần tử phải có:
           - venueId: BẮT BUỘC phải là giá trị "id" từ danh sách sân ở trên. KHÔNG ĐƯỢC TỰ TẠO ID MỚI.
           - name: Tên sân tương ứng.
           - matchScore: Điểm phù hợp (1-100).
           - reason: Lý do tóm tắt (ngắn gọn).
           - detailedAnalysis: Phân tích chi tiết (2-3 câu).
        3. CHỈ TRẢ VỀ JSON, KHÔNG CÓ TEXT GIẢI THÍCH NÀO KHÁC.
      `;

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" }
      });

      const content = chatCompletion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Groq response content is empty');
      }

      let recommendations;
      const parsedContent = JSON.parse(content);

      // Normalize response format
      if (Array.isArray(parsedContent)) {
        recommendations = parsedContent;
      } else if (parsedContent.recommendations) {
        recommendations = parsedContent.recommendations;
      } else {
        const firstArrayKey = Object.keys(parsedContent).find(key => Array.isArray(parsedContent[key]));
        recommendations = firstArrayKey ? parsedContent[firstArrayKey] : [parsedContent];
      }

      console.log('AI Recommendation: Successfully generated recommendations via Groq');

      // Map AI recommendations to full venue data
      const fullRecommendations = recommendations.map(rec => {
        const venue = venues.find(v => v._id.toString() === rec.venueId);
        if (venue) {
          // Merge venue data with AI analysis
          return {
            ...venue.toObject ? venue.toObject() : venue,
            matchScore: rec.matchScore,
            reason: rec.reason,
            detailedAnalysis: rec.detailedAnalysis,
            isAI: true
          };
        }
        return null;
      }).filter(Boolean);

      return createApiResponse(fullRecommendations, 'AI gợi ý sân thành công', HttpStatus.OK);
    } catch (error) {
      console.error('Groq Recommendation Error Detail:', error);
      return this.getMockRecommendations();
    }
  }

  private getMockRecommendations() {
    const recommendations = [
      {
        venueId: 'sample-id-1',
        name: 'Sân Cầu Lông Ngôi Sao',
        reason: 'Gần vị trí của bạn và có giá tốt vào buổi sáng.',
        matchScore: 95,
        detailedAnalysis: 'Sân Ngôi Sao nằm rất gần vị trí hiện tại của bạn, giúp tiết kiệm thời gian di chuyển. Ngoài ra, mức giá buổi sáng cực kỳ cạnh tranh, phù hợp với tiêu chí giá rẻ.'
      },
      {
        venueId: 'sample-id-2',
        name: 'Badminton Hub Quận 7',
        reason: 'Phù hợp với sở thích sân thảm gỗ của bạn.',
        matchScore: 88,
        detailedAnalysis: 'Dựa trên sở thích chơi trên thảm gỗ của bạn, đây là lựa chọn hàng đầu. Sân có chất lượng cơ sở vật chất 5 sao và được cộng đồng đánh giá rất cao.'
      }
    ];
    return createApiResponse(recommendations, 'AI gợi ý sân thành công (Mock)', HttpStatus.OK);
  }

  async getDemandAnalytics(venueId: string): Promise<ApiResponseType> {
    const analytics = {
      peakHours: ['17:00 - 19:00', '19:00 - 21:00'],
      predicted_occupancy: {
        'Monday': '85%',
        'Tuesday': '70%',
        'Wednesday': '90%',
        'Thursday': '75%',
        'Friday': '95%',
        'Saturday': '100%',
        'Sunday': '100%'
      },
      recommendation: 'Bạn nên tăng giá vào khung giờ 18h-20h các ngày cuối tuần.'
    };

    return createApiResponse(analytics, 'Phân tích nhu cầu thành công', HttpStatus.OK);
  }

  async chatbot(message: string): Promise<ApiResponseType> {
    let response = 'Chào bạn! Tôi có thể giúp gì cho bạn về việc đặt sân cầu lông hôm nay?';

    if (message.toLowerCase().includes('giá')) {
      response = 'Giá sân dao động từ 50k - 150k tùy khung giờ và loại sân. Bạn muốn xem bảng giá của cơ sở nào?';
    } else if (message.toLowerCase().includes('đặt sân')) {
      response = 'Để đặt sân, bạn hãy chọn cơ sở yêu thích, chọn khung giờ trống và tiến hành thanh toán nhé.';
    }

    return createApiResponse({ reply: response }, 'Chatbot phản hồi thành công', HttpStatus.OK);
  }

  async chat(message: string, history?: { role: 'user' | 'assistant'; content: string }[]): Promise<ApiResponseType> {
    try {
      const apiKey = this.configService.get<string>('GROQ_API_KEY');
      if (!apiKey) {
        throw new Error('GROQ_API_KEY is missing');
      }

      // 1. Fetch some active venues to provide in the system prompt for context
      let venuesContext = '';
      try {
        const venuesRes = await this.venuesService.findAll({ limit: 10, status: 'ACTIVE' });
        const venues = venuesRes?.data?.venues || [];
        if (venues.length > 0) {
          venuesContext = venues.map((v: any) => `- Tên sân: ${v.name}, Địa chỉ: ${v.address}, Giá: ${v.pricePerHour} VND/giờ, Đánh giá: ${v.averageRating || 'chưa có'} sao.`).join('\n');
        }
      } catch (err) {
        console.error('Failed to fetch venues for AI context:', err);
      }

      const groq = new Groq({ apiKey });
      
      const systemPrompt = `
        Bạn là "BadmintonHub AI Assistant" (Trợ lý AI của BadmintonHub) - một trợ lý ảo thông minh, lịch sự, nhiệt tình và cực kỳ am hiểu về bộ môn cầu lông cũng như dịch vụ của hệ thống đặt sân BadmintonHub.
        
        Nhiệm vụ chính của bạn:
        1. Hướng dẫn và tư vấn người dùng chọn và đặt sân cầu lông phù hợp trên hệ thống BadmintonHub.
        2. Giải đáp thắc mắc về cầu lông (kỹ thuật chơi, luật thi đấu, cách chọn vợt, giày, v.v.).
        3. Cung cấp thông tin thực tế về các sân nổi bật trong hệ thống dựa trên dữ liệu dưới đây (nếu người dùng hỏi về sân hoặc địa điểm cụ thể).
        
        Dữ liệu các sân nổi bật hiện tại của hệ thống:
        ${venuesContext || '- Hiện tại hệ thống của chúng tôi sở hữu rất nhiều sân cầu lông thảm chất lượng cao, đầy đủ tiện nghi.'}
        
        Quy tắc ứng xử và phong cách trả lời:
        - Luôn sử dụng tiếng Việt tự nhiên, thân thiện, lịch sự và tràn đầy năng lượng.
        - Có thể sử dụng biểu tượng cảm xúc (emoji) phù hợp như 🏸, 😊, 🚀, ⭐️ để tăng độ sinh động.
        - Trả lời ngắn gọn, rõ ràng, trực quan, đi thẳng vào câu hỏi của người dùng. Tránh lan man dài dòng.
        - Nếu câu hỏi nằm ngoài chủ đề cầu lông hoặc đặt sân, hãy khéo léo từ chối và hướng người dùng quay trở lại chủ đề chính (ví dụ: "Tôi là trợ lý AI chuyên về cầu lông, tôi có thể giúp gì cho bạn về đặt sân hôm nay không?").
        - Khuyến khích người dùng thực hiện đặt sân trực tiếp trên website BadmintonHub để được giữ chỗ và hưởng ưu đãi.
      `;

      const messages: any[] = [{ role: 'system', content: systemPrompt }];
      
      // Add conversation history if available
      if (history && history.length > 0) {
        const recentHistory = history.slice(-8); // Keep last 8 messages for context to avoid token bloat
        recentHistory.forEach(h => {
          messages.push({ role: h.role, content: h.content });
        });
      }

      // Add current user message
      messages.push({ role: 'user', content: message });

      const chatCompletion = await groq.chat.completions.create({
        messages,
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 1024,
      });

      const reply = chatCompletion.choices[0]?.message?.content || 'Xin lỗi bạn, tôi không thể xử lý câu hỏi này lúc này. Bạn vui lòng thử lại nhé!';
      
      return createApiResponse({ reply }, 'Phản hồi từ AI thành công', HttpStatus.OK);
    } catch (error: any) {
      console.error('AI Chat Error:', error);
      
      // Fallback response in case API key is missing or error occurs
      let fallbackReply = 'Chào bạn! Tôi là trợ lý AI của BadmintonHub. Hiện tại hệ thống AI đang nâng cấp, tôi có thể tư vấn nhanh cho bạn:\\n- Để đặt sân: Vui lòng truy cập trang Sân Cầu Lông, chọn sân, chọn khung giờ trống và thanh toán.\\n- Bảng giá sân: Thường dao động từ 50,000 VND đến 150,000 VND/giờ tùy theo khung giờ tháp/vàng.\\n- Bạn cần tôi hỗ trợ tìm sân hay luật chơi cầu lông nào khác không?';
      
      if (message.toLowerCase().includes('giá')) {
        fallbackReply = 'Dạ, giá thuê sân của hệ thống BadmintonHub dao động từ 50,000đ - 150,000đ/giờ tùy theo khung giờ (buổi sáng/buổi tối) và loại sân thảm. Bạn muốn xem chi tiết giá của cơ sở nào ạ?';
      } else if (message.toLowerCase().includes('đặt sân') || message.toLowerCase().includes('book')) {
        fallbackReply = 'Để đặt sân nhanh nhất, bạn hãy chọn mục "Sân Cầu Lông" trên trang chủ, chọn cơ sở bạn muốn chơi, chọn ngày/khung giờ còn trống và tiến hành thanh toán là hoàn tất ạ! 🏸';
      }
      
      return createApiResponse({ reply: fallbackReply }, 'Phản hồi từ AI thành công (Fallback)', HttpStatus.OK);
    }
  }
}
