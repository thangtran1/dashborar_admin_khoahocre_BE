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
} from '@nestjs/common';
import { UsersService } from './users.service';
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
import { QueryUserDto } from './dto/query-user.dto';
import { BulkUpdateStatusDto, BulkDeleteDto } from './dto/bulk-operations.dto';
import { UserRole } from './schemas/user.schema';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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

  // ========== ADMIN ENDPOINTS ==========

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.usersService.create(createUserDto);
      return {
        success: true,
        message: 'Tạo người dùng thành công',
        data: user,
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

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    try {
      await this.usersService.remove(id);
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

  @Patch(':id/soft-delete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async softDelete(@Param('id') id: string) {
    try {
      const user = await this.usersService.softDelete(id);
      return {
        success: true,
        message: 'Vô hiệu hóa người dùng thành công',
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message || 'Lỗi khi vô hiệu hóa người dùng',
        data: null,
      };
    }
  }

  // ========== BULK OPERATIONS ==========

  @Patch('bulk/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async bulkUpdateStatus(@Body() bulkUpdateDto: BulkUpdateStatusDto) {
    try {
      const modifiedCount = await this.usersService.bulkUpdateStatus(
        bulkUpdateDto.ids,
        bulkUpdateDto.status,
      );
      return {
        success: true,
        message: `Cập nhật trạng thái ${modifiedCount} người dùng thành công`,
        data: { modifiedCount },
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message || 'Lỗi khi cập nhật hàng loạt',
        data: null,
      };
    }
  }

  @Delete('bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async bulkDelete(@Body() bulkDeleteDto: BulkDeleteDto) {
    try {
      const deletedCount = await this.usersService.bulkDelete(
        bulkDeleteDto.ids,
      );
      return {
        success: true,
        message: `Xóa ${deletedCount} người dùng thành công`,
        data: { deletedCount },
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message || 'Lỗi khi xóa hàng loạt',
        data: null,
      };
    }
  }
}
