import {
  IsOptional,
  IsEnum,
  IsString,
  IsDateString,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  MaintenanceStatus,
  MaintenanceType,
} from '../schemas/maintenance.schema';
import { ApiProperty } from '@nestjs/swagger';

export class MaintenanceFilterDto {
  @ApiProperty({
    description: 'Tìm kiếm theo tiêu đề',
    required: false,
    example: 'Database',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Lọc theo trạng thái',
    enum: MaintenanceStatus,
    required: false,
    isArray: true,
    example: [MaintenanceStatus.SCHEDULED, MaintenanceStatus.IN_PROGRESS],
  })
  @IsOptional()
  @IsEnum(MaintenanceStatus, { each: true })
  status?: MaintenanceStatus | MaintenanceStatus[];

  @ApiProperty({
    description: 'Lọc theo loại bảo trì',
    enum: MaintenanceType,
    required: false,
    example: MaintenanceType.DATABASE,
  })
  @IsOptional()
  @IsEnum(MaintenanceType)
  type?: MaintenanceType;

  @ApiProperty({
    description: 'Lọc từ ngày',
    required: false,
    example: '2025-10-01',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiProperty({
    description: 'Lọc đến ngày',
    required: false,
    example: '2025-10-31',
  })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiProperty({
    description: 'Số trang',
    required: false,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Số lượng item trên một trang',
    required: false,
    minimum: 1,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}
