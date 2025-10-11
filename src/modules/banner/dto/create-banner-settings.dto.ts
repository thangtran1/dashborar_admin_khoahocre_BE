import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsBoolean,
  IsOptional,
  Matches,
} from 'class-validator';

export class CreateBannerSettingsDto {
  @IsString({ message: 'Màu nền phải là chuỗi' })
  @IsNotEmpty({ message: 'Màu nền không được để trống' })
  @Matches(/^#[0-9A-F]{6}$/i, {
    message: 'Màu nền phải có định dạng hex (#RRGGBB)',
  })
  backgroundColor: string;

  @IsString({ message: 'Màu chữ phải là chuỗi' })
  @IsNotEmpty({ message: 'Màu chữ không được để trống' })
  @Matches(/^#[0-9A-F]{6}$/i, {
    message: 'Màu chữ phải có định dạng hex (#RRGGBB)',
  })
  textColor: string;

  @IsNumber({}, { message: 'Tốc độ cuộn phải là số' })
  @Min(10, { message: 'Tốc độ cuộn tối thiểu là 10' })
  @Max(200, { message: 'Tốc độ cuộn tối đa là 200' })
  scrollSpeed: number;

  @IsNumber({}, { message: 'Khoảng cách phải là số' })
  @Min(0, { message: 'Khoảng cách tối thiểu là 0' })
  @Max(100, { message: 'Khoảng cách tối đa là 100' })
  bannerSpacing: number;

  @IsOptional()
  @IsBoolean({ message: 'Trạng thái phải là boolean' })
  isActive?: boolean;
}
