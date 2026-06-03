import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type VenueDocument = Venue & Document;

export enum VenueStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
  PENDING_CLOSURE = 'PENDING_CLOSURE',
  CLOSED = 'CLOSED',
}

@Schema({ timestamps: true })
export class Venue {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: User;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  address: string;

  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      required: false,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: false,
    },
  })
  coordinates: any;

  @Prop()
  description: string;

  @Prop({ required: true })
  openTime: string; // Format HH:mm

  @Prop({ required: true })
  closeTime: string; // Format HH:mm

  @Prop({ default: 0 })
  averageRating: number;

  @Prop({ required: true, default: 0 })
  pricePerHour: number;

  @Prop({ required: true, enum: VenueStatus, default: VenueStatus.PENDING })
  status: VenueStatus;

  @Prop()
  statusReason: string;
}

export const VenueSchema = SchemaFactory.createForClass(Venue);
VenueSchema.index({ coordinates: '2dsphere' });
