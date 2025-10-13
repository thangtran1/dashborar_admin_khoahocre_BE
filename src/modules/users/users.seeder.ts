import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import {
  User,
  UserDocument,
  UserRole,
  UserStatus,
} from './schemas/user.schema';

@Injectable()
export class UsersSeeder {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async seed() {
    const count = await this.userModel.countDocuments();
    if (count > 0) {
      console.log('User data already exists, skipping seeding...');
      return;
    }

    const hashedPassword = await bcrypt.hash('123456', 12);

    const users = [
      {
        email: 'admin@example.com',
        name: 'Super Admin',
        password: hashedPassword,
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
        bio: 'Quản trị viên hệ thống',
        loginCount: 0,
      },
      {
        email: 'moderator@example.com',
        name: 'Moderator User',
        password: hashedPassword,
        role: UserRole.MODERATOR,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
        bio: 'Người kiểm duyệt nội dung',
        loginCount: 0,
      },
      {
        email: 'user1@example.com',
        name: 'Nguyễn Văn A',
        password: hashedPassword,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
        phone: '0901234567',
        address: 'Hà Nội, Việt Nam',
        bio: 'Người dùng thường',
        loginCount: 5,
      },
      {
        email: 'user2@example.com',
        name: 'Trần Thị B',
        password: hashedPassword,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
        phone: '0907654321',
        address: 'TP.HCM, Việt Nam',
        bio: 'Học viên tích cực',
        loginCount: 12,
      },
      {
        email: 'user3@example.com',
        name: 'Lê Văn C',
        password: hashedPassword,
        role: UserRole.USER,
        status: UserStatus.INACTIVE,
        isEmailVerified: false,
        bio: 'Tài khoản chưa kích hoạt',
        loginCount: 0,
      },
      {
        email: 'banned@example.com',
        name: 'Người dùng bị cấm',
        password: hashedPassword,
        role: UserRole.USER,
        status: UserStatus.BANNED,
        isEmailVerified: true,
        bio: 'Tài khoản bị cấm do vi phạm',
        loginCount: 3,
      },
    ];

    await this.userModel.insertMany(users);
    console.log('✅ User data seeded successfully');
  }

  async drop() {
    await this.userModel.deleteMany({});
    console.log('🗑️ User data cleared successfully');
  }

  async clear() {
    await this.drop();
  }
}
