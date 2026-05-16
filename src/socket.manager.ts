import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyAccessToken } from './utils/jwt';
import MessageModel from './models/chat';
import ConversationModel from './models/conversation';
import Logging from './library/logging';
import { IJwtPayload } from './models/JWTPayload';

export class SocketManager {
    private io: Server;

    constructor(server: HttpServer) {
        this.io = new Server(server, {
            cors: {
                origin: '*', // Adjust this for production if needed
                methods: ['GET', 'POST']
            }
        });

        this.setupMiddlewares();
        this.setupEvents();
        Logging.info('Socket.IO initialized.');
    }

    private setupMiddlewares() {
        this.io.use((socket: Socket, next: (err?: any) => void) => {
            // Support token in auth object or headers
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
    }

    private setupEvents() {
        this.io.on('connection', (socket: Socket) => {
            const user = (socket as any).user as IJwtPayload;
            Logging.info(`User connected to socket: ${user.name} (${user.role}) [${socket.id}]`);

            // Join a personal room for direct notifications
            socket.join(`user_${user.id}`);

            // Join a restaurant room if user is an employee
            if ((user.role === 'owner' || user.role === 'staff') && user.restaurant_id) {
                socket.join(`restaurant_${user.restaurant_id}`);
                Logging.info(`Employee ${user.name} joined restaurant room: ${user.restaurant_id}`);
            }

            socket.on('join_conversation', (conversationId: string) => {
                socket.join(conversationId);
                Logging.info(`User ${user.name} joined conversation room: ${conversationId}`);
            });

            socket.on('leave_conversation', (conversationId: string) => {
                socket.leave(conversationId);
                Logging.info(`User ${user.name} left conversation room: ${conversationId}`);
            });

            socket.on('send_message', async (data: { conversationId: string; content: string; restaurantId: string }) => {
                const { conversationId, content, restaurantId } = data;

                try {
                    // 0. Fetch conversation to get customer and restaurant IDs
                    const conversation = await ConversationModel.findById(conversationId);
                    if (!conversation) {
                        throw new Error('Conversation not found');
                    }

                    // 1. Create and save the message
                    const message = new MessageModel({
                        conversation: conversationId,
                        customer: conversation.customer,
                        restaurant: conversation.restaurant,
                        sender: user.id,
                        senderRole: (user.role === 'owner' || user.role === 'staff') ? 'employee' : 'customer',
                        contenido: content,
                        readBy: [user.id]
                    });

                    await message.save();

                    // 2. Update conversation with last message info
                    await ConversationModel.findByIdAndUpdate(conversationId, {
                        lastMessage: message._id,
                        lastMessageAt: new Date()
                    });

                    // 3. Emit message to everyone in the conversation room
                    this.io.to(conversationId).emit('receive_message', message);
                    
                    // 4. Notify the restaurant if a customer sends a message (for the sidebar update)
                    if (user.role === 'customer') {
                        this.io.to(`restaurant_${restaurantId}`).emit('conversation_updated', {
                            conversationId,
                            message
                        });
                    }

                } catch (error) {
                    Logging.error(`Error processing send_message: ${error}`);
                    socket.emit('error_message', { message: 'Failed to send message' });
                }
            });

            socket.on('typing', (data: { conversationId: string; isTyping: boolean }) => {
                socket.to(data.conversationId).emit('user_typing', {
                    userId: user.id,
                    isTyping: data.isTyping
                });
            });

            socket.on('disconnect', () => {
                Logging.info(`User disconnected from socket: ${user.name}`);
            });
        });
    }
}
