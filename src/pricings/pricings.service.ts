import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Pricing, PricingDocument } from './schemas/pricing.schema';
import { Venue, VenueDocument } from '../venues/schemas/venue.schema';
import { ApiResponseType, createApiResponse } from '../utils/response.util';
import { CreatePricingDto, UpdatePricingDto } from './dto/pricing.dto';
import { UserRole } from '../users/schemas/user.schema';

@Injectable()
export class PricingsService {
  constructor(
    @InjectModel(Pricing.name) private pricingModel: Model<PricingDocument>,
    @InjectModel(Venue.name) private venueModel: Model<VenueDocument>,
  ) { }

  async findByVenue(venueId: string): Promise<ApiResponseType> {
    if (!Types.ObjectId.isValid(venueId)) {
      throw new HttpException('ID cơ sở không hợp lệ', HttpStatus.BAD_REQUEST);
    }
    const pricings = await this.pricingModel.find({ venueId: venueId }).exec();
    return createApiResponse(pricings, 'Lấy bảng giá thành công', HttpStatus.OK);
  }

  async create(user: any, dto: CreatePricingDto): Promise<ApiResponseType> {
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

    const overlappingPricing = await this.pricingModel.findOne({
      venueId: dto.venueId,
      dayOfWeek: dto.day_of_week ?? null,
      startTime: { $lt: dto.endTime },
      endTime: { $gt: dto.startTime },
    }).exec();

    if (overlappingPricing) {
      throw new HttpException('Khung giờ này đã bị trùng lặp với một bảng giá khác', HttpStatus.BAD_REQUEST);
    }

    const newPricing = await this.pricingModel.create({
      venueId: dto.venueId,
      dayOfWeek: dto.day_of_week,
      startTime: dto.startTime,
      endTime: dto.endTime,
      pricePerHour: dto.price_per_hour,
      label: dto.label,
    });
    return createApiResponse(newPricing, 'Thêm bảng giá thành công', HttpStatus.CREATED);
  }

  async update(id: string, user: any, dto: UpdatePricingDto): Promise<ApiResponseType> {
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException('ID bảng giá không hợp lệ', HttpStatus.BAD_REQUEST);
    }

    const pricing = await this.pricingModel.findById(id).exec();
    if (!pricing) {
      throw new HttpException('Không tìm thấy bảng giá', HttpStatus.NOT_FOUND);
    }

    const venue = await this.venueModel.findById(pricing.venueId).exec();
    if (!venue || (user.role !== UserRole.ADMIN && venue.ownerId.toString() !== user.id.toString())) {
      throw new HttpException('Bạn không có quyền cập nhật bảng giá này', HttpStatus.FORBIDDEN);
    }

    const updateData: any = {};
    if (dto.day_of_week !== undefined) updateData.dayOfWeek = dto.day_of_week;
    if (dto.startTime) updateData.startTime = dto.startTime;
    if (dto.endTime) updateData.endTime = dto.endTime;
    if (dto.price_per_hour !== undefined) updateData.pricePerHour = dto.price_per_hour;
    if (dto.label !== undefined) updateData.label = dto.label;

    if (updateData.startTime || updateData.endTime || updateData.dayOfWeek !== undefined) {
      const checkDay = updateData.dayOfWeek !== undefined ? updateData.dayOfWeek : pricing.dayOfWeek;
      const checkStart = updateData.startTime || pricing.startTime;
      const checkEnd = updateData.endTime || pricing.endTime;

      const overlappingPricing = await this.pricingModel.findOne({
        _id: { $ne: id },
        venueId: pricing.venueId,
        dayOfWeek: checkDay ?? null,
        startTime: { $lt: checkEnd },
        endTime: { $gt: checkStart },
      }).exec();

      if (overlappingPricing) {
        throw new HttpException('Khung giờ này đã bị trùng lặp với một bảng giá khác', HttpStatus.BAD_REQUEST);
      }
    }

    const updatedPricing = await this.pricingModel.findByIdAndUpdate(id, { $set: updateData }, { new: true }).exec();
    return createApiResponse(updatedPricing, 'Cập nhật bảng giá thành công', HttpStatus.OK);
  }

  async remove(id: string, user: any): Promise<ApiResponseType> {
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException('ID bảng giá không hợp lệ', HttpStatus.BAD_REQUEST);
    }

    const pricing = await this.pricingModel.findById(id).exec();
    if (!pricing) {
      throw new HttpException('Không tìm thấy bảng giá', HttpStatus.NOT_FOUND);
    }

    const venue = await this.venueModel.findById(pricing.venueId).exec();
    if (!venue || (user.role !== UserRole.ADMIN && venue.ownerId.toString() !== user.id.toString())) {
      throw new HttpException('Bạn không có quyền xóa bảng giá này', HttpStatus.FORBIDDEN);
    }

    await pricing.deleteOne();
    return createApiResponse(null, 'Xóa bảng giá thành công', HttpStatus.OK);
  }
}
