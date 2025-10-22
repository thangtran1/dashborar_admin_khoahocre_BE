import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import {
  UpdateUserDto,
  UpdateUserPasswordDto,
  UpdateUserRoleDto,
  UpdateUserStatusDto,
} from './dto/update-user.dto';
import { AdminChangePasswordDto } from './dto/admin-change-password.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UserRole } from './schemas/user.schema';

@Controller('user')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  // ========== PUBLIC ENDPOINTS ==========

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(
    @CurrentUser() user: { id: string; email: string; role: string },
  ) {
    try {
      const userProfile = await this.usersService.findById(user.id);
      return {
        success: true,
        message: 'Lấy thông tin profile thành công',
        data: userProfile,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message || 'Lỗi khi lấy thông tin profile',
        data: null,
      };
    }
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @CurrentUser() user: { id: string; email: string; role: string },
    @Body() updateUserDto: UpdateUserDto,
  ) {
    try {
      const updatedUser = await this.usersService.update(
        user.id,
        updateUserDto,
      );
      return {
        success: true,
        message: 'Cập nhật thông tin thành công',
        data: updatedUser,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message || 'Lỗi khi cập nhật thông tin',
        data: null,
      };
    }
  }

  @Patch('profile/password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updatePassword(
    @CurrentUser() user: { id: string; email: string; role: string },
    @Body() updatePasswordDto: UpdateUserPasswordDto,
  ) {
    try {
      await this.usersService.updatePassword(user.id, updatePasswordDto);
      return {
        success: true,
        message: 'Cập nhật mật khẩu thành công',
        data: null,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message || 'Lỗi khi cập nhật mật khẩu',
        data: null,
      };
    }
  }

  @Patch('admin/change-password')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async adminChangePassword(
    @CurrentUser() user: { id: string; role: string },
    @Body() changePasswordDto: AdminChangePasswordDto,
  ) {
    try {
      await this.usersService.updatePassword(user.id, {
        currentPassword: changePasswordDto.currentPassword,
        newPassword: changePasswordDto.newPassword,
      });
      return {
        success: true,
        message: 'Đổi mật khẩu admin thành công',
        data: null,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message || 'Lỗi khi đổi mật khẩu admin',
        data: null,
      };
    }
  }

  @Post('upload-avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './public/uploads/avatars',
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `avatar-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowed = /\/(jpg|jpeg|png)$/i.test(file.mimetype);
        if (allowed) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Chỉ chấp nhận file ảnh JPG, JPEG hoặc PNG',
            ),
            false,
          );
        }
      },
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    }),
  )
  async uploadAvatar(
    @CurrentUser() user: { id: string; role: string },
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Không có file được upload');
    }

    const avatarUrl = `/uploads/avatars/${file.filename}`;
    const updatedUser = await this.usersService.updateAvatar(
      user.id,
      avatarUrl,
    );

    return {
      success: true,
      message: 'Upload avatar thành công',
      data: { avatarUrl, user: updatedUser },
    };
  }

  // ========== ADMIN ENDPOINTS ==========

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      const temporaryPassword = createUserDto.password;
      const user = await this.usersService.create(createUserDto);

      // Send welcome email with account information
      const emailResult = await this.authService.sendNewUserNotification(
        user.email,
        user.name,
        temporaryPassword,
        new Date(user.createdAt as unknown as string),
      );

      const message = emailResult.success
        ? 'Tạo người dùng thành công và đã gửi email thông báo'
        : 'Tạo người dùng thành công nhưng không thể gửi email thông báo';

      return {
        success: true,
        message,
        data: user,
        emailSent: emailResult.success,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message || 'Lỗi khi tạo người dùng',
        data: null,
      };
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  async findAll(
    @Query(new ValidationPipe({ transform: true })) queryDto: QueryUserDto,
  ) {
    try {
      const result = await this.usersService.findAll(queryDto);
      return {
        success: true,
        message: 'Lấy danh sách người dùng thành công',
        data: result.users,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message || 'Lỗi khi lấy danh sách người dùng',
        data: [],
      };
    }
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getStats() {
    try {
      const stats = await this.usersService.getStats();
      return {
        success: true,
        message: 'Lấy thống kê người dùng thành công',
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message || 'Lỗi khi lấy thống kê người dùng',
        data: null,
      };
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  async findOne(@Param('id') id: string) {
    try {
      const user = await this.usersService.findById(id);
      return {
        success: true,
        message: 'Lấy thông tin người dùng thành công',
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message || 'Lỗi khi lấy thông tin người dùng',
        data: null,
      };
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      const user = await this.usersService.update(id, updateUserDto);
      return {
        success: true,
        message: 'Cập nhật người dùng thành công',
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message || 'Lỗi khi cập nhật người dùng',
        data: null,
      };
    }
  }

  @Patch(':id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateUserRoleDto,
  ) {
    try {
      const user = await this.usersService.updateRole(id, updateRoleDto);
      return {
        success: true,
        message: 'Cập nhật vai trò thành công',
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message || 'Lỗi khi cập nhật vai trò',
        data: null,
      };
    }
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateUserStatusDto,
  ) {
    try {
      const user = await this.usersService.updateStatus(id, updateStatusDto);
      return {
        success: true,
        message: 'Cập nhật trạng thái thành công',
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message || 'Lỗi khi cập nhật trạng thái',
        data: null,
      };
    }
  }

  @Delete()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async remove(
    @Body('ids') ids: string[] | string, // có thể là 1 id hoặc nhiều id
  ) {
    try {
      const idArray = Array.isArray(ids) ? ids : [ids];
      await this.usersService.removeMany(idArray);
      return {
        success: true,
        message: 'Xóa người dùng thành công',
        data: null,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message || 'Lỗi khi xóa người dùng',
        data: null,
      };
    }
  }

  @Delete('soft-delete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async softDeleteMany(@Body('ids') ids: string[] | string) {
    try {
      const idArray = Array.isArray(ids) ? ids : [ids];
      await this.usersService.softDeleteMany(idArray);
      return {
        success: true,
        message: 'Xóa mềm người dùng thành công',
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message || 'Lỗi khi xóa mềm người dùng',
      };
    }
  }

  @Patch('restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async restore(
    @Body('ids') ids: string[] | string, // 1 hoặc nhiều id
  ) {
    try {
      const idArray = Array.isArray(ids) ? ids : [ids];
      const restoredCount = await this.usersService.restoreMany(idArray);

      return {
        success: true,
        message: `Khôi phục thành công ${restoredCount} người dùng`,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message || 'Lỗi khi khôi phục người dùng',
      };
    }
  }
}
