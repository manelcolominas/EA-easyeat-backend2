'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const express_1 = __importDefault(require('express'));
const generate_1 = require('../controllers/generate');
const auth_1 = require('../middleware/auth');
const router = express_1.default.Router();
/**
 * @swagger
 * /llm/generate:
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
 *     responses:
 *       200:
 *         description: Generated text returned successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */
router.post('/generate', auth_1.authenticate, generate_1.generate);
exports.default = router;
//# sourceMappingURL=generate.js.map
