import { Type } from 'class-transformer';
import {
  IsOptional,
  IsIn,
  IsString,
  IsDateString,
  IsInt,
  Min,
} from 'class-validator';

export class FilterAuthSessionDto {
  @IsOptional()
  @IsIn(['active', 'revoked'])
  sessionStatus?: 'active' | 'revoked';

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsDateString()
  from?: string; // giữ string

  @IsOptional()
  @IsDateString()
  to?: string; // giữ string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
