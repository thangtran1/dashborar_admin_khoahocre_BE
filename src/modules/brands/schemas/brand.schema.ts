import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BrandDocument = Brand &
  Document & { _id: Types.ObjectId; createdAt: Date; updatedAt: Date };

export enum BrandStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Schema({ timestamps: true })
export class Brand {
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
  logo?: string;

  @Prop()
  website?: string;

  @Prop({
    type: String,
    enum: BrandStatus,
    default: BrandStatus.ACTIVE,
    index: true,
  })
  status: BrandStatus;

  @Prop({ default: 0 })
  productCount: number;

  @Prop({ default: 0 })
  sortOrder: number;

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const BrandSchema = SchemaFactory.createForClass(Brand);

// Indexes
BrandSchema.index({ name: 'text', description: 'text' });
BrandSchema.index({ slug: 1 });
BrandSchema.index({ status: 1, isDeleted: 1 });
BrandSchema.index({ isFeatured: 1 });
BrandSchema.index({ sortOrder: 1 });
BrandSchema.index({ createdAt: -1 });
