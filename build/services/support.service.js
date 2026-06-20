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
exports.supportService = exports.SupportService = void 0;
const generative_ai_1 = require("@google/generative-ai");
const config_1 = require("../config/config");
const logging_1 = __importDefault(require("../library/logging"));
const SYSTEM_PROMPT = `
You are the AI support assistant for EasyEat. Respond in a clear, friendly, brief and helpful way. 
Only answer questions related to the platform, including registration, login, profiles, restaurants, customers, payments, plans, configuration, account deletion and common issues. 
If you are not sure about the answer, say so transparently and recommend contacting human support. 
Do not invent features or policies.
`;
class SupportService {
    constructor() {
        this.genAI = new generative_ai_1.GoogleGenerativeAI(config_1.config.geminiApiKey);
        this.model = this.genAI.getGenerativeModel({
            model: 'gemini-2.5-flash-lite'
        });
    }
    getChatResponse(message_1) {
        return __awaiter(this, arguments, void 0, function* (message, history = []) {
            try {
                if (!config_1.config.geminiApiKey) {
                    throw new Error('GEMINI_API_KEY is not configured on the server.');
                }
                // Convert history to Gemini format
                // IMPORTANT: Gemini history must start with a 'user' message.
                const geminiHistory = [
                    { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
                    { role: 'model', parts: [{ text: 'Entendido. Actuaré como el asistente de soporte de EasyEat según estas instrucciones.' }] }
                ];
                let foundFirstUser = false;
                for (const msg of history) {
                    if (msg.role === 'user')
                        foundFirstUser = true;
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
                const result = yield chat.sendMessage(message);
                const response = yield result.response;
                return response.text();
            }
            catch (error) {
                logging_1.default.error(`Error in SupportService: ${error.message}`);
                if (error.response) {
                    logging_1.default.error(`Gemini Response Error: ${JSON.stringify(error.response.data)}`);
                }
                console.error(error); // This will show in the terminal
                throw new Error('Lo siento, ha ocurrido un error al procesar tu consulta. Por favor, inténtalo de nuevo más tarde.');
            }
        });
    }
}
exports.SupportService = SupportService;
exports.supportService = new SupportService();
//# sourceMappingURL=support.service.js.map