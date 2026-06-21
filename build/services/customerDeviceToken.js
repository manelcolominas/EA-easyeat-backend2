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
const customerDeviceToken_1 = require('../models/customerDeviceToken');
/**
 * Register (upsert) a device token for a customer.
 * If the token already exists it is re-activated and its metadata updated.
 */
const registerToken = (data) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return yield customerDeviceToken_1.CustomerDeviceTokenModel.findOneAndUpdate(
      { token: data.token },
      {
        $set: {
          customer_id: data.customer_id,
          platform: data.platform,
          active: true,
          deletedAt: null,
          lastSeenAt: new Date()
        }
      },
      { upsert: true, new: true }
    );
  });
/**
 * Soft-deactivate a device token (sets active=false + deletedAt).
 * Returns null when the token is not found.
 */
const unregisterToken = (token) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return yield customerDeviceToken_1.CustomerDeviceTokenModel.findOneAndUpdate({ token, deletedAt: null }, { $set: { active: false, deletedAt: new Date() } }, { new: true });
  });
/**
 * Return a single token document by its MongoDB _id.
 */
const getToken = (tokenId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return yield customerDeviceToken_1.CustomerDeviceTokenModel.findOne({ _id: tokenId, deletedAt: null }).lean();
  });
/**
 * Return all active tokens for a given customer.
 */
const getTokensByCustomer = (customer_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return yield customerDeviceToken_1.CustomerDeviceTokenModel.find({ customer_id, active: true, deletedAt: null }).lean();
  });
/**
 * Paginated list of every active token (admin use).
 */
const getAllTokens = (skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const [tokens, total] = yield Promise.all([
      customerDeviceToken_1.CustomerDeviceTokenModel.find({ deletedAt: null }).lean().skip(skip).limit(limit),
      customerDeviceToken_1.CustomerDeviceTokenModel.countDocuments({ deletedAt: null })
    ]);
    return { tokens, total };
  });
/**
 * Update lastSeenAt to now — call this whenever the token is used
 * to confirm the device is still active.
 */
const refreshLastSeen = (token) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return yield customerDeviceToken_1.CustomerDeviceTokenModel.findOneAndUpdate({ token, active: true, deletedAt: null }, { $set: { lastSeenAt: new Date() } }, { new: true });
  });
/**
 * Hard-delete a token document permanently (admin / cleanup use).
 */
const hardDeleteToken = (tokenId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return yield customerDeviceToken_1.CustomerDeviceTokenModel.findByIdAndDelete(tokenId);
  });
exports.default = {
  registerToken,
  unregisterToken,
  getToken,
  getTokensByCustomer,
  getAllTokens,
  refreshLastSeen,
  hardDeleteToken
};
//# sourceMappingURL=customerDeviceToken.js.map
