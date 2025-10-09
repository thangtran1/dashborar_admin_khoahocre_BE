import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({ required: true })
  senderId: string;

  @Prop({ required: true })
  recipientId: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  senderRole: string;

  @Prop({ default: Date.now })
  timestamp: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

// Add indexes for better query performance
MessageSchema.index({ senderId: 1, recipientId: 1, timestamp: -1 });
MessageSchema.index({ recipientId: 1, timestamp: -1 });
MessageSchema.index({ senderRole: 1, timestamp: -1 });
