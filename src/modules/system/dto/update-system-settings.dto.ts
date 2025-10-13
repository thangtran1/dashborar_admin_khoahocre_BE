import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateSystemSettingsDto {
  @IsOptional()
  @IsString({ message: 'Ngôn ngữ mặc định phải là chuỗi' })
  @IsIn(['vi', 'en'], { message: 'Ngôn ngữ mặc định phải là vi hoặc en' })
  defaultLanguage?: string;

  @IsOptional()
  @IsString({ message: 'Tên hệ thống phải là chuỗi' })
  systemName?: string;

  @IsOptional()
  @IsString({ message: 'Mô tả hệ thống phải là chuỗi' })
  systemDescription?: string;
}
