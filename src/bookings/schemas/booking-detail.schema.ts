import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Booking } from './booking.schema';
import { Court } from '../../courts/schemas/court.schema';

export type BookingDetailDocument = BookingDetail & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class BookingDetail {
  @Prop({ type: Types.ObjectId, ref: 'Booking', required: true })
  bookingId: Booking;

  @Prop({ type: Types.ObjectId, ref: 'Court', required: true })
  courtId: Court;

  @Prop({ required: true })
  bookingDate: Date; // Keep as date part

  @Prop({ required: true })
  startTime: string; // Format HH:mm

  @Prop({ required: true })
  endTime: string; // Format HH:mm

  @Prop({ required: true })
  price: number; // Price of this specific slot
}

export const BookingDetailSchema = SchemaFactory.createForClass(BookingDetail);
