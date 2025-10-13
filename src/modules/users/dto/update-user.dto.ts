import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { UserRole, UserStatus } from '../schemas/user.schema';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const),
) {}

export class UpdateUserPasswordDto {
  @IsOptional({ message: 'Mật khẩu cũ không được để trống' })
  @IsNotEmpty({ message: 'Mật khẩu cũ không được để trống' })
  currentPassword: string;

  @IsString({ message: 'Mật khẩu mới phải là chuỗi' })
  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
  newPassword: string;
}

export class UpdateUserRoleDto {
  @IsEnum(UserRole, { message: 'Vai trò không hợp lệ' })
  role: UserRole;
}

export class UpdateUserStatusDto {
  @IsEnum(UserStatus, { message: 'Trạng thái không hợp lệ' })
  status: UserStatus;
}
