import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from './schemas/user.schema';
import { Booking, BookingSchema } from '../bookings/schemas/booking.schema';
import { Venue, VenueSchema } from '../venues/schemas/venue.schema';
import { Court, CourtSchema } from '../courts/schemas/court.schema';
import { BookingDetail, BookingDetailSchema } from '../bookings/schemas/booking-detail.schema';
import { VenueImage, VenueImageSchema } from '../venues/schemas/venue-image.schema';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: Venue.name, schema: VenueSchema },
      { name: Court.name, schema: CourtSchema },
      { name: BookingDetail.name, schema: BookingDetailSchema },
      { name: VenueImage.name, schema: VenueImageSchema },
    ]),
    AuditLogsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, MongooseModule],
})
export class UsersModule { }
