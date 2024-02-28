import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Booking, BookingDocument, BookingStatus } from './schemas/booking.schema';
import { BookingDetail, BookingDetailDocument } from './schemas/booking-detail.schema';
import { Court, CourtDocument } from '../courts/schemas/court.schema';
import { Venue, VenueDocument } from '../venues/schemas/venue.schema';
import { Pricing, PricingDocument } from '../pricings/schemas/pricing.schema';
import { Promotion, PromotionDocument } from '../promotions/schemas/promotion.schema';
import { CourtUnavailableTime, CourtUnavailableTimeDocument } from '../courts/schemas/court-unavailable-time.schema';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';
import { Payment, PaymentDocument } from '../payments/schemas/payment.schema';
import { ApiResponseType, createApiResponse } from '../utils/response.util';
import { CreateBookingDto, UpdateBookingStatusDto } from './dto/booking.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(BookingDetail.name) private bookingDetailModel: Model<BookingDetailDocument>,
    @InjectModel(Court.name) private courtModel: Model<CourtDocument>,
    @InjectModel(Venue.name) private venueModel: Model<VenueDocument>,
    @InjectModel(Pricing.name) private pricingModel: Model<PricingDocument>,
    @InjectModel(Promotion.name) private promotionModel: Model<PromotionDocument>,
    @InjectModel(CourtUnavailableTime.name) private unavailableTimeModel: Model<CourtUnavailableTimeDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    private mailService: MailService,
  ) { }

  async create(playerId: string, dto: CreateBookingDto): Promise<ApiResponseType> {
    const { venueId, promotionId, details, note, isWeekly, customerName, customerPhone, customerEmail } = dto;

    // Check if player is blocked
    if (playerId) {
      const player = await this.userModel.findById(playerId).exec();
      if (player && player.status === 'BLOCKED') {
        throw new HttpException(
          {
            message: 'Tài khoản của bạn đã bị khóa. Không thể đặt sân.',
            blockedReason: player.blockedReason || 'Không có lý do được cung cấp',
          },
          HttpStatus.FORBIDDEN,
        );
      }
    }

    // 1. Validate Venue
    if (!Types.ObjectId.isValid(venueId)) {
      throw new HttpException('ID cơ sở không hợp lệ', HttpStatus.BAD_REQUEST);
    }
    const venue = await this.venueModel.findById(venueId).exec();
    if (!venue) {
      throw new HttpException('Không tìm thấy cơ sở', HttpStatus.NOT_FOUND);
    }

    let totalPrice = 0;
    const processedDetails = [];

    // 2. Validate Details & Calculate Price
    for (const detail of details) {
      if (!Types.ObjectId.isValid(detail.courtId)) {
        throw new HttpException(`ID sân ${detail.courtId} không hợp lệ`, HttpStatus.BAD_REQUEST);
      }

      const court = await this.courtModel.findById(detail.courtId).exec();
      if (!court || court.venueId.toString() !== venueId) {
        throw new HttpException(`Sân ${detail.courtId} không thuộc cơ sở này`, HttpStatus.BAD_REQUEST);
      }

      const checkDate = new Date(detail.bookingDate);
      checkDate.setUTCHours(0, 0, 0, 0);
      const checkDateEnd = new Date(detail.bookingDate);
      checkDateEnd.setUTCHours(23, 59, 59, 999);

      const existingBookings = await this.bookingDetailModel.find({
        courtId: detail.courtId,
      }).populate('bookingId').exec();

      const isBooked = existingBookings.some((b: any) => {
        if (!b.bookingId || b.bookingId.status === BookingStatus.CANCELLED) return false;

        const timesOverlap = detail.startTime < b.endTime && detail.endTime > b.startTime;
        if (!timesOverlap) return false;

        const existingDate = new Date(b.bookingDate);
        const requestedDate = checkDate;

        if (!isWeekly && !b.bookingId.isWeekly) {
          return existingDate.getTime() === requestedDate.getTime();
        }

        const shareDayOfWeek = existingDate.getUTCDay() === requestedDate.getUTCDay();
        if (shareDayOfWeek) {
          if (b.bookingId.isWeekly && !isWeekly) {
            return existingDate <= requestedDate;
          }
          if (!b.bookingId.isWeekly && isWeekly) {
            return requestedDate <= existingDate;
          }
          if (b.bookingId.isWeekly && isWeekly) {
            return true;
          }
        }

        return false;
      });

      if (isBooked) {
        throw new HttpException(`Sân ${court.name} đã có người đặt trong khoảng ${detail.startTime} - ${detail.endTime}`, HttpStatus.CONFLICT);
      }

      // Check Blocked times
      const formatDateTime = (date: string, time: string) => {
        const [h, m] = time.split(':');
        return new Date(`${date}T${h.padStart(2, '0')}:${m.padStart(2, '0')}:00`);
      };

      const isBlocked = await this.unavailableTimeModel.findOne({
        courtId: detail.courtId,
        startDatetime: { $lt: formatDateTime(detail.bookingDate, detail.endTime) },
        endDatetime: { $gt: formatDateTime(detail.bookingDate, detail.startTime) }
      }).exec();

      if (isBlocked) {
        throw new HttpException(`Sân ${court.name} đang bận/bảo trì trong khoảng ${detail.startTime} - ${detail.endTime}`, HttpStatus.CONFLICT);
      }

      // Calculate Price
      const pricingDay = (new Date(detail.bookingDate).getDay() === 0) ? 6 : new Date(detail.bookingDate).getDay() - 1;

      const pricing = await this.pricingModel.findOne({
        venueId,
        dayOfWeek: pricingDay,
        startTime: { $lte: detail.startTime },
        endTime: { $gte: detail.endTime }
      }).exec() || await this.pricingModel.findOne({
        venueId,
        dayOfWeek: null,
        startTime: { $lte: detail.startTime },
        endTime: { $gte: detail.endTime }
      }).exec();

      const startH = parseInt(detail.startTime.split(':')[0]);
      const startM = parseInt(detail.startTime.split(':')[1]);
      const endH = parseInt(detail.endTime.split(':')[0]);
      const endM = parseInt(detail.endTime.split(':')[1]);
      const durationHours = (endH + endM / 60) - (startH + startM / 60);

      const rate = pricing ? pricing.pricePerHour : venue.pricePerHour;
      const price = Math.round(durationHours * rate);
      totalPrice += price;

      processedDetails.push({
        courtId: detail.courtId,
        bookingDate: checkDate,
        startTime: detail.startTime,
        endTime: detail.endTime,
        price: price
      });
    }

    let finalPrice = totalPrice;
    let promotion = null;
    if (promotionId) {
      if (!Types.ObjectId.isValid(promotionId)) {
        throw new HttpException('ID khuyến mãi không hợp lệ', HttpStatus.BAD_REQUEST);
      }
      promotion = await this.promotionModel.findById(promotionId).exec();
      if (promotion && promotion.isActive) {
        const now = new Date();
        if (now >= promotion.startDate && now <= promotion.endDate) {
          let discount = (totalPrice * promotion.discountPercentage) / 100;
          if (promotion.maxDiscountAmount && discount > promotion.maxDiscountAmount) {
            discount = promotion.maxDiscountAmount;
          }
          finalPrice = totalPrice - discount;
        }
      }
    }

    // 4. Create Booking
    const newBooking = await this.bookingModel.create({
      playerId: playerId ? new Types.ObjectId(playerId) : null,
      isGuest: !playerId,
      venueId: new Types.ObjectId(venueId),
      promotionId: promotion ? promotion._id : null,
      totalPrice: totalPrice,
      finalPrice: finalPrice,
      status: BookingStatus.PENDING,
      note: note,
      isWeekly: isWeekly || false,
      customerName: customerName,
      customerPhone: customerPhone,
      customerEmail: customerEmail
    });

    // 5. Create Booking Details
    if (processedDetails.length > 0) {
      const detailsToCreate = processedDetails.map(d => ({
        ...d,
        courtId: new Types.ObjectId(d.courtId as any),
        bookingDate: new Date(d.bookingDate),
        bookingId: newBooking._id
      }));
      await this.bookingDetailModel.insertMany(detailsToCreate);
    }

    // 6. Send Booking Confirmation Email asynchronously
    this.sendBookingConfirmationEmail(newBooking._id.toString()).catch(err => {
      console.error('[BookingsService] Error sending booking confirmation email:', err);
    });

    return createApiResponse(newBooking, 'Đặt sân thành công', HttpStatus.CREATED);
  }

  async getMyBookings(playerId: string, page: number = 1, limit: number = 10, status?: string, search?: string): Promise<ApiResponseType> {
    const skip = (page - 1) * limit;
    const playerObjectId = new Types.ObjectId(playerId);

    const query: any = { playerId: playerObjectId };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      const venues = await this.venueModel.find({
        name: { $regex: search, $options: 'i' }
      }).select('_id').exec();
      const venueIds = venues.map(v => v._id);
      query.venueId = { $in: venueIds };
    }

    const [bookings, total] = await Promise.all([
      this.bookingModel.find(query)
        .populate('venueId')
        .populate('promotionId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.bookingModel.countDocuments(query),
    ]);

    const result = await Promise.all(bookings.map(async (b) => {
      const details = await this.bookingDetailModel.find({ bookingId: b._id }).populate('courtId').exec();
      return { ...b.toObject(), details };
    }));

    return createApiResponse(
      {
        bookings: result,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      'Lấy lịch sử đặt sân thành công',
      HttpStatus.OK,
    );
  }

  async getVenueBookings(ownerId: string, venueId: string, page: number = 1, limit: number = 10): Promise<ApiResponseType> {
    const skip = (page - 1) * limit;

    if (!Types.ObjectId.isValid(venueId)) {
      throw new HttpException('ID cơ sở không hợp lệ', HttpStatus.BAD_REQUEST);
    }

    const venue = await this.venueModel.findById(venueId).exec();
    if (!venue) {
      throw new HttpException('Không tìm thấy cơ sở', HttpStatus.NOT_FOUND);
    }

    if (venue.ownerId.toString() !== ownerId.toString()) {
      throw new HttpException('Bạn không có quyền xem thông tin cơ sở này', HttpStatus.FORBIDDEN);
    }

    const [bookings, total] = await Promise.all([
      this.bookingModel.find({ venueId: venueId })
        .populate('playerId', 'fullName email phone avatarUrl')
        .populate('promotionId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.bookingModel.countDocuments({ venueId: venueId }),
    ]);

    const result = await Promise.all(bookings.map(async (b) => {
      const details = await this.bookingDetailModel.find({ bookingId: b._id }).populate('courtId').exec();
      return { ...b.toObject(), details };
    }));

    return createApiResponse(
      {
        bookings: result,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      'Lấy danh sách đặt sân của cơ sở thành công',
      HttpStatus.OK,
    );
  }

  async updateStatus(userId: string, id: string, dto: UpdateBookingStatusDto, userRole?: string): Promise<ApiResponseType> {
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException('ID đơn đặt sân không hợp lệ', HttpStatus.BAD_REQUEST);
    }

    const booking = await this.bookingModel.findById(id).exec();
    if (!booking) {
      throw new HttpException('Không tìm thấy đơn đặt sân', HttpStatus.NOT_FOUND);
    }

    const isAdmin = userRole === 'ADMIN';

    if (!isAdmin) {
      const venue = await this.venueModel.findById(booking.venueId).exec();
      if (!venue || venue.ownerId.toString() !== userId.toString()) {
        if (booking.playerId.toString() !== userId.toString() || dto.status !== BookingStatus.CANCELLED) {
          throw new HttpException('Bạn không có quyền cập nhật đơn này', HttpStatus.FORBIDDEN);
        }
      }
    }

    const updatedBooking = await this.bookingModel.findByIdAndUpdate(id, { status: dto.status }, { new: true }).exec();

    // If status is updated to COMPLETED (check-in and payment complete), set cash or existing payment status to SUCCESS
    if (dto.status === BookingStatus.COMPLETED) {
      const payment = await this.paymentModel.findOne({ bookingId: updatedBooking._id }).exec();
      if (payment) {
        if (payment.status !== 'SUCCESS') {
          payment.status = 'SUCCESS' as any;
          await payment.save();
        }
      } else {
        // Create offline CASH payment as SUCCESS
        await this.paymentModel.create({
          bookingId: updatedBooking._id,
          amount: updatedBooking.finalPrice,
          method: 'CASH',
          status: 'SUCCESS'
        });
      }
    }

    return createApiResponse(updatedBooking, 'Cập nhật trạng thái thành công', HttpStatus.OK);
  }

  async findOne(userId: string, id: string): Promise<ApiResponseType> {
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException('ID đơn đặt sân không hợp lệ', HttpStatus.BAD_REQUEST);
    }

    const booking = await this.bookingModel.findById(id)
      .populate('venueId')
      .populate('promotionId')
      .populate('playerId', 'fullName email phone avatarUrl')
      .exec();

    if (!booking) {
      throw new HttpException('Không tìm thấy đơn đặt sân', HttpStatus.NOT_FOUND);
    }

    const venue = booking.venueId as any;
    if (booking.playerId && booking.playerId['_id'].toString() !== userId && venue.ownerId.toString() !== userId) {
      throw new HttpException('Bạn không có quyền xem đơn đặt sân này', HttpStatus.FORBIDDEN);
    }

    const [details, payment] = await Promise.all([
      this.bookingDetailModel.find({ bookingId: new Types.ObjectId(booking._id as any) }).populate('courtId').exec(),
      this.paymentModel.findOne({ bookingId: new Types.ObjectId(booking._id as any) }).sort({ createdAt: -1 }).exec()
    ]);

    return createApiResponse({ ...booking.toObject(), details, payment }, 'Lấy chi tiết đặt sân thành công', HttpStatus.OK);
  }

  async findAll(query: any): Promise<ApiResponseType> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.status) filter.status = query.status;
    if (query.userId) filter.playerId = new Types.ObjectId(query.userId);
    if (query.venueId) filter.venueId = new Types.ObjectId(query.venueId);

    if (query.search) {
      const [users, venues] = await Promise.all([
        this.userModel.find({ fullName: { $regex: query.search, $options: 'i' } }).select('_id').exec(),
        this.venueModel.find({ name: { $regex: query.search, $options: 'i' } }).select('_id').exec(),
      ]);

      const userIds = users.map(u => u._id);
      const venueIds = venues.map(v => v._id);

      filter.$or = [
        { playerId: { $in: userIds } },
        { venueId: { $in: venueIds } }
      ];

      if (Types.ObjectId.isValid(query.search)) {
        filter.$or.push({ _id: new Types.ObjectId(query.search) });
      }
    }

    const [bookings, total] = await Promise.all([
      this.bookingModel.find(filter)
        .populate('playerId', 'fullName email avatarUrl')
        .populate('venueId', 'name address')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.bookingModel.countDocuments(filter),
    ]);

    const result = await Promise.all(bookings.map(async (b) => {
      const details = await this.bookingDetailModel.find({ bookingId: b._id }).populate('courtId').exec();
      return { ...b.toObject(), details };
    }));

    return createApiResponse(
      {
        bookings: result,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      'Lấy danh sách đặt sân thành công',
      HttpStatus.OK,
    );
  }

  async getOwnerBookings(ownerId: string, page: number = 1, limit: number = 10, query: any = {}): Promise<ApiResponseType> {
    const skip = (page - 1) * limit;

    // Get all venues owned by this user
    const venues = await this.venueModel.find({ ownerId: new Types.ObjectId(ownerId) }).exec();
    const venueIds = venues.map(v => new Types.ObjectId(v._id as any));

    const filter: any = { venueId: { $in: venueIds } };
    if (query.status) filter.status = query.status;
    if (query.venueId && Types.ObjectId.isValid(query.venueId)) {
      filter.venueId = new Types.ObjectId(query.venueId);
    }

    // Search bằng mã đơn hàng - dùng aggregation để convert _id thành string
    const searchTerm = query.search ? query.search.toUpperCase().replace('#BH', '') : null;
    
    const baseMatch = { ...filter };
    if (searchTerm) {
      // Match mã 6 ký tự cuối của ObjectId
      baseMatch._idStr = { $regex: `.*${searchTerm}$`, $options: 'i' };
    }

    const pipeline: any[] = [
      {
        $addFields: {
          _idStr: { $toString: '$_id' }
        }
      },
      { $match: baseMatch },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'playerId',
          foreignField: '_id',
          as: 'playerData'
        }
      },
      { $unwind: { path: '$playerData', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'venues',
          localField: 'venueId',
          foreignField: '_id',
          as: 'venueData'
        }
      },
      { $unwind: { path: '$venueData', preserveNullAndEmptyArrays: true } },
    ];

    const [bookings, total] = await Promise.all([
      this.bookingModel.aggregate(pipeline),
      this.bookingModel.countDocuments(filter)
    ]);

    // Transform kết quả
    const result = await Promise.all(bookings.map(async (b: any) => {
      const [details, payment] = await Promise.all([
        this.bookingDetailModel.find({ bookingId: b._id }).populate('courtId').exec(),
        this.paymentModel.findOne({ bookingId: b._id }).exec()
      ]);
      return { 
        ...b, 
        playerId: b.playerData ? {
          _id: b.playerData._id,
          fullName: b.playerData.fullName,
          email: b.playerData.email,
          phone: b.playerData.phone,
          avatarUrl: b.playerData.avatarUrl
        } : null,
        venueId: b.venueData ? {
          _id: b.venueData._id,
          name: b.venueData.name,
          address: b.venueData.address
        } : null,
        details,
        payment
      };
    }));

    return createApiResponse(
      {
        bookings: result,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      'Lấy danh sách đặt sân tổng hợp thành công',
      HttpStatus.OK,
    );
  }

  async createManualBooking(ownerId: string, dto: any): Promise<ApiResponseType> {
    const { venueId, courtId, bookingDate, startTime, endTime, customerName, customerPhone, note, type } = dto;

    const venue = await this.venueModel.findById(venueId).exec();
    if (!venue || venue.ownerId.toString() !== ownerId.toString()) {
      throw new HttpException('Bạn không có quyền thao tác trên cơ sở này', HttpStatus.FORBIDDEN);
    }

    if (type === 'LOCK') {
      // Create a lock/unavailable time entry
      const lockEntry = await this.unavailableTimeModel.create({
        courtId: new Types.ObjectId(courtId),
        startDatetime: new Date(`${bookingDate}T${startTime}:00`),
        endDatetime: new Date(`${bookingDate}T${endTime}:00`),
        reason: note || 'Chủ sân khóa sân',
      });
      return createApiResponse(lockEntry, 'Khóa sân thành công', HttpStatus.CREATED);
    }

    // 1. Find or Create Player based on phone
    let playerId = null;
    if (customerPhone) {
      let user = await this.userModel.findOne({ phone: customerPhone }).exec();
      if (!user) {
        // Create a basic player record
        user = await this.userModel.create({
          fullName: customerName || 'Khách vãng lai',
          phone: customerPhone,
          email: `${customerPhone}@guest.bmhub.vn`, // Generate a dummy email
          passwordHash: 'manual_booking_default_hash', // Placeholder
          role: UserRole.PLAYER,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(customerName || 'Guest')}&background=random`
        });
      }
      playerId = user._id.toString();
    }

    // Standard manual booking for walk-in
    const manualBookingDto: CreateBookingDto = {
      venueId,
      details: [{ courtId, bookingDate, startTime, endTime }],
      note: note || `Đơn tạo bởi chủ sân cho: ${customerName || 'Khách'} - ${customerPhone || 'Không số'}`
    };

    // We can reuse parts of create but with special flags for manual
    const result = await this.create(playerId, manualBookingDto);
    // Update status to CONFIRMED immediately for all manual bookings
    if (result.statusCode === HttpStatus.CREATED) {
      const finalPrice = result.data.finalPrice || result.data.totalPrice || 0;
      const paymentMethod = dto.paymentMethod || 'CASH';
      const isOnlinePayment = paymentMethod === 'VNPAY' || paymentMethod === 'MOMO';

      await this.bookingModel.findByIdAndUpdate(result.data._id, {
        status: BookingStatus.CONFIRMED, // Auto xác nhận ngay lập tức cho chủ sân đặt
        note: manualBookingDto.note
      });

      // Tự động tạo bản ghi thanh toán tương ứng cho khách vãng lai tại quầy
      await this.paymentModel.create({
        bookingId: result.data._id,
        amount: finalPrice,
        method: paymentMethod,
        status: isOnlinePayment ? 'PENDING' : 'SUCCESS', // Nếu online thì ở trạng thái PENDING chờ khách chuyển khoản, offline thì SUCCESS ngay
      });
    }

    return createApiResponse(result.data, 'Đặt sân thủ công thành công', HttpStatus.CREATED);
  }

  async getCalendarData(ownerId: string, venueId: string, date: string): Promise<ApiResponseType> {
    const venue = await this.venueModel.findById(venueId).exec();
    if (!venue || venue.ownerId.toString() !== ownerId.toString()) {
      throw new HttpException('Bạn không có quyền xem thông tin cơ sở này', HttpStatus.FORBIDDEN);
    }

    const checkDate = new Date(date);
    checkDate.setUTCHours(0, 0, 0, 0);
    const checkDateEnd = new Date(date);
    checkDateEnd.setUTCHours(23, 59, 59, 999);

    const courts = await this.courtModel.find({ venueId }).exec();
    const courtIds = courts.map(c => c._id);

    const [allBookings, locks] = await Promise.all([
      this.bookingDetailModel.find({
        courtId: { $in: courtIds }
      }).populate({
        path: 'bookingId',
        match: { status: { $ne: BookingStatus.CANCELLED } }
      }).exec(),
      this.unavailableTimeModel.find({
        startDatetime: { $lte: checkDateEnd },
        endDatetime: { $gte: checkDate }
      }).exec()
    ]);

    const bookings = allBookings.filter((b: any) => {
      if (!b.bookingId) return false;

      const bDate = new Date(b.bookingDate);
      const isSameDay = bDate >= checkDate && bDate <= checkDateEnd;
      if (isSameDay) return true;

      if (b.bookingId.isWeekly) {
        const isBeforeOrEqual = bDate <= checkDateEnd;
        const isSameDayOfWeek = bDate.getUTCDay() === checkDate.getUTCDay();
        if (isBeforeOrEqual && isSameDayOfWeek) return true;
      }

      return false;
    });

    // Format for timeline
    const timelineData = courts.map(court => {
      const courtBookings = bookings.filter(b => b.courtId.toString() === court._id.toString() && b.bookingId);
      const courtLocks = locks.filter(l => l.courtId.toString() === court._id.toString());

      return {
        courtId: court._id,
        courtName: court.name,
        events: [
          ...courtBookings.map(b => ({
            id: b._id,
            type: 'BOOKING',
            startTime: b.startTime,
            endTime: b.endTime,
            status: (b.bookingId as any).status,
            customerName: (b.bookingId as any).isGuest ? 'Khách vãng lai' : 'Thành viên',
          })),
          ...courtLocks.map(l => ({
            id: l._id,
            type: 'LOCK',
            startTime: l.startDatetime.toISOString().split('T')[1].substring(0, 5),
            endTime: l.endDatetime.toISOString().split('T')[1].substring(0, 5),
            status: 'LOCKED',
            reason: l.reason
          }))
        ]
      };
    });

    return createApiResponse(timelineData, 'Lấy dữ liệu lịch biểu thành công', HttpStatus.OK);
  }

  async getOwnerCustomers(ownerId: string, page: number = 1, limit: number = 10): Promise<ApiResponseType> {
    const skip = (page - 1) * limit;

    // 1. Get venues owned by this user
    const venues = await this.venueModel.find({ ownerId: new Types.ObjectId(ownerId) }).exec();
    const venueIds = venues.map(v => v._id);

    // 2. Aggregate bookings to find unique players and their stats
    const customerStats = await this.bookingModel.aggregate([
      { $match: { venueId: { $in: venueIds }, playerId: { $ne: null } } },
      {
        $lookup: {
          from: 'payments',
          localField: '_id',
          foreignField: 'bookingId',
          as: 'payments'
        }
      },
      {
        $group: {
          _id: '$playerId',
          totalBookings: { $sum: 1 },
          totalSpent: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ['$status', BookingStatus.COMPLETED] },
                    {
                      $and: [
                        { $in: ['$status', [BookingStatus.CONFIRMED, BookingStatus.NO_SHOW]] },
                        { $eq: [{ $arrayElemAt: ['$payments.status', 0] }, 'SUCCESS'] }
                      ]
                    }
                  ]
                },
                '$finalPrice',
                0
              ]
            }
          },
          lastBookingDate: { $max: '$createdAt' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'playerInfo'
        }
      },
      { $unwind: '$playerInfo' },
      {
        $project: {
          _id: 1,
          totalBookings: 1,
          totalSpent: 1,
          lastBookingDate: 1,
          'playerInfo.fullName': 1,
          'playerInfo.email': 1,
          'playerInfo.phone': 1,
          'playerInfo.avatarUrl': 1
        }
      },
      { $sort: { totalBookings: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]);

    // 3. Count total unique customers
    const totalCountResult = await this.bookingModel.aggregate([
      { $match: { venueId: { $in: venueIds }, playerId: { $ne: null } } },
      { $group: { _id: '$playerId' } },
      { $count: 'total' }
    ]);
    const total = totalCountResult[0]?.total || 0;

    return createApiResponse(
      {
        customers: customerStats,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      },
      'Lấy danh sách khách hàng thành công',
      HttpStatus.OK
    );
  }

  async getMyStatistics(playerId: string): Promise<ApiResponseType> {
    const playerObjectId = new Types.ObjectId(playerId);

    // 1. Get ALL bookings count (any status)
    const totalBookingsCount = await this.bookingModel.countDocuments({
      playerId: playerObjectId
    }).exec();

    // 2. Get CONFIRMED + COMPLETED bookings for hours and spent calculation
    const completedBookings = await this.bookingModel.find({
      playerId: playerObjectId,
      status: { $in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] },
    }).exec();

    const bookingIds = completedBookings.map(b => b._id);

    // Find all details for these completed bookings
    const details = await this.bookingDetailModel.find({
      bookingId: { $in: bookingIds }
    }).exec();

    let totalHours = 0;
    details.forEach(detail => {
      const startH = parseInt(detail.startTime.split(':')[0]);
      const startM = parseInt(detail.startTime.split(':')[1]);
      const endH = parseInt(detail.endTime.split(':')[0]);
      const endM = parseInt(detail.endTime.split(':')[1]);
      const duration = (endH + endM / 60) - (startH + startM / 60);
      totalHours += duration;
    });

    return createApiResponse({
      totalHours: Math.round(totalHours * 10) / 10,
      totalBookings: totalBookingsCount,
      totalSpent: completedBookings.reduce((sum, b) => sum + b.finalPrice, 0)
    }, 'Lấy thống kê cá nhân thành công', HttpStatus.OK);
  }

  async sendBookingConfirmationEmail(bookingId: string): Promise<boolean> {
    try {
      const booking = await this.bookingModel.findById(bookingId)
        .populate('playerId', 'fullName email phone')
        .populate('venueId', 'name address')
        .exec();
        
      if (!booking) return false;
      
      const details = await this.bookingDetailModel.find({ bookingId: booking._id })
        .populate('courtId', 'name')
        .exec();
        
      return await this.mailService.sendBookingConfirmation(booking, details);
    } catch (error) {
      console.error('[BookingsService] Failed to send booking email:', error);
      return false;
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleAutoNoShow() {
    const now = new Date();
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
    
    // Find all bookings that are PENDING or CONFIRMED
    const bookings = await this.bookingModel.find({
      status: { $in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] }
    }).exec();

    for (const booking of bookings) {
      const details = await this.bookingDetailModel.find({ bookingId: booking._id }).exec();
      if (!details || details.length === 0) continue;

      // PENDING: Auto NO_SHOW sau 15 phút nếu chưa xác nhận
      if (booking.status === BookingStatus.PENDING) {
        const createdAt = new Date(booking.createdAt);
        if (createdAt < fifteenMinutesAgo) {
          await this.bookingModel.findByIdAndUpdate(booking._id, { status: BookingStatus.NO_SHOW }).exec();
          console.log(`[Cron Auto-NoShow] PENDING Booking BH${booking._id.toString().slice(-6).toUpperCase()} exceeded 15 minutes and was auto-updated to NO_SHOW.`);
        }
        continue;
      }

      // CONFIRMED: Check nếu tất cả slots đã hết giờ
      if (booking.status === BookingStatus.CONFIRMED) {
        let allPassed = true;
        for (const detail of details) {
          try {
            let endDateTime: Date;
            const [hours, minutes] = detail.endTime.split(':').map(Number);
            
            if (detail.bookingDate instanceof Date) {
              const year = detail.bookingDate.getFullYear();
              const month = detail.bookingDate.getMonth();
              const day = detail.bookingDate.getDate();
              endDateTime = new Date(year, month, day, hours, minutes);
            } else {
              const dateStr = String(detail.bookingDate);
              if (dateStr.includes('T')) {
                const dateObj = new Date(dateStr);
                const year = dateObj.getFullYear();
                const month = dateObj.getMonth();
                const day = dateObj.getDate();
                endDateTime = new Date(year, month, day, hours, minutes);
              } else {
                const [year, month, day] = dateStr.split('-').map(Number);
                endDateTime = new Date(year, month - 1, day, hours, minutes);
              }
            }
            
            if (now <= endDateTime) {
              allPassed = false;
              break;
            }
          } catch (e) {
            allPassed = false;
            break;
          }
        }

        if (allPassed) {
          await this.bookingModel.findByIdAndUpdate(booking._id, { status: BookingStatus.NO_SHOW }).exec();
          console.log(`[Cron Auto-NoShow] CONFIRMED Booking BH${booking._id.toString().slice(-6).toUpperCase()} has passed slot time and was auto-updated to NO_SHOW.`);
        }
      }
    }
  }
}
