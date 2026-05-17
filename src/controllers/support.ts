import { Request, Response } from 'express';
import Joi from 'joi';
import { supportService } from '../services/support.service';
import Logging from '../library/logging';

const chatSchema = Joi.object({
    message: Joi.string().required().max(1000),
    history: Joi.array().items(
        Joi.object({
            role: Joi.string().valid('user', 'model').required(),
            parts: Joi.string().required().max(2000)
        })
    ).max(20).optional()
});

export const handleChat = async (req: Request, res: Response) => {
    try {
        const { error, value } = chatSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                message: 'Datos de entrada inválidos',
                details: error.details.map((d) => d.message)
            });
        }

        const { message, history } = value;

        const aiResponse = await supportService.getChatResponse(message, history);

        return res.status(200).json({
            response: aiResponse
        });
    } catch (err: any) {
        Logging.error(`[SupportController] ${err.message}`);
        return res.status(500).json({
            message: err.message || 'Error interno del servidor'
        });
    }
};
