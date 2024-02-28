import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PricingsController } from './pricings.controller';
import { PricingsService } from './pricings.service';
import { Pricing, PricingSchema } from './schemas/pricing.schema';
import { Venue, VenueSchema } from '../venues/schemas/venue.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Pricing.name, schema: PricingSchema },
      { name: Venue.name, schema: VenueSchema },
    ]),
  ],
  controllers: [PricingsController],
  providers: [PricingsService],
  exports: [PricingsService, MongooseModule],
})
export class PricingsModule {}
