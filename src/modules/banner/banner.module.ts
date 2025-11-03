import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BannerService } from './banner.service';
import { BannerSettingsService } from './banner-settings.service';
import { BannerController } from './banner.controller';
import { Banner, BannerSchema } from './schemas/banner.schema';
import {
  BannerSettings,
  BannerSettingsSchema,
} from './schemas/banner-settings.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Banner.name, schema: BannerSchema },
      { name: BannerSettings.name, schema: BannerSettingsSchema },
    ]),
  ],
  controllers: [BannerController],
  providers: [BannerService, BannerSettingsService],
  exports: [BannerService, BannerSettingsService],
})
export class BannerModule {}
