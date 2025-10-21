import { IsString, IsUrl, IsEnum } from 'class-validator';
import { NotificationType } from '../schemas/notification.schema';

export class CreateNotificationDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsUrl()
  actionUrl?: string;

  @IsEnum(NotificationType)
  type: NotificationType;
}
