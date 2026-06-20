"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const chat_1 = __importDefault(require("../models/chat"));
const conversation_1 = __importDefault(require("../models/conversation"));
class ChatService {
    constructor(io) {
        this.io = io;
    }
    validateObjectId(id, fieldName) {
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            throw new Error(`${fieldName} is not a valid ObjectId`);
        }
    }
    getEntityId(value) {
        if (!value)
            return '';
        if (typeof value === 'string')
            return value;
        if (value._id)
            return value._id.toString();
        return value.toString();
    }
    createOrGetConversation(_a) {
        return __awaiter(this, arguments, void 0, function* ({ customerId, restaurantId }) {
            this.validateObjectId(customerId, 'customerId');
            this.validateObjectId(restaurantId, 'restaurantId');
            let conversation = yield conversation_1.default.findOne({
                customer: customerId,
                restaurant: restaurantId
            })
                .populate('customer')
                .populate('restaurant')
                .populate('lastMessage');
            if (!conversation) {
                const createdConversation = yield conversation_1.default.create({
                    customer: customerId,
                    restaurant: restaurantId,
                    lastMessage: null,
                    lastMessageAt: null
                });
                conversation = yield conversation_1.default.findById(createdConversation._id).populate('customer').populate('restaurant').populate('lastMessage');
            }
            return conversation;
        });
    }
    getCustomerConversations(customerId) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validateObjectId(customerId, 'customerId');
            return conversation_1.default.find({
                customer: customerId
            })
                .populate('customer')
                .populate('restaurant')
                .populate('lastMessage')
                .sort({ lastMessageAt: -1, updatedAt: -1 });
        });
    }
    getRestaurantConversations(restaurantId) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validateObjectId(restaurantId, 'restaurantId');
            return conversation_1.default.find({
                restaurant: restaurantId
            })
                .populate('customer')
                .populate('restaurant')
                .populate('lastMessage')
                .sort({ lastMessageAt: -1, updatedAt: -1 });
        });
    }
    getConversationMessages(conversationId) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validateObjectId(conversationId, 'conversationId');
            return chat_1.default.find({
                conversation: conversationId
            })
                .populate('customer')
                .populate('restaurant')
                .sort({ createdAt: 1 });
        });
    }
    createMessage(_a) {
        return __awaiter(this, arguments, void 0, function* ({ conversationId, senderId, senderRole, contenido }) {
            this.validateObjectId(conversationId, 'conversationId');
            this.validateObjectId(senderId, 'senderId');
            if (!['customer', 'employee', 'owner'].includes(senderRole)) {
                throw new Error('senderRole must be customer, employee or owner');
            }
            if (!contenido || !contenido.trim()) {
                throw new Error('Message content cannot be empty');
            }
            const conversation = yield conversation_1.default.findById(conversationId);
            if (!conversation) {
                throw new Error('Conversation not found');
            }
            const message = yield chat_1.default.create({
                conversation: conversation._id,
                customer: conversation.customer,
                restaurant: conversation.restaurant,
                sender: senderId,
                senderRole,
                contenido: contenido.trim(),
                readBy: [new mongoose_1.default.Types.ObjectId(senderId)]
            });
            yield conversation_1.default.findByIdAndUpdate(conversationId, {
                lastMessage: message._id,
                lastMessageAt: message.createdAt
            }, {
                new: true
            });
            return chat_1.default.findById(message._id).populate('customer').populate('restaurant');
        });
    }
    markMessageAsRead(messageId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validateObjectId(messageId, 'messageId');
            this.validateObjectId(userId, 'userId');
            return chat_1.default.findByIdAndUpdate(messageId, {
                $addToSet: {
                    readBy: userId
                }
            }, {
                new: true
            })
                .populate('customer')
                .populate('restaurant');
        });
    }
    markConversationAsRead(conversationId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validateObjectId(conversationId, 'conversationId');
            this.validateObjectId(userId, 'userId');
            yield chat_1.default.updateMany({
                conversation: conversationId,
                readBy: { $ne: userId }
            }, {
                $addToSet: {
                    readBy: userId
                }
            });
            return {
                success: true
            };
        });
    }
    deleteMessage(messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validateObjectId(messageId, 'messageId');
            return chat_1.default.findByIdAndDelete(messageId);
        });
    }
    inicializarSockets() {
        if (!this.io) {
            throw new Error('Socket.io server instance is required');
        }
        this.io.on('connection', (socket) => {
            console.log(`Socket connected: ${socket.id}`);
            socket.on('chat:joinConversation', ({ conversationId }) => {
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
            socket.on('chat:leaveConversation', ({ conversationId }) => {
                if (!conversationId)
                    return;
                socket.leave(`conversation:${conversationId}`);
            });
            socket.on('chat:joinCustomer', ({ customerId }) => {
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
            socket.on('chat:joinRestaurant', ({ restaurantId }) => {
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
            socket.on('chat:sendMessage', (payload) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const { conversationId, senderId, senderRole, contenido } = payload;
                    if (!conversationId || !senderId || !senderRole || !contenido) {
                        socket.emit('chat:error', {
                            message: 'conversationId, senderId, senderRole and contenido are required'
                        });
                        return;
                    }
                    const message = yield this.createMessage({
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
                    const restaurantId = this.getEntityId(message.restaurant);
                    const customerId = this.getEntityId(message.customer);
                    this.io.to(`conversation:${conversationId}`).emit('chat:newMessage', message);
                    this.io.to(`restaurant:${restaurantId}`).emit('chat:conversationUpdated', {
                        conversationId,
                        message
                    });
                    this.io.to(`customer:${customerId}`).emit('chat:conversationUpdated', {
                        conversationId,
                        message
                    });
                }
                catch (error) {
                    socket.emit('chat:error', {
                        message: error.message || 'Error sending message'
                    });
                }
            }));
            socket.on('chat:typing', ({ conversationId, senderId, senderRole }) => {
                if (!conversationId || !senderId || !senderRole)
                    return;
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
exports.ChatService = ChatService;
//# sourceMappingURL=chat.js.map