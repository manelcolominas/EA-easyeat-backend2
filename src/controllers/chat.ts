import { Request, Response } from 'express';

import { ChatService } from '../services/chat';

const chatService = new ChatService();

const handleControllerError = (res: Response, error: any, fallbackMessage: string): void => {
  const errorMessage = error.message || fallbackMessage;

  const isBadRequest = errorMessage.includes('required') || errorMessage.includes('valid ObjectId') || errorMessage.includes('cannot be empty') || errorMessage.includes('senderRole');

  res.status(isBadRequest ? 400 : 500).json({
    message: fallbackMessage,
    error: errorMessage
  });
};

export const createOrGetConversation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerId, restaurantId } = req.body;

    if (!customerId || !restaurantId) {
      res.status(400).json({
        message: 'customerId and restaurantId are required'
      });
      return;
    }

    const conversation = await chatService.createOrGetConversation({
      customerId,
      restaurantId
    });

    res.status(200).json({
      message: 'Conversation retrieved successfully',
      data: conversation
    });
  } catch (error: any) {
    handleControllerError(res, error, 'Error creating or getting conversation');
  }
};

export const getCustomerConversations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerId } = req.params;

    const conversations = await chatService.getCustomerConversations(customerId);

    res.status(200).json({
      message: 'Customer conversations retrieved successfully',
      data: conversations
    });
  } catch (error: any) {
    handleControllerError(res, error, 'Error getting customer conversations');
  }
};

export const getRestaurantConversations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { restaurantId } = req.params;

    const conversations = await chatService.getRestaurantConversations(restaurantId);

    res.status(200).json({
      message: 'Restaurant conversations retrieved successfully',
      data: conversations
    });
  } catch (error: any) {
    handleControllerError(res, error, 'Error getting restaurant conversations');
  }
};

export const getConversationMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;

    const messages = await chatService.getConversationMessages(conversationId);

    res.status(200).json({
      message: 'Conversation messages retrieved successfully',
      data: messages
    });
  } catch (error: any) {
    handleControllerError(res, error, 'Error getting conversation messages');
  }
};

export const createMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const { senderId, senderRole, contenido } = req.body;

    if (!senderId || !senderRole || !contenido) {
      res.status(400).json({
        message: 'senderId, senderRole and contenido are required'
      });
      return;
    }

    const message = await chatService.createMessage({
      conversationId,
      senderId,
      senderRole,
      contenido
    });

    res.status(201).json({
      message: 'Message created successfully',
      data: message
    });
  } catch (error: any) {
    handleControllerError(res, error, 'Error creating message');
  }
};

export const markMessageAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { messageId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      res.status(400).json({
        message: 'userId is required'
      });
      return;
    }

    const message = await chatService.markMessageAsRead(messageId, userId);

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
  } catch (error: any) {
    handleControllerError(res, error, 'Error marking message as read');
  }
};

export const markConversationAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      res.status(400).json({
        message: 'userId is required'
      });
      return;
    }

    const result = await chatService.markConversationAsRead(conversationId, userId);

    res.status(200).json({
      message: 'Conversation marked as read successfully',
      data: result
    });
  } catch (error: any) {
    handleControllerError(res, error, 'Error marking conversation as read');
  }
};

export const deleteMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { messageId } = req.params;

    const deletedMessage = await chatService.deleteMessage(messageId);

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
  } catch (error: any) {
    handleControllerError(res, error, 'Error deleting message');
  }
};
