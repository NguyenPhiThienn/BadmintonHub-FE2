import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Promotion, PromotionDocument } from './schemas/promotion.schema';
import { Venue, VenueDocument } from '../venues/schemas/venue.schema';
import { ApiResponseType, createApiResponse } from '../utils/response.util';
import { CreatePromotionDto, UpdatePromotionDto } from './dto/promotion.dto';
import { UserRole } from '../users/schemas/user.schema';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectModel(Promotion.name) private promotionModel: Model<PromotionDocument>,
    @InjectModel(Venue.name) private venueModel: Model<VenueDocument>,
  ) { }

  async getValidPromotions(venueId?: string): Promise<ApiResponseType> {
    const now = new Date();
    const filter: any = {
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    };

    if (venueId) {
      filter.$or = [
        { venueId: venueId },
        { venueId: null },
        { venueId: { $exists: false } }
      ];
    } else {
      // Only strictly global if no venue selected or frontend wants to view general promotions
      filter.$or = [
        { venueId: null },
        { venueId: { $exists: false } }
      ];
    }

    const promotions = await this.promotionModel.find(filter).exec();
    return createApiResponse(promotions, 'Lấy danh sách khuyến mãi thành công', HttpStatus.OK);
  }

  async create(user: any, dto: CreatePromotionDto): Promise<ApiResponseType> {
    if (dto.venueId) {
      if (!Types.ObjectId.isValid(dto.venueId)) {
        throw new HttpException('ID cơ sở không hợp lệ', HttpStatus.BAD_REQUEST);
      }
      const venue = await this.venueModel.findById(dto.venueId).exec();
      if (!venue) {
        throw new HttpException('Không tìm thấy cơ sở', HttpStatus.NOT_FOUND);
      }
      if (user.role !== UserRole.ADMIN && venue.ownerId.toString() !== user.id.toString()) {
        throw new HttpException('Bạn không có quyền thực hiện trên cơ sở này', HttpStatus.FORBIDDEN);
      }
    } else {
      if (user.role !== UserRole.ADMIN) {
        throw new HttpException('Chỉ Quản trị viên mới được tạo mã khuyến mãi toàn hệ thống', HttpStatus.FORBIDDEN);
      }
    }

    const exists = await this.promotionModel.findOne({ code: dto.code }).exec();
    if (exists) {
      throw new HttpException('Mã khuyến mãi đã tồn tại', HttpStatus.BAD_REQUEST);
    }

    const newPromotion = await this.promotionModel.create(dto);
    return createApiResponse(newPromotion, 'Tạo mã khuyến mãi thành công', HttpStatus.CREATED);
  }

  async update(id: string, user: any, dto: UpdatePromotionDto): Promise<ApiResponseType> {
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException('ID khuyến mãi không hợp lệ', HttpStatus.BAD_REQUEST);
    }

    const promotion = await this.promotionModel.findById(id).exec();
    if (!promotion) {
      throw new HttpException('Không tìm thấy mã khuyến mãi', HttpStatus.NOT_FOUND);
    }

    if (promotion.venueId) {
      const venue = await this.venueModel.findById(promotion.venueId).exec();
      if (!venue || (user.role !== UserRole.ADMIN && venue.ownerId.toString() !== user.id.toString())) {
        throw new HttpException('Bạn không có quyền cập nhật mã khuyến mãi này', HttpStatus.FORBIDDEN);
      }
    } else {
      if (user.role !== UserRole.ADMIN) {
        throw new HttpException('Chỉ Quản trị viên mới được sửa mã khuyến mãi toàn hệ thống', HttpStatus.FORBIDDEN);
      }
    }

    if (dto.code && dto.code !== promotion.code) {
      const exists = await this.promotionModel.findOne({ code: dto.code }).exec();
      if (exists) {
        throw new HttpException('Mã khuyến mãi này đã tồn tại', HttpStatus.BAD_REQUEST);
      }
    }

    const updatedPromotion = await this.promotionModel.findByIdAndUpdate(id, { $set: dto }, { new: true }).exec();
    return createApiResponse(updatedPromotion, 'Cập nhật mã khuyến mãi thành công', HttpStatus.OK);
  }

  async findAll(page: number, limit: number, venueId?: string, search?: string): Promise<ApiResponseType> {
    const skip = (page - 1) * limit;
    const filter: any = {};
    if (venueId) filter.venueId = venueId;
    if (search) {
      filter.code = { $regex: search, $options: 'i' };
    }

    const [promotions, total] = await Promise.all([
      this.promotionModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.promotionModel.countDocuments(filter),
    ]);

    return createApiResponse(
      {
        promotions,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      'Lấy danh sách khuyến mãi thành công',
      HttpStatus.OK,
    );
  }
}
