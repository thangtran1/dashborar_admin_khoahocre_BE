import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import {
  User,
  UserDocument,
  UserRole,
  UserStatus,
} from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import {
  UpdateUserDto,
  UpdateUserPasswordDto,
  UpdateUserRoleDto,
  UpdateUserStatusDto,
} from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  // ========== CREATE OPERATIONS ==========

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const existingUser = await this.userModel
      .findOne({ email: createUserDto.email })
      .exec();

    if (existingUser) {
      throw new ConflictException('Email đã tồn tại trong hệ thống');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      role: createUserDto.role || UserRole.USER,
      status: createUserDto.status || UserStatus.ACTIVE,
      loginCount: 0,
      isEmailVerified: false,
    });

    return user.save();
  }

  // ========== READ OPERATIONS ==========

  async findAll(queryDto: QueryUserDto): Promise<{
    users: UserDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      isDeleted = false,
      isNewUsers = false,
    } = queryDto;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: Record<string, any> = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (role) {
      filter.role = role;
    }

    if (status) {
      filter.status = status;
    }

    // Always filter by isDeleted status
    filter.isDeleted = isDeleted;

    // Filter for new users (created in the last 3 days)
    if (isNewUsers) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 3);
      filter.createdAt = { $gte: sevenDaysAgo };
    }

    // Build sort object
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [users, total] = await Promise.all([
      this.userModel
        .find(filter)
        .select('-password -otp -otpExpiry')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);

    return {
      users: users as unknown as UserDocument[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel
      .findById(id)
      .select('-password -otp -otpExpiry')
      .exec();

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).select('+password').exec();
  }

  // ========== UPDATE OPERATIONS ==========

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    // Check if email is being updated and if it already exists
    if (updateUserDto.email) {
      const existingUser = await this.userModel
        .findOne({ email: updateUserDto.email, _id: { $ne: id } })
        .exec();

      if (existingUser) {
        throw new ConflictException('Email đã tồn tại trong hệ thống');
      }
    }

    const user = await this.userModel
      .findByIdAndUpdate(
        id,
        { ...updateUserDto, updatedAt: new Date() },
        { new: true },
      )
      .select('-password -otp -otpExpiry ')
      .exec();

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng để cập nhật');
    }

    return user;
  }

  async updatePassword(
    id: string,
    updatePasswordDto: UpdateUserPasswordDto,
  ): Promise<void> {
    const user = await this.userModel.findById(id).select('+password').exec();

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      updatePasswordDto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Mật khẩu hiện tại không đúng');
    }

    const hashedNewPassword = await bcrypt.hash(
      updatePasswordDto.newPassword,
      12,
    );

    await this.userModel
      .findByIdAndUpdate(id, {
        password: hashedNewPassword,
        updatedAt: new Date(),
      })
      .exec();
  }

  async updateAvatar(id: string, avatarUrl: string): Promise<UserDocument> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        id,
        { avatar: avatarUrl, updatedAt: new Date() },
        { new: true },
      )
      .select('-password')
      .lean()
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    return updatedUser as unknown as UserDocument;
  }

  async updateRole(
    id: string,
    updateRoleDto: UpdateUserRoleDto,
  ): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(
        id,
        { role: updateRoleDto.role, updatedAt: new Date() },
        { new: true },
      )
      .select('-password -otp -otpExpiry ')
      .exec();

    if (!user) {
      throw new NotFoundException(
        'Không tìm thấy người dùng để cập nhật vai trò',
      );
    }

    return user;
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateUserStatusDto,
  ): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(
        id,
        { status: updateStatusDto.status, updatedAt: new Date() },
        { new: true },
      )
      .select('-password -otp -otpExpiry')
      .exec();

    if (!user) {
      throw new NotFoundException(
        'Không tìm thấy người dùng để cập nhật trạng thái',
      );
    }

    return user;
  }

  // ========== DELETE OPERATIONS ==========

  async removeMany(ids: string[]): Promise<void> {
    const result = await this.userModel
      .deleteMany({ _id: { $in: ids } })
      .exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('Không tìm thấy người dùng để xóa');
    }
  }

  async softDeleteMany(ids: string[]): Promise<number> {
    const result = await this.userModel
      .updateMany(
        { _id: { $in: ids } },
        { isDeleted: true, updatedAt: new Date() },
      )
      .exec();

    if (result.matchedCount === 0) {
      throw new NotFoundException('Không tìm thấy người dùng để xóa mềm');
    }

    return result.matchedCount;
  }

  // ========== RESTORE USER ==========

  async restoreMany(ids: string[]): Promise<number> {
    const result = await this.userModel
      .updateMany(
        { _id: { $in: ids }, isDeleted: true }, // chỉ restore user đã soft delete
        { isDeleted: false, updatedAt: new Date() },
      )
      .exec();

    if (result.matchedCount === 0) {
      throw new NotFoundException('Không tìm thấy người dùng để khôi phục');
    }

    return result.matchedCount;
  }

  // ========== UTILITY OPERATIONS ==========

  async updateLoginInfo(id: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(id, {
        lastLoginAt: new Date(),
        $inc: { loginCount: 1 },
      })
      .exec();
  }

  async updateOtp(
    email: string,
    otp: string,
    otpExpiry: Date,
  ): Promise<UserDocument | null> {
    return this.userModel
      .findOneAndUpdate(
        { email },
        { otp, otpExpiry, updatedAt: new Date() },
        { new: true },
      )
      .exec();
  }

  async resetPassword(id: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.userModel
      .findByIdAndUpdate(id, {
        password: hashedPassword,
        otp: null,
        otpExpiry: null,
        updatedAt: new Date(),
      })
      .exec();
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // ========== STATISTICS ==========

  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    banned: number;
    admins: number;
    users: number;
    moderators: number;
    newUsersThisMonth: number;
  }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      total,
      active,
      inactive,
      banned,
      admins,
      users,
      moderators,
      newUsersThisMonth,
    ] = await Promise.all([
      this.userModel.countDocuments().exec(),
      this.userModel.countDocuments({ status: UserStatus.ACTIVE }).exec(),
      this.userModel.countDocuments({ status: UserStatus.INACTIVE }).exec(),
      this.userModel.countDocuments({ status: UserStatus.BANNED }).exec(),
      this.userModel.countDocuments({ role: UserRole.ADMIN }).exec(),
      this.userModel.countDocuments({ role: UserRole.USER }).exec(),
      this.userModel.countDocuments({ role: UserRole.MODERATOR }).exec(),
      this.userModel
        .countDocuments({ createdAt: { $gte: startOfMonth } })
        .exec(),
    ]);

    return {
      total,
      active,
      inactive,
      banned,
      admins,
      users,
      moderators,
      newUsersThisMonth,
    };
  }
}
