import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChatMessageDocument = ChatMessage & Document;
export type ChatSessionDocument = ChatSession & Document;

export enum SessionStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
}

@Schema({ _id: true })
export class ChatMessage {
  @Prop({ required: true, enum: ['user', 'assistant'] })
  role: 'user' | 'assistant';

  @Prop({ required: true })
  content: string;

  @Prop({ default: Date.now })
  timestamp: Date;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);

@Schema({ timestamps: true })
export class ChatSession {
  // Null nếu là khách vãng lai (chưa đăng nhập)
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  userId?: Types.ObjectId;

  // sessionId dùng cho khách vãng lai (lưu ở LocalStorage FE)
  @Prop({ required: true, unique: true })
  sessionId: string;

  @Prop({ type: [ChatMessageSchema], default: [] })
  messages: ChatMessage[];

  @Prop({ enum: SessionStatus, default: SessionStatus.ACTIVE })
  status: SessionStatus;

  // Tự động set khi session bị đóng
  @Prop({ required: false })
  closedAt?: Date;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export const ChatSessionSchema = SchemaFactory.createForClass(ChatSession);

// Auto-close session after 24h of inactivity via TTL index on updatedAt is handled in service
