import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AddressDocument = Address & Document;

@Schema({ timestamps: true })
export class Address {
  // 👉 LIÊN KẾT USER
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  member_id: Types.ObjectId;

  @Prop({ enum: [1, 2], required: true })
  type: number; // 1: nhà, 2: văn phòng

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  full_address: string;

  @Prop({ required: true })
  province_id: number;

  @Prop({ required: true })
  district_id: number;

  @Prop({ required: true })
  ward_id: number;

  @Prop({ default: false })
  is_default: boolean;
}

export const AddressSchema = SchemaFactory.createForClass(Address);
