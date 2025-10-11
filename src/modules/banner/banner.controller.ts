import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Put,
  Query,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { BannerService } from './banner.service';
import { BannerSettingsService } from './banner-settings.service';
import { ToggleBannerDto } from './dto/toggle-banner.dto';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { UpdateBannerSettingsDto } from './dto/update-banner-settings.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('banners')
export class BannerController {
  constructor(
    private readonly bannerService: BannerService,
    private readonly bannerSettingsService: BannerSettingsService,
  ) {}

  // ========== BANNER SETTINGS ENDPOINTS ==========

  @Get('settings')
  async getSettings() {
    try {
      const settings = await this.bannerSettingsService.getSettings();
      return {
        success: true,
        message: 'Lấy cài đặt banner thành công',
        data: settings,
      };
    } catch (error: any) {
      return {
        success: false,
        message: (error as Error).message || 'Lỗi khi lấy cài đặt banner',
        data: null,
      };
    }
  }

  @Put('settings')
  @UseGuards(JwtAuthGuard)
  async updateSettings(@Body() updateSettingsDto: UpdateBannerSettingsDto) {
    try {
      const settings =
        await this.bannerSettingsService.updateSettings(updateSettingsDto);
      return {
        success: true,
        message: 'Cập nhật cài đặt banner thành công',
        data: settings,
      };
    } catch (error: any) {
      return {
        success: false,
        message: (error as Error).message || 'Lỗi khi cập nhật cài đặt banner',
        data: null,
      };
    }
  }

  @Post('settings/reset')
  @UseGuards(JwtAuthGuard)
  async resetSettings() {
    try {
      const settings = await this.bannerSettingsService.resetToDefault();
      return {
        success: true,
        message: 'Đặt lại cài đặt banner về mặc định thành công',
        data: settings,
      };
    } catch (error: any) {
      return {
        success: false,
        message: (error as Error).message || 'Lỗi khi đặt lại cài đặt banner',
        data: null,
      };
    }
  }

  // ========== BANNER ENDPOINTS ==========

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createBannerDto: CreateBannerDto) {
    try {
      const banner = await this.bannerService.create(createBannerDto);
      return {
        success: true,
        message: 'Tạo banner thành công',
        data: banner,
      };
    } catch (error: any) {
      return {
        success: false,
        message: (error as Error).message || 'Lỗi khi tạo banner',
        data: null,
      };
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    try {
      const pageNum = parseInt(page || '1', 10) || 1;
      const limitNum = parseInt(limit || '10', 10) || 10;

      const result = await this.bannerService.findAll(pageNum, limitNum);

      return {
        success: true,
        message: 'Lấy danh sách banner thành công',
        data: result.banners,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: (error as Error).message || 'Lỗi khi lấy danh sách banner',
        data: [],
      };
    }
  }

  @Get('active')
  async findActive() {
    try {
      const banners = await this.bannerService.findActive();
      return {
        success: true,
        message: 'Lấy banner hoạt động thành công',
        data: banners,
      };
    } catch (error: any) {
      return {
        success: false,
        message: (error as Error).message || 'Lỗi khi lấy banner hoạt động',
        data: [],
      };
    }
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getStats() {
    try {
      const stats = await this.bannerService.getStats();
      return {
        success: true,
        message: 'Lấy thống kê banner thành công',
        data: stats,
      };
    } catch (error: any) {
      return {
        success: false,
        message: (error as Error).message || 'Lỗi khi lấy thống kê banner',
        data: null,
      };
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    try {
      const banner = await this.bannerService.findOne(id);
      return {
        success: true,
        message: 'Lấy banner thành công',
        data: banner,
      };
    } catch (error: any) {
      return {
        success: false,
        message: (error as Error).message || 'Lỗi khi lấy banner',
        data: null,
      };
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateBannerDto: UpdateBannerDto,
  ) {
    try {
      const banner = await this.bannerService.update(id, updateBannerDto);
      return {
        success: true,
        message: 'Cập nhật banner thành công',
        data: banner,
      };
    } catch (error: any) {
      return {
        success: false,
        message: (error as Error).message || 'Lỗi khi cập nhật banner',
        data: null,
      };
    }
  }

  @Put(':id/toggle')
  @UseGuards(JwtAuthGuard)
  async toggle(
    @Param('id') id: string,
    @Body() toggleBannerDto: ToggleBannerDto,
  ) {
    try {
      const banner = await this.bannerService.toggle(id, toggleBannerDto);
      return {
        success: true,
        message: 'Thay đổi trạng thái banner thành công',
        data: banner,
      };
    } catch (error: any) {
      return {
        success: false,
        message:
          (error as Error).message || 'Lỗi khi thay đổi trạng thái banner',
        data: null,
      };
    }
  }

  @Patch(':id/order')
  @UseGuards(JwtAuthGuard)
  async updateOrder(@Param('id') id: string, @Body('order') order: number) {
    try {
      const banner = await this.bannerService.updateOrder(id, order);
      return {
        success: true,
        message: 'Cập nhật thứ tự banner thành công',
        data: banner,
      };
    } catch (error: any) {
      return {
        success: false,
        message: (error as Error).message || 'Lỗi khi cập nhật thứ tự banner',
        data: null,
      };
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    try {
      await this.bannerService.remove(id);
      return {
        success: true,
        message: 'Xóa banner thành công',
        data: null,
      };
    } catch (error: any) {
      return {
        success: false,
        message: (error as Error).message || 'Lỗi khi xóa banner',
        data: null,
      };
    }
  }
}
