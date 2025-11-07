import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString({ message: 'Token phải là chuỗi' })
  @IsNotEmpty({ message: 'Token là bắt buộc' })
  token: string;

  @IsString({ message: 'Mật khẩu mới phải là chuỗi' })
  @IsNotEmpty({ message: 'Mật khẩu mới là bắt buộc' })
  @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
  newPassword: string;

  @IsOptional() // 👈 biến currentPassword thành không bắt buộc
  @IsString({ message: 'Mật khẩu cũ phải là chuỗi' })
  currentPassword?: string;
}
