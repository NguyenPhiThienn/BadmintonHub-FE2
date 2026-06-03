import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Coupon, CouponDocument, CouponStatus } from './schemas/coupon.schema';
import { CreateCouponDto, UpdateCouponDto } from './dto/coupon.dto';
import { ApiResponseType, createApiResponse } from '../utils/response.util';
import { UserRole } from '../users/schemas/user.schema';

@Injectable()
export class CouponsService {
  constructor(
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
  ) {}

  async findAll(ownerId: string, query: any): Promise<ApiResponseType> {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter: any = { ownerId: new Types.ObjectId(ownerId), status: { $ne: CouponStatus.DELETED } };
    
    if (query.status) {
      filter.status = query.status;
    }

    if (query.search) {
      filter.code = { $regex: query.search, $options: 'i' };
    }

    const coupons = await this.couponModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.couponModel.countDocuments(filter);

    return createApiResponse(
      { coupons, total, page, totalPages: Math.ceil(total / limit) },
      'Lấy danh sách mã khuyến mãi thành công',
      HttpStatus.OK,
    );
  }

  async findOne(id: string, ownerId: string): Promise<ApiResponseType> {
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException('ID mã khuyến mãi không hợp lệ', HttpStatus.BAD_REQUEST);
    }

    const coupon = await this.couponModel.findOne({ _id: id, ownerId: new Types.ObjectId(ownerId), status: { $ne: CouponStatus.DELETED } }).exec();
    
    if (!coupon) {
      throw new HttpException('Không tìm thấy mã khuyến mãi', HttpStatus.NOT_FOUND);
    }

    return createApiResponse(coupon, 'Lấy chi tiết mã khuyến mãi thành công', HttpStatus.OK);
  }

  async create(ownerId: string, dto: CreateCouponDto): Promise<ApiResponseType> {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (endDate <= startDate) {
      throw new HttpException('Ngày kết thúc phải sau ngày bắt đầu', HttpStatus.BAD_REQUEST);
    }

    const existingCode = await this.couponModel.findOne({ code: dto.code.toUpperCase(), status: { $ne: CouponStatus.DELETED } }).exec();
    if (existingCode) {
      throw new HttpException('Mã khuyến mãi này đã tồn tại', HttpStatus.BAD_REQUEST);
    }

    const newCoupon = await this.couponModel.create({
      ...dto,
      code: dto.code.toUpperCase(),
      ownerId: new Types.ObjectId(ownerId),
      venueId: dto.venueId ? new Types.ObjectId(dto.venueId) : null,
    });

    return createApiResponse(newCoupon, 'Tạo mã khuyến mãi thành công', HttpStatus.CREATED);
  }

  async update(id: string, ownerId: string, dto: UpdateCouponDto): Promise<ApiResponseType> {
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException('ID mã khuyến mãi không hợp lệ', HttpStatus.BAD_REQUEST);
    }

    const coupon = await this.couponModel.findOne({ _id: id, ownerId: new Types.ObjectId(ownerId) }).exec();
    if (!coupon) {
      throw new HttpException('Không tìm thấy mã khuyến mãi', HttpStatus.NOT_FOUND);
    }

    if (coupon.usedCount > 0) {
      // Nếu đã sử dụng, chỉ cho phép sửa endDate, usageLimit, status
      const allowedFields = ['endDate', 'usageLimit', 'status'];
      const incomingFields = Object.keys(dto);
      
      const hasRestrictedFields = incomingFields.some(field => !allowedFields.includes(field));
      if (hasRestrictedFields) {
        throw new HttpException('Mã khuyến mãi đã có lượt sử dụng, chỉ có thể cập nhật ngày hết hạn, số lượng và trạng thái', HttpStatus.BAD_REQUEST);
      }
    } else {
      if (dto.startDate && dto.endDate) {
        if (new Date(dto.endDate) <= new Date(dto.startDate)) {
          throw new HttpException('Ngày kết thúc phải sau ngày bắt đầu', HttpStatus.BAD_REQUEST);
        }
      } else if (dto.endDate) {
        if (new Date(dto.endDate) <= new Date(coupon.startDate)) {
          throw new HttpException('Ngày kết thúc phải sau ngày bắt đầu', HttpStatus.BAD_REQUEST);
        }
      } else if (dto.startDate) {
        if (new Date(coupon.endDate) <= new Date(dto.startDate)) {
          throw new HttpException('Ngày kết thúc phải sau ngày bắt đầu', HttpStatus.BAD_REQUEST);
        }
      }

      if (dto.code && dto.code.toUpperCase() !== coupon.code) {
        const existingCode = await this.couponModel.findOne({ code: dto.code.toUpperCase(), status: { $ne: CouponStatus.DELETED } }).exec();
        if (existingCode) {
          throw new HttpException('Mã khuyến mãi này đã tồn tại', HttpStatus.BAD_REQUEST);
        }
        dto.code = dto.code.toUpperCase();
      }
    }

    const updatedCoupon = await this.couponModel.findByIdAndUpdate(id, { $set: dto }, { new: true }).exec();
    return createApiResponse(updatedCoupon, 'Cập nhật mã khuyến mãi thành công', HttpStatus.OK);
  }

  async remove(id: string, ownerId: string): Promise<ApiResponseType> {
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException('ID mã khuyến mãi không hợp lệ', HttpStatus.BAD_REQUEST);
    }

    const coupon = await this.couponModel.findOne({ _id: id, ownerId: new Types.ObjectId(ownerId) }).exec();
    if (!coupon) {
      throw new HttpException('Không tìm thấy mã khuyến mãi', HttpStatus.NOT_FOUND);
    }

    if (coupon.usedCount > 0) {
      coupon.status = CouponStatus.DELETED;
      await coupon.save();
    } else {
      await coupon.deleteOne();
    }

    return createApiResponse(null, 'Xóa mã khuyến mãi thành công', HttpStatus.OK);
  }
}
