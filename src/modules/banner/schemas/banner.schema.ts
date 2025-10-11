import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BannerDocument = Banner & Document;

@Schema({ timestamps: true })
export class Banner {
  @Prop({ required: true, maxlength: 500, trim: true })
  content: string;

  @Prop({ default: true, index: true }) // Index cho query active banners
  isActive: boolean;

  @Prop({ default: 0, index: true }) // Index cho sorting
  order: number;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);

// Compound index để tối ưu query active banners với sort
BannerSchema.index({ isActive: 1, order: 1 });
