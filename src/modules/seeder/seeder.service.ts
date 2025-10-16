import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../users/schemas/user.schema';
import { BannerSeeder } from '../banner/banner.seeder';
import { UsersSeeder } from '../users/users.seeder';
import { SystemSeeder } from '../system/system.seeder';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private bannerSeeder: BannerSeeder,
    private usersSeeder: UsersSeeder,
    private systemSeeder: SystemSeeder,
  ) {}

  async seedAll(): Promise<void> {
    try {
      this.logger.log('Bắt đầu seed dữ liệu...');

      await this.seedUsers();
      await this.bannerSeeder.seed();
      await this.systemSeeder.seed();

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
        isDeleted: false,
        status: 'active',
        avatar: '/uploads/avatars/avatar-1760599639969-286742541.jfif',
        phone: '0123456789',
        dateOfBirth: new Date('2000-01-01'),
        address: 'Đà Nẵng, Việt Nam',
        bio: 'Quản trị viên hệ thống',
      },
      {
        email: 'user1@khoahocre.com',
        name: 'Nguyễn Văn A',
        password: hashedPassword,
        role: 'user',
        isDeleted: false,
        status: 'active',
        avatar: '/uploads/avatars/avatar-1760599639969-286742541.jfif',
        phone: '0123456789',
        dateOfBirth: new Date('2000-01-01'),
        address: 'Đà Nẵng, Việt Nam',
        bio: 'Người dùng thường',
      },
      {
        email: 'user2@khoahocre.com',
        name: 'Trần Thị B',
        password: hashedPassword,
        role: 'user',
        isDeleted: false,
        status: 'active',
        avatar: '/uploads/avatars/avatar-1760599639969-286742541.jfif',
        phone: '0123456789',
        dateOfBirth: new Date('2000-01-01'),
        address: 'Đà Nẵng, Việt Nam',
        bio: 'Người dùng thường',
      },
      {
        email: 'user3@khoahocre.com',
        name: 'Lê Văn C',
        password: hashedPassword,
        role: 'user',
        isDeleted: false,
        status: 'active',
        avatar: '/uploads/avatars/avatar-1760599639969-286742541.jfif',
        phone: '0123456789',
        dateOfBirth: new Date('2000-01-01'),
        address: 'Đà Nẵng, Việt Nam',
        bio: 'Người dùng thường',
      },
      {
        email: 'user4@khoahocre.com',
        name: 'Phạm Thị D',
        password: hashedPassword,
        role: 'user',
        isDeleted: false,
        status: 'active',
        avatar: '/uploads/avatars/avatar-1760599639969-286742541.jfif',
        phone: '0123456789',
        dateOfBirth: new Date('2000-01-01'),
        address: 'Đà Nẵng, Việt Nam',
        bio: 'Người dùng thường',
      },
      {
        email: 'user5@khoahocre.com',
        name: 'Nguyễn Thị E',
        password: hashedPassword,
        role: 'user',
        isDeleted: false,
        status: 'active',
        avatar: '/uploads/avatars/avatar-1760599639969-286742541.jfif',
        phone: '0123456789',
        dateOfBirth: new Date('2000-01-01'),
        address: 'Đà Nẵng, Việt Nam',
        bio: 'Người dùng thường',
      },
      {
        email: 'user6@khoahocre.com',
        name: 'Nguyễn Thị F',
        password: hashedPassword,
        role: 'user',
        isDeleted: false,
        status: 'active',
        avatar: '/uploads/avatars/avatar-1760599639969-286742541.jfif',
        phone: '0123456789',
        dateOfBirth: new Date('2000-01-01'),
        address: 'Đà Nẵng, Việt Nam',
        bio: 'Người dùng thường',
      },
      {
        email: 'user7@khoahocre.com',
        name: 'Nguyễn Thị G',
        password: hashedPassword,
        role: 'user',
        isDeleted: false,
        status: 'active',
        avatar: '/uploads/avatars/avatar-1760599639969-286742541.jfif',
        phone: '0123456789',
        dateOfBirth: new Date('2000-01-01'),
        address: 'Đà Nẵng, Việt Nam',
        bio: 'Người dùng thường',
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
