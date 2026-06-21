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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMessage = exports.markConversationAsRead = exports.markMessageAsRead = exports.createMessage = exports.getConversationMessages = exports.getRestaurantConversations = exports.getCustomerConversations = exports.createOrGetConversation = void 0;
const chat_1 = require("../services/chat");
const chatService = new chat_1.ChatService();
const handleControllerError = (res, error, fallbackMessage) => {
    const errorMessage = error.message || fallbackMessage;
    const isBadRequest = errorMessage.includes('required') || errorMessage.includes('valid ObjectId') || errorMessage.includes('cannot be empty') || errorMessage.includes('senderRole');
    res.status(isBadRequest ? 400 : 500).json({
        message: fallbackMessage,
        error: errorMessage
    });
};
const createOrGetConversation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { customerId, restaurantId } = req.body;
        if (!customerId || !restaurantId) {
            res.status(400).json({
                message: 'customerId and restaurantId are required'
            });
            return;
        }
        const conversation = yield chatService.createOrGetConversation({
            customerId,
            restaurantId
        });
        res.status(200).json({
            message: 'Conversation retrieved successfully',
            data: conversation
        });
    }
    catch (error) {
        handleControllerError(res, error, 'Error creating or getting conversation');
    }
});
exports.createOrGetConversation = createOrGetConversation;
const getCustomerConversations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { customerId } = req.params;
        const conversations = yield chatService.getCustomerConversations(customerId);
        res.status(200).json({
            message: 'Customer conversations retrieved successfully',
            data: conversations
        });
    }
    catch (error) {
        handleControllerError(res, error, 'Error getting customer conversations');
    }
});
exports.getCustomerConversations = getCustomerConversations;
const getRestaurantConversations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { restaurantId } = req.params;
        const conversations = yield chatService.getRestaurantConversations(restaurantId);
        res.status(200).json({
            message: 'Restaurant conversations retrieved successfully',
            data: conversations
        });
    }
    catch (error) {
        handleControllerError(res, error, 'Error getting restaurant conversations');
    }
});
exports.getRestaurantConversations = getRestaurantConversations;
const getConversationMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { conversationId } = req.params;
        const messages = yield chatService.getConversationMessages(conversationId);
        res.status(200).json({
            message: 'Conversation messages retrieved successfully',
            data: messages
        });
    }
    catch (error) {
        handleControllerError(res, error, 'Error getting conversation messages');
    }
});
exports.getConversationMessages = getConversationMessages;
const createMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { conversationId } = req.params;
        const { senderId, senderRole, contenido } = req.body;
        if (!senderId || !senderRole || !contenido) {
            res.status(400).json({
                message: 'senderId, senderRole and contenido are required'
            });
            return;
        }
        const message = yield chatService.createMessage({
            conversationId,
            senderId,
            senderRole,
            contenido
        });
        res.status(201).json({
            message: 'Message created successfully',
            data: message
        });
    }
    catch (error) {
        handleControllerError(res, error, 'Error creating message');
    }
});
exports.createMessage = createMessage;
const markMessageAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { messageId } = req.params;
        const { userId } = req.body;
        if (!userId) {
            res.status(400).json({
                message: 'userId is required'
            });
            return;
        }
        const message = yield chatService.markMessageAsRead(messageId, userId);
        if (!message) {
            res.status(404).json({
                message: 'Message not found'
            });
            return;
        }
        res.status(200).json({
            message: 'Message marked as read successfully',
            data: message
        });
    }
    catch (error) {
        handleControllerError(res, error, 'Error marking message as read');
    }
});
exports.markMessageAsRead = markMessageAsRead;
const markConversationAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { conversationId } = req.params;
        const { userId } = req.body;
        if (!userId) {
            res.status(400).json({
                message: 'userId is required'
            });
            return;
        }
        const result = yield chatService.markConversationAsRead(conversationId, userId);
        res.status(200).json({
            message: 'Conversation marked as read successfully',
            data: result
        });
    }
    catch (error) {
        handleControllerError(res, error, 'Error marking conversation as read');
    }
});
exports.markConversationAsRead = markConversationAsRead;
const deleteMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { messageId } = req.params;
        const deletedMessage = yield chatService.deleteMessage(messageId);
        if (!deletedMessage) {
            res.status(404).json({
                message: 'Message not found'
            });
            return;
        }
        res.status(200).json({
            message: 'Message deleted successfully',
            data: deletedMessage
        });
    }
    catch (error) {
        handleControllerError(res, error, 'Error deleting message');
    }
});
exports.deleteMessage = deleteMessage;
//# sourceMappingURL=chat.js.map