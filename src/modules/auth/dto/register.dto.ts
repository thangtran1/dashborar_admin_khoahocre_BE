import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Validate,
} from 'class-validator';

// Custom validator để kiểm tra confirmPassword
class ConfirmPasswordValidator {
  validate(
    confirmPassword: string,
    args: { constraints: string[]; object: Record<string, any> },
  ) {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = args.object[relatedPropertyName] as string;
    return confirmPassword === relatedValue;
  }

  defaultMessage() {
    return 'Mật khẩu xác nhận không khớp';
  }
}

export class RegisterDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email là bắt buộc' })
  email: string;

  @IsString({ message: 'Tên phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên là bắt buộc' })
  name: string;

  @IsString({ message: 'Mật khẩu phải là chuỗi' })
  @IsNotEmpty({ message: 'Mật khẩu là bắt buộc' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;

  @IsString({ message: 'Mật khẩu xác nhận phải là chuỗi' })
  @IsNotEmpty({ message: 'Mật khẩu xác nhận là bắt buộc' })
  @Validate(ConfirmPasswordValidator, ['password'])
  confirmPassword: string;

  @IsString({ message: 'Role phải là chuỗi' })
  role?: string = 'user'; // Mặc định là 'user' nếu không được cung cấp

  @IsString()
  provider?: string; // 'local', 'google', 'github', etc.

  @IsString()
  providerId?: string; // ID từ provider (Google ID, GitHub ID, etc.)
}
