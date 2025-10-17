import {
  IsOptional,
  IsEnum,
  IsString,
  IsNumber,
  Min,
  Max,
  IsBoolean,
  ValidateIf,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { UserRole, UserStatus } from '../schemas/user.schema';

export class QueryUserDto {
  // --- Pagination ---
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Trang phải là số' })
  @Min(1, { message: 'Trang phải lớn hơn 0' })
  @Transform(({ value }: { value: unknown }) => {
    const n = Number(value);
    return isNaN(n) || n < 1 ? 1 : n;
  })
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Số lượng phải là số' })
  @Min(1)
  @Max(100)
  @Transform(({ value }: { value: unknown }) => {
    const n = Number(value);
    return isNaN(n) ? 10 : Math.min(Math.max(n, 1), 100);
  })
  limit = 10;

  // --- Search ---
  @IsOptional()
  @IsString({ message: 'Từ khóa phải là chuỗi' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() || undefined : undefined,
  )
  search?: string;

  // --- Filters ---
  @IsOptional()
  @ValidateIf((_, v) => v !== '' && v != null)
  @IsEnum(UserRole, { message: 'Vai trò không hợp lệ' })
  role?: UserRole;

  @IsOptional()
  @ValidateIf((_, v) => v !== '' && v != null)
  @IsEnum(UserStatus, { message: 'Trạng thái không hợp lệ' })
  status?: UserStatus;

  // --- Sorting ---
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' && value.trim() ? value.trim() : 'createdAt',
  )
  sortBy = 'createdAt';

  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' && ['asc', 'desc'].includes(value.toLowerCase())
      ? value.toLowerCase()
      : 'desc',
  )
  sortOrder: 'asc' | 'desc' = 'desc';

  // --- Deleted filter ---
  @IsOptional()
  @IsBoolean({ message: 'isDeleted must be a boolean value' })
  @Transform(({ value }: { value: unknown }) =>
    ['true', '1', true, 1].includes(value as string | number | boolean),
  )
  isDeleted = false;
}
