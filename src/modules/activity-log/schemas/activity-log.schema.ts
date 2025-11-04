import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ActivityLog extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ required: true })
  type: string; // login, logout, update_profile, create_user, update_user, delete_user, etc.

  @Prop()
  ip: string;

  @Prop()
  userAgent: string;
}

export const ActivityLogSchema = SchemaFactory.createForClass(ActivityLog);
