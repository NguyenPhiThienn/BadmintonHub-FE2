import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PromotionsController } from './promotions.controller';
import { PromotionsService } from './promotions.service';
import { Promotion, PromotionSchema } from './schemas/promotion.schema';
import { Venue, VenueSchema } from '../venues/schemas/venue.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Promotion.name, schema: PromotionSchema },
      { name: Venue.name, schema: VenueSchema },
    ]),
  ],
  controllers: [PromotionsController],
  providers: [PromotionsService],
  exports: [PromotionsService, MongooseModule],
})
export class PromotionsModule {}
