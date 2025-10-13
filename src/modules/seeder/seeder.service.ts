import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../users/schemas/user.schema';
import { BannerSeeder } from '../banner/banner.seeder';
import { UsersSeeder } from '../users/users.seeder';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private bannerSeeder: BannerSeeder,
    private usersSeeder: UsersSeeder,
  ) {}

  async seedAll(): Promise<void> {
    try {
      this.logger.log('Bắt đầu seed dữ liệu...');

      await this.seedUsers();
      await this.bannerSeeder.seed();

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
      },
      {
        email: 'user1@khoahocre.com',
        name: 'Nguyễn Văn A',
        password: hashedPassword,
        role: 'user',
      },
      {
        email: 'user2@khoahocre.com',
        name: 'Trần Thị B',
        password: hashedPassword,
        role: 'user',
      },
      {
        email: 'user3@khoahocre.com',
        name: 'Lê Văn C',
        password: hashedPassword,
        role: 'user',
      },
      {
        email: 'user4@khoahocre.com',
        name: 'Phạm Thị D',
        password: hashedPassword,
        role: 'user',
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
