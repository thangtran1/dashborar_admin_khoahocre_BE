import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Introduce, IntroduceSchema } from './introduce.schema';
import {
  CourseContentSection,
  CourseContentSectionSchema,
} from './course-content-section.schema';

export type CourseDocument = Course & Document;

@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true })
  title: string;

  @Prop()
  subtitle?: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  price: number;

  @Prop()
  oldPrice?: number;

  @Prop()
  discountCode?: string;

  @Prop()
  image?: string;

  @Prop({ default: false })
  isFree: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop()
  level?: string;

  @Prop({ default: 0 })
  viewCount: number;

  // Embedded documents
  @Prop({ type: IntroduceSchema })
  introduce?: Introduce;

  @Prop({ type: [CourseContentSectionSchema], default: [] })
  contents: CourseContentSection[];

  // References to other collections
  @Prop({ type: [String], default: [] })
  categoryCodes: string[];

  @Prop({ type: [Types.ObjectId], ref: 'Teacher', default: [] })
  teacherIds: Types.ObjectId[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
