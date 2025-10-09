import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ChatService } from './chat.service';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  async getConversations(@Request() req: any) {
    try {
      const currentUserId = req.user.id;

      if (req.user.role === 'admin') {
        const conversations =
          await this.chatService.getConversationsForAdmin(currentUserId);

        const result = {
          success: true,
          data: conversations,
        };
        return result;
      } else {
        const messages = await this.chatService.getAllMessagesForAdmin();

        const conversations = new Map();

        messages.forEach((message: any) => {
          const otherUserId =
            message.senderId === currentUserId
              ? message.recipientId
              : message.senderId;

          if (!conversations.has(otherUserId)) {
            conversations.set(otherUserId, {
              participants: [currentUserId, otherUserId],
              messages: [],
              updatedAt: message.timestamp,
            });
          }

          conversations.get(otherUserId).messages.push(message);
          if (message.timestamp > conversations.get(otherUserId).updatedAt) {
            conversations.get(otherUserId).updatedAt = message.timestamp;
          }
        });

        const result = {
          success: true,
          data: Array.from(conversations.values()),
        };
        return result;
      }
    } catch (error) {
      console.error('Error getting conversations:', error);
      return {
        success: false,
        data: [],
      };
    }
  }

  @Get('users')
  async getAllUsers(@Request() req: any) {
    try {
      if (req.user.role !== 'admin') {
        return {
          success: false,
          message: 'Unauthorized',
          data: [],
        };
      }

      const users = await this.chatService.getAllUsers();

      return {
        success: true,
        data: users,
      };
    } catch (error) {
      console.error('Error getting all users:', error);
      return {
        success: false,
        message: 'Failed to get users',
        data: [],
      };
    }
  }

  @Get('history/:userId')
  getChatHistory() {
    return { messages: [] };
  }
}
