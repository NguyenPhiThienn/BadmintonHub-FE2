import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Court } from './court.schema';

export type CourtUnavailableTimeDocument = CourtUnavailableTime & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class CourtUnavailableTime {
  @Prop({ type: Types.ObjectId, ref: 'Court', required: true })
  courtId: Court;

  @Prop({ required: true })
  startDatetime: Date;

  @Prop({ required: true })
  endDatetime: Date;

  @Prop()
  reason: string;
}

export const CourtUnavailableTimeSchema = SchemaFactory.createForClass(CourtUnavailableTime);
