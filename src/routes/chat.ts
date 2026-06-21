import express from 'express';
import * as ChatController from '../controllers/chat';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Endpoints para la gestión de conversaciones y mensajes de chat
 */

/**
 * @swagger
 * /chat/conversations:
 *   post:
 *     summary: Crear o recuperar una conversación entre un customer y un restaurante
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - restaurantId
 *             properties:
 *               customerId:
 *                 type: string
 *                 example: "65a123456789abcdef123456"
 *               restaurantId:
 *                 type: string
 *                 example: "65a123456789abcdef654321"
 *     responses:
 *       200:
 *         description: Conversación obtenida correctamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/conversations', ChatController.createOrGetConversation);

/**
 * @swagger
 * /chat/conversations/customer/{customerId}:
 *   get:
 *     summary: Obtener todas las conversaciones de un customer
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del customer
 *     responses:
 *       200:
 *         description: Conversaciones del customer obtenidas correctamente
 *       400:
 *         description: ID de customer inválido
 *       500:
 *         description: Error interno del servidor
 */
router.get('/conversations/customer/:customerId', ChatController.getCustomerConversations);

/**
 * @swagger
 * /chat/conversations/restaurant/{restaurantId}:
 *   get:
 *     summary: Obtener todas las conversaciones de un restaurante
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del restaurante
 *     responses:
 *       200:
 *         description: Conversaciones del restaurante obtenidas correctamente
 *       400:
 *         description: ID de restaurante inválido
 *       500:
 *         description: Error interno del servidor
 */
router.get('/conversations/restaurant/:restaurantId', ChatController.getRestaurantConversations);

/**
 * @swagger
 * /chat/conversations/{conversationId}/messages:
 *   get:
 *     summary: Obtener los mensajes de una conversación
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la conversación
 *     responses:
 *       200:
 *         description: Mensajes obtenidos correctamente
 *       400:
 *         description: ID de conversación inválido
 *       500:
 *         description: Error interno del servidor
 */
router.get('/conversations/:conversationId/messages', ChatController.getConversationMessages);

/**
 * @swagger
 * /chat/conversations/{conversationId}/messages:
 *   post:
 *     summary: Crear un mensaje dentro de una conversación
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la conversación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - senderId
 *               - senderRole
 *               - contenido
 *             properties:
 *               senderId:
 *                 type: string
 *                 example: "65a123456789abcdef123456"
 *               senderRole:
 *                 type: string
 *                 enum: [customer, employee, owner]
 *                 example: "customer"
 *               contenido:
 *                 type: string
 *                 example: "Hola, tinc una pregunta"
 *     responses:
 *       201:
 *         description: Mensaje creado correctamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Conversación no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.post('/conversations/:conversationId/messages', ChatController.createMessage);

/**
 * @swagger
 * /chat/messages/{messageId}/read:
 *   patch:
 *     summary: Marcar un mensaje concreto como leído
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del mensaje
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "65a123456789abcdef123456"
 *     responses:
 *       200:
 *         description: Mensaje marcado como leído correctamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Mensaje no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.patch('/messages/:messageId/read', ChatController.markMessageAsRead);

/**
 * @swagger
 * /chat/conversations/{conversationId}/read:
 *   patch:
 *     summary: Marcar todos los mensajes de una conversación como leídos
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la conversación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "65a123456789abcdef123456"
 *     responses:
 *       200:
 *         description: Conversación marcada como leída correctamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.patch('/conversations/:conversationId/read', ChatController.markConversationAsRead);

/**
 * @swagger
 * /chat/messages/{messageId}:
 *   delete:
 *     summary: Eliminar un mensaje
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del mensaje
 *     responses:
 *       200:
 *         description: Mensaje eliminado correctamente
 *       400:
 *         description: ID de mensaje inválido
 *       404:
 *         description: Mensaje no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/messages/:messageId', ChatController.deleteMessage);

export default router;
