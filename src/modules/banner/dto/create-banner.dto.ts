import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsBoolean,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateBannerDto {
  @IsString({ message: 'Nội dung phải là chuỗi' })
  @IsNotEmpty({ message: 'Nội dung không được để trống' })
  @MaxLength(500, { message: 'Nội dung không được vượt quá 500 ký tự' })
  content: string;

  @IsOptional()
  @IsBoolean({ message: 'Trạng thái phải là boolean' })
  isActive?: boolean;

  @IsOptional()
  @IsNumber({}, { message: 'Thứ tự phải là số' })
  @Min(0, { message: 'Thứ tự phải lớn hơn hoặc bằng 0' })
  order?: number;
}
