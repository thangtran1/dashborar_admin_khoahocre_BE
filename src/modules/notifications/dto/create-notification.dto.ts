import { IsString, IsOptional, IsUrl } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsString()
  shortDescription: string;

  @IsUrl()
  actionUrl?: string;

  @IsOptional()
  @IsString()
  type?: string;
}
