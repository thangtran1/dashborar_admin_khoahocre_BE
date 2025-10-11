import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BannerSettingsDocument = BannerSettings & Document;

@Schema({ timestamps: true })
export class BannerSettings {
  @Prop({
    required: true,
    match: /^#[0-9A-F]{6}$/i,
    default: '#1890ff',
  })
  backgroundColor: string;

  @Prop({
    required: true,
    match: /^#[0-9A-F]{6}$/i,
    default: '#ffffff',
  })
  textColor: string;

  @Prop({
    required: true,
    min: 10,
    max: 200,
    default: 50,
  })
  scrollSpeed: number;

  @Prop({
    required: true,
    min: 0,
    max: 100,
    default: 20,
  })
  bannerSpacing: number; // Khoảng cách giữa các banner

  @Prop({ default: true })
  isActive: boolean;
}

export const BannerSettingsSchema =
  SchemaFactory.createForClass(BannerSettings);
