import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateFeedbackDto {
  @IsString()
  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  @MaxLength(100, { message: 'Họ và tên tối đa 100 ký tự' })
  fullName: string;

  @IsString()
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @Matches(/^[0-9]{10,11}$/, {
    message: 'Số điện thoại phải có 10-11 chữ số',
  })
  phone: string;

  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @MaxLength(100, { message: 'Email tối đa 100 ký tự' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  @MaxLength(200, { message: 'Tiêu đề tối đa 200 ký tự' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Nội dung không được để trống' })
  @MaxLength(2000, { message: 'Nội dung tối đa 2000 ký tự' })
  content: string;
}
