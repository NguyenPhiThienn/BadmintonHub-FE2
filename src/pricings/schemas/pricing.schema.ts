import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Venue } from '../../venues/schemas/venue.schema';

export type PricingDocument = Pricing & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Pricing {
  @Prop({ type: Types.ObjectId, ref: 'Venue', required: true })
  venueId: Venue;

  @Prop({ required: false })
  dayOfWeek: number; // 0-6 cho thứ 2 đến CN, NULL cho ngày đặc biệt/lễ

  @Prop({ required: true })
  startTime: string; // Format HH:mm

  @Prop({ required: true })
  endTime: string; // Format HH:mm

  @Prop({ required: true })
  pricePerHour: number;
}

export const PricingSchema = SchemaFactory.createForClass(Pricing);
