import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BookingDetail, BookingDetailDocument } from '../bookings/schemas/booking-detail.schema';
import { CourtUnavailableTime, CourtUnavailableTimeDocument } from '../courts/schemas/court-unavailable-time.schema';
import { Court, CourtDocument } from '../courts/schemas/court.schema';
import { ApiResponseType, createApiResponse } from '../utils/response.util';
import { Venue, VenueDocument } from '../venues/schemas/venue.schema';
import { BlockAvailabilityDto, GetAvailabilityDto, LockSlotDto } from './dto/availability.dto';
import { SlotLock, SlotLockDocument } from './schemas/slot-lock.schema';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectModel(Court.name) private courtModel: Model<CourtDocument>,
    @InjectModel(Venue.name) private venueModel: Model<VenueDocument>,
    @InjectModel(BookingDetail.name) private bookingDetailModel: Model<BookingDetailDocument>,
    @InjectModel(CourtUnavailableTime.name) private unavailableTimeModel: Model<CourtUnavailableTimeDocument>,
    @InjectModel(SlotLock.name) private slotLockModel: Model<SlotLockDocument>,
  ) { }

  async getAvailability(dto: GetAvailabilityDto): Promise<ApiResponseType> {
    const { courtId, venueId, date, userId } = dto;

    if (!courtId && !venueId) {
      throw new HttpException('Vui lòng cung cấp courtId hoặc venueId', HttpStatus.BAD_REQUEST);
    }

    let courts: CourtDocument[] = [];
    if (venueId) {
      if (!Types.ObjectId.isValid(venueId)) throw new HttpException('ID cơ sở không hợp lệ', HttpStatus.BAD_REQUEST);
      courts = await this.courtModel.find({ venueId: new Types.ObjectId(venueId), status: 'AVAILABLE' }).populate('venueId').exec();
    } else {
      if (!Types.ObjectId.isValid(courtId)) throw new HttpException('ID sân không hợp lệ', HttpStatus.BAD_REQUEST);
      const court = await this.courtModel.findById(courtId).populate('venueId').exec();
      if (court) courts = [court];
    }

    if (courts.length === 0) {
      throw new HttpException('Không tìm thấy sân phù hợp', HttpStatus.NOT_FOUND);
    }

    const result = [];
    for (const court of courts) {
      const availability = await this._calculateCourtAvailability(court, date, userId);
      result.push(availability);
    }

    return createApiResponse(result, 'Lấy lịch trống thành công', HttpStatus.OK);
  }

  private async _calculateCourtAvailability(court: CourtDocument, date: string, currentUserId?: string) {
    try {
      const venue = court.venueId as unknown as VenueDocument;
      const openTime = venue.openTime || '06:00';
      const closeTime = venue.closeTime || '22:00';

      const [year, month, day] = date.split('-').map(Number);
      const queryDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
      const queryDateEnd = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

      const courtIdStr = court._id.toString();
      const bookings = await this.bookingDetailModel.find({
        courtId: { $in: [courtIdStr, new Types.ObjectId(courtIdStr)] },
      }).populate('bookingId').exec();

      const activeBookings = bookings.filter((b: any) => {
        if (!b.bookingId) return false;
        // Các trạng thái không chiếm slot: CANCELLED, NO_SHOW
        if (['CANCELLED', 'NO_SHOW'].includes(b.bookingId.status)) return false;

        const bDate = new Date(b.bookingDate);
        const isSameDay = bDate >= queryDate && bDate <= queryDateEnd;
        if (isSameDay) return true;

        if (b.bookingId.isWeekly) {
          const isBeforeOrEqual = bDate <= queryDateEnd;
          const isSameDayOfWeek = bDate.getUTCDay() === queryDate.getUTCDay();
          if (isBeforeOrEqual && isSameDayOfWeek) return true;
        }

        return false;
      });

      const blocks = await this.unavailableTimeModel.find({
        courtId: court._id,
        $or: [
          { startDatetime: { $lte: queryDateEnd }, endDatetime: { $gte: queryDate } },
        ],
      }).exec();

      const locks = await this.slotLockModel.find({
        courtId: court._id,
        date: date
      }).exec();

      const slots = [];
      const [openH, openM] = openTime.split(':').map(Number);
      const [closeH, closeM] = closeTime.split(':').map(Number);

      let currentH = openH;
      let currentM = openM;

      while (currentH < closeH || (currentH === closeH && currentM < closeM)) {
        const nextH = currentH + 1;
        const nextM = currentM;
        if (nextH > closeH || (nextH === closeH && nextM > closeM)) break;

        const slotStart = `${currentH.toString().padStart(2, '0')}:${currentM.toString().padStart(2, '0')}`;
        const slotEnd = `${nextH.toString().padStart(2, '0')}:${nextM.toString().padStart(2, '0')}`;

        const isBooked = activeBookings.some(b => {
          const bStart = b.startTime.padStart(5, '0');
          const bEnd = b.endTime.padStart(5, '0');

          return (bStart <= slotStart && bEnd > slotStart) ||
            (bStart < slotEnd && bEnd >= slotEnd) ||
            (slotStart <= bStart && slotEnd >= bEnd);
        });

        const isBlocked = blocks.some(b => {
          const bStart = new Date(b.startDatetime);
          const bEnd = new Date(b.endDatetime);
          const slotStartDate = new Date(Date.UTC(year, month - 1, day, currentH, currentM, 0, 0));
          const slotEndDate = new Date(Date.UTC(year, month - 1, day, nextH, nextM, 0, 0));
          return (bStart <= slotStartDate && bEnd > slotStartDate) ||
            (bStart < slotEndDate && bEnd >= slotEndDate) ||
            (slotStartDate <= bStart && slotEndDate >= bEnd);
        });

        const isLockedByOther = locks.some(l => {
          return l.startTime === slotStart && l.userId !== currentUserId;
        });

        const lock = locks.find(l => l.startTime === slotStart);

        slots.push({
          startTime: slotStart,
          endTime: slotEnd,
          status: isBooked ? 'BOOKED' : (isBlocked ? 'BLOCKED' : (isLockedByOther ? 'LOCKED' : 'AVAILABLE')),
          userId: lock ? lock.userId : undefined,
        });

        currentH = nextH;
        currentM = nextM;
      }

      return {
        courtId: court._id,
        courtName: court.name,
        slots
      };
    } catch (error) {
      return {
        courtId: court._id,
        courtName: court.name,
        slots: [],
        error: error.message
      };
    }
  }

  async blockAvailability(ownerId: string, dto: BlockAvailabilityDto): Promise<ApiResponseType> {
    const { courtId, startDatetime, endDatetime, reason } = dto;

    if (!Types.ObjectId.isValid(courtId)) {
      throw new HttpException('ID sân không hợp lệ', HttpStatus.BAD_REQUEST);
    }

    const court = await this.courtModel.findById(courtId).exec();
    if (!court) {
      throw new HttpException('Không tìm thấy sân', HttpStatus.NOT_FOUND);
    }

    const venue = await this.venueModel.findById(court.venueId).exec();
    if (!venue || venue.ownerId.toString() !== ownerId.toString()) {
      throw new HttpException('Bạn không có quyền chặn lịch cho sân này', HttpStatus.FORBIDDEN);
    }

    const start = new Date(startDatetime);
    const end = new Date(endDatetime);

    if (start >= end) {
      throw new HttpException('Thời gian bắt đầu phải trước thời gian kết thúc', HttpStatus.BAD_REQUEST);
    }

    const block = await this.unavailableTimeModel.create({
      courtId: new Types.ObjectId(courtId),
      startDatetime: start,
      endDatetime: end,
      reason
    });

    return createApiResponse(block, 'Đã chặn khung giờ thành công', HttpStatus.CREATED);
  }

  async lockSlot(dto: LockSlotDto): Promise<ApiResponseType> {
    const { courtId, date, startTime, userId } = dto;

    if (!Types.ObjectId.isValid(courtId)) {
      throw new HttpException('ID sân không hợp lệ', HttpStatus.BAD_REQUEST);
    }

    const [hours, minutes] = startTime.split(':').map(Number);
    const endH = hours + 1;
    const endTime = `${endH.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    // Check if slot is already booked, blocked, or locked by another user
    // 1. Booked check
    const [year, month, day] = date.split('-').map(Number);
    const queryDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    const queryDateEnd = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

    const bookings = await this.bookingDetailModel.find({
      courtId: new Types.ObjectId(courtId),
      startTime: startTime,
    }).populate('bookingId').exec();

    const activeBookings = bookings.filter((b: any) => {
      if (!b.bookingId) return false;
      // Các trạng thái không chiếm slot: CANCELLED, NO_SHOW
      if (['CANCELLED', 'NO_SHOW'].includes(b.bookingId.status)) return false;

      const bDate = new Date(b.bookingDate);
      const isSameDay = bDate >= queryDate && bDate <= queryDateEnd;
      if (isSameDay) return true;

      if (b.bookingId.isWeekly) {
        const isBeforeOrEqual = bDate <= queryDateEnd;
        const isSameDayOfWeek = bDate.getUTCDay() === queryDate.getUTCDay();
        if (isBeforeOrEqual && isSameDayOfWeek) return true;
      }

      return false;
    });

    if (activeBookings.length > 0) {
      throw new HttpException('Khung giờ này đã được đặt', HttpStatus.BAD_REQUEST);
    }

    // 2. Blocked check
    const isBlocked = await this.unavailableTimeModel.findOne({
      courtId: new Types.ObjectId(courtId),
      $or: [
        { startDatetime: { $lte: queryDateEnd }, endDatetime: { $gte: queryDate } },
      ],
    }).exec();

    // 3. Locked by other check
    const isLocked = await this.slotLockModel.findOne({
      courtId: new Types.ObjectId(courtId),
      date,
      startTime,
      userId: { $ne: userId }
    }).exec();

    if (isLocked) {
      throw new HttpException('Khung giờ này đã bị khóa bởi người dùng khác', HttpStatus.BAD_REQUEST);
    }

    // Upsert lock (or create)
    const lock = await this.slotLockModel.findOneAndUpdate(
      { courtId: new Types.ObjectId(courtId), date, startTime, userId },
      { courtId: new Types.ObjectId(courtId), date, startTime, endTime, userId },
      { new: true, upsert: true }
    ).exec();

    return createApiResponse(lock, 'Khóa giờ thành công', HttpStatus.CREATED);
  }

  async unlockSlot(dto: LockSlotDto): Promise<ApiResponseType> {
    const { courtId, date, startTime, userId } = dto;

    if (!Types.ObjectId.isValid(courtId)) {
      throw new HttpException('ID sân không hợp lệ', HttpStatus.BAD_REQUEST);
    }

    await this.slotLockModel.deleteOne({
      courtId: new Types.ObjectId(courtId),
      date,
      startTime,
      userId
    }).exec();

    return createApiResponse(null, 'Mở khóa giờ thành công', HttpStatus.OK);
  }
}
