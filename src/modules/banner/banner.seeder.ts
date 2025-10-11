import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Banner, BannerDocument } from './schemas/banner.schema';
import {
  BannerSettings,
  BannerSettingsDocument,
} from './schemas/banner-settings.schema';

@Injectable()
export class BannerSeeder {
  constructor(
    @InjectModel(Banner.name) private bannerModel: Model<BannerDocument>,
    @InjectModel(BannerSettings.name)
    private bannerSettingsModel: Model<BannerSettingsDocument>,
  ) {}

  async seed() {
    const count = await this.bannerModel.countDocuments();
    if (count > 0) {
      console.log('Banner data already exists, skipping seeding...');
      return;
    }

    // Tạo cài đặt banner mặc định
    const settingsCount = await this.bannerSettingsModel.countDocuments();
    if (settingsCount === 0) {
      await this.bannerSettingsModel.create({
        backgroundColor: '#1890ff',
        textColor: '#ffffff',
        scrollSpeed: 60,
        bannerSpacing: 30,
        isActive: true,
      });
      console.log('✅ Banner settings seeded successfully');
    }

    // Tạo banner mẫu
    const banners = [
      {
        content:
          '🎉 Khuyến mãi đặc biệt - Giảm giá 50% tất cả khóa học! Đăng ký ngay hôm nay!',
        isActive: true,
        order: 1,
      },
      {
        content:
          '📚 Khóa học mới về React và TypeScript đã ra mắt - Học ngay với giá ưu đãi',
        isActive: true,
        order: 2,
      },
      {
        content:
          '🚀 Tham gia cộng đồng học tập online lớn nhất Việt Nam - Miễn phí 100%',
        isActive: true,
        order: 3,
      },
      {
        content:
          '💡 Học lập trình từ cơ bản đến nâng cao với các chuyên gia hàng đầu',
        isActive: false,
        order: 4,
      },
      {
        content:
          '🎯 Chương trình đào tạo thực chiến - Cam kết việc làm sau khóa học',
        isActive: true,
        order: 5,
      },
    ];

    await this.bannerModel.insertMany(banners);
    console.log('✅ Banner data seeded successfully');
  }

  async drop() {
    await this.bannerModel.deleteMany({});
    await this.bannerSettingsModel.deleteMany({});
    console.log('🗑️ Banner data cleared successfully');
  }

  async clear() {
    await this.drop();
  }
}
