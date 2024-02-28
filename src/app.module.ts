import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AiModule } from './ai/ai.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { AuthModule } from './auth/auth.module';
import { AvailabilityModule } from './availability/availability.module';
import { BookingsModule } from './bookings/bookings.module';
import { CourtsModule } from './courts/courts.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { GatewayModule } from './gateways/gateways.module';
import { OwnerRequestsModule } from './owner-requests/owner-requests.module';
import { PaymentsModule } from './payments/payments.module';
import { PricingsModule } from './pricings/pricings.module';
import { PromotionsModule } from './promotions/promotions.module';
import { ReviewsModule } from './reviews/reviews.module';
import { UploadModule } from './upload/upload.module';
import { UsersModule } from './users/users.module';
import { NotificationModule } from './utils/notification.module';
import { VenuesModule } from './venues/venues.module';
import { MailModule } from './mail/mail.module';
@Module({
  imports: [
    ConfigModule.forRoot(),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 60,
    }]),
    MongooseModule.forRoot(process.env.MONGO_URI),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    VenuesModule,
    CourtsModule,
    PricingsModule,
    PromotionsModule,
    NotificationModule,
    UploadModule,
    AvailabilityModule,
    BookingsModule,
    PaymentsModule,
    ReviewsModule,
    DashboardModule,
    AiModule,
    GatewayModule,
    AuditLogsModule,
    OwnerRequestsModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
