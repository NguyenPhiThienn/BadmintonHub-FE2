import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Court, CourtDocument, CourtStatus } from '../courts/schemas/court.schema';
import { ApiResponseType, createApiResponse } from '../utils/response.util';
import { AddVenueImageDto } from './dto/venue-image.dto';
import { CreateVenueDto, UpdateVenueDto } from './dto/venue.dto';
import { VenueImage, VenueImageDocument } from './schemas/venue-image.schema';
import { Venue, VenueDocument, VenueStatus } from './schemas/venue.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Booking, BookingDocument, BookingStatus } from '../bookings/schemas/booking.schema';
import { Payment, PaymentDocument } from '../payments/schemas/payment.schema';
import { Coupon, CouponDocument, CouponStatus, DiscountType } from '../coupons/schemas/coupon.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';
import { MailService } from '../mail/mail.service';

@Injectable()
export class VenuesService {
  constructor(
    @InjectModel(Venue.name) private venueModel: Model<VenueDocument>,
    @InjectModel(VenueImage.name) private venueImageModel: Model<VenueImageDocument>,
    @InjectModel(Court.name) private courtModel: Model<CourtDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
    private notificationsService: NotificationsService,
    private mailService: MailService,
  ) { }

  async findAll(query: any): Promise<ApiResponseType> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};

    // Status filter
    if (query.status) {
      filter.status = query.status;
    } else if (!query.allStatuses) {
      filter.status = VenueStatus.ACTIVE;
    }

    if (query.ownerId) {
      filter.ownerId = new Types.ObjectId(query.ownerId);
    }

    // Filter out venues owned by blocked users (unless explicitly requesting all)
    if (!query.allStatuses && !query.ownerId) {
      const blockedOwners = await this.userModel.find({ status: 'BLOCKED' }).select('_id').exec();
      const blockedOwnerIds = blockedOwners.map(u => u._id);
      if (blockedOwnerIds.length > 0) {
        filter.ownerId = { $nin: blockedOwnerIds };
      }
    }

    // Search filter
    const searchTerm = query.search || query.keyword;
    if (searchTerm) {
      filter.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { address: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    // Price range filter
    if (query.minPrice || query.maxPrice) {
      filter.pricePerHour = {};
      if (query.minPrice) filter.pricePerHour.$gte = Number(query.minPrice);
      if (query.maxPrice) filter.pricePerHour.$lte = Number(query.maxPrice);
    }

    // Sorting
    let sortOptions: any = { createdAt: -1, _id: -1 };
    if (query.sortBy === 'price_asc') {
      sortOptions = { pricePerHour: 1, _id: 1 };
    } else if (query.sortBy === 'price_desc') {
      sortOptions = { pricePerHour: -1, _id: -1 };
    } else if (query.sortBy === 'rating_desc') {
      sortOptions = { averageRating: -1, _id: -1 };
    } else if (query.sortBy === 'asc' || query.sortBy === 'createdAt_asc') {
      sortOptions = { createdAt: 1, _id: 1 };
    } else if (query.sortBy === 'desc' || query.sortBy === 'createdAt_desc') {
      sortOptions = { createdAt: -1, _id: -1 };
    }

    // Geospatial sorting (Nearest)
    let venues: any[];
    let total: number;

    if (query.sortBy === 'nearest' && query.lat && query.lng) {
      const lat = Number(query.lat);
      const lng = Number(query.lng);

      // Use aggregation for $geoNear to get distance
      venues = await this.venueModel.aggregate([
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [lng, lat] },
            distanceField: 'distance',
            query: filter,
            spherical: true,
          },
        },
        { $skip: skip },
        { $limit: limit },
      ]);

      // Count total for nearest
      const countResult = await this.venueModel.aggregate([
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [lng, lat] },
            distanceField: 'distance',
            query: filter,
            spherical: true,
          },
        },
        { $count: 'total' }
      ]);
      total = countResult[0]?.total || 0;
    } else {
      [venues, total] = await Promise.all([
        this.venueModel.find(filter)
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .exec(),
        this.venueModel.countDocuments(filter),
      ]);
    }

    // Get available counts, courts list and images for each venue
    const venuesWithAvailability = await Promise.all(venues.map(async (v) => {
      const venueObj = typeof v.toObject === 'function' ? v.toObject() : v;
      const [courts, images] = await Promise.all([
        this.courtModel.find({ venueId: venueObj._id }).select('name type status').exec(),
        this.venueImageModel.find({ venueId: venueObj._id }).exec()
      ]);
      const available = courts.filter(c => c.status === CourtStatus.AVAILABLE).length;
      const totalCourts = courts.length;
      return { ...venueObj, available, totalCourts, courts, images };
    }));

    return createApiResponse(
      {
        venues: venuesWithAvailability,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      'Lấy danh sách cơ sở sân thành công',
      HttpStatus.OK,
    );
  }

  async findOne(id: string): Promise<ApiResponseType> {
    if (!Types.ObjectId.isValid(id)) throw new HttpException('ID cơ sở không hợp lệ', HttpStatus.BAD_REQUEST);

    const venue = await this.venueModel.findById(id).populate('ownerId', 'fullName email phone').exec();
    if (!venue) throw new HttpException('Không tìm thấy cơ sở sân', HttpStatus.NOT_FOUND);

    const [images, available, courts] = await Promise.all([
      this.venueImageModel.find({ venueId: id }).exec(),
      this.courtModel.countDocuments({
        venueId: { $in: [id, new Types.ObjectId(id)] },
        status: CourtStatus.AVAILABLE
      }),
      this.courtModel.find({
        venueId: { $in: [id, new Types.ObjectId(id)] }
      }).exec()
    ]);

    const result = {
      ...venue.toObject(),
      images,
      available,
      courts
    };

    return createApiResponse(result, 'Lấy chi tiết cơ sở thành công', HttpStatus.OK);
  }

  async create(ownerId: string, dto: CreateVenueDto, forceStatus?: VenueStatus): Promise<ApiResponseType> {
    const { lat, lng, courts, ...rest } = dto;
    const createData: any = {
      ...rest,
      ownerId: new Types.ObjectId(ownerId),
      status: forceStatus || VenueStatus.PENDING, // New venues need admin approval by default
    };

    if (lat !== undefined && lng !== undefined) {
      createData.coordinates = {
        type: 'Point',
        coordinates: [lng, lat],
      };
    }

    const newVenue = await this.venueModel.create(createData);

    if (courts && courts.length > 0) {
      const courtData = courts.map(c => ({
        ...c,
        venueId: newVenue._id
      }));
      await this.courtModel.insertMany(courtData);
    }

    return createApiResponse(newVenue, 'Đăng ký cơ sở sân mới thành công', HttpStatus.CREATED);
  }

  async update(id: string, ownerId: string, dto: UpdateVenueDto, isAdmin: boolean = false): Promise<ApiResponseType> {
    if (!Types.ObjectId.isValid(id)) throw new HttpException('ID cơ sở không hợp lệ', HttpStatus.BAD_REQUEST);

    // Nếu không phải admin thì phải kiểm tra quyền sở hữu
    const filter: any = { _id: new Types.ObjectId(id) };
    if (!isAdmin) {
      filter.ownerId = new Types.ObjectId(ownerId);
    }

    const venue = await this.venueModel.findOne(filter).exec();
    if (!venue) {
      const msg = isAdmin ? 'Không tìm thấy cơ sở sân' : 'Bạn không có quyền cập nhật cơ sở này hoặc cơ sở không tồn tại';
      throw new HttpException(msg, HttpStatus.NOT_FOUND);
    }

    const { lat, lng, courts, ...rest } = dto;
    const updateData: any = { ...rest };

    if (lat !== undefined && lng !== undefined) {
      updateData.coordinates = {
        type: 'Point',
        coordinates: [lng, lat],
      };
    }

    const updatedVenue = await this.venueModel.findByIdAndUpdate(id, { $set: updateData }, { new: true }).exec();

    let updatedCourts = [];
    if (courts) {
      await this.courtModel.deleteMany({
        venueId: { $in: [id, new Types.ObjectId(id)] }
      }).exec();

      if (courts.length > 0) {
        const courtData = courts.map(c => ({
          ...c,
          venueId: new Types.ObjectId(id)
        }));
        updatedCourts = await this.courtModel.insertMany(courtData);
      }
    } else {
      updatedCourts = await this.courtModel.find({ venueId: new Types.ObjectId(id) }).exec();
    }

    const [images, available] = await Promise.all([
      this.venueImageModel.find({ venueId: id }).exec(),
      this.courtModel.countDocuments({ venueId: new Types.ObjectId(id), status: CourtStatus.AVAILABLE })
    ]);

    const result = {
      ...updatedVenue.toObject(),
      images,
      available,
      courts: updatedCourts
    };

    return createApiResponse(result, 'Cập nhật thông tin cơ sở thành công', HttpStatus.OK);
  }

  async addImage(id: string, ownerId: string, dto: AddVenueImageDto, isAdmin: boolean = false): Promise<ApiResponseType> {
    if (!Types.ObjectId.isValid(id)) throw new HttpException('ID cơ sở không hợp lệ', HttpStatus.BAD_REQUEST);

    const filter: any = { _id: new Types.ObjectId(id) };
    if (!isAdmin) {
      filter.ownerId = new Types.ObjectId(ownerId);
    }

    const venue = await this.venueModel.findOne(filter).exec();
    if (!venue) {
      const msg = isAdmin ? 'Không tìm thấy cơ sở sân' : 'Bạn không có quyền thêm ảnh cho cơ sở này hoặc cơ sở không tồn tại';
      throw new HttpException(msg, HttpStatus.NOT_FOUND);
    }

    if (dto.isPrimary) {
      await this.venueImageModel.updateMany({ venueId: id }, { isPrimary: false }).exec();
    }

    const newImage = await this.venueImageModel.create({
      venueId: id,
      imageUrl: dto.imageUrl,
      isPrimary: dto.isPrimary || false,
    });

    return createApiResponse(newImage, 'Thêm hình ảnh thành công', HttpStatus.CREATED);
  }

  async updateStatus(id: string, status: string, reason?: string): Promise<ApiResponseType> {
    if (!Types.ObjectId.isValid(id)) throw new HttpException('ID cơ sở không hợp lệ', HttpStatus.BAD_REQUEST);

    const venue = await this.venueModel.findById(id).populate('ownerId', 'fullName email').exec();
    if (!venue) throw new HttpException('Không tìm thấy cơ sở sân', HttpStatus.NOT_FOUND);

    const updateData: any = { status };
    if (reason) updateData.statusReason = reason;

    const updatedVenue = await this.venueModel.findByIdAndUpdate(id, { $set: updateData }, { new: true }).exec();

    // Send email notification to owner
    const owner = venue.ownerId as any;
    if (owner?.email) {
      this.mailService.sendVenueReviewEmail({
        email: owner.email,
        fullName: owner.fullName,
        venueName: (venue as any).name,
        status: status as 'ACTIVE' | 'APPROVED' | 'REJECTED',
        rejectReason: reason,
      }).catch(() => { }); // Fire and forget
    }

    return createApiResponse(updatedVenue, 'Cập nhật trạng thái thành công', HttpStatus.OK);
  }

  async remove(id: string): Promise<ApiResponseType> {
    if (!Types.ObjectId.isValid(id)) throw new HttpException('ID cơ sở không hợp lệ', HttpStatus.BAD_REQUEST);

    const venue = await this.venueModel.findById(id).exec();
    if (!venue) throw new HttpException('Không tìm thấy cơ sở sân', HttpStatus.NOT_FOUND);

    await Promise.all([
      this.venueModel.findByIdAndDelete(id).exec(),
      this.courtModel.deleteMany({ venueId: id }).exec(),
      this.venueImageModel.deleteMany({ venueId: id }).exec(),
    ]);

    return createApiResponse(null, 'Xóa cơ sở sân thành công', HttpStatus.OK);
  }

  async resetAllRatings(): Promise<ApiResponseType> {
    await this.venueModel.updateMany({}, { $set: { averageRating: 0 } }).exec();
    return createApiResponse({ updated: true }, 'Đã reset tất cả ratings về 0', HttpStatus.OK);
  }
  async requestClosure(id: string, userId: string): Promise<ApiResponseType> {
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException('ID cơ sở không hợp lệ', HttpStatus.BAD_REQUEST);
    }
    const venue = await this.venueModel.findById(id).exec();
    if (!venue || venue.ownerId.toString() !== userId) {
      throw new HttpException('Không tìm thấy cơ sở hoặc bạn không có quyền', HttpStatus.FORBIDDEN);
    }
    
    venue.status = VenueStatus.PENDING_CLOSURE;
    await venue.save();

    // Notify admins
    const admins = await this.userModel.find({ role: 'ADMIN' }).select('_id').exec();
    for (const admin of admins) {
      this.notificationsService.sendAndSaveNotification(
        admin._id.toString(),
        '🏢 Yêu cầu đóng cửa cơ sở',
        `Chủ sân đã yêu cầu đóng cửa cơ sở ${venue.name}. Vui lòng kiểm tra và phê duyệt.`,
        NotificationType.SYSTEM_ALERT
      ).catch(console.error);
    }

    return createApiResponse(null, 'Đã gửi yêu cầu đóng cửa cơ sở. Vui lòng chờ phê duyệt (tối đa 3 ngày).', HttpStatus.OK);
  }

  async cancelClosure(id: string, userId: string): Promise<ApiResponseType> {
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException('ID cơ sở không hợp lệ', HttpStatus.BAD_REQUEST);
    }
    const venue = await this.venueModel.findById(id).exec();
    if (!venue || venue.ownerId.toString() !== userId) {
      throw new HttpException('Không tìm thấy cơ sở hoặc bạn không có quyền', HttpStatus.FORBIDDEN);
    }
    
    if (venue.status !== VenueStatus.PENDING_CLOSURE) {
      throw new HttpException('Cơ sở không ở trạng thái chờ duyệt đóng cửa', HttpStatus.BAD_REQUEST);
    }

    venue.status = VenueStatus.ACTIVE;
    await venue.save();

    // Notify admins that the owner cancelled the request
    const admins = await this.userModel.find({ role: 'ADMIN' }).select('_id').exec();
    for (const admin of admins) {
      this.notificationsService.sendAndSaveNotification(
        admin._id.toString(),
        '✅ Hủy yêu cầu đóng cửa cơ sở',
        `Chủ sân đã HỦY yêu cầu đóng cửa cơ sở ${venue.name}. Cơ sở này hiện đã hoạt động trở lại.`,
        NotificationType.SYSTEM_ALERT
      ).catch(console.error);
    }

    return createApiResponse(null, 'Đã hủy yêu cầu đóng cửa thành công. Cơ sở đã hoạt động bình thường.', HttpStatus.OK);
  }

  async approveClosure(id: string): Promise<ApiResponseType> {
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException('ID cơ sở không hợp lệ', HttpStatus.BAD_REQUEST);
    }
    const venue = await this.venueModel.findById(id).exec();
    if (!venue) {
      throw new HttpException('Không tìm thấy cơ sở', HttpStatus.NOT_FOUND);
    }

    venue.status = VenueStatus.CLOSED;
    await venue.save();

    // 1. Find all active bookings (PENDING, CONFIRMED)
    const activeBookings = await this.bookingModel.find({
      venueId: venue._id,
      status: { $in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] }
    }).exec();

    // 2. Process each booking
    for (const booking of activeBookings) {
      // Cancel booking
      booking.status = BookingStatus.CANCELLED;
      booking.cancelReason = 'Cơ sở ngưng hoạt động';
      booking.cancelledBy = 'SYSTEM';
      await booking.save();

      // Check payment status
      const payment = await this.paymentModel.findOne({ bookingId: booking._id }).sort({ createdAt: -1 }).exec();
      const isPaidViaVNPay = payment && payment.method === 'VNPAY' && payment.status === 'SUCCESS';
      
      if (isPaidViaVNPay) {
        // Mock refund VNPAY (in reality, trigger VNPAY refund API here)
        payment.status = 'REFUNDED' as any;
        await payment.save();
      }

      // Create 5% compensation coupon for the user
      const couponCode = `COMP5_${booking._id.toString().slice(-6).toUpperCase()}`;
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 30); // Valid for 30 days
      
      await this.couponModel.create({
        code: couponCode,
        ownerId: venue.ownerId, // required by schema
        venueId: null, // Apply to all venues of this owner (since the original venue is closed)
        discountType: DiscountType.PERCENTAGE,
        discountValue: 5,
        maxDiscountAmount: 50000, // schema uses maxDiscountAmount
        startDate: new Date(),
        endDate: validUntil,
        usageLimit: 1,
        usedCount: 0,
        status: CouponStatus.ACTIVE,
      });

      // Send Notification to user if they are registered
      if (booking.playerId) {
        const message = isPaidViaVNPay 
          ? `Rất tiếc, cơ sở ${venue.name} đã ngưng hoạt động nên đơn đặt sân của bạn bị hủy. Tiền (100%) sẽ được hoàn về tài khoản của bạn. Để tạ lỗi, hệ thống tặng bạn mã giảm giá 5%: ${couponCode}`
          : `Rất tiếc, cơ sở ${venue.name} đã ngưng hoạt động nên đơn đặt sân của bạn bị hủy. Để tạ lỗi, hệ thống tặng bạn mã giảm giá 5%: ${couponCode} cho lần đặt sân tiếp theo.`;

        this.notificationsService.sendAndSaveNotification(
          booking.playerId.toString(),
          '⚠️ Hủy đơn do cơ sở ngưng hoạt động',
          message,
          NotificationType.BOOKING_CANCELLED
        ).catch(console.error);
      }
    }

    // Notify owner
    this.notificationsService.sendAndSaveNotification(
      venue.ownerId.toString(),
      '🏢 Cơ sở đã đóng cửa',
      `Yêu cầu đóng cửa cơ sở ${venue.name} của bạn đã được duyệt. Tất cả đơn đặt sân hiện tại đã bị hủy.`,
      NotificationType.SYSTEM_ALERT
    ).catch(console.error);

    return createApiResponse(null, 'Đã duyệt đóng cửa cơ sở thành công', HttpStatus.OK);
  }

  async requestReopen(id: string, userId: string): Promise<ApiResponseType> {
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException('ID cơ sở không hợp lệ', HttpStatus.BAD_REQUEST);
    }
    const venue = await this.venueModel.findById(id).exec();
    if (!venue || venue.ownerId.toString() !== userId) {
      throw new HttpException('Không tìm thấy cơ sở hoặc bạn không có quyền', HttpStatus.FORBIDDEN);
    }
    
    if (venue.status !== VenueStatus.CLOSED) {
      throw new HttpException('Cơ sở không ở trạng thái ĐÃ ĐÓNG', HttpStatus.BAD_REQUEST);
    }

    venue.status = VenueStatus.PENDING; // Send back to pending state for admin to review
    await venue.save();

    // Notify admins
    const admins = await this.userModel.find({ role: 'ADMIN' }).select('_id').exec();
    for (const admin of admins) {
      this.notificationsService.sendAndSaveNotification(
        admin._id.toString(),
        '🏢 Xin mở lại cơ sở đã đóng',
        `Chủ sân đã yêu cầu xin mở lại cơ sở ${venue.name}. Vui lòng kiểm tra và phê duyệt.`,
        NotificationType.SYSTEM_ALERT
      ).catch(console.error);
    }

    return createApiResponse(null, 'Đã gửi yêu cầu mở lại cơ sở. Vui lòng chờ phê duyệt.', HttpStatus.OK);
  }
}
