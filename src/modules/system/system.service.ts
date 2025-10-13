import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SystemSettings,
  SystemSettingsDocument,
} from './schemas/system-settings.schema';
import { UpdateSystemSettingsDto } from './dto/update-system-settings.dto';

@Injectable()
export class SystemService {
  constructor(
    @InjectModel(SystemSettings.name)
    private systemSettingsModel: Model<SystemSettingsDocument>,
  ) {}

  async getSettings(): Promise<SystemSettingsDocument> {
    let settings = await this.systemSettingsModel.findOne().exec();

    // Nếu chưa có settings, tạo mặc định
    if (!settings) {
      settings = await this.systemSettingsModel.create({
        defaultLanguage: 'vi',
        systemName: 'TVT Admin',
        systemDescription: 'TVT Admin',
      });
    }

    return settings;
  }

  async updateSettings(
    updateDto: UpdateSystemSettingsDto,
  ): Promise<SystemSettingsDocument> {
    let settings = await this.systemSettingsModel.findOne().exec();

    if (!settings) {
      settings = await this.systemSettingsModel.create({
        defaultLanguage: updateDto.defaultLanguage || 'vi',
        systemName: updateDto.systemName || 'TVT Admin',
        systemDescription: updateDto.systemDescription || 'TVT Admin',
      });
    } else {
      settings = await this.systemSettingsModel
        .findByIdAndUpdate(settings._id, updateDto, { new: true })
        .exec();
    }

    return settings!;
  }

  async getDefaultLanguage(): Promise<string> {
    const settings = await this.getSettings();
    return settings.defaultLanguage;
  }
}
