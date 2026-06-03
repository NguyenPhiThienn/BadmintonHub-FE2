import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type OwnerRequestDocument = OwnerRequest & Document;

export enum OwnerRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Schema({ timestamps: true })
export class OwnerRequest {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: User;

  @Prop({ required: true })
  identityCard: string;

  @Prop({ required: true })
  courtAddress: string;

  @Prop({ type: [String], required: true })
  courtImages: string[];

  @Prop({ required: true })
  businessLicense: string;

  @Prop({ required: true })
  bankName: string;

  @Prop({ required: true })
  bankAccountNumber: string;

  @Prop({ required: true })
  bankAccountName: string;

  @Prop({ required: true })
  taxCode: string;

  @Prop({ required: true, default: true })
  isAgreedToTerms: boolean;

  @Prop({ required: true, enum: OwnerRequestStatus, default: OwnerRequestStatus.PENDING })
  status: OwnerRequestStatus;

  @Prop({ required: false })
  rejectReason?: string;
}

export const OwnerRequestSchema = SchemaFactory.createForClass(OwnerRequest);
