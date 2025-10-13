import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { SystemService } from './system.service';
import { UpdateSystemSettingsDto } from './dto/update-system-settings.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('system')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get('settings')
  async getSettings() {
    try {
      const settings = await this.systemService.getSettings();
      return {
        success: true,
        message: 'Lấy cài đặt hệ thống thành công',
        data: settings,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message || 'Lỗi khi lấy cài đặt hệ thống',
        data: null,
      };
    }
  }

  @Put('settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateSettings(@Body() updateSettingsDto: UpdateSystemSettingsDto) {
    try {
      const settings =
        await this.systemService.updateSettings(updateSettingsDto);
      return {
        success: true,
        message: 'Cập nhật cài đặt hệ thống thành công',
        data: settings,
      };
    } catch (error) {
      return {
        success: false,
        message:
          (error as Error).message || 'Lỗi khi cập nhật cài đặt hệ thống',
        data: null,
      };
    }
  }

  @Get('default-language')
  async getDefaultLanguage() {
    try {
      const defaultLanguage = await this.systemService.getDefaultLanguage();
      return {
        success: true,
        message: 'Lấy ngôn ngữ mặc định thành công',
        data: { defaultLanguage },
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message || 'Lỗi khi lấy ngôn ngữ mặc định',
        data: null,
      };
    }
  }
}
