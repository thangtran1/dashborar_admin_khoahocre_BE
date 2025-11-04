import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { MaintenanceFilterDto } from './dto/maintenance-filter.dto';
@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body(ValidationPipe) createMaintenanceDto: CreateMaintenanceDto) {
    return this.maintenanceService.create(createMaintenanceDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy danh sách bảo trì' })
  findAll(@Query(ValidationPipe) filters: MaintenanceFilterDto) {
    return this.maintenanceService.findAll(filters);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getStats() {
    const data = await this.maintenanceService.getStats();
    return {
      success: true,
      message: 'Thống kê maintenance thành công',
      data,
    };
  }

  @Get('current-status')
  @ApiOperation({ summary: 'Kiểm tra trạng thái bảo trì hiện tại' })
  async getCurrentStatus() {
    const activeMaintenance = await this.maintenanceService.getCurrentStatus();
    return activeMaintenance;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy chi tiết bảo trì theo ID' })
  findOne(@Param('id') id: string) {
    return this.maintenanceService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cập nhật thông tin bảo trì' })
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateMaintenanceDto: UpdateMaintenanceDto,
  ) {
    return this.maintenanceService.update(id, updateMaintenanceDto);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Xóa bảo trì' })
  remove(@Body('ids') ids: string | string[]) {
    return this.maintenanceService.remove(ids);
  }

  @Post(':id/start')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Bắt đầu bảo trì ngay lập tức' })
  startNow(@Param('id') id: string) {
    return this.maintenanceService.startNow(id);
  }

  @Post(':id/stop')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Dừng bảo trì' })
  stop(@Param('id') id: string) {
    return this.maintenanceService.stop(id);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Hủy bảo trì' })
  cancel(@Param('id') id: string) {
    return this.maintenanceService.cancel(id);
  }
}
