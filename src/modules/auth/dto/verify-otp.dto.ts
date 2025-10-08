import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class VerifyOtpDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email là bắt buộc' })
  email: string;

  @IsString({ message: 'OTP phải là chuỗi' })
  @IsNotEmpty({ message: 'OTP là bắt buộc' })
  otp: string;
}
