import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Notification,
  NotificationDocument,
} from './schemas/notification.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';

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
      type: 'system',
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
        .find({ type: 'system' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.notificationModel.countDocuments({ type: 'system' }),
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
  ): Promise<{ success: boolean; message: string; unreadCount: number }> {
    // Đếm số thông báo hệ thống mà user chưa đọc
    const count = await this.notificationModel.countDocuments({
      type: 'system',
      readByUsers: { $nin: [userId] }, // Chưa có userId trong readByUsers
    });

    return { success: true, message: 'OK', unreadCount: count };
  }

  // Admin methods
  async findAllForAdmin(
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
        .find({ type: 'system' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.notificationModel.countDocuments({ type: 'system' }),
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
