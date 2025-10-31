import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../users/schemas/user.schema';
import { BannerSeeder } from '../banner/banner.seeder';
import { SystemSeeder } from '../system/system.seeder';
import { MaintenanceSeeder } from '../maintenance/maintenance.seeder';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private bannerSeeder: BannerSeeder,
    private systemSeeder: SystemSeeder,
    private maintenanceSeeder: MaintenanceSeeder,
  ) {}

  async seedAll(): Promise<void> {
    try {
      this.logger.log('Bắt đầu seed dữ liệu...');

      await this.seedUsers();
      await this.bannerSeeder.seed();
      await this.systemSeeder.seed();
      await this.maintenanceSeeder.seed();

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
      await this.bannerSeeder.clear();
      await this.systemSeeder.clear();
      await this.maintenanceSeeder.clear();

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
        status: 'active',
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
        status: 'active',
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
        status: 'active',
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
        status: 'active',
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
        status: 'active',
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
        status: 'active',
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
        status: 'active',
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
        status: 'active',
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
        status: 'active',
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
        status: 'active',
        avatar: '/uploads/avatars/avatar-1760599639969-286742541.jfif',
        phone: '0123456789',
        dateOfBirth: new Date('2000-01-01'),
        address: 'Đà Nẵng, Việt Nam',
        bio: 'Người dùng thường 10',
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
}
