import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ContentItemDto {
  @IsString({ message: 'Tiêu đề item phải là chuỗi' })
  @IsNotEmpty({ message: 'Tiêu đề item là bắt buộc' })
  title: string;
}

export class ContentSectionDto {
  @IsString({ message: 'Tiêu đề section phải là chuỗi' })
  @IsNotEmpty({ message: 'Tiêu đề section là bắt buộc' })
  title: string;

  @IsArray({ message: 'Items phải là mảng' })
  @ValidateNested({ each: true })
  @Type(() => ContentItemDto)
  items: ContentItemDto[];
}

export class IntroduceDto {
  @IsString({ message: 'Tiêu đề introduce phải là chuỗi' })
  @IsNotEmpty({ message: 'Tiêu đề introduce là bắt buộc' })
  title: string;

  @IsOptional()
  @IsString({ message: 'Subtitle phải là chuỗi' })
  subtitle?: string;

  @IsOptional()
  @IsArray({ message: 'Reasons phải là mảng' })
  @IsString({ each: true, message: 'Mỗi reason phải là chuỗi' })
  reasons?: string[];
}

export class CreateCourseDto {
  @IsString({ message: 'Tiêu đề phải là chuỗi' })
  @IsNotEmpty({ message: 'Tiêu đề là bắt buộc' })
  title: string;

  @IsOptional()
  @IsString({ message: 'Subtitle phải là chuỗi' })
  subtitle?: string;

  @IsString({ message: 'Slug phải là chuỗi' })
  @IsNotEmpty({ message: 'Slug là bắt buộc' })
  slug: string;

  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi' })
  description?: string;

  @IsNumber({}, { message: 'Giá phải là số' })
  @Min(0, { message: 'Giá phải không âm' })
  price: number;

  @IsOptional()
  @IsNumber({}, { message: 'Giá cũ phải là số' })
  @Min(0, { message: 'Giá cũ phải không âm' })
  oldPrice?: number;

  @IsOptional()
  @IsString({ message: 'Mã giảm giá phải là chuỗi' })
  discountCode?: string;

  @IsOptional()
  @IsString({ message: 'Hình ảnh phải là chuỗi' })
  image?: string;

  @IsOptional()
  @IsBoolean({ message: 'isFree phải là boolean' })
  isFree?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'isActive phải là boolean' })
  isActive?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'isFeatured phải là boolean' })
  isFeatured?: boolean;

  @IsOptional()
  @IsString({ message: 'Level phải là chuỗi' })
  level?: string;

  @IsArray({ message: 'Categories phải là mảng' })
  @IsString({ each: true, message: 'Mỗi category phải là chuỗi' })
  categories: string[];

  @IsOptional()
  @IsArray({ message: 'TeacherIds phải là mảng' })
  @IsString({ each: true, message: 'Mỗi teacherId phải là chuỗi' })
  teacherIds?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => IntroduceDto)
  introduce?: IntroduceDto;

  @IsOptional()
  @IsArray({ message: 'Contents phải là mảng' })
  @ValidateNested({ each: true })
  @Type(() => ContentSectionDto)
  contents?: ContentSectionDto[];
}
