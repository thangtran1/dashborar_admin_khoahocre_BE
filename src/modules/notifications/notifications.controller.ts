import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Delete,
  HttpException,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // Admin endpoints
  @Post()
  async create(
    @Body() createNotificationDto: CreateNotificationDto,
    @Request() req: any,
  ) {
    // Chỉ admin mới được tạo thông báo
    if (req.user.role !== 'admin') {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    return await this.notificationsService.create(createNotificationDto);
  }

  @Get('admin')
  async findAllForAdmin(
    @Request() req: any,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    // Chỉ admin mới được xem danh sách admin
    if (req.user.role !== 'admin') {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    return await this.notificationsService.findAllForAdmin(
      limit ? parseInt(limit) : 20,
      page ? parseInt(page) : 1,
    );
  }

  @Get('admin/:id')
  async findOneForAdmin(@Param('id') id: string, @Request() req: any) {
    if (req.user.role !== 'admin') {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    return await this.notificationsService.findOne(id);
  }

  @Put('admin/:id')
  async updateForAdmin(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateNotificationDto>,
    @Request() req: any,
  ) {
    if (req.user.role !== 'admin') {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    return await this.notificationsService.update(id, updateData);
  }

  @Delete('admin/:id')
  async removeForAdmin(@Param('id') id: string, @Request() req: any) {
    if (req.user.role !== 'admin') {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    await this.notificationsService.remove(id);
    return {
      message: 'Notification deleted successfully',
      success: true,
    };
  }

  // User endpoints
  @Get()
  async findAll(
    @Request() req: any,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    // User lấy thông báo với thông tin đã đọc chưa
    return await this.notificationsService.findAll(
      req.user.id,
      limit ? parseInt(limit) : 20,
      page ? parseInt(page) : 1,
    );
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req: any) {
    const count = await this.notificationsService.getUnreadCount(req.user.id);
    return { unreadCount: count, success: true };
  }

  @Put(':id/mark-read')
  async markAsRead(@Param('id') id: string, @Request() req: any) {
    await this.notificationsService.markAsRead(id, req.user.id);
    return { message: 'Notification marked as read', success: true };
  }
}
