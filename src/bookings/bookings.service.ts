import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model, Types } from 'mongoose';
import { Coupon, CouponDocument, CouponStatus } from '../coupons/schemas/coupon.schema';
import { CourtUnavailableTime, CourtUnavailableTimeDocument } from '../courts/schemas/court-unavailable-time.schema';
import { Court, CourtDocument } from '../courts/schemas/court.schema';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';
import { Payment, PaymentDocument } from '../payments/schemas/payment.schema';
import { Pricing, PricingDocument } from '../pricings/schemas/pricing.schema';
import { Promotion, PromotionDocument } from '../promotions/schemas/promotion.schema';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';
import { ApiResponseType, createApiResponse } from '../utils/response.util';
import { Venue, VenueDocument } from '../venues/schemas/venue.schema';
import { SlotLock, SlotLockDocument } from '../availability/schemas/slot-lock.schema';
import { ApplyCouponDto, CreateBookingDto, UpdateBookingStatusDto } from './dto/booking.dto';
import { BookingDetail, BookingDetailDocument } from './schemas/booking-detail.schema';
import { Booking, BookingDocument, BookingStatus } from './schemas/booking.schema';

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
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
    @InjectModel(SlotLock.name) private slotLockModel: Model<SlotLockDocument>,
    private mailService: MailService,
    private notificationsService: NotificationsService,
  ) { }


  async getAvailableCoupons(venueId: string): Promise<ApiResponseType> {
    if (!Types.ObjectId.isValid(venueId)) {
      throw new HttpException('ID cơ sở không hợp lệ', HttpStatus.BAD_REQUEST);
    }

    const venue = await this.venueModel.findById(venueId);
    if (!venue) {
      throw new HttpException('Cơ sở không tồn tại', HttpStatus.NOT_FOUND);
    }

    const admins = await this.userModel.find({ role: 'ADMIN' }).select('_id').exec();
    const adminIds = admins.map(a => a._id);

    const now = new Date();

    const coupons = await this.couponModel.find({
      status: CouponStatus.ACTIVE,
      startDate: { $lte: now },
      endDate: { $gte: now },
      $or: [
        { venueId: new Types.ObjectId(venueId) },
        { 
          venueId: null,
          ownerId: { $in: [venue.ownerId, ...adminIds] }
        }
      ],
      $expr: { $lt: ['$usedCount', '$usageLimit'] } // Only return coupons that haven't reached usage limit
    }).sort({ discountValue: -1 }).exec();

    return createApiResponse(coupons, 'Lấy danh sách mã khuyến mãi khả dụng thành công', HttpStatus.OK);
  }

  async applyCoupon(dto: ApplyCouponDto): Promise<ApiResponseType> {
    const { code, venueId, totalAmount } = dto;

    if (!Types.ObjectId.isValid(venueId)) {
      throw new HttpException('ID cơ sở không hợp lệ', HttpStatus.BAD_REQUEST);
    }

    const coupon = await this.couponModel.findOne({ 
      code: code.toUpperCase(), 
      status: CouponStatus.ACTIVE 
    }).exec();

    if (!coupon) {
      throw new HttpException('Mã khuyến mãi không tồn tại hoặc không hợp lệ', HttpStatus.BAD_REQUEST);
    }

    const now = new Date();
    if (now < coupon.startDate || now > coupon.endDate) {
      throw new HttpException('Mã khuyến mãi không nằm trong thời gian hiệu lực', HttpStatus.BAD_REQUEST);
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      throw new HttpException('Mã khuyến mãi đã hết lượt sử dụng', HttpStatus.BAD_REQUEST);
    }

    if (coupon.venueId && coupon.venueId.toString() !== venueId) {
      throw new HttpException('Mã khuyến mãi không áp dụng cho cơ sở này', HttpStatus.BAD_REQUEST);
    }

    if (coupon.minOrderValue && totalAmount < coupon.minOrderValue) {
      throw new HttpException(`Đơn hàng phải tối thiểu ${coupon.minOrderValue}đ để áp dụng mã này`, HttpStatus.BAD_REQUEST);
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (totalAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    if (discountAmount > totalAmount) {
      discountAmount = totalAmount;
    }

    const finalAmount = totalAmount - discountAmount;

    return createApiResponse(
      { discountAmount, finalAmount, couponId: coupon._id }, 
      'Áp dụng mã khuyến mãi thành công', 
      HttpStatus.OK
    );
  }

  async create(playerId: string, dto: CreateBookingDto): Promise<ApiResponseType> {
    const { venueId, promotionId, couponId, details, note, isWeekly, customerName, customerPhone, customerEmail } = dto;

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
    let coupon = null;

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
    } else if (couponId) {
      if (!Types.ObjectId.isValid(couponId)) {
        throw new HttpException('ID mã khuyến mãi không hợp lệ', HttpStatus.BAD_REQUEST);
      }
      coupon = await this.couponModel.findById(couponId).populate('ownerId').exec();
      if (coupon && coupon.status === CouponStatus.ACTIVE) {
        if (coupon.venueId && coupon.venueId.toString() !== venueId) {
          throw new HttpException('Mã khuyến mãi không áp dụng cho cơ sở này', HttpStatus.BAD_REQUEST);
        }
        if (!coupon.venueId) {
          const couponOwner: any = coupon.ownerId;
          const isAdmin = couponOwner && couponOwner.role === 'ADMIN';
          if (couponOwner && couponOwner._id.toString() !== venue.ownerId.toString() && !isAdmin) {
            throw new HttpException('Mã khuyến mãi không áp dụng cho cơ sở này', HttpStatus.BAD_REQUEST);
          }
        }

        const now = new Date();
        if (now >= coupon.startDate && now <= coupon.endDate && coupon.usedCount < coupon.usageLimit) {
          if (!coupon.minOrderValue || totalPrice >= coupon.minOrderValue) {
            let discountAmount = 0;
            if (coupon.discountType === 'PERCENTAGE') {
              discountAmount = (totalPrice * coupon.discountValue) / 100;
              if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
                discountAmount = coupon.maxDiscountAmount;
              }
            } else {
              discountAmount = coupon.discountValue;
            }
            if (discountAmount > totalPrice) discountAmount = totalPrice;
            finalPrice = totalPrice - discountAmount;
          }
        }
      }
    }

    // 4. Create Booking
    const newBooking = await this.bookingModel.create({
      playerId: playerId ? new Types.ObjectId(playerId) : null,
      isGuest: !playerId,
      venueId: new Types.ObjectId(venueId),
      promotionId: promotion ? promotion._id : null,
      couponId: coupon ? coupon._id : null,
      totalPrice: totalPrice,
      finalPrice: finalPrice,
      status: BookingStatus.PENDING,
      note: note,
      isWeekly: isWeekly || false,
      customerName: customerName,
      customerPhone: customerPhone,
      customerEmail: customerEmail
    });

    if (coupon) {
      coupon.usedCount += 1;
      await coupon.save();
    }

    // 5. Create Booking Details & Clear Slot Locks
    if (processedDetails.length > 0) {
      const detailsToCreate = processedDetails.map(d => ({
        ...d,
        courtId: new Types.ObjectId(d.courtId as any),
        bookingDate: new Date(d.bookingDate),
        bookingId: newBooking._id
      }));
      await this.bookingDetailModel.insertMany(detailsToCreate);

      // Clear the temporary SlotLocks since the booking is successfully created
      for (const d of processedDetails) {
        await this.slotLockModel.deleteMany({
          courtId: new Types.ObjectId(d.courtId as any),
          startTime: d.startTime,
        }).exec();
      }
    }

    // 6. Send Booking Confirmation Email asynchronously
    this.sendBookingConfirmationEmail(newBooking._id.toString()).catch(err => {
      console.error('[BookingsService] Error sending booking confirmation email:', err);
    });

    // 7. Send Push Notification to Venue Owner
    if (venue.ownerId) {
      const ownerIdStr = (venue.ownerId as any)._id ? (venue.ownerId as any)._id.toString() : venue.ownerId.toString();
      this.notificationsService.sendAndSaveNotification(
        ownerIdStr,
        '🎉 Có đơn đặt sân mới!',
        `Khách hàng ${customerName || 'khách vãng lai'} vừa đặt sân tại ${venue.name}. Tổng tiền: ${finalPrice.toLocaleString()}đ`,
        NotificationType.BOOKING_CREATED,
        { bookingId: newBooking._id.toString() }
      ).catch(err => {
        console.error('[BookingsService] Error sending push notification to owner:', err);
      });
    }

    // 8. Send Push Notification to Customer
    if (newBooking.playerId) {
      const playerIdStr = (newBooking.playerId as any)._id ? (newBooking.playerId as any)._id.toString() : newBooking.playerId.toString();
      this.notificationsService.sendAndSaveNotification(
        playerIdStr,
        '📅 Đặt sân thành công!',
        `Đơn đặt sân #${newBooking._id.toString().slice(-6).toUpperCase()} tại ${venue.name} đang chờ xác nhận.`,
        NotificationType.BOOKING_CREATED,
        { bookingId: newBooking._id.toString() }
      ).catch(err => {
        console.error('[BookingsService] Error sending push notification to customer:', err);
      });
    }

    return createApiResponse(newBooking, 'Đặt sân thành công', HttpStatus.CREATED);
  }

  async getMyBookings(playerId: string, page: number = 1, limit: number = 10, status?: string, search?: string, isWeekly?: string, paymentMethod?: string): Promise<ApiResponseType> {
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

    if (isWeekly !== undefined && isWeekly !== 'all') {
      if (isWeekly === 'true' || isWeekly === true as any) {
        query.isWeekly = true;
      } else if (isWeekly === 'false' || isWeekly === false as any) {
        query.isWeekly = false;
      }
    }

    if (paymentMethod && paymentMethod !== 'all') {
      const latestPayments = await this.paymentModel.aggregate([
        { $sort: { createdAt: 1 } },
        {
          $group: {
            _id: '$bookingId',
            method: { $last: '$method' }
          }
        },
        { $match: { method: paymentMethod } }
      ]).exec();
      
      const validBookingIdsByPayment = latestPayments.map(p => p._id);
      
      // Merge with existing _id query if it exists (though it shouldn't in this context)
      query._id = { ...query._id, $in: validBookingIdsByPayment };
    }

    const [bookings, total] = await Promise.all([
      this.bookingModel.find(query)
        .populate('venueId')
        .populate('promotionId')
        .populate('couponId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.bookingModel.countDocuments(query),
    ]);

    const result = await Promise.all(bookings.map(async (b) => {
      const [details, payment] = await Promise.all([
        this.bookingDetailModel.find({ bookingId: b._id }).populate('courtId').exec(),
        this.paymentModel.findOne({ bookingId: b._id }).sort({ createdAt: -1 }).exec()
      ]);
      return { ...b.toObject(), details, payment };
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
        .populate('couponId')
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

    if (dto.status === BookingStatus.CANCELLED && !isAdmin) {
      const details = await this.bookingDetailModel.find({ bookingId: booking._id }).sort({ bookingDate: 1, startTime: 1 }).exec();
      if (details.length > 0) {
        const firstDetail = details[0];
        const [h, m] = firstDetail.startTime.split(':');
        const startDateTime = new Date(firstDetail.bookingDate);
        startDateTime.setUTCHours(parseInt(h), parseInt(m), 0, 0);
        
        // Cùng múi giờ hoặc giả định giờ local, cứ dùng getTime
        const diffMs = startDateTime.getTime() - new Date().getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        
        if (diffHours < 2) {
          throw new HttpException('Chỉ được phép hủy trước 2 tiếng', HttpStatus.BAD_REQUEST);
        }
      }
    }

    const updateData: any = { status: dto.status };
    if (dto.cancelReason) {
      updateData.cancelReason = dto.cancelReason;
    }
    
    if (dto.status === BookingStatus.CANCELLED) {
      if (isAdmin) {
        updateData.cancelledBy = 'ADMIN';
      } else if (booking.playerId.toString() === userId.toString()) {
        updateData.cancelledBy = 'CUSTOMER';
      } else {
        updateData.cancelledBy = 'OWNER';
      }
    }

    const updatedBooking = await this.bookingModel.findByIdAndUpdate(id, updateData, { new: true })
      .populate('venueId')
      .exec();

    // Dọn dẹp (Release) SlotLock nếu có (Fix lỗi hiển thị Xanh dương - Khóa trên lịch)
    if (dto.status === BookingStatus.CANCELLED) {
      const details = await this.bookingDetailModel.find({ bookingId: updatedBooking._id }).exec();
      for (const d of details) {
        await this.slotLockModel.deleteMany({
          courtId: new Types.ObjectId(d.courtId as any),
          startTime: d.startTime,
        }).exec();
      }
    }

    // Send push notification to Customer based on Status
    if (updatedBooking.playerId && updatedBooking.status !== booking.status) {
      let title = '';
      let body = '';
      let type: NotificationType = null;
      let venueName = (updatedBooking.venueId as any)?.name || 'Cơ sở';

      if (dto.status === BookingStatus.CONFIRMED) {
        title = '✅ Đơn đặt sân đã được xác nhận!';
        body = `Chủ sân đã xác nhận đơn đặt sân của bạn tại ${venueName}. Bạn nhớ đến đúng giờ nhé.`;
        type = NotificationType.BOOKING_CONFIRMED;
      } else if (dto.status === BookingStatus.CANCELLED) {
        if (booking.playerId.toString() === userId.toString()) {
           // Khách tự hủy
           if ((updatedBooking.venueId as any)?.ownerId) {
             this.notificationsService.sendAndSaveNotification(
               (updatedBooking.venueId as any).ownerId.toString(),
               '⚠️ Đơn đặt sân bị hủy',
               `Khách hàng vừa hủy đơn đặt sân tại ${venueName}. Lịch đã được trống.`,
               NotificationType.BOOKING_CANCELLED,
               { bookingId: updatedBooking._id.toString() }
             ).catch(console.error);
           }
        } else {
           // Chủ sân / Hệ thống hủy
           title = '❌ Đơn đặt sân bị hủy';
           body = `Đơn đặt sân của bạn tại ${venueName} đã bị hủy. ${dto.cancelReason ? `Lý do: ${dto.cancelReason}` : ''}`;
           type = NotificationType.BOOKING_CANCELLED;
        }
      } else if (dto.status === BookingStatus.REFUNDED) {
         title = '💸 Hoàn tiền thành công';
         body = `Tiền đặt sân tại ${venueName} đã được hoàn về tài khoản của bạn.`;
         type = NotificationType.SYSTEM_ALERT;
      } else if (dto.status === BookingStatus.IN_PROGRESS) {
         title = '🏸 Tới giờ chơi rồi!';
         body = `Đơn đặt sân của bạn tại ${venueName} đã bắt đầu (Check-in). Chúc bạn có một buổi chơi vui vẻ!`;
         type = NotificationType.SYSTEM_ALERT;
      } else if (dto.status === BookingStatus.COMPLETED) {
         const paymentStatus = dto.paymentStatus || 'SUCCESS';
         if (paymentStatus === 'DEBT') {
           title = '⚠️ Ghi nhận khách nợ';
           body = `Đơn đặt sân tại ${venueName} đã hoàn thành nhưng bạn chưa thanh toán tiền mặt. Vui lòng thanh toán để không bị ảnh hưởng tài khoản.`;
           type = NotificationType.SYSTEM_ALERT;
         } else {
           title = '✅ Đơn đặt sân hoàn tất';
           body = `Cảm ơn bạn đã chơi tại ${venueName}. Hãy để lại đánh giá cho sân nhé!`;
           type = NotificationType.SYSTEM_ALERT;
         }
      }

      if (title && body && type) {
        this.notificationsService.sendAndSaveNotification(
          updatedBooking.playerId.toString(),
          title,
          body,
          type,
          { bookingId: updatedBooking._id.toString() }
        ).catch(err => {
          console.error('[BookingsService] Error sending push notification:', err);
        });
      }
    }

    // Cập nhật Payment khi đơn COMPLETED
    if (dto.status === BookingStatus.COMPLETED) {
      const targetPaymentStatus = dto.paymentStatus || 'SUCCESS';
      const payment = await this.paymentModel.findOne({ bookingId: updatedBooking._id }).exec();
      
      if (payment) {
        if (payment.status !== targetPaymentStatus) {
          payment.status = targetPaymentStatus as any;
          await payment.save();
        }
      } else {
        // Create offline CASH payment
        await this.paymentModel.create({
          bookingId: updatedBooking._id,
          amount: updatedBooking.finalPrice,
          method: 'CASH',
          status: targetPaymentStatus
        });
      }

      // Nếu trạng thái là DEBT, check blacklist
      if (targetPaymentStatus === 'DEBT') {
        await this._checkDebtAndLock(updatedBooking.playerId.toString());
      }
    }

    // Nếu hủy đơn, check blacklist hủy quá 3 lần/tuần
    if (dto.status === BookingStatus.CANCELLED) {
      await this._checkCancelAndLock(updatedBooking.playerId.toString());
    }

    // Nếu vắng mặt (NO_SHOW), check blacklist
    if (dto.status === BookingStatus.NO_SHOW) {
      await this._checkNoShowAndLock(updatedBooking.playerId.toString());
    }

    return createApiResponse(updatedBooking, 'Cập nhật trạng thái thành công', HttpStatus.OK);
  }

  private async _checkDebtAndLock(userId: string) {
    if (!userId) return;
    
    // Tìm tất cả các booking của user này
    const userBookings = await this.bookingModel.find({ playerId: new Types.ObjectId(userId) }).select('_id').exec();
    const bookingIds = userBookings.map(b => b._id);
    
    // Đếm số lượng hóa đơn DEBT
    const debtCount = await this.paymentModel.countDocuments({
      bookingId: { $in: bookingIds },
      status: 'DEBT'
    });

    console.log(`[_checkDebtAndLock] Debug: userId=${userId}, debtCount=${debtCount}`);

    if (debtCount >= 3) {
      const reason = 'Tài khoản bị khóa do có 3 hóa đơn chưa thanh toán';
      await this.userModel.findByIdAndUpdate(userId, {
        status: 'BLOCKED',
        blockedReason: reason,
        blockType: 'TEMPORARY',
        blockedAt: new Date()
      });
      console.log(`[Auto-Ban] User ${userId} blocked due to 3 DEBT payments.`);
      await this._notifyLock(userId, reason);
    }
  }

  private async _checkCancelAndLock(userId: string) {
    if (!userId) return;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Đếm số đơn CANCELLED trong 7 ngày qua do KHÁCH HÀNG tự hủy
    const cancelCount = await this.bookingModel.countDocuments({
      playerId: new Types.ObjectId(userId),
      status: BookingStatus.CANCELLED,
      cancelledBy: 'CUSTOMER',
      updatedAt: { $gte: sevenDaysAgo }
    });

    console.log(`[_checkCancelAndLock] Debug: userId=${userId}, cancelCount=${cancelCount}`);

    if (cancelCount >= 3) {
      const reason = 'Tài khoản bị khóa do lạm dụng hủy sân (3 lần trong 7 ngày)';
      await this.userModel.findByIdAndUpdate(userId, {
        status: 'BLOCKED',
        blockedReason: reason,
        blockType: 'TEMPORARY',
        blockedAt: new Date()
      });
      console.log(`[Auto-Ban] User ${userId} blocked due to 3 cancellations in 7 days.`);
      await this._notifyLock(userId, reason);
    }
  }

  private async _checkNoShowAndLock(userId: string) {
    if (!userId) return;

    const userBookings = await this.bookingModel.find({ 
      playerId: new Types.ObjectId(userId), 
      status: BookingStatus.NO_SHOW 
    }).select('_id').exec();
    
    const bookingIds = userBookings.map(b => b._id);

    if (bookingIds.length === 0) return;

    const noShowCashCount = await this.paymentModel.countDocuments({
      bookingId: { $in: bookingIds },
      method: 'CASH'
    });

    console.log(`[_checkNoShowAndLock] Debug: userId=${userId}, noShowCashCount=${noShowCashCount}`);

    if (noShowCashCount >= 3) {
      const reason = 'Tài khoản bị khóa do vắng mặt (không tới sân) 3 lần với đơn thanh toán tiền mặt';
      await this.userModel.findByIdAndUpdate(userId, {
        status: 'BLOCKED',
        blockedReason: reason,
        blockType: 'TEMPORARY',
        blockedAt: new Date()
      });
      console.log(`[Auto-Ban] User ${userId} blocked due to 3 NO_SHOW with CASH payments.`);
      await this._notifyLock(userId, reason);
    }
  }

  private async _notifyLock(userId: string, reason: string) {
    // 1. Notify the blocked user
    this.notificationsService.sendAndSaveNotification(
      userId,
      '🔒 Tài khoản bị khóa',
      `Tài khoản của bạn đã bị khóa tạm thời. Lý do: ${reason}. Vui lòng liên hệ Admin để được hỗ trợ.`,
      NotificationType.SYSTEM_ALERT
    ).catch(console.error);

    // 2. Notify all Admins
    const user = await this.userModel.findById(userId).select('fullName email').exec();
    const admins = await this.userModel.find({ role: 'ADMIN' }).select('_id').exec();
    
    for (const admin of admins) {
      this.notificationsService.sendAndSaveNotification(
        admin._id.toString(),
        '🚨 Cảnh báo bảo mật: Khóa tài khoản',
        `Hệ thống vừa tự động khóa tài khoản khách hàng ${user?.fullName || 'Không rõ'} (${user?.email || 'Không rõ'}). Lý do: ${reason}.`,
        NotificationType.SYSTEM_ALERT
      ).catch(console.error);
    }
  }

  async requestRefund(userId: string, id: string, dto: any, userRole?: string): Promise<ApiResponseType> {
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException('ID đơn đặt sân không hợp lệ', HttpStatus.BAD_REQUEST);
    }

    const booking = await this.bookingModel.findById(id).exec();
    if (!booking) {
      throw new HttpException('Không tìm thấy đơn đặt sân', HttpStatus.NOT_FOUND);
    }

    if (booking.playerId.toString() !== userId.toString() && userRole !== 'ADMIN') {
      throw new HttpException('Bạn không có quyền yêu cầu hoàn tiền đơn này', HttpStatus.FORBIDDEN);
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new HttpException('Chỉ có thể yêu cầu hoàn tiền cho đơn đã xác nhận/thanh toán', HttpStatus.BAD_REQUEST);
    }

    const payment = await this.paymentModel.findOne({ bookingId: booking._id, status: 'SUCCESS' }).exec();
    if (!payment) {
      throw new HttpException('Không tìm thấy giao dịch thanh toán thành công cho đơn này', HttpStatus.BAD_REQUEST);
    }

    // Check 2 hours rule
    const details = await this.bookingDetailModel.find({ bookingId: booking._id }).sort({ bookingDate: 1, startTime: 1 }).exec();
    if (details.length > 0) {
      const firstDetail = details[0];
      const [h, m] = firstDetail.startTime.split(':');
      const startDateTime = new Date(firstDetail.bookingDate);
      startDateTime.setUTCHours(parseInt(h), parseInt(m), 0, 0);
      
      const diffMs = startDateTime.getTime() - new Date().getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      
      if (diffHours < 2) {
        throw new HttpException('Chỉ được phép hủy và hoàn tiền trước 2 tiếng', HttpStatus.BAD_REQUEST);
      }
    }

    // 1. Cập nhật trạng thái Booking thành CANCELLED để giải phóng sân
    booking.status = BookingStatus.CANCELLED;
    if (dto.reason) {
      booking.cancelReason = dto.reason;
    }
    await booking.save();

    // 2. Cập nhật Payment thành REFUNDING và lưu thông tin
    payment.status = 'REFUNDING' as any;
    payment.refundInfo = {
      bankName: dto.bankName,
      accountNumber: dto.accountNumber,
      accountName: dto.accountName,
      reason: dto.reason
    };
    await payment.save();

    return createApiResponse({ booking, payment }, 'Yêu cầu hoàn tiền đã được gửi thành công', HttpStatus.OK);
  }

  async findOne(userId: string, id: string): Promise<ApiResponseType> {
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException('ID đơn đặt sân không hợp lệ', HttpStatus.BAD_REQUEST);
    }

    const booking = await this.bookingModel.findById(id)
      .populate('venueId')
      .populate('promotionId')
      .populate('couponId')
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
      const [details, payment] = await Promise.all([
        this.bookingDetailModel.find({ bookingId: b._id }).populate('courtId').exec(),
        this.paymentModel.findOne({ bookingId: b._id }).sort({ createdAt: -1 }).exec()
      ]);
      return { ...b.toObject(), details, payment };
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

    const postLookupFilter: any = {};
    if (query.paymentMethod) {
      if (query.paymentMethod === 'CASH') {
        postLookupFilter.$or = [
          { 'paymentData': { $exists: false } },
          { 'paymentData': { $size: 0 } },
          { 'paymentData': null },
          { 'paymentData.method': 'CASH' }
        ];
      } else {
        postLookupFilter['paymentData.method'] = query.paymentMethod;
      }
    }

    const basePipeline: any[] = [
      {
        $addFields: {
          _idStr: { $toString: '$_id' }
        }
      },
      { $match: baseMatch },
      {
        $lookup: {
          from: 'payments',
          localField: '_id',
          foreignField: 'bookingId',
          as: 'paymentData'
        }
      },
      { $unwind: { path: '$paymentData', preserveNullAndEmptyArrays: true } },
      { $match: postLookupFilter },
    ];

    const countPipeline = [...basePipeline, { $count: 'total' }];
    
    const pipeline: any[] = [
      ...basePipeline,
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

    const [bookings, countResult] = await Promise.all([
      this.bookingModel.aggregate(pipeline),
      this.bookingModel.aggregate(countPipeline)
    ]);
    const total = countResult[0]?.total || 0;

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
        .populate('couponId')
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
    const nowMs = Date.now();
    const fifteenMinutesAgoMs = nowMs - 15 * 60 * 1000;
    
    // Find all bookings that are PENDING, CONFIRMED, or LATE_ARRIVAL
    const bookings = await this.bookingModel.find({
      status: { $in: [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.LATE_ARRIVAL] }
    }).exec();

    for (const booking of bookings) {
      const details = await this.bookingDetailModel.find({ bookingId: booking._id }).exec();
      if (!details || details.length === 0) continue;

      // PENDING: Auto CANCEL sau 15 phút nếu là VNPAY hoặc quá giờ startTime nếu là CASH
      if (booking.status === BookingStatus.PENDING) {
        const payment = await this.paymentModel.findOne({ bookingId: booking._id }).sort({ createdAt: -1 }).exec();
        const isVnPay = payment && payment.method === 'VNPAY';

        if (isVnPay) {
          const createdAtMs = new Date(booking.createdAt).getTime();
          if (createdAtMs < fifteenMinutesAgoMs) {
            await this.bookingModel.findByIdAndUpdate(booking._id, { 
              status: BookingStatus.CANCELLED,
              cancelReason: 'Hệ thống tự động hủy do quá hạn thanh toán (15 phút)'
            }).exec();
            console.log(`[Cron Auto-Cancel] PENDING Booking BH${booking._id.toString().slice(-6).toUpperCase()} (VNPAY) exceeded 15 minutes and was auto-updated to CANCELLED.`);
          }
        } else {
          // Xử lý Tiền mặt (CASH) - Kiểm tra nếu tất cả slots đã qua giờ bắt đầu (startTime)
          let allPassed = true;
          for (const detail of details) {
            try {
              const [hours, minutes] = detail.startTime.split(':').map(Number);
              let year: number, month: number, day: number;

              if (detail.bookingDate instanceof Date) {
                year = detail.bookingDate.getUTCFullYear();
                month = detail.bookingDate.getUTCMonth();
                day = detail.bookingDate.getUTCDate();
              } else {
                const dateStr = String(detail.bookingDate);
                if (dateStr.includes('T')) {
                  const dateObj = new Date(dateStr);
                  year = dateObj.getUTCFullYear();
                  month = dateObj.getUTCMonth();
                  day = dateObj.getUTCDate();
                } else {
                  [year, month, day] = dateStr.split('-').map(Number);
                  month -= 1; // 0-indexed month
                }
              }
              
              // startTime là giờ Việt Nam (UTC+7). 
              const startDateTimeMs = Date.UTC(year, month, day, hours, minutes) - (7 * 60 * 60 * 1000);
              
              if (nowMs <= startDateTimeMs) {
                allPassed = false;
                break;
              }
            } catch (e) {
              allPassed = false;
              break;
            }
          }

          if (allPassed) {
            await this.bookingModel.findByIdAndUpdate(booking._id, { 
              status: BookingStatus.CANCELLED,
              cancelReason: 'Đơn không được xác nhận',
              cancelledBy: 'SYSTEM'
            }).exec();
            console.log(`[Cron Auto-Cancel] PENDING Booking BH${booking._id.toString().slice(-6).toUpperCase()} (CASH) passed start time and was auto-updated to CANCELLED.`);
          }
        }
        continue;
      }

      // CONFIRMED or LATE_ARRIVAL: Check if past endTime (NO_SHOW) or past startTime (LATE_ARRIVAL)
      if (booking.status === BookingStatus.CONFIRMED || booking.status === BookingStatus.LATE_ARRIVAL) {
        let allPastEndTime = true;
        let anyPastStartTime = false;
        
        for (const detail of details) {
          try {
            let year: number, month: number, day: number;

            if (detail.bookingDate instanceof Date) {
              year = detail.bookingDate.getUTCFullYear();
              month = detail.bookingDate.getUTCMonth();
              day = detail.bookingDate.getUTCDate();
            } else {
              const dateStr = String(detail.bookingDate);
              if (dateStr.includes('T')) {
                const dateObj = new Date(dateStr);
                year = dateObj.getUTCFullYear();
                month = dateObj.getUTCMonth();
                day = dateObj.getUTCDate();
              } else {
                [year, month, day] = dateStr.split('-').map(Number);
                month -= 1; // 0-indexed month
              }
            }
            
            // Check endTime (NO_SHOW)
            const [endH, endM] = detail.endTime.split(':').map(Number);
            const endDateTimeMs = Date.UTC(year, month, day, endH, endM) - (7 * 60 * 60 * 1000);
            if (nowMs <= endDateTimeMs) {
              allPastEndTime = false;
            }

            // Check startTime (LATE_ARRIVAL)
            const [startH, startM] = detail.startTime.split(':').map(Number);
            const startDateTimeMs = Date.UTC(year, month, day, startH, startM) - (7 * 60 * 60 * 1000);
            if (nowMs > startDateTimeMs) {
              anyPastStartTime = true;
            }
          } catch (e) {
            allPastEndTime = false;
          }
        }

        if (allPastEndTime) {
          await this.bookingModel.findByIdAndUpdate(booking._id, { status: BookingStatus.NO_SHOW }).exec();
          console.log(`[Cron Auto-NoShow] Booking BH${booking._id.toString().slice(-6).toUpperCase()} has passed end time and was auto-updated to NO_SHOW.`);
        } else if (anyPastStartTime && booking.status === BookingStatus.CONFIRMED) {
          await this.bookingModel.findByIdAndUpdate(booking._id, { status: BookingStatus.LATE_ARRIVAL }).exec();
          console.log(`[Cron Auto-LateArrival] Booking BH${booking._id.toString().slice(-6).toUpperCase()} has passed start time and was auto-updated to LATE_ARRIVAL.`);
        }
      }
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleBookingReminders() {
    const now = new Date();
    // UTC time for today and tomorrow to cover timezone boundary cases
    const startOfToday = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0));
    const startOfTomorrow = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0));

    const details = await this.bookingDetailModel.find({
      bookingDate: { $gte: startOfToday, $lte: startOfTomorrow },
      isReminderSent: { $ne: true }
    }).populate({
      path: 'bookingId',
      match: { status: BookingStatus.CONFIRMED, isGuest: false }
    }).populate('courtId').exec();

    for (const d of details) {
      if (!d.bookingId) continue;
      const booking = d.bookingId as any;

      try {
        const [h, m] = d.startTime.split(':').map(Number);
        
        let year = startOfToday.getUTCFullYear();
        let month = startOfToday.getUTCMonth();
        let day = startOfToday.getUTCDate();
        
        const dateStr = d.bookingDate as unknown as string;
        if (typeof dateStr === 'string') {
          if (dateStr.includes('T')) {
            const dateObj = new Date(dateStr);
            year = dateObj.getUTCFullYear();
            month = dateObj.getUTCMonth();
            day = dateObj.getUTCDate();
          } else {
            [year, month, day] = dateStr.split('-').map(Number);
            month -= 1;
          }
        } else {
           year = d.bookingDate.getUTCFullYear();
           month = d.bookingDate.getUTCMonth();
           day = d.bookingDate.getUTCDate();
        }

        // Vietnam time offset is +7. The server might be in UTC. 
        // We calculate absolute UTC time for the slot.
        // If bookingDate is stored as UTC 00:00:00 of the local day, 
        // the start time in UTC is startH - 7
        const startDateTimeMs = Date.UTC(year, month, day, h, m) - (7 * 60 * 60 * 1000);
        
        const diffMs = startDateTimeMs - now.getTime();
        const diffMinutes = diffMs / (1000 * 60);

        // Notify if it's within 15 minutes and hasn't started yet
        if (diffMinutes > 0 && diffMinutes <= 15) {
          const venueId = (d.courtId as any)?.venueId;
          let venueName = 'Cơ sở';
          let venueAddress = '';
          if (venueId) {
             const venue = await this.venueModel.findById(venueId).exec();
             if (venue) {
               venueName = venue.name;
               venueAddress = venue.address;
             }
          }

          this.notificationsService.sendAndSaveNotification(
            booking.playerId.toString(),
            '⏰ Sắp tới giờ chơi rồi!',
            `Bạn có lịch đánh cầu tại ${venueName} vào lúc ${d.startTime}. Vui lòng chuẩn bị và đến đúng giờ nhé!`,
            NotificationType.SYSTEM_ALERT,
            { bookingId: booking._id.toString() }
          ).catch(console.error);

          // Gửi Email nhắc nhở
          this.mailService.sendBookingReminderEmail(booking, d.startTime, venueName, venueAddress).catch(console.error);

          d.isReminderSent = true;
          await d.save();
        }
      } catch (e) {
        console.error('[BookingsService] Error processing reminder for booking detail', d._id, e);
      }
    }
  }
}
