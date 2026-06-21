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
Object.defineProperty(exports, '__esModule', { value: true });
exports.generate = void 0;
const llm_service_1 = require('../services/llm.service');
const generate = (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const { model, prompt } = req.body;
      if (!model || !prompt) {
        res.status(400).json({ message: 'model and prompt are required' });
        return;
      }
      const llmResponse = yield (0, llm_service_1.generateText)(model, prompt);
      if (!llmResponse.ok) {
        res.status(llmResponse.status).json({ message: 'Error from LLM service', error: llmResponse });
        return;
      }
      const data = yield llmResponse.json();
      res.status(200).json({
        message: 'LLM response received',
        response: data.response,
        done: data.done,
        done_reason: data.done_reason
      });
    } catch (error) {
      const message = (error === null || error === void 0 ? void 0 : error.message) || 'Error generating text from LLM';
      res.status(500).json({ message, error });
    }
  });
exports.generate = generate;
//# sourceMappingURL=generate.js.map
