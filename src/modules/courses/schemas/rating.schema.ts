import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RatingDocument = Rating & Document;

@Schema({ timestamps: true })
export class Rating {
  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  courseId: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  star: number;

  @Prop({ default: 0 })
  count: number;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const RatingSchema = SchemaFactory.createForClass(Rating);

// Compound index để đảm bảo unique combination
RatingSchema.index({ courseId: 1, star: 1 }, { unique: true });
