import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SystemSettingsDocument = SystemSettings & Document;

@Schema({ timestamps: true })
export class SystemSettings {
  @Prop({
    required: true,
    enum: ['vi', 'en'],
    default: 'vi',
  })
  defaultLanguage: string;

  @Prop({
    required: true,
    default: 'TVT Admin',
  })
  systemName: string;

  @Prop({
    default: 'TVT Admin',
  })
  systemDescription: string;
}

export const SystemSettingsSchema =
  SchemaFactory.createForClass(SystemSettings);
