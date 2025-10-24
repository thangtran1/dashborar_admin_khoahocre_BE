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
@UseGuards(JwtAuthGuard)
@Controller('maintenance')
@UseGuards(JwtAuthGuard)
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Post()
  create(@Body(ValidationPipe) createMaintenanceDto: CreateMaintenanceDto) {
    return this.maintenanceService.create(createMaintenanceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách bảo trì' })
  findAll(@Query(ValidationPipe) filters: MaintenanceFilterDto) {
    return this.maintenanceService.findAll(filters);
  }

  @Get('current-status')
  @ApiOperation({ summary: 'Kiểm tra trạng thái bảo trì hiện tại' })
  getCurrentStatus() {
    return this.maintenanceService.getCurrentStatus();
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Lấy danh sách bảo trì sắp tới trong 48h' })
  getUpcoming() {
    return this.maintenanceService.getUpcoming();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Thống kê bảo trì' })
  getStats() {
    return this.maintenanceService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết bảo trì theo ID' })
  findOne(@Param('id') id: string) {
    return this.maintenanceService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin bảo trì' })
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateMaintenanceDto: UpdateMaintenanceDto,
  ) {
    return this.maintenanceService.update(id, updateMaintenanceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa bảo trì' })
  remove(@Param('id') id: string) {
    return this.maintenanceService.remove(id);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Bắt đầu bảo trì ngay lập tức' })
  startNow(@Param('id') id: string) {
    return this.maintenanceService.startNow(id);
  }

  @Post(':id/stop')
  @ApiOperation({ summary: 'Dừng bảo trì' })
  stop(@Param('id') id: string) {
    return this.maintenanceService.stop(id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Hủy bảo trì' })
  cancel(@Param('id') id: string) {
    return this.maintenanceService.cancel(id);
  }
}
