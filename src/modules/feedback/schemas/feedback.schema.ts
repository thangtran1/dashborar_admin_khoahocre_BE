import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FeedbackDocument = Feedback & Document;

@Schema({ timestamps: true })
export class Feedback {
  @Prop({ required: true, trim: true, maxlength: 100 })
  fullName: string;

  @Prop({ required: true, trim: true, maxlength: 15 })
  phone: string;

  @Prop({ required: true, trim: true, lowercase: true, maxlength: 100 })
  email: string;

  @Prop({ required: true, trim: true, maxlength: 200 })
  title: string;

  @Prop({ required: true, trim: true, maxlength: 2000 })
  content: string;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);

// Index để tối ưu query
FeedbackSchema.index({ createdAt: -1 });
