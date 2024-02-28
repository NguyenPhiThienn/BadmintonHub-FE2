import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Venue } from '../../venues/schemas/venue.schema';

export type CourtDocument = Court & Document;

export enum CourtStatus {
  AVAILABLE = 'AVAILABLE',
  MAINTENANCE = 'MAINTENANCE',
}

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Court {
  @Prop({ type: Types.ObjectId, ref: 'Venue', required: true })
  venueId: Venue;

  @Prop({ required: true })
  name: string;

  @Prop()
  type: string; // e.g. Thảm PVC, Sàn gỗ

  @Prop({ required: true, enum: CourtStatus, default: CourtStatus.AVAILABLE })
  status: CourtStatus;
}

export const CourtSchema = SchemaFactory.createForClass(Court);
