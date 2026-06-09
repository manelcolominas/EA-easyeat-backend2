import mongoose from 'mongoose';
import { Server as SocketIOServer, Socket } from 'socket.io';
import NotificationService from '../services/notification';
import Chat, { SenderRole } from '../models/chat';
import Conversation from '../models/conversation';
import { verifyAccessToken } from '../utils/jwt';
import Logging from '../library/logging';

interface CreateOrGetConversationInput {
  customerId: string;
  restaurantId: string;
}

interface CreateMessageInput {
  conversationId: string;
  senderId: string;
  senderRole: SenderRole;
  contenido: string;
}

interface JoinConversationPayload {
  conversationId: string;
}

interface JoinCustomerPayload {
  customerId: string;
}

interface JoinRestaurantPayload {
  restaurantId: string;
}

interface SendMessagePayload {
  conversationId: string;
  senderId: string;
  senderRole: SenderRole;
  contenido: string;
}

export class ChatService {
  private static ioInstance?: SocketIOServer;

  constructor(io?: SocketIOServer) {
    if (io) {
      ChatService.ioInstance = io;
    }
  }

  private get io(): SocketIOServer | undefined {
    return ChatService.ioInstance;
  }

  private validateObjectId(id: string, fieldName: string): void {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error(`${fieldName} is not a valid ObjectId`);
    }
  }

  private getEntityId(value: any): string {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (value._id) return value._id.toString();

    return value.toString();
  }

  public async createOrGetConversation({ customerId, restaurantId }: CreateOrGetConversationInput) {
    this.validateObjectId(customerId, 'customerId');
    this.validateObjectId(restaurantId, 'restaurantId');

    let conversation = await Conversation.findOne({
      customer: customerId,
      restaurant: restaurantId
    })
      .populate('customer')
      .populate('restaurant')
      .populate('lastMessage');

    if (!conversation) {
      const createdConversation = await Conversation.create({
        customer: customerId,
        restaurant: restaurantId,
        lastMessage: null,
        lastMessageAt: null
      });

      conversation = await Conversation.findById(createdConversation._id).populate('customer').populate('restaurant').populate('lastMessage');
    }

    return conversation;
  }

  public async getCustomerConversations(customerId: string) {
    this.validateObjectId(customerId, 'customerId');

    return Conversation.find({
      customer: customerId
    })
      .populate('customer')
      .populate('restaurant')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1, updatedAt: -1 });
  }

  public async getRestaurantConversations(restaurantId: string) {
    this.validateObjectId(restaurantId, 'restaurantId');

    return Conversation.find({
      restaurant: restaurantId
    })
      .populate('customer')
      .populate('restaurant')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1, updatedAt: -1 });
  }

  public async getConversationMessages(conversationId: string) {
    this.validateObjectId(conversationId, 'conversationId');

    return Chat.find({
      conversation: conversationId
    })
      .populate('customer')
      .populate('restaurant')
      .sort({ createdAt: 1 });
  }

  public async createMessage({ conversationId, senderId, senderRole, contenido }: CreateMessageInput) {
    this.validateObjectId(conversationId, 'conversationId');
    this.validateObjectId(senderId, 'senderId');

    if (!['customer', 'employee', 'owner'].includes(senderRole)) {
      throw new Error('senderRole must be customer, employee or owner');
    }

    if (!contenido || !contenido.trim()) {
      throw new Error('Message content cannot be empty');
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const message = await Chat.create({
      conversation: conversation._id,
      customer: conversation.customer,
      restaurant: conversation.restaurant,
      sender: senderId,
      senderRole,
      contenido: contenido.trim(),
      readBy: [new mongoose.Types.ObjectId(senderId)]
    });

    await Conversation.findByIdAndUpdate(
      conversationId,
      {
        lastMessage: message._id,
        lastMessageAt: message.createdAt
      },
      {
        new: true
      }
    );

    const notificationData: any = {
      // keep ids as ObjectId (models expect ObjectId types); the notification service
      // will stringify values when preparing FCM payload
      message_id: message._id,
      conversation_id: conversation._id
    };

    await NotificationService.createAndSendNotification({
      customer_id: conversation.customer,
      restaurant_id: conversation.restaurant,
      type: 'new_message',
      title: 'Nou missatge',
      message: 'T’han enviat un nou missatge al xat.',
      data: notificationData
    });

    const populatedMessage = await Chat.findById(message._id).populate('customer').populate('restaurant');

    if (populatedMessage && this.io) {
      const restaurantId = this.getEntityId(populatedMessage.restaurant);
      const customerId = this.getEntityId(populatedMessage.customer);

      this.io.to(`conversation:${conversationId}`).emit('chat:newMessage', populatedMessage);

      this.io.to(`restaurant:${restaurantId}`).emit('chat:conversationUpdated', {
        conversationId,
        message: populatedMessage
      });

      this.io.to(`customer:${customerId}`).emit('chat:conversationUpdated', {
        conversationId,
        message: populatedMessage
      });
    }

    return populatedMessage;
  }

  public async markMessageAsRead(messageId: string, userId: string) {
    this.validateObjectId(messageId, 'messageId');
    this.validateObjectId(userId, 'userId');

    return Chat.findByIdAndUpdate(
      messageId,
      {
        $addToSet: {
          readBy: userId
        }
      },
      {
        new: true
      }
    )
      .populate('customer')
      .populate('restaurant');
  }

  public async markConversationAsRead(conversationId: string, userId: string) {
    this.validateObjectId(conversationId, 'conversationId');
    this.validateObjectId(userId, 'userId');

    await Chat.updateMany(
      {
        conversation: conversationId,
        readBy: { $ne: userId }
      },
      {
        $addToSet: {
          readBy: userId
        }
      }
    );

    return {
      success: true
    };
  }

  public async deleteMessage(messageId: string) {
    this.validateObjectId(messageId, 'messageId');

    return Chat.findByIdAndDelete(messageId);
  }

  public inicializarSockets(): void {
    if (!this.io) {
      throw new Error('Socket.io server instance is required');
    }

    // Middleware to authenticate socket connection via token
    this.io.use((socket: Socket, next: (err?: any) => void) => {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        Logging.warning('Socket connection attempt without token');
        return next(new Error('Authentication error: Token missing'));
      }

      try {
        const decoded = verifyAccessToken(token);
        if (decoded.type !== 'access') {
          return next(new Error('Authentication error: Invalid token type'));
        }
        (socket as any).user = decoded;
        next();
      } catch (err) {
        Logging.error('Socket authentication failed');
        next(new Error('Authentication error: Invalid or expired token'));
      }
    });

    this.io.on('connection', (socket: Socket) => {
      console.log(`Socket connected: ${socket.id}`);

      socket.on('chat:joinConversation', ({ conversationId }: JoinConversationPayload) => {
        if (!conversationId) {
          socket.emit('chat:error', {
            message: 'conversationId is required'
          });
          return;
        }

        socket.join(`conversation:${conversationId}`);

        socket.emit('chat:joinedConversation', {
          conversationId
        });
      });

      socket.on('chat:leaveConversation', ({ conversationId }: JoinConversationPayload) => {
        if (!conversationId) return;

        socket.leave(`conversation:${conversationId}`);
      });

      socket.on('chat:joinCustomer', ({ customerId }: JoinCustomerPayload) => {
        if (!customerId) {
          socket.emit('chat:error', {
            message: 'customerId is required'
          });
          return;
        }

        socket.join(`customer:${customerId}`);

        socket.emit('chat:joinedCustomer', {
          customerId
        });
      });

      socket.on('chat:joinRestaurant', ({ restaurantId }: JoinRestaurantPayload) => {
        if (!restaurantId) {
          socket.emit('chat:error', {
            message: 'restaurantId is required'
          });
          return;
        }

        socket.join(`restaurant:${restaurantId}`);

        socket.emit('chat:joinedRestaurant', {
          restaurantId
        });
      });

      socket.on('chat:sendMessage', async (payload: SendMessagePayload) => {
        try {
          const { conversationId, senderId, senderRole, contenido } = payload;

          if (!conversationId || !senderId || !senderRole || !contenido) {
            socket.emit('chat:error', {
              message: 'conversationId, senderId, senderRole and contenido are required'
            });
            return;
          }

          const message = await this.createMessage({
            conversationId,
            senderId,
            senderRole,
            contenido
          });

          if (!message) {
            socket.emit('chat:error', {
              message: 'Message could not be created'
            });
            return;
          }
        } catch (error: any) {
          socket.emit('chat:error', {
            message: error.message || 'Error sending message'
          });
        }
      });

      socket.on('chat:typing', ({ conversationId, senderId, senderRole }: { conversationId: string; senderId: string; senderRole: SenderRole }) => {
        if (!conversationId || !senderId || !senderRole) return;

        socket.to(`conversation:${conversationId}`).emit('chat:typing', {
          conversationId,
          senderId,
          senderRole
        });
      });

      socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
      });
    });
  }
}
