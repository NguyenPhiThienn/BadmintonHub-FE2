import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserRole } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { ApiResponseType, createApiResponse } from '../utils/response.util';
import { CreateOwnerRequestDto, ReviewOwnerRequestDto } from './dto/owner-request.dto';
import { OwnerRequest, OwnerRequestDocument, OwnerRequestStatus } from './schemas/owner-request.schema';

import { User, UserDocument } from '../users/schemas/user.schema';
import { VenueStatus } from '../venues/schemas/venue.schema';
import { VenuesService } from '../venues/venues.service';

@Injectable()
export class OwnerRequestsService {
  constructor(
    @InjectModel(OwnerRequest.name) private ownerRequestModel: Model<OwnerRequestDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private usersService: UsersService,
    private venuesService: VenuesService,
  ) {}

  async create(userId: string, dto: CreateOwnerRequestDto): Promise<ApiResponseType> {
    // Check if the user already has a pending or approved request
    const existingRequest = await this.ownerRequestModel.findOne({
      userId,
      status: { $in: [OwnerRequestStatus.PENDING, OwnerRequestStatus.APPROVED] }
    }).exec();

    if (existingRequest) {
      if (existingRequest.status === OwnerRequestStatus.PENDING) {
        throw new HttpException('Bạn đã gửi một đơn đăng ký trước đó và đang chờ xét duyệt', HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException('Tài khoản của bạn đã được duyệt làm chủ sân', HttpStatus.BAD_REQUEST);
      }
    }

    // Check for duplicate identityCard
    const duplicateIdentity = await this.ownerRequestModel.findOne({
      identityCard: dto.identityCard,
      status: { $ne: OwnerRequestStatus.REJECTED }
    }).exec();

    if (duplicateIdentity) {
      throw new HttpException('Số CCCD này đã được sử dụng trong một hồ sơ đăng ký khác', HttpStatus.BAD_REQUEST);
    }

    const newRequest = await this.ownerRequestModel.create({
      userId,
      ...dto,
      status: OwnerRequestStatus.PENDING
    });

    return createApiResponse(newRequest, 'Gửi đơn đăng ký chủ sân thành công', HttpStatus.CREATED);
  }

  async getMyRequest(userId: string): Promise<ApiResponseType> {
    const request = await this.ownerRequestModel.findOne({ userId })
      .sort({ createdAt: -1 })
      .exec();
    
    return createApiResponse(request, 'Lấy thông tin đăng ký của tôi thành công', HttpStatus.OK);
  }

  async findAll(query: any): Promise<ApiResponseType> {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.status && query.status !== 'all') {
      filter.status = query.status;
    }

    if (query.search) {
      const searchRegex = new RegExp(query.search, 'i');
      
      // Find matching users first
      const matchedUsers = await this.userModel.find({
        $or: [
          { fullName: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
        ],
      }).select('_id').exec();

      const matchedUserIds = matchedUsers.map(user => user._id);

      // Filter requests by matching user IDs OR search in local fields
      filter.$or = [
        { userId: { $in: matchedUserIds } },
        { courtAddress: searchRegex },
        { identityCard: searchRegex },
      ];
    }

    const [requests, total] = await Promise.all([
      this.ownerRequestModel.find(filter)
        .populate('userId', 'fullName email phone avatarUrl')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.ownerRequestModel.countDocuments(filter),
    ]);

    return createApiResponse({
      requests,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }, 'Lấy danh sách đơn đăng ký thành công', HttpStatus.OK);
  }

  async findOne(id: string): Promise<ApiResponseType> {
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException('ID đơn đăng ký không hợp lệ', HttpStatus.BAD_REQUEST);
    }

    const request = await this.ownerRequestModel.findById(id)
      .populate('userId', 'fullName email phone avatarUrl')
      .exec();

    if (!request) {
      throw new HttpException('Không tìm thấy đơn đăng ký', HttpStatus.NOT_FOUND);
    }

    return createApiResponse(request, 'Lấy chi tiết đơn đăng ký thành công', HttpStatus.OK);
  }

  async review(id: string, dto: ReviewOwnerRequestDto): Promise<ApiResponseType> {
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException('ID đơn đăng ký không hợp lệ', HttpStatus.BAD_REQUEST);
    }

    const request = await this.ownerRequestModel.findById(id).exec();
    if (!request) {
      throw new HttpException('Không tìm thấy đơn đăng ký', HttpStatus.NOT_FOUND);
    }

    if (request.status !== OwnerRequestStatus.PENDING) {
      throw new HttpException('Đơn đăng ký này đã được xử lý trước đó', HttpStatus.BAD_REQUEST);
    }

    request.status = dto.status as any;
    if (dto.status === OwnerRequestStatus.REJECTED) {
      if (!dto.rejectReason) {
        throw new HttpException('Vui lòng nhập lý do từ chối', HttpStatus.BAD_REQUEST);
      }
      request.rejectReason = dto.rejectReason;
    }

    await request.save();

    // If approved, update user role to OWNER and create a default venue
    if (dto.status === OwnerRequestStatus.APPROVED) {
      await this.usersService.update(request.userId.toString(), {
        role: UserRole.COURT_OWNER as any,
      } as any);

      // Auto-create venue from the owner's request info (ACTIVE since owner is approved)
      const user = await this.userModel.findById(request.userId).exec();
      await this.venuesService.create(request.userId.toString(), {
        name: `Cơ sở của ${user?.fullName || 'Chủ sân'}`,
        address: request.courtAddress,
        lat: 10.8231, // default coordinates (Ho Chi Minh City center)
        lng: 106.6297,
        description: 'Cơ sở sân cầu lông đang chờ hoàn thiện thông tin.',
        openTime: '06:00',
        closeTime: '22:00',
        pricePerHour: 60000,
      }, VenueStatus.ACTIVE);
    }

    const populatedRequest = await this.ownerRequestModel.findById(id)
      .populate('userId', 'fullName email phone avatarUrl')
      .exec();

    return createApiResponse(populatedRequest, 'Xử lý đơn đăng ký thành công', HttpStatus.OK);
  }
}
