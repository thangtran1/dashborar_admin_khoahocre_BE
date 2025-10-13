import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SystemService } from './system.service';
import { SystemController } from './system.controller';
import { SystemSeeder } from './system.seeder';
import {
  SystemSettings,
  SystemSettingsSchema,
} from './schemas/system-settings.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SystemSettings.name, schema: SystemSettingsSchema },
    ]),
  ],
  controllers: [SystemController],
  providers: [SystemService, SystemSeeder],
  exports: [SystemService, SystemSeeder],
})
export class SystemModule {}
