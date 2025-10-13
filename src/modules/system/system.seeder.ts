import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SystemSettings,
  SystemSettingsDocument,
} from './schemas/system-settings.schema';

@Injectable()
export class SystemSeeder {
  private readonly logger = new Logger(SystemSeeder.name);

  constructor(
    @InjectModel(SystemSettings.name)
    private systemSettingsModel: Model<SystemSettingsDocument>,
  ) {}

  async seed() {
    const existingSettings = await this.systemSettingsModel.countDocuments();

    if (existingSettings === 0) {
      await this.systemSettingsModel.create({
        defaultLanguage: 'vi',
        systemName: 'Hệ thống Admin',
        systemDescription: 'Hệ thống quản lý hệ thống',
      });
      this.logger.log('System settings seeded!');
    } else {
      this.logger.log('System settings already exist');
    }
  }

  async clear() {
    await this.systemSettingsModel.deleteMany({});
    this.logger.log('System settings cleared!');
  }
}
