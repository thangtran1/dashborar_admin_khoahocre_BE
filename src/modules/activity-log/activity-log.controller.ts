import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from '../users/schemas/user.schema';
import { FilterAuthSessionDto } from './dto/filter-auth-session.dto';

@Controller('activity-log')
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Get('stats')
  async getActivityStats(
    @Query('period') period: 'day' | 'week' | 'month' | 'year',
  ) {
    const stats = await this.activityLogService.getStats(period);
    return {
      success: true,
      message: 'Lấy thống kê hoạt động thành công',
      data: stats,
    };
  }

  // Lấy tất cả phiên đăng nhập của người dùng
  @Get('sessions/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllLoginSessions(@Query() query: FilterAuthSessionDto) {
    const {  sessionStatus, keyword, from, to, page, limit } =
      query;

    const filter = {
      sessionStatus,
      keyword,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    };

    const pageNumber = page ?? 1;
    const limitNumber = limit ?? 10;

    const { sessions, total } =
      await this.activityLogService.getUserLoginSessions(
        filter,
        pageNumber,
        limitNumber,
      );

    return {
      success: true,
      message: 'Lấy danh sách phiên đăng nhập thành công',
      data: {
        authSessions: sessions,
        total: total,
        page: pageNumber,
        limit: limitNumber,
      },
    };
  }

  // Lấy lịch sử hoạt động của admin
  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getMyActivityLogs(@CurrentUser() user: { id: string }) {
    try {
      const logs = await this.activityLogService.findUserActivityLogs(user.id);
      return {
        success: true,
        message: 'Lấy lịch sử hoạt động của admin thành công',
        data: logs.map((log) => ({
          id: log._id as string,
          type: log.type,
          timestamp: (log as unknown as { createdAt: Date }).createdAt,
          ip: log.ip,
          userAgent: log.userAgent,
        })),
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message || 'Lỗi khi lấy lịch sử hoạt động',
        data: [],
      };
    }
  }
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getUserActivityLogs(@Param('id') id: string) {
    try {
      const logs = await this.activityLogService.findUserActivityLogs(id);
      return {
        success: true,
        message: 'Lấy lịch sử hoạt động thành công',
        data: logs.map((log) => ({
          id: log._id as string,
          type: log.type,
          timestamp: (log as unknown as { createdAt: Date }).createdAt,
          ip: log.ip,
          userAgent: log.userAgent,
        })),
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message || 'Lỗi khi lấy lịch sử hoạt động',
        data: [],
      };
    }
  }
}
