import { GoogleGenerativeAI, Content } from '@google/generative-ai';
import { config } from '../config/config';
import Logging from '../library/logging';

export interface SupportChatMessage {
  role: 'user' | 'model';
  parts: string;
}

const SYSTEM_PROMPT = `
You are the AI support assistant for EasyEat. Respond in a clear, friendly, brief and helpful way. 
Only answer questions related to the platform, including registration, login, profiles, restaurants, customers, payments, plans, configuration, account deletion and common issues. 
If you are not sure about the answer, say so transparently and recommend contacting human support. 
Do not invent features or policies.
`;

export class SupportService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(config.geminiApiKey);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite'
    });
  }

  async getChatResponse(message: string, history: SupportChatMessage[] = []): Promise<string> {
    try {
      if (!config.geminiApiKey) {
        throw new Error('GEMINI_API_KEY is not configured on the server.');
      }

      // Convert history to Gemini format
      // IMPORTANT: Gemini history must start with a 'user' message.
      const geminiHistory: Content[] = [
        { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
        { role: 'model', parts: [{ text: 'Entendido. Actuaré como el asistente de soporte de EasyEat según estas instrucciones.' }] }
      ];

      let foundFirstUser = false;

      for (const msg of history) {
        if (msg.role === 'user') foundFirstUser = true;
        if (foundFirstUser) {
          geminiHistory.push({
            role: msg.role,
            parts: [{ text: msg.parts }]
          });
        }
      }

      const chat = this.model.startChat({
        history: geminiHistory
      });

      const result = await chat.sendMessage(message);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      Logging.error(`Error in SupportService: ${error.message}`);
      if (error.response) {
        Logging.error(`Gemini Response Error: ${JSON.stringify(error.response.data)}`);
      }
      console.error(error); // This will show in the terminal
      throw new Error('Lo siento, ha ocurrido un error al procesar tu consulta. Por favor, inténtalo de nuevo más tarde.');
    }
  }
}

export const supportService = new SupportService();
