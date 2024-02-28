import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

export enum AuditAction {
  USER_BLOCK = 'USER_BLOCK',
  USER_UNBLOCK = 'USER_UNBLOCK',
  USER_DELETE = 'USER_DELETE',
  VENUE_APPROVE = 'VENUE_APPROVE',
  VENUE_REJECT = 'VENUE_REJECT',
}

@Schema({ timestamps: true })
export class AuditLog {
  @Prop({ required: true })
  action: AuditAction;

  @Prop({ required: true })
  performedBy: string;  // Admin ID

  @Prop({ required: true })
  targetUser: string;  // User ID being acted upon

  @Prop({ required: true })
  targetEmail: string;

  @Prop({ type: Object })
  details: Record<string, any>;  // Additional details like reason, blockType, etc.

  @Prop()
  ipAddress: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

// Index for efficient queries
AuditLogSchema.index({ performedBy: 1, createdAt: -1 });
AuditLogSchema.index({ targetUser: 1, createdAt: -1 });
