import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VenuesController } from './venues.controller';
import { AdminVenuesController } from './admin-venues.controller';
import { VenuesService } from './venues.service';
import { Venue, VenueSchema } from './schemas/venue.schema';
import { VenueImage, VenueImageSchema } from './schemas/venue-image.schema';
import { Court, CourtSchema } from '../courts/schemas/court.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Booking, BookingSchema } from '../bookings/schemas/booking.schema';
import { Payment, PaymentSchema } from '../payments/schemas/payment.schema';
import { Coupon, CouponSchema } from '../coupons/schemas/coupon.schema';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Venue.name, schema: VenueSchema },
      { name: VenueImage.name, schema: VenueImageSchema },
      { name: Court.name, schema: CourtSchema },
      { name: User.name, schema: UserSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: Coupon.name, schema: CouponSchema },
    ]),
    MailModule,
  ],
  controllers: [VenuesController, AdminVenuesController],
  providers: [VenuesService],
  exports: [VenuesService, MongooseModule],
})
export class VenuesModule { }
