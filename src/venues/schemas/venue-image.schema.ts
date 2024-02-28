import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Venue } from './venue.schema';

export type VenueImageDocument = VenueImage & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class VenueImage {
  @Prop({ type: Types.ObjectId, ref: 'Venue', required: true })
  venueId: Venue;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ default: false })
  isPrimary: boolean;
}

export const VenueImageSchema = SchemaFactory.createForClass(VenueImage);
