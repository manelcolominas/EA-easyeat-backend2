import { Request, Response } from 'express';
import { generateText, LLMGenerateRequest } from '../services/llm.service';

export const generate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { model, prompt } = req.body as LLMGenerateRequest;

    if (!model || !prompt) {
      res.status(400).json({ message: 'model and prompt are required' });
      return;
    }

    const llmResponse = await generateText(model, prompt);

    if (!llmResponse.ok) {
      res.status(llmResponse.status).json({ message: 'Error from LLM service', error: llmResponse });
      return;
    }

    const data = await llmResponse.json();
    res.status(200).json({ message: 'LLM response received', data });

  } catch (error: any) {
    const message = error?.message || 'Error generating text from LLM';
    res.status(500).json({ message, error });
  }
};
