import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AvailabilityController } from './availability.controller';
import { AvailabilityService } from './availability.service';
import { Court, CourtSchema } from '../courts/schemas/court.schema';
import { Venue, VenueSchema } from '../venues/schemas/venue.schema';
import { BookingDetail, BookingDetailSchema } from '../bookings/schemas/booking-detail.schema';
import { CourtUnavailableTime, CourtUnavailableTimeSchema } from '../courts/schemas/court-unavailable-time.schema';
import { Booking, BookingSchema } from '../bookings/schemas/booking.schema';
import { SlotLock, SlotLockSchema } from './schemas/slot-lock.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Court.name, schema: CourtSchema },
      { name: Venue.name, schema: VenueSchema },
      { name: BookingDetail.name, schema: BookingDetailSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: CourtUnavailableTime.name, schema: CourtUnavailableTimeSchema },
      { name: SlotLock.name, schema: SlotLockSchema },
    ]),
  ],
  controllers: [AvailabilityController],
  providers: [AvailabilityService],
  exports: [AvailabilityService],
})
export class AvailabilityModule { }
