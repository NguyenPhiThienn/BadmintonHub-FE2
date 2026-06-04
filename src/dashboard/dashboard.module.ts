import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { AdminDashboardController } from './admin-dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Booking, BookingSchema } from '../bookings/schemas/booking.schema';
import { BookingDetail, BookingDetailSchema } from '../bookings/schemas/booking-detail.schema';
import { Venue, VenueSchema } from '../venues/schemas/venue.schema';
import { Court, CourtSchema } from '../courts/schemas/court.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Payment, PaymentSchema } from '../payments/schemas/payment.schema';
import { RevenueSummary, RevenueSummarySchema } from './schemas/revenue-summary.schema';
import { OwnerRequest, OwnerRequestSchema } from '../owner-requests/schemas/owner-request.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: BookingDetail.name, schema: BookingDetailSchema },
      { name: Venue.name, schema: VenueSchema },
      { name: Court.name, schema: CourtSchema },
      { name: User.name, schema: UserSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: RevenueSummary.name, schema: RevenueSummarySchema },
      { name: OwnerRequest.name, schema: OwnerRequestSchema },
    ]),
  ],
  controllers: [DashboardController, AdminDashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
