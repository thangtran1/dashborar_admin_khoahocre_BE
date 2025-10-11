import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  BannerSettings,
  BannerSettingsDocument,
} from './schemas/banner-settings.schema';
import { UpdateBannerSettingsDto } from './dto/update-banner-settings.dto';

@Injectable()
export class BannerSettingsService {
  constructor(
    @InjectModel(BannerSettings.name)
    private bannerSettingsModel: Model<BannerSettingsDocument>,
  ) {}

  async getSettings(): Promise<BannerSettingsDocument> {
    let settings = await this.bannerSettingsModel.findOne().exec();

    // Nếu chưa có settings, tạo mặc định
    if (!settings) {
      settings = await this.bannerSettingsModel.create({
        backgroundColor: '#1890ff',
        textColor: '#ffffff',
        scrollSpeed: 60,
        bannerSpacing: 30,
        isActive: true,
      });
    }

    return settings;
  }

  async updateSettings(
    updateDto: UpdateBannerSettingsDto,
  ): Promise<BannerSettingsDocument> {
    let settings = await this.bannerSettingsModel.findOne().exec();

    if (!settings) {
      // Tạo mới nếu chưa có
      settings = await this.bannerSettingsModel.create({
        backgroundColor: '#1890ff',
        textColor: '#ffffff',
        scrollSpeed: 60,
        bannerSpacing: 30,
        isActive: true,
        ...updateDto,
      });
    } else {
      // Cập nhật
      settings = await this.bannerSettingsModel
        .findByIdAndUpdate(settings._id, updateDto, { new: true })
        .exec();
    }

    if (!settings) {
      throw new NotFoundException('Không thể cập nhật cài đặt banner');
    }

    return settings;
  }

  async resetToDefault(): Promise<BannerSettingsDocument> {
    const defaultSettings = {
      backgroundColor: '#1890ff',
      textColor: '#ffffff',
      scrollSpeed: 60,
      bannerSpacing: 30,
      isActive: true,
    };

    let settings = await this.bannerSettingsModel.findOne().exec();

    if (!settings) {
      settings = await this.bannerSettingsModel.create(defaultSettings);
    } else {
      settings = await this.bannerSettingsModel
        .findByIdAndUpdate(settings._id, defaultSettings, { new: true })
        .exec();
    }

    return settings!;
  }
}
