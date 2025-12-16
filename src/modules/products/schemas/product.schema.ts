import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product &
  Document & { _id: Types.ObjectId; createdAt: Date; updatedAt: Date };

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OUT_OF_STOCK = 'out_of_stock',
}

// Embedded schema cho Review Reply
@Schema({ _id: true, timestamps: true })
export class ReviewReply {
  @Prop({ required: true })
  comment: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop()
  userName: string;

  @Prop({ default: false })
  isAdmin: boolean;
}

// Embedded schema cho Review
@Schema({ _id: true, timestamps: true })
export class Review {
  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ required: true, maxlength: 1000 })
  comment: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop()
  userName: string;

  @Prop()
  userAvatar?: string;

  @Prop({
    type: String,
    enum: ['Đã mua hàng', 'Chưa mua hàng'],
    default: 'Chưa mua hàng',
  })
  type: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: [ReviewReply], default: [] })
  replies: ReviewReply[];
}

// Embedded schema cho Product Image
@Schema({ _id: false })
export class ProductImage {
  @Prop({ required: true })
  url: string;

  @Prop()
  alt?: string;

  @Prop({ default: 0 })
  sortOrder: number;
}

@Schema({ timestamps: true })
export class Product {
  @Prop({
    required: true,
    trim: true,
    maxlength: 200,
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
    required: true,
    min: 0,
  })
  price: number;

  @Prop({
    min: 0,
    max: 100,
    default: 0,
  })
  discount: number;

  @Prop({
    trim: true,
    maxlength: 5000,
  })
  description?: string;

  @Prop({
    trim: true,
    maxlength: 500,
  })
  shortDescription?: string;

  // Ảnh chính của sản phẩm
  @Prop()
  image?: string;

  // Gallery ảnh
  @Prop({ type: [ProductImage], default: [] })
  images: ProductImage[];

  // Liên kết với Category
  @Prop({
    type: Types.ObjectId,
    ref: 'Category',
    required: true,
    index: true,
  })
  category: Types.ObjectId;

  // Liên kết với Brand
  @Prop({
    type: Types.ObjectId,
    ref: 'Brand',
    required: true,
    index: true,
  })
  brand: Types.ObjectId;

  @Prop({
    required: true,
    min: 0,
    default: 0,
  })
  stock: number;

  @Prop({
    type: String,
    enum: ProductStatus,
    default: ProductStatus.ACTIVE,
    index: true,
  })
  status: ProductStatus;

  @Prop({ default: false })
  isNew: boolean;

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ default: false })
  isBestSeller: boolean;

  // Specifications (thông số kỹ thuật)
  @Prop({ type: [String], default: [] })
  specifications: string[];

  // Thời gian bảo hành (tháng)
  @Prop({ default: 0 })
  warrantyPeriod: number;

  // SKU code
  @Prop({ unique: true, sparse: true })
  sku?: string;

  // Trọng lượng (gram)
  @Prop({ min: 0 })
  weight?: number;

  // Kích thước
  @Prop({
    type: {
      length: Number,
      width: Number,
      height: Number,
    },
  })
  dimensions?: {
    _id?: string;
    length: number;
    width: number;
    height: number;
  };

  // Reviews (đánh giá)
  @Prop({ type: [Review], default: [] })
  reviews: Review[];

  // Thống kê
  @Prop({ default: 0 })
  viewCount: number;

  @Prop({ default: 0 })
  soldCount: number;

  @Prop({ default: 0 })
  reviewCount: number;

  @Prop({ default: 0 })
  averageRating: number;

  // Tags để tìm kiếm
  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: 0 })
  sortOrder: number;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Indexes cho tìm kiếm và filter
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ slug: 1 });
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({ brand: 1, status: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ discount: -1 });
ProductSchema.index({ isNew: 1, isFeatured: 1, isBestSeller: 1 });
ProductSchema.index({ averageRating: -1 });
ProductSchema.index({ soldCount: -1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ status: 1, isDeleted: 1 });

// Virtual field: Giá sau giảm
ProductSchema.virtual('finalPrice').get(function () {
  return this.price - (this.price * this.discount) / 100;
});

// Đảm bảo virtual fields được include trong JSON output
ProductSchema.set('toJSON', { virtuals: true });
ProductSchema.set('toObject', { virtuals: true });
