'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.SocketManager = void 0;
const socket_io_1 = require('socket.io');
const jwt_1 = require('./utils/jwt');
const chat_1 = __importDefault(require('./models/chat'));
const conversation_1 = __importDefault(require('./models/conversation'));
const logging_1 = __importDefault(require('./library/logging'));
class SocketManager {
  constructor(server) {
    this.io = new socket_io_1.Server(server, {
      cors: {
        origin: '*', // Adjust this for production if needed
        methods: ['GET', 'POST']
      }
    });
    this.setupMiddlewares();
    this.setupEvents();
    logging_1.default.info('Socket.IO initialized.');
  }
  setupMiddlewares() {
    this.io.use((socket, next) => {
      var _a;
      // Support token in auth object or headers
      const token = socket.handshake.auth.token || ((_a = socket.handshake.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1]);
      if (!token) {
        logging_1.default.warning('Socket connection attempt without token');
        return next(new Error('Authentication error: Token missing'));
      }
      try {
        const decoded = (0, jwt_1.verifyAccessToken)(token);
        if (decoded.type !== 'access') {
          return next(new Error('Authentication error: Invalid token type'));
        }
        socket.user = decoded;
        next();
      } catch (err) {
        logging_1.default.error('Socket authentication failed');
        next(new Error('Authentication error: Invalid or expired token'));
      }
    });
  }
  setupEvents() {
    this.io.on('connection', (socket) => {
      const user = socket.user;
      logging_1.default.info(`User connected to socket: ${user.name} (${user.role}) [${socket.id}]`);
      // Join a personal room for direct notifications
      socket.join(`user_${user.id}`);
      // Join a restaurant room if user is an employee
      if ((user.role === 'owner' || user.role === 'staff') && user.restaurant_id) {
        socket.join(`restaurant_${user.restaurant_id}`);
        logging_1.default.info(`Employee ${user.name} joined restaurant room: ${user.restaurant_id}`);
      }
      socket.on('join_conversation', (conversationId) => {
        socket.join(conversationId);
        logging_1.default.info(`User ${user.name} joined conversation room: ${conversationId}`);
      });
      socket.on('leave_conversation', (conversationId) => {
        socket.leave(conversationId);
        logging_1.default.info(`User ${user.name} left conversation room: ${conversationId}`);
      });
      socket.on('send_message', (data) =>
        __awaiter(this, void 0, void 0, function* () {
          const { conversationId, content, restaurantId } = data;
          try {
            // 0. Fetch conversation to get customer and restaurant IDs
            const conversation = yield conversation_1.default.findById(conversationId);
            if (!conversation) {
              throw new Error('Conversation not found');
            }
            // 1. Create and save the message
            const message = new chat_1.default({
              conversation: conversationId,
              customer: conversation.customer,
              restaurant: conversation.restaurant,
              sender: user.id,
              senderRole: user.role === 'owner' || user.role === 'staff' ? 'employee' : 'customer',
              contenido: content,
              readBy: [user.id]
            });
            yield message.save();
            // 2. Update conversation with last message info
            yield conversation_1.default.findByIdAndUpdate(conversationId, {
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
            logging_1.default.error(`Error processing send_message: ${error}`);
            socket.emit('error_message', { message: 'Failed to send message' });
          }
        })
      );
      socket.on('typing', (data) => {
        socket.to(data.conversationId).emit('user_typing', {
          userId: user.id,
          isTyping: data.isTyping
        });
      });
      socket.on('disconnect', () => {
        logging_1.default.info(`User disconnected from socket: ${user.name}`);
      });
    });
  }
}
exports.SocketManager = SocketManager;
//# sourceMappingURL=socket.manager.js.map
