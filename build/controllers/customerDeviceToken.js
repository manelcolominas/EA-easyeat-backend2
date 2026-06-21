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
const customerDeviceToken_1 = __importDefault(require('../services/customerDeviceToken'));
const pagination_1 = require('../utils/pagination');
/**
 * POST /customerDeviceTokens/register
 * Register (upsert) a device token for the authenticated customer.
 */
const register = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const token = yield customerDeviceToken_1.default.registerToken(req.body);
      return res.status(201).json(token);
    } catch (error) {
      return next(error);
    }
  });
/**
 * POST /customerDeviceTokens/unregister
 * Soft-deactivate a device token.
 */
const unregister = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const { token } = req.body;
      const result = yield customerDeviceToken_1.default.unregisterToken(token);
      return result ? res.status(200).json({ message: 'Token unregistered' }) : res.status(404).json({ message: 'Token not found' });
    } catch (error) {
      return next(error);
    }
  });
/**
 * GET /customerDeviceTokens/:tokenId
 * Get a single token document by its _id.
 */
const readToken = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const token = yield customerDeviceToken_1.default.getToken(req.params.tokenId);
      return token ? res.status(200).json(token) : res.status(404).json({ message: 'Token not found' });
    } catch (error) {
      return next(error);
    }
  });
/**
 * GET /customerDeviceTokens/customer/:customer_id
 * List all active tokens for a given customer.
 */
const readByCustomer = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const tokens = yield customerDeviceToken_1.default.getTokensByCustomer(req.params.customer_id);
      return res.status(200).json(tokens);
    } catch (error) {
      return next(error);
    }
  });
/**
 * GET /customerDeviceTokens
 * Paginated list of all tokens (admin only).
 */
const readAll = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
      const { tokens, total } = yield customerDeviceToken_1.default.getAllTokens(skip, limit);
      return res.status(200).json({
        data: tokens,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
      });
    } catch (error) {
      return next(error);
    }
  });
/**
 * PATCH /customerDeviceTokens/:tokenId/ping
 * Update lastSeenAt for a token — call on app foreground/startup.
 */
const ping = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const { token } = req.body;
      const result = yield customerDeviceToken_1.default.refreshLastSeen(token);
      return result ? res.status(200).json(result) : res.status(404).json({ message: 'Token not found or inactive' });
    } catch (error) {
      return next(error);
    }
  });
/**
 * DELETE /customerDeviceTokens/:tokenId
 * Permanently remove a token document (admin only).
 */
const hardDelete = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const deleted = yield customerDeviceToken_1.default.hardDeleteToken(req.params.tokenId);
      return deleted ? res.status(200).json({ message: 'Token permanently deleted' }) : res.status(404).json({ message: 'Token not found' });
    } catch (error) {
      return next(error);
    }
  });
exports.default = {
  register,
  unregister,
  readToken,
  readByCustomer,
  readAll,
  ping,
  hardDelete
};
//# sourceMappingURL=customerDeviceToken.js.map
