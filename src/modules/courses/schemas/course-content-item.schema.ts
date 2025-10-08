import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CourseContentItemDocument = CourseContentItem & Document;

@Schema({ _id: false })
export class CourseContentItem {
  @Prop({ required: true })
  title: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const CourseContentItemSchema =
  SchemaFactory.createForClass(CourseContentItem);
