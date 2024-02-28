import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type PlayerSearchHistoryDocument = PlayerSearchHistory & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class PlayerSearchHistory {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  playerId: User;

  @Prop()
  searchedAddress: string;

  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      required: false,
    },
    searchedCoordinates: {
      type: [Number], // [longitude, latitude]
      required: false,
    },
  })
  searchedCoordinates: any;
}

export const PlayerSearchHistorySchema = SchemaFactory.createForClass(PlayerSearchHistory);
PlayerSearchHistorySchema.index({ searchedCoordinates: '2dsphere' });
