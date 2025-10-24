import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum MaintenanceStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum MaintenanceType {
  DATABASE = 'database',
  SYSTEM = 'system',
  NETWORK = 'network',
  OTHER = 'other',
}

export type MaintenanceDocument = Maintenance & Document;

@Schema({ timestamps: true })
export class Maintenance {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  endTime: Date;

  @Prop({
    type: String,
    enum: MaintenanceStatus,
    default: MaintenanceStatus.SCHEDULED,
  })
  status: MaintenanceStatus;

  @Prop({
    type: String,
    enum: MaintenanceType,
    default: MaintenanceType.OTHER,
  })
  type: MaintenanceType;

  @Prop({ default: false })
  isActive: boolean;

  @Prop({ default: false })
  autoAdjusted: boolean;

  @Prop()
  duration: number;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const MaintenanceSchema = SchemaFactory.createForClass(Maintenance);
