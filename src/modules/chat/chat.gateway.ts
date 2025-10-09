import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

interface SocketData {
  userId: string;
  userRole: string;
  userEmail: string;
}

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:4173',
    ],
    credentials: true,
  },
  namespace: '/',
  transports: ['websocket', 'polling'],
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  @WebSocketServer()
  server: Server;

  private onlineUsers = new Set<string>();
  private adminUsers = new Set<string>();
  private messageBatch = new Map<string, any[]>();
  private batchTimer: NodeJS.Timeout | null = null;

  private findAdminId(): string | null {
    for (const userId of this.onlineUsers) {
      if (this.adminUsers.has(userId)) {
        return userId;
      }
    }

    for (const userId of this.onlineUsers) {
      const socket = this.findSocketByUserId(userId);
      if (socket && (socket.data as SocketData).userRole === 'admin') {
        this.adminUsers.add(userId);
        return userId;
      }
    }

    return null;
  }

  private findSocketByUserId(userId: string): Socket | null {
    for (const [, socket] of this.server.sockets.sockets) {
      if ((socket.data as SocketData).userId === userId) {
        return socket;
      }
    }
    return null;
  }

  constructor(
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
  ) {}

  onModuleInit() {
    console.log('Chat Gateway initialized');
  }

  handleConnection(socket: Socket) {
    try {
      const token = socket.handshake.auth?.token as string;

      if (!token) {
        socket.emit('error', { message: 'Authentication token required' });
        return socket.disconnect();
      }

      let payload: JwtPayload;
      try {
        payload = this.jwtService.verify(token);
      } catch (jwtError: unknown) {
        const errorMessage =
          jwtError instanceof Error ? jwtError.message : 'Unknown JWT error';
        console.log('JWT verification failed:', errorMessage);
        socket.emit('error', { message: 'Invalid authentication token' });
        return socket.disconnect();
      }

      const userId = payload.sub;
      const userRole = payload.role;

      (socket.data as SocketData).userId = userId;
      (socket.data as SocketData).userRole = userRole;
      (socket.data as SocketData).userEmail = payload.email;

      void socket.join(userId);
      this.onlineUsers.add(userId);

      if (userRole === 'admin') {
        void socket.join('admin_room');
        this.adminUsers.add(userId);
      } else {
        setTimeout(() => {
          const userRooms = Array.from(socket.rooms);
          if (userRooms.includes('admin_room')) {
            void socket.leave('admin_room');
            this.adminUsers.delete(userId);
          }
        }, 1000);
      }

      this.server.to('admin_room').emit('userStatusChanged', {
        userId,
        isOnline: true,
        userEmail: payload.email,
      });

      if (userRole === 'admin') {
        socket.emit('initialOnlineUsers', Array.from(this.onlineUsers));
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown connection error';
      console.error('Connection error:', error);
      socket.emit('error', { message: 'Connection failed: ' + errorMessage });
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {
    const socketData = socket.data as SocketData;
    const userId = socketData.userId;
    const userEmail = socketData.userEmail;
    const userRole = socketData.userRole;

    if (userId) {
      this.onlineUsers.delete(userId);
      if (userRole === 'admin') {
        this.adminUsers.delete(userId);
      }

      this.server.to('admin_room').emit('userStatusChanged', {
        userId,
        isOnline: false,
        userEmail,
      });
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: { content: string; recipientId?: string },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      const { content, recipientId } = data;
      const socketData = socket.data as SocketData;
      const senderId = socketData.userId;
      const senderRole = socketData.userRole;

      if (!senderId || !content) {
        return socket.emit('error', { message: 'Invalid message data' });
      }

      let targetRecipientId: string;

      if (senderRole === 'admin') {
        if (!recipientId) {
          return socket.emit('error', {
            message: 'Admin must specify recipient',
          });
        }

        if (recipientId === senderId) {
          return socket.emit('error', {
            message: 'Admin cannot send message to themselves',
          });
        }

        targetRecipientId = recipientId;
      } else {
        const adminId = this.findAdminId();
        if (!adminId) {
          return socket.emit('error', {
            message: 'No admin available online',
          });
        }

        targetRecipientId = adminId;
      }

      const savedMessage = await this.chatService.saveMessage(
        senderId,
        targetRecipientId,
        content,
        senderRole,
      );

      const messageData = {
        id: String(savedMessage._id),
        senderId,
        recipientId: targetRecipientId,
        content,
        timestamp: savedMessage.timestamp.toISOString(),
        senderRole,
        messageId: String(savedMessage._id),
      };

      if (senderRole === 'user' && this.adminUsers.has(targetRecipientId)) {
        const messageDataWithConversation = {
          ...messageData,
          conversationId: senderId,
        };

        socket.to('admin_room').emit('newMessage', messageDataWithConversation);
      } else if (
        senderRole === 'admin' &&
        !this.adminUsers.has(targetRecipientId)
      ) {
        this.server.to(targetRecipientId).emit('newMessage', messageData);
      }

      // Emit message back to sender for confirmation
      socket.emit('messageSent', messageData);
    } catch (error: unknown) {
      const errorStack =
        error instanceof Error ? error.stack : 'No stack trace';
      console.error('Error stack:', errorStack);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage('getChatHistory')
  async handleGetChatHistory(
    @MessageBody() data: { userId?: string },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      const socketData = socket.data as SocketData;
      const currentUserId = socketData.userId;
      const currentUserRole = socketData.userRole;
      const targetUserId = data.userId || currentUserId;

      const messages = await this.chatService.getChatHistory(
        currentUserId,
        targetUserId,
        currentUserRole,
      );

      const formattedMessages = messages.map((msg) => ({
        id: String(msg._id),
        senderId: msg.senderId,
        recipientId: msg.recipientId,
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
        senderRole: msg.senderRole,
        messageId: String(msg._id),
      }));

      socket.emit('chatHistory', {
        messages: formattedMessages,
        targetUserId,
      });
    } catch (error: unknown) {
      const errorStack =
        error instanceof Error ? error.stack : 'No stack trace';
      console.error('Error stack:', errorStack);
      socket.emit('error', { message: 'Failed to get chat history' });
    }
  }
}
