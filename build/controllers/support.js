'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.handleChat = void 0;
const joi_1 = __importDefault(require('joi'));
const support_service_1 = require('../services/support.service');
const logging_1 = __importDefault(require('../library/logging'));
const chatSchema = joi_1.default.object({
  message: joi_1.default.string().required().max(1000),
  history: joi_1.default
    .array()
    .items(
      joi_1.default.object({
        role: joi_1.default.string().valid('user', 'model').required(),
        parts: joi_1.default.string().required().max(2000)
      })
    )
    .max(20)
    .optional()
});
const handleChat = (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const { error, value } = chatSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          message: 'Datos de entrada inválidos',
          details: error.details.map((d) => d.message)
        });
      }
      const { message, history } = value;
      const aiResponse = yield support_service_1.supportService.getChatResponse(message, history);
      return res.status(200).json({
        response: aiResponse
      });
    } catch (err) {
      logging_1.default.error(`[SupportController] ${err.message}`);
      return res.status(500).json({
        message: err.message || 'Error interno del servidor'
      });
    }
  });
exports.handleChat = handleChat;
//# sourceMappingURL=support.js.map
