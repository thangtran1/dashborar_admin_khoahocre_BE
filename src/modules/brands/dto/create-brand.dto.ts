import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';
import { BrandStatus } from '../schemas/brand.schema';
import { Transform } from 'class-transformer';

export class CreateBrandDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  slug?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsString()
  @IsOptional()
  logo?: string;

  @IsUrl()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  website?: string;

  @IsEnum(BrandStatus)
  @IsOptional()
  status?: BrandStatus;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}
