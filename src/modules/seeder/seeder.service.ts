import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
}
