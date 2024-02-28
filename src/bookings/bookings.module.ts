import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { Booking, BookingSchema } from './schemas/booking.schema';
import { BookingDetail, BookingDetailSchema } from './schemas/booking-detail.schema';
import { Payment, PaymentSchema } from '../payments/schemas/payment.schema';
import { CourtsModule } from '../courts/courts.module';
import { VenuesModule } from '../venues/venues.module';
import { PricingsModule } from '../pricings/pricings.module';
import { PromotionsModule } from '../promotions/promotions.module';
import { UsersModule } from '../users/users.module';
import { MailModule } from '../mail/mail.module';

import { AdminBookingsController } from './admin-bookings.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: BookingDetail.name, schema: BookingDetailSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
    CourtsModule,
    VenuesModule,
    PricingsModule,
    PromotionsModule,
    UsersModule,
    MailModule,
  ],
  controllers: [BookingsController, AdminBookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule { }
