import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  shortDescription: string;

  @Prop({ default: 'system' })
  type: string; // 'system' cho thông báo hệ thống

  @Prop()
  actionUrl?: string;

  @Prop({ type: [String], default: [] })
  readByUsers: string[];
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.index({ type: 1, createdAt: -1 });
NotificationSchema.index({ readByUsers: 1 });
