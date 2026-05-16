import express from 'express';
import * as SupportController from '../controllers/support';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Support
 *   description: Endpoints para el sistema de soporte con IA
 */

/**
 * @swagger
 * /support/chat:
 *   post:
 *     summary: Enviar un mensaje al chatbot de soporte
 *     tags: [Support]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: "¿Cómo puedo registrarme?"
 *               history:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [user, model]
 *                     parts:
 *                       type: string
 *     responses:
 *       200:
 *         description: Respuesta de la IA
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/chat', SupportController.handleChat);

export default router;
