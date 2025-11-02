import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import {
  User,
  UserDocument,
  UserRole,
  UserStatus,
} from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { BulkCreateUser } from 'src/types/entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserPasswordDto } from './dto/update-user.dto';
import { ActivityLog } from './schemas/activity-log.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(ActivityLog.name) private activityLogModel: Model<ActivityLog>,
  ) {}

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

  // ========== Tạo nhiều người dùng cùng lúc từ file Excel ==========
  async bulkCreateFromExcel(filePath: string): Promise<{
    successCount: number;
    errorCount: number;
    errors: Array<{ row: number; email: string; error: string }>;
    createdUsers: UserDocument[];
  }> {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      fs.unlinkSync(filePath);

      if (!data || data.length === 0) {
        throw new BadRequestException('File Excel không có dữ liệu');
      }

      const results = {
        successCount: 0,
        errorCount: 0,
        errors: [] as Array<{ row: number; email: string; error: string }>,
        createdUsers: [] as UserDocument[],
      };

      // BƯỚC 1: Validate tất cả users trước (không tạo gì cả)
      const validatedUsers: Array<{
        row: number;
        data: CreateUserDto;
        hashedPassword: string;
      }> = [];

      for (let i = 0; i < data.length; i++) {
        const row = data[i] as BulkCreateUser;
        const rowNumber = i + 2;

        try {
          // Validate required fields
          if (!row.name || !row.email || !row.password) {
            results.errors.push({
              row: rowNumber,
              email: row.email || 'N/A',
              error: 'Thiếu thông tin bắt buộc (name, email, password)',
            });
            results.errorCount++;
            continue;
          }

          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(row.email)) {
            results.errors.push({
              row: rowNumber,
              email: row.email,
              error: 'Email không hợp lệ',
            });
            results.errorCount++;
            continue;
          }

          // Check if email already exists
          const existingUser = await this.userModel
            .findOne({ email: row.email.trim().toLowerCase() })
            .exec();

          if (existingUser) {
            results.errors.push({
              row: rowNumber,
              email: row.email,
              error: 'Email đã tồn tại trong hệ thống',
            });
            results.errorCount++;
            continue;
          }

          // Validate role
          const validRoles = Object.values(UserRole);
          const role = row.role || UserRole.USER;
          if (!validRoles.includes(role)) {
            results.errors.push({
              row: rowNumber,
              email: row.email,
              error: `Vai trò không hợp lệ. Chỉ chấp nhận: ${validRoles.join(', ')}`,
            });
            results.errorCount++;
            continue;
          }

          // Validate status
          const validStatuses = Object.values(UserStatus);
          const status = row.status || UserStatus.ACTIVE;
          if (!validStatuses.includes(status)) {
            results.errors.push({
              row: rowNumber,
              email: row.email,
              error: `Trạng thái không hợp lệ. Chỉ chấp nhận: ${validStatuses.join(', ')}`,
            });
            results.errorCount++;
            continue;
          }

          // Validate password length
          if (row.password.length < 6) {
            results.errors.push({
              row: rowNumber,
              email: row.email,
              error: 'Mật khẩu phải có ít nhất 6 ký tự',
            });
            results.errorCount++;
            continue;
          }

          // Check for duplicate emails within the Excel file
          const duplicateInFile = validatedUsers.find(
            (u) => u.data.email === row.email.trim().toLowerCase(),
          );
          if (duplicateInFile) {
            results.errors.push({
              row: rowNumber,
              email: row.email,
              error: `Email trùng lặp trong file (dòng ${duplicateInFile.row})`,
            });
            results.errorCount++;
            continue;
          }

          // Prepare user data
          const hashedPassword = await bcrypt.hash(row.password, 12);
          const createUserDto: CreateUserDto = {
            name: row.name.trim(),
            email: row.email.trim().toLowerCase(),
            password: row.password,
            role: role,
            status: status,
            phone: row.phone || '',
            address: row.address || '',
            bio: row.bio || '',
          };

          validatedUsers.push({
            row: rowNumber,
            data: createUserDto,
            hashedPassword,
          });
        } catch (error) {
          results.errors.push({
            row: rowNumber,
            email: row.email || 'N/A',
            error: (error as Error).message || 'Lỗi không xác định',
          });
          results.errorCount++;
        }
      }

      // BƯỚC 2: Kiểm tra - nếu có lỗi thì KHÔNG tạo user nào cả
      if (results.errorCount > 0) {
        return results; // Trả về kết quả với lỗi, không tạo user nào
      }

      // BƯỚC 3: Chỉ khi TẤT CẢ hợp lệ thì mới tạo users
      for (const validatedUser of validatedUsers) {
        try {
          const user = new this.userModel({
            ...validatedUser.data,
            password: validatedUser.hashedPassword,
            loginCount: 0,
            isEmailVerified: false,
          });

          const savedUser = await user.save();
          results.createdUsers.push(savedUser);
          results.successCount++;
        } catch {
          // Nếu có lỗi khi tạo, rollback tất cả users đã tạo
          if (results.createdUsers.length > 0) {
            const createdIds = results.createdUsers.map((u) => u._id as string);
            await this.userModel.deleteMany({ _id: { $in: createdIds } });
          }

          throw new Error(
            `Lỗi khi tạo user ở dòng ${validatedUser.row}. Đã rollback tất cả thay đổi.`,
          );
        }
      }

      return results;
    } catch (error) {
      throw new BadRequestException(
        (error as Error).message || 'Lỗi khi xử lý file Excel',
      );
    } finally {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }

  // Tìm nhật ký hoạt động của người dùng
  async findUserActivityLogs(userId: string) {
    return this.activityLogModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean();
  }

  // Tạo nhật ký hoạt động cho người dùng đăng nhập, đăng xuất .... coming soon
  async createActivityLog(
    userId: string,
    type: string,
    ip?: string,
    userAgent?: string,
  ) {
    const log = new this.activityLogModel({ userId, type, ip, userAgent });
    return await log.save();
  }

  // Admin Update Password User
  async adminUpdateUserPassword(
    userId: string,
    options: { currentPassword?: string; newPassword: string },
  ) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User không tồn tại');

    // Nếu currentPassword tồn tại thì check
    if (options.currentPassword) {
      const isValid = await bcrypt.compare(
        options.currentPassword,
        user.password,
      );
      if (!isValid)
        throw new UnauthorizedException('Mật khẩu hiện tại không đúng');
    }

    user.password = await bcrypt.hash(options.newPassword, 12);
    await user.save();
  }
}
