import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Notification,
  NotificationDocument,
  NotificationType,
} from './schemas/notification.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { FindAllForAdminOptions } from 'src/types/entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<{ success: boolean; message: string; data: Notification }> {
    const notification = new this.notificationModel({
      ...createNotificationDto,
      type: createNotificationDto.type || NotificationType.SYSTEM,
    });

    const savedNotification = await notification.save();

    return {
      message: 'Notification created successfully',
      success: true,
      data: savedNotification,
    };
  }

  async findAll(
    userId: string,
    limit: number = 20,
    page: number = 1,
  ): Promise<{
    success: boolean;
    message: string;
    data: {
      notifications: Notification[];
      total: number;
      page: number;
      limit: number;
    };
  }> {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      this.notificationModel
        .find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.notificationModel.countDocuments({}),
    ]);

    const notificationsWithReadStatus = notifications.map((notification) => ({
      ...notification.toObject(),
      isReadByUser: notification.readByUsers.includes(userId),
    }));

    return {
      success: true,
      message: 'OK',
      data: {
        notifications: notificationsWithReadStatus,
        total,
        page,
        limit,
      },
    };
  }

  // day: 7 giờ gần nhất
  // week: 7 ngày gần nhất
  // month: 6 khoảng tháng gần nhất
  // year: 7 năm gần nhất
  async getNotificationStats(period: 'day' | 'week' | 'month' | 'year') {
    const now = new Date();
    const labels: string[] = [];
    let startDate: Date;
    let intervalDays = 0;

    // --- Xác định mốc thời gian ---
    if (period === 'day') {
      startDate = new Date(now);
      startDate.setHours(now.getHours() - 6, 0, 0, 0);
      for (let i = 0; i < 7; i++) {
        const d = new Date(startDate);
        d.setHours(startDate.getHours() + i);
        labels.push(d.getHours().toString().padStart(2, '0'));
      }
    } else if (period === 'week') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      for (let i = 0; i < 7; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        labels.push(
          `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`,
        );
      }
    } else if (period === 'month') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
      intervalDays = Math.ceil(30 / 6);
      for (let i = 0; i < 6; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i * intervalDays);
        if (d > now) d.setTime(now.getTime());
        labels.push(
          `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`,
        );
      }
    } else if (period === 'year') {
      const currentYear = now.getFullYear();
      startDate = new Date(currentYear - 6, 0, 1);
      for (let i = 0; i < 7; i++) {
        labels.push((currentYear - 6 + i).toString());
      }
    } else {
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
    }

    // --- Aggregate MongoDB ---
    const result = await this.notificationModel.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $addFields: {
          timeKey:
            period === 'day'
              ? { $hour: { date: '$createdAt', timezone: '+07:00' } }
              : period === 'week'
                ? {
                    $dateToString: {
                      format: '%d/%m',
                      date: '$createdAt',
                      timezone: '+07:00',
                    },
                  }
                : period === 'month'
                  ? {
                      $floor: {
                        $divide: [
                          { $subtract: ['$createdAt', startDate] },
                          1000 * 60 * 60 * 24 * intervalDays,
                        ],
                      },
                    }
                  : period === 'year'
                    ? { $year: { date: '$createdAt', timezone: '+07:00' } }
                    : null,
        },
      },
      {
        $group: {
          _id: '$timeKey',
          total: { $sum: 1 },
          system: {
            $sum: {
              $cond: [{ $eq: ['$type', NotificationType.SYSTEM] }, 1, 0],
            },
          },
          news: {
            $sum: {
              $cond: [{ $eq: ['$type', NotificationType.NEWS] }, 1, 0],
            },
          },
          maintenance: {
            $sum: {
              $cond: [{ $eq: ['$type', NotificationType.MAINTENANCE] }, 1, 0],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // --- Chuẩn hoá dữ liệu ---
    const totalData = labels.map((label, idx) => {
      const key =
        period === 'week' ? label : period === 'month' ? idx : parseInt(label);
      const found = result.find(
        (r: { _id: number | string }) => r._id === key,
      ) as { total: number };
      return found ? (found as { total: number }).total : 0;
    });

    const systemData = labels.map((label, idx) => {
      const key =
        period === 'week' ? label : period === 'month' ? idx : parseInt(label);
      const found = result.find(
        (r: { _id: number | string }) => r._id === key,
      ) as { system: number };
      return found ? (found as { system: number }).system : 0;
    });

    const newsData = labels.map((label, idx) => {
      const key =
        period === 'week' ? label : period === 'month' ? idx : parseInt(label);
      const found = result.find(
        (r: { _id: number | string }) => r._id === key,
      ) as { news: number };
      return found ? (found as { news: number }).news : 0;
    });

    const maintenanceData = labels.map((label, idx) => {
      const key =
        period === 'week' ? label : period === 'month' ? idx : parseInt(label);
      const found = result.find(
        (r: { _id: number | string }) => r._id === key,
      ) as { maintenance: number };
      return found ? (found as { maintenance: number }).maintenance : 0;
    });
    return {
      labels,
      series: [
        { name: 'Tổng thông báo', data: totalData },
        { name: 'Hệ thống', data: systemData },
        { name: 'Tin tức', data: newsData },
        { name: 'Bảo trì', data: maintenanceData },
      ],
    };
  }

  async markAsRead(
    notificationId: string,
    userId: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.notificationModel.updateOne(
      { _id: notificationId },
      { $addToSet: { readByUsers: userId } },
    );

    return { success: true, message: 'Notification marked as read' };
  }

  async getUnreadCount(
    userId: string,
    type?: NotificationType,
  ): Promise<{ success: boolean; message: string; unreadCount: number }> {
    // Đếm số thông báo hệ thống mà user chưa đọc
    const count = await this.notificationModel.countDocuments({
      type,
      readByUsers: { $nin: [userId] }, // Chưa có userId trong readByUsers
    });

    return { success: true, message: 'OK', unreadCount: count };
  }

  // Admin methods
  async findAllForAdmin(options: FindAllForAdminOptions) {
    const { limit = 20, page = 1, search, type, startDate, endDate } = options;

    const skip = (page - 1) * limit;

    // --- Build query object ---
    const query: Record<string, any> = {};

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Filter by search in title or content
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } }, // i = case insensitive
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate)
        (query.createdAt as Record<string, any>).$gte = new Date(startDate);
      if (endDate)
        (query.createdAt as Record<string, any>).$lte = new Date(endDate);
    }

    const [notifications, total] = await Promise.all([
      this.notificationModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.notificationModel.countDocuments(query),
    ]);

    return {
      success: true,
      message: 'OK',
      data: {
        notifications,
        total,
        page,
        limit,
      },
    };
  }

  async findOne(id: string): Promise<{
    success: boolean;
    message: string;
    data: Notification;
  }> {
    const notification = await this.notificationModel.findById(id).exec();
    if (!notification) {
      throw new Error('Notification not found');
    }
    return {
      success: true,
      message: 'Notification found successfully',
      data: notification,
    };
  }

  async update(
    id: string,
    updateData: Partial<CreateNotificationDto>,
  ): Promise<{
    success: boolean;
    message: string;
    data: Notification;
  }> {
    const notification = await this.notificationModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!notification) {
      throw new Error('Notification not found');
    }
    return {
      success: true,
      message: 'Notification updated successfully',
      data: notification,
    };
  }

  async remove(id: string): Promise<void> {
    const result = await this.notificationModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new Error('Notification not found');
    }
  }
}
