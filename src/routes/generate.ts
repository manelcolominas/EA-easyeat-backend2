import express from 'express';
import { generate } from '../controllers/generate';

const router = express.Router();

/**
 * @swagger
 * /api/generate:
 *   post:
 *     summary: Generate text using an external LLM service
 *     tags: [LLM]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - model
 *               - prompt
 *             properties:
 *               model:
 *                 type: string
 *                 example: "qwen2.5:14b"
 *               prompt:
 *                 type: string
 *                 example: "Recomana'm un restaurant de menjar italià a Barcelona"
 *               temperature:
 *                 type: number
 *               maxTokens:
 *                 type: number
 *               topP:
 *                 type: number
 *               stop:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Generated text returned successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */
router.post('/generate', generate);

export default router;
