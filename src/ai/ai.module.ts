import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { VenuesModule } from '../venues/venues.module';
import { AvailabilityModule } from '../availability/availability.module';

@Module({
  imports: [ConfigModule, VenuesModule, AvailabilityModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule { }
