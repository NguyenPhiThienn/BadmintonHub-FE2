import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RevenueSummaryDocument = RevenueSummary & Document;

@Schema({ timestamps: true })
export class RevenueSummary {
  @Prop({ required: true })
  year: number;

  @Prop({ required: true })
  month: number; // 1-12

  @Prop({ required: true })
  venueId: string;

  @Prop({ required: true, default: 0 })
  totalRevenue: number;

  @Prop({ required: true, default: 0 })
  totalBookings: number;

  @Prop({ default: 0 })
  vnpayRevenue: number;

  @Prop({ default: 0 })
  momoRevenue: number;

  @Prop({ default: 0 })
  cashRevenue: number;
}

export const RevenueSummarySchema = SchemaFactory.createForClass(RevenueSummary);

// Compound index for fast lookups
RevenueSummarySchema.index({ year: 1, month: 1, venueId: 1 }, { unique: true });
RevenueSummarySchema.index({ year: 1, month: 1 });
