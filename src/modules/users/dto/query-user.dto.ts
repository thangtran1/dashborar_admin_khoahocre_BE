import {
  IsOptional,
  IsEnum,
  IsString,
  IsNumber,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { UserRole, UserStatus } from '../schemas/user.schema';

export class QueryUserDto {
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      const num = parseInt(value, 10);
      return isNaN(num) || num < 1 ? 1 : num;
    }
    return typeof value === 'number' && value >= 1 ? value : 1;
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'Trang phải là số' })
  @Min(1, { message: 'Trang phải lớn hơn 0' })
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      const num = parseInt(value, 10);
      return isNaN(num) || num < 1 ? 10 : num > 100 ? 100 : num;
    }
    return typeof value === 'number' && value >= 1 && value <= 100 ? value : 10;
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'Số lượng phải là số' })
  @Min(1, { message: 'Số lượng phải lớn hơn 0' })
  @Max(100, { message: 'Số lượng không được vượt quá 100' })
  limit?: number = 10;

  @IsOptional()
  @IsString({ message: 'Từ khóa tìm kiếm phải là chuỗi' })
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed === '' ? undefined : trimmed;
    }
    return value;
  })
  search?: string;

  @IsOptional()
  @ValidateIf(
    (o, value) => value !== '' && value !== null && value !== undefined,
  )
  @IsEnum(UserRole, { message: 'Vai trò không hợp lệ' })
  role?: UserRole;

  @IsOptional()
  @ValidateIf(
    (o, value) => value !== '' && value !== null && value !== undefined,
  )
  @IsEnum(UserStatus, { message: 'Trạng thái không hợp lệ' })
  status?: UserStatus;

  @IsOptional()
  @IsString({ message: 'Sắp xếp phải là chuỗi' })
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed === '' ? 'createdAt' : trimmed;
    }
    return value || 'createdAt';
  })
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString({ message: 'Thứ tự sắp xếp phải là chuỗi' })
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      const trimmed = value.toLowerCase().trim();
      return trimmed === '' || !['asc', 'desc'].includes(trimmed)
        ? 'desc'
        : trimmed;
    }
    return 'desc';
  })
  sortOrder?: 'asc' | 'desc' = 'desc';
}
