import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Venue } from '../../venues/schemas/venue.schema';

export type PromotionDocument = Promotion & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Promotion {
  @Prop({ type: Types.ObjectId, ref: 'Venue', required: false })
  venueId: Venue; // Nullable if system-wide promotion

  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  discountPercentage: number;

  @Prop()
  maxDiscountAmount: number;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ default: true })
  isActive: boolean;
}

export const PromotionSchema = SchemaFactory.createForClass(Promotion);
