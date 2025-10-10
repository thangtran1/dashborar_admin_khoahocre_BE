import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NotificationsService } from './notifications.service';

interface SocketData {
  userId: string;
  userName: string;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, Socket>();

  constructor(
    private jwtService: JwtService,
    private notificationsService: NotificationsService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        (client.handshake.auth.token as string) ||
        client.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const socketData: SocketData = {
        userId: payload.sub,
        userName: payload.email,
      };

      client.data = socketData;
      this.connectedUsers.set(socketData.userId, client);

      // Join user to their personal room
      await client.join(`user_${socketData.userId}`);

      // Send unread count to user
      const unreadCount = await this.notificationsService.getUnreadCount(
        socketData.userId,
      );
      client.emit('unreadCount', { unreadCount });

      console.log(
        `User ${socketData.userName} (${socketData.userId}) connected to notifications`,
      );
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const socketData = client.data as SocketData;
    if (socketData) {
      this.connectedUsers.delete(socketData.userId);
      console.log(
        `User ${socketData.userName} (${socketData.userId}) disconnected from notifications`,
      );
    }
  }

  @SubscribeMessage('getNotifications')
  async handleGetNotifications(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { page?: number; limit?: number },
  ) {
    const socketData = client.data as SocketData;
    if (!socketData) return;

    try {
      const result = await this.notificationsService.findAll(
        socketData.userId,
        data.limit || 20,
        data.page || 1,
      );

      client.emit('notifications', result);
    } catch {
      client.emit('error', { message: 'Failed to fetch notifications' });
    }
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { notificationId: string },
  ) {
    const socketData = client.data as SocketData;
    if (!socketData) return;

    try {
      await this.notificationsService.markAsRead(
        data.notificationId,
        socketData.userId,
      );

      // Update unread count
      const unreadCount = await this.notificationsService.getUnreadCount(
        socketData.userId,
      );
      client.emit('unreadCount', { unreadCount });
      client.emit('markAsReadSuccess', { notificationId: data.notificationId });
    } catch {
      client.emit('error', { message: 'Failed to mark as read' });
    }
  }

  // Method to send notification to all users
  async sendNotificationToAllUsers(notification: any) {
    try {
      // Tạo notification trong database trước
      const createdNotification = await this.notificationsService.create({
        title: notification.title,
        content: notification.content,
        shortDescription: notification.shortDescription,
        actionUrl: notification.actionUrl,
      });

      // Gửi thông báo đến tất cả user đang online
      this.server.emit('newNotification', createdNotification);

      // Update unread count cho tất cả user đang online
      for (const [userId, socket] of this.connectedUsers) {
        const unreadCount =
          await this.notificationsService.getUnreadCount(userId);
        socket.emit('unreadCount', { unreadCount });
      }
    } catch (error) {
      console.error('Error sending notification to all users:', error);
    }
  }
}
