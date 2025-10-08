import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  CourseContentItem,
  CourseContentItemSchema,
} from './course-content-item.schema';

export type CourseContentSectionDocument = CourseContentSection & Document;

@Schema({ _id: false })
export class CourseContentSection {
  @Prop({ required: true })
  title: string;

  @Prop({ type: [CourseContentItemSchema], default: [] })
  items: CourseContentItem[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const CourseContentSectionSchema =
  SchemaFactory.createForClass(CourseContentSection);
