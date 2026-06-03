import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { ChatSession, ChatSessionSchema } from './schemas/chat-session.schema';
import { AvailabilityModule } from '../availability/availability.module';
import { VenuesModule } from '../venues/venues.module';
import { Booking, BookingSchema } from '../bookings/schemas/booking.schema';
import { Venue, VenueSchema } from '../venues/schemas/venue.schema';

@Module({
  imports: [
    ConfigModule,
    VenuesModule,
    AvailabilityModule,
    MongooseModule.forFeature([
      { name: ChatSession.name, schema: ChatSessionSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: Venue.name, schema: VenueSchema },
    ]),
  ],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule { }

