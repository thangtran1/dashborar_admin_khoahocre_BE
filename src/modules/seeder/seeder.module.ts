import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/user.schema';
import { SeederService } from './seeder.service';
import { SeederController } from './seeder.controller';
import {
  Notification,
  NotificationSchema,
} from '../notifications/schemas/notification.schema';
import {
  Maintenance,
  MaintenanceSchema,
} from '../maintenance/schemas/maintenance.schema';
import {
  BannerSettings,
  BannerSettingsSchema,
} from '../banner/schemas/banner-settings.schema';
import { Banner, BannerSchema } from '../banner/schemas/banner.schema';
import {
  SystemSettings,
  SystemSettingsSchema,
} from '../system/schemas/system-settings.schema';
import { Brand, BrandSchema } from '../brands/schemas/brand.schema';
import {
  Category,
  CategorySchema,
} from '../categories/schemas/category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),

    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),

    MongooseModule.forFeature([
      { name: Maintenance.name, schema: MaintenanceSchema },
    ]),

    MongooseModule.forFeature([{ name: Banner.name, schema: BannerSchema }]),

    MongooseModule.forFeature([
      { name: BannerSettings.name, schema: BannerSettingsSchema },
    ]),

    MongooseModule.forFeature([
      { name: SystemSettings.name, schema: SystemSettingsSchema },
    ]),
    MongooseModule.forFeature([{ name: Brand.name, schema: BrandSchema }]),
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  controllers: [SeederController],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}
