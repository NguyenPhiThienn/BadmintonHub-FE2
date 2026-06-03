import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Venue } from '../../venues/schemas/venue.schema';

export type CouponDocument = Coupon & Document;

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
}

export enum CouponStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED',
}

@Schema({ timestamps: true })
export class Coupon {
  @Prop({ required: true, unique: true, index: true, uppercase: true })
  code: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: User;

  @Prop({ type: Types.ObjectId, ref: 'Venue', required: false, default: null })
  venueId: Venue | null;

  @Prop({ required: true, enum: DiscountType })
  discountType: DiscountType;

  @Prop({ required: true })
  discountValue: number;

  @Prop({ required: false, default: 0 })
  minOrderValue: number;

  @Prop({ required: false })
  maxDiscountAmount: number;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true })
  usageLimit: number;

  @Prop({ required: true, default: 0 })
  usedCount: number;

  @Prop({ required: true, enum: CouponStatus, default: CouponStatus.ACTIVE })
  status: CouponStatus;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);
