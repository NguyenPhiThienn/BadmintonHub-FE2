import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Court, CourtDocument } from './schemas/court.schema';
import { Venue, VenueDocument } from '../venues/schemas/venue.schema';
import { ApiResponseType, createApiResponse } from '../utils/response.util';
import { CreateCourtDto, UpdateCourtDto } from './dto/court.dto';

@Injectable()
export class CourtsService {
  constructor(
    @InjectModel(Court.name) private courtModel: Model<CourtDocument>,
    @InjectModel(Venue.name) private venueModel: Model<VenueDocument>,
  ) { }

  async findByVenue(venueId: string): Promise<ApiResponseType> {
    if (!Types.ObjectId.isValid(venueId)) {
      throw new HttpException('ID cơ sở không hợp lệ', HttpStatus.BAD_REQUEST);
    }
    const courts = await this.courtModel.find({ venueId: venueId }).exec();
    return createApiResponse(courts, 'Lấy danh sách sân thành công', HttpStatus.OK);
  }

  async create(ownerId: string, dto: CreateCourtDto): Promise<ApiResponseType> {
    if (!Types.ObjectId.isValid(dto.venueId)) {
      throw new HttpException('ID cơ sở không hợp lệ', HttpStatus.BAD_REQUEST);
    }

    const venue = await this.venueModel.findById(dto.venueId).exec();
    if (!venue) {
      throw new HttpException('Không tìm thấy cơ sở', HttpStatus.NOT_FOUND);
    }

    // Admin could bypass this, but for now we enforce that owner is matching or skip verify if needed
    if (venue.ownerId.toString() !== ownerId.toString()) {
      throw new HttpException('Bạn không có quyền thực hiện trên cơ sở này', HttpStatus.FORBIDDEN);
    }

    const newCourt = await this.courtModel.create(dto);
    return createApiResponse(newCourt, 'Thêm sân mới thành công', HttpStatus.CREATED);
  }

  async update(id: string, ownerId: string, dto: UpdateCourtDto): Promise<ApiResponseType> {
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException('ID sân không hợp lệ', HttpStatus.BAD_REQUEST);
    }

    const court = await this.courtModel.findById(id).exec();
    if (!court) {
      throw new HttpException('Không tìm thấy sân', HttpStatus.NOT_FOUND);
    }

    const venue = await this.venueModel.findById(court.venueId).exec();
    if (!venue || venue.ownerId.toString() !== ownerId.toString()) {
      // In a real advanced app check if user role is ADMIN to bypass, here we check safely
      throw new HttpException('Bạn không có quyền cập nhật sân này', HttpStatus.FORBIDDEN);
    }

    const updatedCourt = await this.courtModel.findByIdAndUpdate(id, { $set: dto }, { new: true }).exec();
    return createApiResponse(updatedCourt, 'Cập nhật thông tin sân thành công', HttpStatus.OK);
  }
}
