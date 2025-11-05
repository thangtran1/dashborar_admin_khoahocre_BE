import { Type } from 'class-transformer';
import {
  IsOptional,
  IsBoolean,
  IsIn,
  IsString,
  IsDateString,
  IsInt,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class FilterAuthSessionDto {
  @IsOptional()
  @Transform(({ value }) => (value === 'false' ? false : true))
  @IsBoolean()
  excludeAdmin?: boolean;

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
