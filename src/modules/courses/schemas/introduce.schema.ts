import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type IntroduceDocument = Introduce & Document;

@Schema({ _id: false })
export class Introduce {
  @Prop({ required: true })
  title: string;

  @Prop()
  subtitle?: string;

  @Prop({ type: [String], default: [] })
  reasons: string[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const IntroduceSchema = SchemaFactory.createForClass(Introduce);
