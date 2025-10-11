import { IsBoolean } from 'class-validator';

export class ToggleBannerDto {
  @IsBoolean({ message: 'Trạng thái phải là boolean' })
  isActive: boolean;
}
