import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Venue } from '../../venues/schemas/venue.schema';
import { Promotion } from '../../promotions/schemas/promotion.schema';

export type BookingDocument = Booking & Document;

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
  LATE_ARRIVAL = 'LATE_ARRIVAL',
  IN_PROGRESS = 'IN_PROGRESS',
  REFUNDED = 'REFUNDED',
}

@Schema({ timestamps: true })
export class Booking {
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  playerId: User;

  @Prop({ default: false })
  isGuest: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Venue', required: true })
  venueId: Venue;

  @Prop({ type: Types.ObjectId, ref: 'Promotion', required: false })
  promotionId: Promotion;

  @Prop({ type: Types.ObjectId, ref: 'Coupon', required: false })
  couponId: any;

  @Prop({ required: true })
  totalPrice: number;

  @Prop({ required: true })
  finalPrice: number;

  @Prop({ required: true, enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @Prop()
  note: string;

  @Prop()
  cancelReason: string;

  @Prop({ enum: ['CUSTOMER', 'OWNER', 'SYSTEM', 'ADMIN'] })
  cancelledBy: string;

  @Prop({ default: false })
  isWeekly: boolean;

  @Prop({ required: false })
  customerName: string;

  @Prop({ required: false })
  customerPhone: string;

  @Prop({ required: false })
  customerEmail: string;

  @Prop({ default: false })
  isReviewed: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
