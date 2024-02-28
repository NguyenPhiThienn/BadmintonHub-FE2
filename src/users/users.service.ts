import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument, UserRole, BlockType } from './schemas/user.schema';
import { ApiResponseType, createApiResponse } from '../utils/response.util';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { Booking, BookingStatus } from '../bookings/schemas/booking.schema';
import { Venue, VenueDocument } from '../venues/schemas/venue.schema';
import { Court } from '../courts/schemas/court.schema';
import { BookingDetail } from '../bookings/schemas/booking-detail.schema';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AuditAction } from '../audit-logs/schemas/audit-log.schema';
import { AppGateway } from '../gateways/app.gateway';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
    @InjectModel(Venue.name) private venueModel: Model<VenueDocument>,
    @InjectModel(Court.name) private courtModel: Model<Court>,
    @InjectModel(BookingDetail.name) private bookingDetailModel: Model<BookingDetail>,
    private auditLogsService: AuditLogsService,
    private appGateway: AppGateway,
  ) {}

  async create(dto: CreateUserDto): Promise<ApiResponseType> {
    const { email, phone, password, ...rest } = dto;

    // Check duplicate
    const exists = await this.userModel.findOne({ $or: [{ email }, { phone }] }).exec();
    if (exists) {
      throw new HttpException('Email hoặc số điện thoại đã tồn tại', HttpStatus.BAD_REQUEST);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await this.userModel.create({
      ...rest,
      email,
      phone,
      passwordHash,
    });

    const result = newUser.toObject();
    delete result.passwordHash;

    return createApiResponse(result, 'Thêm người dùng mới thành công', HttpStatus.CREATED);
  }

  async getProfile(userId: string): Promise<ApiResponseType> {
    const user = await this.userModel.findById(userId).select('-passwordHash').exec();
    if (!user) {
      throw new HttpException('Người dùng không tồn tại', HttpStatus.NOT_FOUND);
    }
    return createApiResponse(user, 'Lấy thông tin thành công', HttpStatus.OK);
  }

  async updateProfile(userId: string, dto: UpdateUserDto): Promise<ApiResponseType> {
    const user = await this.userModel.findByIdAndUpdate(userId, { $set: dto }, { new: true }).select('-passwordHash').exec();
    if (!user) {
      throw new HttpException('Người dùng không tồn tại', HttpStatus.NOT_FOUND);
    }
    return createApiResponse(user, 'Cập nhật thông tin thành công', HttpStatus.OK);
  }

  async getAllUsers(page: number, limit: number, search?: string, role?: string, status?: string): Promise<ApiResponseType> {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    if (role && role !== 'all') {
      query.role = role;
    }

    if (status && status !== 'all') {
      query.status = status.toUpperCase();
    }

    const [users, total] = await Promise.all([
      this.userModel.find(query)
        .select('-passwordHash')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.userModel.countDocuments(query),
    ]);

    return createApiResponse(
      {
        users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      'Lấy danh sách người dùng thành công',
      HttpStatus.OK,
    );
  }

  async findOne(id: string): Promise<ApiResponseType> {
    const user = await this.userModel.findById(id).select('-passwordHash').exec();
    if (!user) {
      throw new HttpException('Người dùng không tồn tại', HttpStatus.NOT_FOUND);
    }
    return createApiResponse(user, 'Lấy chi tiết người dùng thành công', HttpStatus.OK);
  }

  async update(id: string, dto: UpdateUserDto): Promise<ApiResponseType> {
    const { password, ...rest } = dto as any;
    const updateData: any = { ...rest };
    if (password && password.trim()) {
      updateData.passwordHash = await bcrypt.hash(password.trim(), 10);
    }
    const user = await this.userModel.findByIdAndUpdate(id, { $set: updateData }, { new: true }).select('-passwordHash').exec();
    if (!user) {
      throw new HttpException('Người dùng không tồn tại', HttpStatus.NOT_FOUND);
    }

    // Gửi sự kiện cập nhật vai trò qua Socket
    if (dto.role) {
      this.appGateway.sendToUser(id, 'user:role_changed', { role: user.role });
    }

    return createApiResponse(user, 'Cập nhật người dùng thành công', HttpStatus.OK);
  }

  async blockUser(
    adminId: string,
    userId: string,
    data: { action: 'block' | 'unblock'; blockType?: string; reason?: string; days?: number }
  ): Promise<ApiResponseType> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new HttpException('ID người dùng không hợp lệ', HttpStatus.BAD_REQUEST);
    }

    const targetUser = await this.userModel.findById(userId).exec();
    if (!targetUser) {
      throw new HttpException('Người dùng không tồn tại', HttpStatus.NOT_FOUND);
    }

    // Không cho phép khóa tài khoản Admin
    if (targetUser.role === UserRole.ADMIN) {
      throw new HttpException('Không thể khóa tài khoản Admin', HttpStatus.FORBIDDEN);
    }

    if (data.action === 'block') {
      const blockData: any = {
        status: 'BLOCKED',
        blockType: data.blockType || BlockType.PERMANENT,
        blockedReason: data.reason || 'Vi phạm điều khoản sử dụng',
        blockedAt: new Date(),
        blockedBy: adminId,
      };

      // Nếu là khóa tạm thời, tính thời gian mở khóa
      if (data.blockType === BlockType.TEMPORARY && data.days) {
        const blockedUntil = new Date();
        blockedUntil.setDate(blockedUntil.getDate() + data.days);
        blockData.blockedUntil = blockedUntil;
      }

      await this.userModel.findByIdAndUpdate(userId, { $set: blockData }).exec();

      // Ghi audit log
      await this.auditLogsService.create({
        action: AuditAction.USER_BLOCK,
        performedBy: adminId,
        targetUser: userId,
        targetEmail: targetUser.email,
        details: {
          blockType: blockData.blockType,
          reason: blockData.blockedReason,
          blockedUntil: blockData.blockedUntil,
        },
      });

      // Gửi thông báo qua Socket
      this.appGateway.sendToUser(userId, 'user:blocked', {
        type: 'BLOCKED',
        blockType: blockData.blockType,
        reason: blockData.blockedReason,
        blockedUntil: blockData.blockedUntil,
        message: `Tài khoản của bạn đã bị khóa. Lý do: ${blockData.blockedReason}`,
      });

      return createApiResponse(null, 'Đã khóa tài khoản thành công', HttpStatus.OK);
    } else {
      await this.userModel.findByIdAndUpdate(userId, {
        $set: {
          status: 'ACTIVE',
          blockType: null,
          blockedReason: null,
          blockedAt: null,
          blockedUntil: null,
          blockedBy: null,
        },
      }).exec();

      // Ghi audit log
      await this.auditLogsService.create({
        action: AuditAction.USER_UNBLOCK,
        performedBy: adminId,
        targetUser: userId,
        targetEmail: targetUser.email,
        details: {},
      });

      // Gửi thông báo qua Socket
      this.appGateway.sendToUser(userId, 'user:unblocked', {
        type: 'UNBLOCKED',
        message: 'Tài khoản của bạn đã được mở khóa.',
      });

      return createApiResponse(null, 'Đã mở khóa tài khoản thành công', HttpStatus.OK);
    }
  }

  async remove(id: string): Promise<ApiResponseType> {
    // Check if user is OWNER role
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new HttpException('Người dùng không tồn tại', HttpStatus.NOT_FOUND);
    }

    // Nếu là chủ sân (OWNER), kiểm tra và xóa các cơ sở của họ
    if (user.role === 'OWNER') {
      // Tìm tất cả venue của owner
      const venues = await this.venueModel.find({ ownerId: new Types.ObjectId(id) }).exec();
      
      for (const venue of venues) {
        // Kiểm tra có đơn đặt sân chưa hoàn thành không
        const incompleteBookings = await this.bookingModel.find({
          venueId: venue._id,
          status: { $in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] }
        }).exec();

        if (incompleteBookings.length > 0) {
          throw new HttpException(
            `Không thể xóa: Cơ sở "${venue.name}" có ${incompleteBookings.length} đơn đặt sân chưa hoàn thành. Vui lòng xử lý các đơn đặt trước.`,
            HttpStatus.BAD_REQUEST
          );
        }

        // Xóa các booking details liên quan đến venue
        await this.bookingDetailModel.deleteMany({ venueId: venue._id }).exec();
        
        // Xóa các court của venue
        await this.courtModel.deleteMany({ venueId: venue._id }).exec();
        
        // Xóa venue
        await this.venueModel.findByIdAndDelete(venue._id).exec();
      }
    }

    // Xóa các đơn đặt sân của user (nếu là PLAYER)
    await this.bookingModel.deleteMany({ playerId: new Types.ObjectId(id) }).exec();

    // Xóa user
    await this.userModel.findByIdAndDelete(id).exec();
    
    return createApiResponse(null, 'Xóa người dùng và các dữ liệu liên quan thành công', HttpStatus.OK);
  }
}
