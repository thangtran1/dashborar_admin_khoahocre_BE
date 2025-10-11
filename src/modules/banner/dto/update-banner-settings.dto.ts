import { PartialType } from '@nestjs/mapped-types';
import { CreateBannerSettingsDto } from './create-banner-settings.dto';

export class UpdateBannerSettingsDto extends PartialType(
  CreateBannerSettingsDto,
) {}
