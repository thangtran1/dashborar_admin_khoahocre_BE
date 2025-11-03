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
import { NotificationType } from './schemas/notification.schema';

export interface RequestWithUser extends Request {
  user: {
    id: string;
    role: string;
  };
}
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll(
    @Request() req: RequestWithUser,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    return await this.notificationsService.findAll(
      req.user.id,
      limit ? parseInt(limit) : 20,
      page ? parseInt(page) : 1,
    );
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req: RequestWithUser) {
    const count = await this.notificationsService.getUnreadCount(req.user.id);
    return { unreadCount: count, success: true };
  }

  @Get('admin')
  async findAllForAdmin(
    @Request() req: RequestWithUser,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
    @Query('search') search?: string,
    @Query('type') type?: NotificationType,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (req.user.role !== 'admin') {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    return await this.notificationsService.findAllForAdmin({
      limit: limit ? parseInt(limit) : 20,
      page: page ? parseInt(page) : 1,
      search,
      type,
      startDate,
      endDate,
    });
  }

  @Get('admin/:id')
  async findOneForAdmin(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ) {
    if (req.user.role !== 'admin') {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    return await this.notificationsService.findOne(id);
  }

  // Admin endpoints
  @Post()
  async create(
    @Body() createNotificationDto: CreateNotificationDto,
    @Request() req: RequestWithUser,
  ) {
    // Chỉ admin mới được tạo thông báo
    if (req.user.role !== 'admin') {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    return await this.notificationsService.create(createNotificationDto);
  }

  @Put('admin/:id')
  async updateForAdmin(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateNotificationDto>,
    @Request() req: RequestWithUser,
  ) {
    if (req.user.role !== 'admin') {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    return await this.notificationsService.update(id, updateData);
  }

  @Put(':id/mark-read')
  async markAsRead(@Param('id') id: string, @Request() req: RequestWithUser) {
    await this.notificationsService.markAsRead(id, req.user.id);
    return { message: 'Notification marked as read', success: true };
  }

  @Delete('admin/:id')
  async removeForAdmin(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ) {
    if (req.user.role !== 'admin') {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    await this.notificationsService.remove(id);
    return {
      message: 'Notification deleted successfully',
      success: true,
    };
  }
}
