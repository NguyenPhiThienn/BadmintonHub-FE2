import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Venue } from '../../venues/schemas/venue.schema';

export type AIAnalysisMetadataDocument = AIAnalysisMetadata & Document;

@Schema({ timestamps: { createdAt: false, updatedAt: false } })
export class AIAnalysisMetadata {
  @Prop({ type: Types.ObjectId, ref: 'Venue', required: true })
  venueId: Venue;

  @Prop({ type: Object, default: {} })
  peakHoursPrediction: any; // JSON lưu trữ dự đoán các khung giờ hot

  @Prop({ default: Date.now })
  lastAnalyzedAt: Date;
}

export const AIAnalysisMetadataSchema = SchemaFactory.createForClass(AIAnalysisMetadata);
