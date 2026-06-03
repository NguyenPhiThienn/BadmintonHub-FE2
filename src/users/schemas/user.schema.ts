import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  ADMIN = 'ADMIN',
  COURT_OWNER = 'OWNER',
  OWNER = 'OWNER',
  PLAYER = 'PLAYER',
}

export enum BlockType {
  TEMPORARY = 'TEMPORARY',  // Khóa tạm thời
  PERMANENT = 'PERMANENT',   // Khóa vĩnh viễn
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: true })
  phone: string;

  @Prop({ required: true, enum: UserRole, default: UserRole.PLAYER })
  role: UserRole;

  @Prop({ required: true })
  passwordHash: string;

  @Prop()
  avatarUrl: string;

  @Prop()
  lastLogin: Date;

  @Prop({ default: 'ACTIVE' })
  status: string;

  @Prop({ enum: BlockType })
  blockType: BlockType;

  @Prop()
  blockedReason: string;

  @Prop()
  blockedAt: Date;

  @Prop()
  blockedUntil: Date;

  @Prop()
  blockedBy: string;  // Admin ID who blocked this user

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Venue' }], default: [] })
  favoriteVenues: Types.ObjectId[];

  @Prop({ type: [String], default: [] })
  fcmTokens: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
