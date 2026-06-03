import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Booking } from '../../bookings/schemas/booking.schema';

export type PaymentDocument = Payment & Document;

export enum PaymentMethod {
  VNPAY = 'VNPAY',
  MOMO = 'MOMO',
  CASH = 'CASH',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  REFUNDING = 'REFUNDING',
  DEBT = 'DEBT',
}

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: 'Booking', required: true })
  bookingId: Booking;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, enum: PaymentMethod })
  method: PaymentMethod;

  @Prop({ required: true, enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Prop()
  transaction_id: string;

  @Prop({ type: Object })
  refundInfo: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    reason: string;
  };
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
