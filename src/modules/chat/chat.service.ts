import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import {
  Conversation,
  ConversationDocument,
} from './schemas/conversation.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Conversation.name)
    private conversationModel: Model<ConversationDocument>,
  ) {}

  async saveMessage(
    senderId: string,
    recipientId: string,
    content: string,
    senderRole: string,
  ): Promise<MessageDocument> {
    try {
      const message = new this.messageModel({
        senderId,
        recipientId,
        content,
        senderRole,
        timestamp: new Date(),
      });

      const savedMessage = await message.save();

      await this.saveToConversation(
        senderId,
        recipientId,
        String(savedMessage._id),
      );

      return savedMessage;
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  }

  private async saveToConversation(
    senderId: string,
    recipientId: string,
    messageId: string,
  ): Promise<void> {
    try {
      let conversation = await this.conversationModel.findOne({
        participants: { $all: [senderId, recipientId] },
      });

      if (!conversation) {
        conversation = new this.conversationModel({
          participants: [senderId, recipientId],
          messages: [],
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      conversation.messages.push(messageId as any);
      await conversation.save();
    } catch (error) {
      console.error('Error saving to conversation:', error);
      throw error;
    }
  }

  async getChatHistory(
    currentUserId: string,
    targetUserId: string,
    currentUserRole: string,
  ): Promise<MessageDocument[]> {
    try {
      let query: Record<string, any>;

      if (currentUserRole === 'admin') {
        if (targetUserId && targetUserId !== currentUserId) {
          query = {
            $or: [
              { senderId: currentUserId, recipientId: targetUserId },
              { senderId: targetUserId, recipientId: currentUserId },
            ],
          };
        } else {
          query = {
            $or: [{ senderId: currentUserId }, { recipientId: currentUserId }],
          };
        }
      } else {
        query = {
          $or: [
            { senderId: currentUserId, senderRole: 'user' },
            { recipientId: currentUserId, senderRole: 'admin' },
          ],
        };
      }

      const messages = await this.messageModel
        .find(query)
        .sort({ timestamp: 1 })
        .limit(50)
        .exec();

      return messages;
    } catch (error) {
      console.error('Error getting chat history:', error);
      throw error;
    }
  }

  getOnlineUsers(): Promise<string[]> {
    return Promise.resolve([]);
  }

  async getAllMessagesForAdmin(): Promise<MessageDocument[]> {
    try {
      const messages = await this.messageModel
        .find({})
        .sort({ timestamp: 1 })
        .limit(100) // Limit to last 100 messages for performance
        .exec();

      return messages;
    } catch (error) {
      console.error('Error getting all messages for admin:', error);
      throw error;
    }
  }

  async getAllUsers(): Promise<any[]> {
    try {
      const userModel = this.messageModel.db.model('User');

      const users = await userModel
        .find({ role: { $ne: 'admin' } })
        .select('_id email name createdAt')
        .sort({ createdAt: -1 })
        .exec();

      return users;
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */
  async getConversationsForAdmin(adminId: string): Promise<any[]> {
    try {
      const conversations = await this.conversationModel
        .find({ participants: adminId })
        .populate('participants', '_id email name')
        .populate('messages')
        .sort({ updatedAt: -1 })
        .exec();

      const formattedConversations = conversations.map((conv: any) => {
        const otherParticipant = conv.participants.find(
          (p: any) => p._id.toString() !== adminId,
        );

        if (!otherParticipant) {
          throw new Error('Other participant not found in conversation');
        }

        return {
          participants: conv.participants.map((p: any) => p._id.toString()),
          messages: conv.messages || [],
          updatedAt: conv.updatedAt,
          userInfo: {
            _id: otherParticipant._id,
            email: otherParticipant.email,
            name: otherParticipant.name || otherParticipant.email,
          },
        };
      });

      return formattedConversations;
    } catch (error) {
      console.error('Error getting conversations for admin:', error);
      throw error;
    }
  }
  /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */
}
