import {
  IsNotEmpty,
  IsEnum,
  IsString,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { MaintenanceType } from '../schemas/maintenance.schema';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMaintenanceDto {
  @ApiProperty({
    description: 'Tiêu đề bảo trì',
    example: 'Bảo trì hệ thống database',
  })
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Mô tả chi tiết về bảo trì',
    example: 'Nâng cấp database lên phiên bản mới',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Thời gian bắt đầu bảo trì',
    example: '2025-10-25T10:00:00Z',
  })
  @IsNotEmpty({ message: 'Thời gian bắt đầu không được để trống' })
  @IsDateString()
  startTime: Date;

  @ApiProperty({
    description: 'Thời gian kết thúc bảo trì',
    example: '2025-10-25T12:00:00Z',
  })
  @IsNotEmpty({ message: 'Thời gian kết thúc không được để trống' })
  @IsDateString()
  endTime: Date;

  @ApiProperty({
    description: 'Loại bảo trì',
    enum: MaintenanceType,
    example: MaintenanceType.DATABASE,
  })
  @IsNotEmpty({ message: 'Loại bảo trì không được để trống' })
  @IsEnum(MaintenanceType, {
    message: 'Loại bảo trì không hợp lệ',
  })
  type: MaintenanceType;
}
