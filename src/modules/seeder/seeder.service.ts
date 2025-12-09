import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument, UserStatus } from '../users/schemas/user.schema';
import {
  Notification,
  NotificationDocument,
  NotificationType,
} from '../notifications/schemas/notification.schema';
import {
  Maintenance,
  MaintenanceDocument,
  MaintenanceStatus,
  MaintenanceType,
} from '../maintenance/schemas/maintenance.schema';
import { Banner, BannerDocument } from '../banner/schemas/banner.schema';
import {
  BannerSettings,
  BannerSettingsDocument,
} from '../banner/schemas/banner-settings.schema';
import { SystemSettings } from '../system/schemas/system-settings.schema';
import { SystemSettingsDocument } from '../system/schemas/system-settings.schema';
import {
  Brand,
  BrandDocument,
  BrandStatus,
} from '../brands/schemas/brand.schema';
import {
  Category,
  CategoryDocument,
  CategoryStatus,
} from '../categories/schemas/category.schema';
import {
  Product,
  ProductDocument,
  ProductStatus,
} from '../products/schemas/product.schema';
@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectModel(Maintenance.name)
    private maintenanceModel: Model<MaintenanceDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    @InjectModel(Banner.name) private bannerModel: Model<BannerDocument>,
    @InjectModel(BannerSettings.name)
    private bannerSettingsModel: Model<BannerSettingsDocument>,
    @InjectModel(SystemSettings.name)
    private systemModel: Model<SystemSettingsDocument>,
    @InjectModel(Category.name)
    private categoryModel: Model<CategoryDocument>,

    @InjectModel(Brand.name)
    private brandModel: Model<BrandDocument>,
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
  ) {}

  async seedAll(): Promise<void> {
    try {
      this.logger.log('Bắt đầu seed dữ liệu...');

      await this.seedUsers();
      await this.seedNotifications();
      await this.seedMaintenance();
      await this.seedBanner();
      await this.seedBannerSettings();
      await this.seedSystem();
      await this.seedBrands();
      await this.seedCategories();
      await this.seedProducts();
      this.logger.log('Hoàn thành seed dữ liệu!');
    } catch (error) {
      this.logger.error('Lỗi khi seed dữ liệu:', error);
      throw error;
    }
  }

  async clearAll(): Promise<void> {
    try {
      this.logger.log('Bắt đầu xóa dữ liệu...');

      await this.userModel.deleteMany({});
      await this.notificationModel.deleteMany({});
      await this.maintenanceModel.deleteMany({});
      await this.bannerModel.deleteMany({});
      await this.bannerSettingsModel.deleteMany({});
      await this.systemModel.deleteMany({});
      await this.categoryModel.deleteMany({});
      await this.brandModel.deleteMany({});
      await this.productModel.deleteMany({});
      this.logger.log('Hoàn thành xóa dữ liệu!');
    } catch (error) {
      this.logger.error('Lỗi khi xóa dữ liệu:', error);
      throw error;
    }
  }

  private async seedUsers(): Promise<void> {
    const hashedPassword = await bcrypt.hash('123123', 10);

    const users = [
      {
        email: 'thangtrandz04@gmail.com',
        name: 'Admin',
        password: hashedPassword,
        role: 'admin',
        status: UserStatus.ACTIVE,
        avatar: '/uploads/avatars/avatar-1760599639969-286742541.jfif',
        phone: '0123456789',
        dateOfBirth: new Date('2000-01-01'),
        address: 'Đà Nẵng, Việt Nam',
        bio: 'Quản trị viên hệ thống',
        loginCount: 0,
        isEmailVerified: true,
        isDeleted: false,
      },
      {
        email: 'user@khoahocre.com',
        name: 'User',
        password: hashedPassword,
        role: 'user',
        status: UserStatus.ACTIVE,
        avatar: '/uploads/avatars/avatar-1760599639969-286742541.jfif',
        phone: '0123456789',
        dateOfBirth: new Date('2000-01-01'),
        address: 'Đà Nẵng, Việt Nam',
        bio: 'Người dùng thường',
        loginCount: 0,
        isEmailVerified: true,
        isDeleted: false,
      },
      {
        email: 'user2@khoahocre.com',
        name: 'User2',
        password: hashedPassword,
        role: 'user',
        status: UserStatus.ACTIVE,
        avatar: '/uploads/avatars/avatar-1760599639969-286742541.jfif',
        phone: '0123456789',
        dateOfBirth: new Date('2000-01-01'),
        address: 'Đà Nẵng, Việt Nam',
        bio: 'Người dùng thường 2',
        loginCount: 0,
        isEmailVerified: true,
        isDeleted: false,
      },
      {
        email: 'user3@khoahocre.com',
        name: 'User3',
        password: hashedPassword,
        role: 'user',
        status: UserStatus.ACTIVE,
        avatar: '/uploads/avatars/avatar-1760599639969-286742541.jfif',
        phone: '0123456789',
        dateOfBirth: new Date('2000-01-01'),
        address: 'Đà Nẵng, Việt Nam',
        bio: 'Người dùng thường 3',
        loginCount: 0,
        isEmailVerified: true,
        isDeleted: false,
      },
      {
        email: 'user4@khoahocre.com',
        name: 'User4',
        password: hashedPassword,
        role: 'user',
        status: 'active',
        avatar: '/uploads/avatars/avatar-1760599639969-286742541.jfif',
        phone: '0123456789',
        dateOfBirth: new Date('2000-01-01'),
        address: 'Đà Nẵng, Việt Nam',
        bio: 'Người dùng thường 4',
        loginCount: 0,
        isEmailVerified: true,
        isDeleted: false,
      },
      {
        email: 'user5@khoahocre.com',
        name: 'User5',
        password: hashedPassword,
        role: 'user',
        status: UserStatus.ACTIVE,
        avatar: '/uploads/avatars/avatar-1760599639969-286742541.jfif',
        phone: '0123456789',
        dateOfBirth: new Date('2000-01-01'),
        address: 'Đà Nẵng, Việt Nam',
        bio: 'Người dùng thường 5',
        loginCount: 0,
        isEmailVerified: true,
        isDeleted: false,
      },
      {
        email: 'user6@khoahocre.com',
        name: 'User6',
        password: hashedPassword,
        role: 'user',
        status: UserStatus.ACTIVE,
        avatar: '/uploads/avatars/avatar-1760599639969-286742541.jfif',
        phone: '0123456789',
        dateOfBirth: new Date('2000-01-01'),
        address: 'Đà Nẵng, Việt Nam',
        bio: 'Người dùng thường 6',
        loginCount: 0,
        isEmailVerified: true,
        isDeleted: false,
      },
      {
        email: 'user7@khoahocre.com',
        name: 'User7',
        password: hashedPassword,
        role: 'user',
        status: UserStatus.INACTIVE,
        avatar: '/uploads/avatars/avatar-1760599639969-286742541.jfif',
        phone: '0123456789',
        dateOfBirth: new Date('2000-01-01'),
        address: 'Đà Nẵng, Việt Nam',
        bio: 'Người dùng thường 7',
        loginCount: 0,
        isEmailVerified: true,
        isDeleted: false,
      },
      {
        email: 'user8@khoahocre.com',
        name: 'User8',
        password: hashedPassword,
        role: 'user',
        status: UserStatus.INACTIVE,
        avatar: '/uploads/avatars/avatar-1760599639969-286742541.jfif',
        phone: '0123456789',
        dateOfBirth: new Date('2000-01-01'),
        address: 'Đà Nẵng, Việt Nam',
        bio: 'Người dùng thường 8',
        loginCount: 0,
        isEmailVerified: true,
        isDeleted: false,
      },
      {
        email: 'user9@khoahocre.com',
        name: 'User9',
        password: hashedPassword,
        role: 'user',
        status: UserStatus.INACTIVE,
        avatar: '/uploads/avatars/avatar-1760599639969-286742541.jfif',
        phone: '0123456789',
        dateOfBirth: new Date('2000-01-01'),
        address: 'Đà Nẵng, Việt Nam',
        bio: 'Người dùng thường 9',
        loginCount: 0,
        isEmailVerified: true,
        isDeleted: false,
      },
      {
        email: 'user10@khoahocre.com',
        name: 'User10',
        password: hashedPassword,
        role: 'user',
        status: UserStatus.INACTIVE,
        avatar: '/uploads/avatars/avatar-1760599639969-286742541.jfif',
        phone: '0123456789',
        dateOfBirth: new Date('2000-01-01'),
        address: 'Đà Nẵng, Việt Nam',
        bio: 'Người dùng thường 10',
        loginCount: 0,
        isEmailVerified: true,
        isDeleted: false,
      },
      {
        email: 'user11@khoahocre.com',
        name: 'User11',
        password: hashedPassword,
        role: 'user',
        status: UserStatus.INACTIVE,
        avatar: '/uploads/avatars/avatar-1760599639969-286742541.jfif',
        phone: '0123456789',
        dateOfBirth: new Date('2000-01-01'),
        address: 'Đà Nẵng, Việt Nam',
        bio: 'Người dùng thường 11',
        loginCount: 0,
        isEmailVerified: true,
        isDeleted: false,
      },
      {
        email: 'user12@khoahocre.com',
        name: 'User12',
        password: hashedPassword,
        role: 'user',
        status: UserStatus.INACTIVE,
        avatar: '/uploads/avatars/avatar-1760599639969-286742541.jfif',
        phone: '0123456789',
        dateOfBirth: new Date('2000-01-01'),
        address: 'Đà Nẵng, Việt Nam',
        bio: 'Người dùng thường 12',
        loginCount: 0,
        isEmailVerified: true,
        isDeleted: false,
      },
    ];

    for (const user of users) {
      const existingUser = await this.userModel.findOne({ email: user.email });
      if (!existingUser) {
        await this.userModel.create(user);
        this.logger.log(`Đã tạo user: ${user.email}`);
      } else {
        this.logger.log(`User đã tồn tại: ${user.email}`);
      }
    }
  }
  private async seedNotifications(): Promise<void> {
    const notifications = [
      {
        title: 'Thông báo 1',
        content: 'Thông báo 1',
        actionUrl:
          'https://statictuoitre.mediacdn.vn/thumb_w/640/2017/7-1512755474943.jpg',
        type: NotificationType.NEWS,
      },
      {
        title: 'Thông báo 2',
        content: 'Thông báo 2',
        actionUrl:
          'https://statictuoitre.mediacdn.vn/thumb_w/640/2017/7-1512755474943.jpg',
        type: NotificationType.NEWS,
      },
      {
        title: 'Thông báo 3',
        content: 'Thông báo 3',
        actionUrl:
          'https://statictuoitre.mediacdn.vn/thumb_w/640/2017/7-1512755474943.jpg',
        type: NotificationType.NEWS,
      },
      {
        title: 'Thông báo 4',
        content: 'Thông báo 4',
        actionUrl:
          'https://statictuoitre.mediacdn.vn/thumb_w/640/2017/7-1512755474943.jpg',
        type: NotificationType.NEWS,
      },
      {
        title: 'Thông báo 5',
        content: 'Thông báo 5',
        actionUrl:
          'https://statictuoitre.mediacdn.vn/thumb_w/640/2017/7-1512755474943.jpg',
        type: NotificationType.NEWS,
      },
      {
        title: 'Thông báo 6',
        content: 'Thông báo 6',
        actionUrl:
          'https://statictuoitre.mediacdn.vn/thumb_w/640/2017/7-1512755474943.jpg',
        type: NotificationType.SYSTEM,
      },
      {
        title: 'Thông báo 7',
        content: 'Thông báo 7',
        actionUrl:
          'https://statictuoitre.mediacdn.vn/thumb_w/640/2017/7-1512755474943.jpg',
        type: NotificationType.SYSTEM,
      },
      {
        title: 'Thông báo 8',
        content: 'Thông báo 8',
        actionUrl:
          'https://statictuoitre.mediacdn.vn/thumb_w/640/2017/7-1512755474943.jpg',
        type: NotificationType.SYSTEM,
      },
      {
        title: 'Thông báo 9',
        content: 'Thông báo 9',
        actionUrl:
          'https://statictuoitre.mediacdn.vn/thumb_w/640/2017/7-1512755474943.jpg',
        type: NotificationType.SYSTEM,
      },
      {
        title: 'Thông báo 10',
        content: 'Thông báo 10',
        actionUrl:
          'https://statictuoitre.mediacdn.vn/thumb_w/640/2017/7-1512755474943.jpg',
        type: NotificationType.MAINTENANCE,
      },
      {
        title: 'Thông báo 11',
        content: 'Thông báo 11',
        actionUrl:
          'https://statictuoitre.mediacdn.vn/thumb_w/640/2017/7-1512755474943.jpg',
        type: NotificationType.MAINTENANCE,
      },
      {
        title: 'Thông báo 12',
        content: 'Thông báo 12',
        actionUrl:
          'https://statictuoitre.mediacdn.vn/thumb_w/640/2017/7-1512755474943.jpg',
        type: NotificationType.MAINTENANCE,
      },
      {
        title: 'Thông báo 13',
        content: 'Thông báo 13',
        actionUrl:
          'https://statictuoitre.mediacdn.vn/thumb_w/640/2017/7-1512755474943.jpg',
        type: NotificationType.MAINTENANCE,
      },
      {
        title: 'Thông báo 14',
        content: 'Thông báo 14',
        actionUrl:
          'https://statictuoitre.mediacdn.vn/thumb_w/640/2017/7-1512755474943.jpg',
        type: NotificationType.MAINTENANCE,
      },
      {
        title: 'Thông báo 15',
        content: 'Thông báo 15',
        actionUrl:
          'https://statictuoitre.mediacdn.vn/thumb_w/640/2017/7-1512755474943.jpg',
        type: NotificationType.MAINTENANCE,
        createdAt: '2025-11-04T06:09:13.345+00:00',
        updatedAt: '2025-11-04T06:09:13.345+00:00',
      },
      {
        title: 'Thông báo 16',
        content: 'Thông báo 16',
        actionUrl:
          'https://statictuoitre.mediacdn.vn/thumb_w/640/2017/7-1512755474943.jpg',
        type: NotificationType.MAINTENANCE,
        createdAt: '2025-11-04T06:09:13.345+00:00',
        updatedAt: '2025-11-04T06:09:13.345+00:00',
      },
      {
        title: 'Thông báo 17',
        content: 'Thông báo 17',
        actionUrl:
          'https://statictuoitre.mediacdn.vn/thumb_w/640/2017/7-1512755474943.jpg',
        type: NotificationType.MAINTENANCE,
        createdAt: '2025-11-04T06:09:13.345+00:00',
        updatedAt: '2025-11-04T06:09:13.345+00:00',
      },
    ];

    for (const notification of notifications) {
      const existingNotification = await this.notificationModel.findOne({
        title: notification.title,
      });
      if (!existingNotification) {
        await this.notificationModel.create(notification);
        this.logger.log(`Đã tạo thông báo: ${notification.title}`);
      } else {
        this.logger.log(`Thông báo đã tồn tại: ${notification.title}`);
      }
    }
  }
  private async seedMaintenance(): Promise<void> {
    const maintenanceSeeds = [
      {
        title: 'Nâng cấp Database',
        description: 'Nâng cấp hệ thống database lên phiên bản mới nhất',
        startTime: new Date('2025-10-25T10:00:00Z'),
        endTime: new Date('2025-10-25T12:00:00Z'),
        status: MaintenanceStatus.SCHEDULED,
        type: MaintenanceType.DATABASE,
        isActive: false,
        autoAdjusted: false,
      },
      {
        title: 'Bảo trì Hệ thống',
        description: 'Bảo trì định kỳ hệ thống và cập nhật các tính năng mới',
        startTime: new Date('2025-10-26T14:00:00Z'),
        endTime: new Date('2025-10-26T18:00:00Z'),
        status: MaintenanceStatus.SCHEDULED,
        type: MaintenanceType.SYSTEM,
        isActive: false,
        autoAdjusted: false,
      },
      {
        title: 'Nâng cấp Network',
        description: 'Nâng cấp hạ tầng mạng và bảo mật',
        startTime: new Date('2025-10-27T22:00:00Z'),
        endTime: new Date('2025-10-28T02:00:00Z'),
        status: MaintenanceStatus.SCHEDULED,
        type: MaintenanceType.NETWORK,
        isActive: false,
        autoAdjusted: false,
      },
      {
        title: 'Cập nhật Phần mềm',
        description: 'Cập nhật các phần mềm hệ thống lên phiên bản mới',
        startTime: new Date('2025-10-29T08:00:00Z'),
        endTime: new Date('2025-10-29T10:00:00Z'),
        status: MaintenanceStatus.SCHEDULED,
        type: MaintenanceType.OTHER,
        isActive: false,
        autoAdjusted: false,
      },
      {
        title: 'Bảo trì Khẩn cấp',
        description: 'Sửa chữa lỗi hệ thống khẩn cấp',
        startTime: new Date('2025-10-24T09:00:00Z'),
        endTime: new Date('2025-10-24T11:00:00Z'),
        status: MaintenanceStatus.COMPLETED,
        type: MaintenanceType.SYSTEM,
        isActive: false,
        autoAdjusted: false,
        duration: 120,
      },
      {
        title: 'Nâng cấp Server',
        description: 'Nâng cấp phần cứng và phần mềm server',
        startTime: new Date('2025-10-23T20:00:00Z'),
        endTime: new Date('2025-10-24T02:00:00Z'),
        status: MaintenanceStatus.COMPLETED,
        type: MaintenanceType.SYSTEM,
        isActive: false,
        autoAdjusted: false,
        duration: 360,
      },
      {
        title: 'Bảo trì Backup System',
        description: 'Kiểm tra và tối ưu hệ thống backup',
        startTime: new Date('2025-10-22T15:00:00Z'),
        endTime: new Date('2025-10-22T17:00:00Z'),
        status: MaintenanceStatus.CANCELLED,
        type: MaintenanceType.DATABASE,
        isActive: false,
        autoAdjusted: false,
      },
      {
        title: 'Cập nhật SSL',
        description: 'Cập nhật chứng chỉ SSL cho hệ thống',
        startTime: new Date('2025-10-21T12:00:00Z'),
        endTime: new Date('2025-10-21T13:00:00Z'),
        status: MaintenanceStatus.COMPLETED,
        type: MaintenanceType.NETWORK,
        isActive: false,
        autoAdjusted: false,
        duration: 60,
      },
      {
        title: 'Tối ưu Database',
        description: 'Tối ưu hiệu suất và dọn dẹp database',
        startTime: new Date('2025-10-20T23:00:00Z'),
        endTime: new Date('2025-10-21T01:00:00Z'),
        status: MaintenanceStatus.COMPLETED,
        type: MaintenanceType.DATABASE,
        isActive: false,
        autoAdjusted: false,
        duration: 120,
      },
      {
        title: 'Nâng cấp Security',
        description: 'Cập nhật các tính năng bảo mật mới',
        startTime: new Date('2025-10-19T18:00:00Z'),
        endTime: new Date('2025-10-19T20:00:00Z'),
        status: MaintenanceStatus.COMPLETED,
        type: MaintenanceType.NETWORK,
        isActive: false,
        autoAdjusted: false,
        duration: 120,
      },
    ];
    for (const maintenance of maintenanceSeeds) {
      const existingMaintenance = await this.maintenanceModel.findOne({
        title: maintenance.title,
      });
      if (!existingMaintenance) {
        await this.maintenanceModel.create(maintenance);
        this.logger.log(`Đã tạo maintenance: ${maintenance.title}`);
      } else {
        this.logger.log(`Maintenance đã tồn tại: ${maintenance.title}`);
      }
    }
  }
  private async seedBanner(): Promise<void> {
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
    for (const banner of banners) {
      const existingBanner = await this.bannerModel.findOne({
        content: banner.content,
      });
      if (!existingBanner) {
        await this.bannerModel.create(banner);
        this.logger.log(`Đã tạo banner: ${banner.content}`);
      } else {
        this.logger.log(`Banner đã tồn tại: ${banner.content}`);
      }
    }
  }
  private async seedBannerSettings(): Promise<void> {
    const bannerSettings = [
      {
        backgroundColor: '#1890ff',
        textColor: '#ffffff',
        scrollSpeed: 60,
        bannerSpacing: 30,
        isActive: true,
      },
    ];
    for (const bannerSetting of bannerSettings) {
      const existingBannerSetting = await this.bannerSettingsModel.findOne({
        backgroundColor: bannerSetting.backgroundColor,
      });
      if (!existingBannerSetting) {
        await this.bannerSettingsModel.create(bannerSetting);
        this.logger.log(
          `Đã tạo banner settings: ${bannerSetting.backgroundColor}`,
        );
      } else {
        this.logger.log(
          `Banner settings đã tồn tại: ${bannerSetting.backgroundColor}`,
        );
      }
    }
  }
  private async seedSystem(): Promise<void> {
    const systems = [
      {
        defaultLanguage: 'vi',
        systemName: 'Hệ thống Admin',
        systemDescription: 'Hệ thống quản lý hệ thống',
      },
    ];
    for (const system of systems) {
      const existingSystem = await this.systemModel.findOne({
        defaultLanguage: system.defaultLanguage,
      });
      if (!existingSystem) {
        await this.systemModel.create(system);
        this.logger.log(`Đã tạo system: ${system.defaultLanguage}`);
      } else {
        this.logger.log(`System đã tồn tại: ${system.defaultLanguage}`);
      }
    }
  }
  private async seedBrands(): Promise<void> {
    const brands = [
      {
        name: 'Samsung',
        slug: 'samsung',
        description:
          'Samsung Electronics – Điện tử, điện thoại, thiết bị gia dụng',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/6/61/Samsung_old_logo_before_year_2015.svg',
        website: 'https://www.samsung.com',
        status: BrandStatus.ACTIVE,
        sortOrder: 1,
        isFeatured: true,
      },
      {
        name: 'Apple',
        slug: 'apple',
        description: 'Apple – iPhone, MacBook, iPad và các sản phẩm công nghệ',
        logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0dJv4E8VraHN5HDwmsBT-E9NpIrdJDMVykw&s',
        website: 'https://www.apple.com',
        status: BrandStatus.ACTIVE,
        sortOrder: 2,
        isFeatured: true,
      },
      {
        name: 'Xiaomi',
        slug: 'xiaomi',
        description:
          'Xiaomi – Điện thoại, đồ gia dụng thông minh, thiết bị công nghệ',
        logo: 'https://1000logos.net/wp-content/uploads/2021/08/Xiaomi-logo.jpg',
        website: 'https://www.mi.com',
        status: BrandStatus.ACTIVE,
        sortOrder: 3,
        isFeatured: false,
      },
      {
        name: 'Sony',
        slug: 'sony',
        description: 'Sony – Điện tử, máy ảnh, TV, âm thanh và giải trí',
        logo: 'https://seekvectorlogo.com/wp-content/uploads/2018/01/sony-vector-logo.png',
        website: 'https://www.sony.com',
        status: BrandStatus.ACTIVE,
        sortOrder: 4,
        isFeatured: false,
      },
      {
        name: 'LG',
        slug: 'lg',
        description:
          'LG Electronics – Điện tử tiêu dùng, gia dụng, thiết bị gia đình',
        logo: 'https://images.squarespace-cdn.com/content/v1/502a8efb84ae42cbccf920c4/1585574686746-VCDIHSO21O76WR72WIAD/LG-Logo.png',
        website: 'https://www.lg.com',
        status: BrandStatus.ACTIVE,
        sortOrder: 5,
        isFeatured: false,
      },
      {
        name: 'Huawei',
        slug: 'huawei',
        description:
          'Huawei – Điện thoại, thiết bị viễn thông, công nghệ thông minh',
        logo: 'https://e7.pngegg.com/pngimages/528/654/png-clipart-huawei-logo-huawei-ascend-%E5%8D%8E%E4%B8%BA-logo-honor-huawei-logo-text-logo.png',
        website: 'https://www.huawei.com',
        status: BrandStatus.ACTIVE,
        sortOrder: 6,
        isFeatured: false,
      },
      {
        name: 'Oppo',
        slug: 'oppo',
        description: 'Oppo – Điện thoại thông minh và thiết bị công nghệ',
        logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDuLPZKtN6y-wDvXCfDCEXz6prcJpyYJGmlw&s',
        website: 'https://www.oppo.com',
        status: BrandStatus.ACTIVE,
        sortOrder: 7,
        isFeatured: false,
      },
      {
        name: 'Vivo',
        slug: 'vivo',
        description: 'Vivo – Điện thoại thông minh, thiết bị di động',
        logo: 'https://1000logos.net/wp-content/uploads/2022/02/Vivo-Logo.jpg',
        website: 'https://www.vivo.com',
        status: BrandStatus.ACTIVE,
        sortOrder: 8,
        isFeatured: false,
      },
      {
        name: 'Dell',
        slug: 'dell',
        description: 'Dell – Laptop, máy tính, thiết bị công nghệ',
        logo: 'https://1000logos.net/wp-content/uploads/2017/07/Dell-Logo.png',
        website: 'https://www.dell.com',
        status: BrandStatus.ACTIVE,
        sortOrder: 9,
        isFeatured: false,
      },
      {
        name: 'HP',
        slug: 'hp',
        description: 'HP – Laptop, máy in, thiết bị công nghệ và văn phòng',
        logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4HDByF3o4Xc-kt7XFifx5yWv0NEff6FqsgA&s',
        website: 'https://www.hp.com',
        status: BrandStatus.ACTIVE,
        sortOrder: 10,
        isFeatured: false,
      },
    ];
    for (const brand of brands) {
      const existingBrand = await this.brandModel.findOne({
        name: brand.name,
      });
      if (!existingBrand) {
        await this.brandModel.create(brand);
        this.logger.log(`Đã tạo brand: ${brand.name}`);
      } else {
        this.logger.log(`Brand đã tồn tại: ${brand.name}`);
      }
    }
  }
  private async seedCategories(): Promise<void> {
    const categories = [
      {
        name: 'Smartphones',
        slug: 'smartphones',
        description: 'Điện thoại thông minh từ các thương hiệu nổi tiếng',
        image:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRswe__RSY0NpJSkmZdQiFj2WsbKbfFV6P7sg&s',
        status: CategoryStatus.ACTIVE,
        sortOrder: 1,
      },
      {
        name: 'Laptops',
        slug: 'laptops',
        description: 'Máy tính xách tay từ các thương hiệu hàng đầu',
        image: 'https://cdn-icons-png.flaticon.com/512/2910/2910767.png',
        status: CategoryStatus.ACTIVE,
        sortOrder: 2,
      },
      {
        name: 'Tablets',
        slug: 'tablets',
        description: 'Máy tính bảng cho công việc và giải trí',
        image:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMIvb__HpyqzWdPKCjPtr48vSSQTOtAJBdrg&s',
        status: CategoryStatus.ACTIVE,
        sortOrder: 3,
      },
      {
        name: 'TV & Audio',
        slug: 'tv-audio',
        description: 'Tivi, loa, âm thanh và giải trí gia đình',
        image:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROtxITMtN6GBRU6oJ154Dn3XsQ7R0w5CqM3Q&s',
        status: CategoryStatus.ACTIVE,
        sortOrder: 4,
      },
      {
        name: 'Smartwatches',
        slug: 'smartwatches',
        description: 'Đồng hồ thông minh và thiết bị đeo',
        image:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQe0aBz5wzhZpsJKRGCdpTv_MjG1oOq6vpkhQ&s',
        status: CategoryStatus.ACTIVE,
        sortOrder: 5,
      },
      {
        name: 'Cameras',
        slug: 'cameras',
        description: 'Máy ảnh kỹ thuật số và thiết bị quay phim',
        image:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZy087-QqhfvEkTvzM2_pda0cBGObwDBkbJA&s',
        status: CategoryStatus.ACTIVE,
        sortOrder: 6,
      },
      {
        name: 'Headphones',
        slug: 'headphones',
        description: 'Tai nghe, earphones chất lượng cao',
        image:
          'https://i0.wp.com/blog.son-video.com/wp-content/uploads/2017/01/Bluetooth.jpg?resize=696%2C392&ssl=1',
        status: CategoryStatus.ACTIVE,
        sortOrder: 7,
      },
      {
        name: 'Gaming',
        slug: 'gaming',
        description: 'Thiết bị, phụ kiện và máy chơi game',
        image:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQe_lGNWrCBvucEnY9IaHiONsSsDFr20ZE1mw&s',
        status: CategoryStatus.ACTIVE,
        sortOrder: 8,
      },
      {
        name: 'Home Appliances',
        slug: 'home-appliances',
        description: 'Đồ gia dụng thông minh và tiện ích',
        image:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQaJ-ICV8RL1--FkJ-mWKYsUTN1c-dANUcm2w&sg',
        status: CategoryStatus.ACTIVE,
        sortOrder: 9,
      },
      {
        name: 'Networking',
        slug: 'networking',
        description: 'Router, modem và thiết bị mạng',
        image:
          'https://www.shutterstock.com/image-vector/people-logo-design-human-infinity-600nw-2459848611.jpg',
        status: CategoryStatus.ACTIVE,
        sortOrder: 10,
      },
    ];
    for (const category of categories) {
      const existingCategory = await this.categoryModel.findOne({
        name: category.name,
      });
      if (!existingCategory) {
        await this.categoryModel.create(category);
        this.logger.log(`Đã tạo category: ${category.name}`);
      } else {
        this.logger.log(`Category đã tồn tại: ${category.name}`);
      }
    }
  }
  private async seedProducts(): Promise<void> {
    const products = [
      {
        _id: new Types.ObjectId(),
        name: 'iPhone 16 Pro Max 256GB',
        slug: 'iphone-16-pro-max-256gb',
        price: 32990000,
        discount: 10,
        description:
          'iPhone 16 Pro Max với hiệu năng mạnh mẽ, camera vượt trội, thiết kế Titanium siêu nhẹ.',
        shortDescription: 'Flagship cao cấp nhất 2024.',
        image:
          'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:0/q:100/plain/https://cellphones.com.vn/media/wysiwyg/Phone/Apple/iphone-16-4.jpg',
        images: [
          {
            url: 'https://cdn-media.sforum.vn/storage/app/media/nhuy/Nhu-Y/hinh-nen-iphone-16-dep-1.jpg',
            alt: 'Mặt trước iPhone 15 Pro Max',
            sortOrder: 1,
          },
          {
            url: 'https://cdn-media.sforum.vn/storage/app/media/nhuy/Nhu-Y/hinh-nen-iphone-16-dep-1.jpg',
            alt: 'Mặt sau iPhone 15 Pro Max',
            sortOrder: 2,
          },
        ],
        category: '6937c2ff844968d64b005451',
        brand: '6937bca8a9768d6fc45c665b',
        stock: 120,
        status: ProductStatus.ACTIVE,
        isNew: true,
        isFeatured: true,
        isBestSeller: true,
        specifications: [
          'Chip Apple A17 Pro',
          'Màn hình 6.7 inch Super Retina XDR',
          'Camera 48MP Tele 5x',
          'Pin 4422mAh',
        ],
        warrantyPeriod: 12,
        sku: 'IP15PM-512-TI',
        weight: 221,
        dimensions: {
          length: 160.8,
          width: 77.8,
          height: 7.85,
        },
        viewCount: 0,
        soldCount: 0,
        reviewCount: 3,
        averageRating: 5,
        tags: ['iphone', 'apple', 'flagship'],
        sortOrder: 1,
        isDeleted: false,
        reviews: [
          {
            rating: 5,
            comment: 'rất hài lòng!',
            user: '6915e28d7c72b6f33b8819bc',
            type: 'Chưa mua hàng',
            images: [
              'https://blog.abit.vn/wp-content/uploads/2020/06/danh-gia-5-sao-1.jpg',
            ],
            replies: [
              {
                comment: 'Cảm ơn bạn nhiều nhé',
                user: '6915e28c7c72b6f33b8819b7',
                isAdmin: true,
                _id: new Types.ObjectId(),
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ],
            isApproved: true,
            _id: new Types.ObjectId(),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 12,
        finalPrice: 29691000,
        id: new Types.ObjectId(),
      },
      {
        _id: new Types.ObjectId(),
        name: 'Samsung Galaxy S24 Ultra 256GB',
        slug: 'samsung-galaxy-s24-ultra-256gb',
        price: 32990000,
        discount: 10,
        description:
          'Samsung Galaxy S24 Ultra với hiệu năng mạnh mẽ, camera vượt trội, thiết kế Titanium siêu nhẹ.',
        shortDescription: 'Flagship cao cấp nhất 2024.',
        image:
          'https://i.ytimg.com/vi/3i1OB6wKYms/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLBP44tQi1uE9_3LF7oEOZPdduyMJw',
        images: [
          {
            url: 'https://static0.pocketlintimages.com/wordpress/wp-content/uploads/wm/2025/01/galaxy-s25-ultra-header-1.jpg?w=1600&h=900&fit=crop',
            alt: 'Mặt trước Samsung Galaxy S24 Ultra',
            sortOrder: 1,
          },
          {
            url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbGy9cX3-uv_IjN8ctFbi9YpkA7V_y0J3yHQ&s',
            alt: 'Mặt sau Samsung Galaxy S24 Ultra',
            sortOrder: 2,
          },
        ],
        category: '6937c2ff844968d64b005451',
        brand: '6937bca8a9768d6fc45c665e',
        stock: 120,
        status: ProductStatus.ACTIVE,
        isNew: true,
        isFeatured: true,
        isBestSeller: true,
        specifications: [
          'Chip Apple A17 Pro',
          'Màn hình 6.7 inch Super Retina XDR',
          'Camera 48MP Tele 5x',
          'Pin 4422mAh',
        ],
        warrantyPeriod: 12,
        sku: 'S24U-256-TI',
        weight: 221,
        dimensions: {
          length: 160.8,
          width: 77.8,
          height: 7.85,
        },
        viewCount: 0,
        soldCount: 0,
        reviewCount: 3,
        averageRating: 5,
        tags: ['samsung', 'galaxy', 's24 ultra'],
        sortOrder: 1,
        isDeleted: false,
        reviews: [
          {
            rating: 5,
            comment: 'Sản phẩm đẹp quá, màn hình sắc nét, camera chụp rất đẹp!',
            user: '6915e28d7c72b6f33b8819bc',
            type: 'Đã mua hàng',
            images: [
              'https://blog.abit.vn/wp-content/uploads/2020/06/danh-gia-5-sao-1.jpg',
            ],
            replies: [
              {
                comment: 'Cảm ơn bạn đã mua hàng!',
                user: '6915e28c7c72b6f33b8819b7',
                isAdmin: true,
                _id: new Types.ObjectId(),
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ],
            isApproved: true,
            _id: new Types.ObjectId(),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 12,
        finalPrice: 12990000,
        id: new Types.ObjectId(),
      },
      {
        _id: new Types.ObjectId(),
        name: 'Camera Canon EOS HP',
        slug: 'camera-canon-eos-hp',
        price: 12990000,
        discount: 30,
        description:
          'Camera Canon EOS HP với hiệu năng mạnh mẽ, camera vượt trội, thiết kế Titanium siêu nhẹ.',
        shortDescription: 'Camera cao cấp nhất 2025.',
        image:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRp4iH-uLXULYFUuhTfGxksq6y6fngUFyIsTg&s',
        images: [
          {
            url: 'https://carcam.vn/mediacenter/media/images/2071/pr…047700865025874764399284353236992n-1571046351.jpg',
            alt: 'Mặt trước Camera Canon EOS HP',
            sortOrder: 1,
          },
          {
            url: 'https://carcam.vn/mediacenter/media/images/2071/pr…881313347929606303404813765836800n-1571046351.jpg',
            alt: 'Mặt sau Camera Canon EOS HP',
            sortOrder: 2,
          },
        ],
        category: '6937c300844968d64b005460',
        brand: '6937bca9a9768d6fc45c6676',
        stock: 120,
        status: ProductStatus.ACTIVE,
        isNew: true,
        isFeatured: true,
        isBestSeller: true,
        specifications: ['Camera 48MP Tele 5x', 'ISO 100-6400', 'Video 4K 60p'],
        warrantyPeriod: 12,
        sku: 'C-EOS-HP-128',
        weight: 221,
        dimensions: {
          length: 160.8,
          width: 77.8,
          height: 7.85,
        },
        viewCount: 0,
        soldCount: 0,
        reviewCount: 3,
        averageRating: 5,
        tags: ['canon', 'eos', 'hp'],
        sortOrder: 1,
        isDeleted: false,
        reviews: [
          {
            rating: 5,
            comment: 'Camera chụp rất đẹp, chất lượng ảnh rất tốt!',
            user: '6915e28d7c72b6f33b8819bc',
            type: 'Đã mua hàng',
            images: [
              'https://blog.abit.vn/wp-content/uploads/2020/06/danh-gia-5-sao-1.jpg',
            ],
            replies: [
              {
                comment: 'Cảm ơn bạn đã đánh giá!',
                user: '6915e28c7c72b6f33b8819b7',
                isAdmin: true,
                _id: new Types.ObjectId(),
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ],
            isApproved: true,
            _id: new Types.ObjectId(),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 12,
        finalPrice: 29691000,
        id: new Types.ObjectId(),
      },
    ];
    for (const product of products) {
      const existingProduct = await this.productModel.findOne({
        name: product.name,
      });
      if (!existingProduct) {
        await this.productModel.create(product);
        this.logger.log(`Đã tạo product: ${product.name}`);
      } else {
        this.logger.log(`Product đã tồn tại: ${product.name}`);
      }
    }
  }
}
