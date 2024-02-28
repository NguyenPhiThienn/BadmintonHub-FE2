import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SlotLockDocument = SlotLock & Document;

@Schema({ timestamps: true })
export class SlotLock {
  @Prop({ type: Types.ObjectId, ref: 'Court', required: true })
  courtId: Types.ObjectId;

  @Prop({ required: true })
  date: string; // YYYY-MM-DD

  @Prop({ required: true })
  startTime: string;

  @Prop({ required: true })
  endTime: string;

  @Prop({ required: true })
  userId: string; // User ID or session identifier

  @Prop({ default: Date.now, index: { expires: 300 } }) // Expire in 5 minutes (300 seconds)
  createdAt: Date;
}

export const SlotLockSchema = SchemaFactory.createForClass(SlotLock);
