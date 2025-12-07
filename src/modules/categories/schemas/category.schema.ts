import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CategoryDocument = Category &
  Document & { _id: Types.ObjectId; createdAt: Date; updatedAt: Date };

export enum CategoryStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Schema({ timestamps: true })
export class Category {
  @Prop({
    required: true,
    trim: true,
    maxlength: 100,
  })
  name: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  })
  slug: string;

  @Prop({
    trim: true,
    maxlength: 500,
  })
  description?: string;

  @Prop()
  image?: string;

  @Prop({
    type: String,
    enum: CategoryStatus,
    default: CategoryStatus.ACTIVE,
    index: true,
  })
  status: CategoryStatus;

  @Prop({ default: 0 })
  productCount: number;

  @Prop({ default: 0 })
  sortOrder: number;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// Indexes
CategorySchema.index({ name: 'text', description: 'text' });
CategorySchema.index({ slug: 1 });
CategorySchema.index({ status: 1, isDeleted: 1 });
CategorySchema.index({ sortOrder: 1 });
CategorySchema.index({ createdAt: -1 });
