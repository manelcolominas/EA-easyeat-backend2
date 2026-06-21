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
const mongoose_1 = __importDefault(require('mongoose'));
const notification_1 = require('../models/notification');
const customerDeviceToken_1 = require('../models/customerDeviceToken');
const fcm_1 = require('./fcm');
// ─── CREATE ────────────────────────────────────────────────────────────────────
const createNotification = (data) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const notification = new notification_1.NotificationModel(Object.assign(Object.assign({ _id: new mongoose_1.default.Types.ObjectId() }, data), { isRead: false, fcmSent: false }));
    return yield notification.save();
  });
/**
 * Crear notificació i retornar amb dades poblades
 */
const createNotificationWithPopulate = (data) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const notification = yield createNotification(data);
    return yield notification.populate('customer_id', 'name email');
  });
// ─── READ ──────────────────────────────────────────────────────────────────────
const getNotification = (notification_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return yield notification_1.NotificationModel.findById(notification_id).active();
  });
const getDeletedNotification = (notification_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return yield notification_1.NotificationModel.findOne({ _id: notification_id, deletedAt: { $ne: null } }).lean();
  });
// ─── READ BY CUSTOMER ─────────────────────────────────────────────────────────
const getByCustomer = (customer_id, skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const query = { customer_id, deletedAt: null };
    const [notifications, total] = yield Promise.all([
      notification_1.NotificationModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      notification_1.NotificationModel.countDocuments(query)
    ]);
    return { notifications, total };
  });
const getUnreadByCustomer = (customer_id, skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const query = { customer_id, isRead: false, deletedAt: null };
    const [notifications, total] = yield Promise.all([
      notification_1.NotificationModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      notification_1.NotificationModel.countDocuments(query)
    ]);
    return { notifications, total };
  });
const countUnreadByCustomer = (customer_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return yield notification_1.NotificationModel.countDocuments({ customer_id, isRead: false, deletedAt: null });
  });
// ─── READ BY TYPE ────────────────────────────────────────────────────────────
const getByType = (type, skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const query = { type, deletedAt: null };
    const [notifications, total] = yield Promise.all([
      notification_1.NotificationModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      notification_1.NotificationModel.countDocuments(query)
    ]);
    return { notifications, total };
  });
// ─── READ ALL ──────────────────────────────────────────────────────────────────
const getAllNotifications = (skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const [notifications, total] = yield Promise.all([
      notification_1.NotificationModel.find({ deletedAt: null }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      notification_1.NotificationModel.countDocuments({ deletedAt: null })
    ]);
    return { notifications, total };
  });
const getAllDeletedNotifications = (skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const query = { deletedAt: { $ne: null } };
    const [notifications, total] = yield Promise.all([
      notification_1.NotificationModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      notification_1.NotificationModel.countDocuments(query)
    ]);
    return { notifications, total };
  });
// ─── UPDATE ────────────────────────────────────────────────────────────────────
const updateNotification = (notification_id, data) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const notification = yield notification_1.NotificationModel.findById(notification_id);
    if (notification) {
      notification.set(data);
      return yield notification.save();
    }
    return null;
  });
/**
 * Marcar notificació com llegida
 */
const markAsRead = (notification_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return yield notification_1.NotificationModel.findByIdAndUpdate(
      notification_id,
      {
        isRead: true,
        readAt: new Date()
      },
      { new: true }
    ).lean();
  });
/**
 * Marcar totes les notificacions d'un client com llegides
 */
const markAllAsReadByCustomer = (customer_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return yield notification_1.NotificationModel.updateMany(
      { customer_id, isRead: false, deletedAt: null },
      {
        isRead: true,
        readAt: new Date()
      }
    );
  });
/**
 * Actualitzar estat d'enviament FCM
 */
const updateFcmStatus = (notification_id, fcmSent, fcmError) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return yield notification_1.NotificationModel.findByIdAndUpdate(
      notification_id,
      {
        fcmSent,
        fcmSentAt: fcmSent ? new Date() : null,
        fcmError: fcmError || null
      },
      { new: true }
    ).lean();
  });
// ─── DELETE ────────────────────────────────────────────────────────────────────
const softDeleteNotification = (notification_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return yield notification_1.NotificationModel.findByIdAndUpdate(notification_id, { deletedAt: new Date() }, { new: true }).lean();
  });
const restoreNotification = (notification_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return yield notification_1.NotificationModel.findByIdAndUpdate(notification_id, { deletedAt: null }, { new: true }).lean();
  });
const hardDeleteNotification = (notification_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return yield notification_1.NotificationModel.findByIdAndDelete(notification_id);
  });
/**
 * Eliminar notificacions antigues (més de X dies)
 */
const deleteOldNotifications = (...args_1) =>
  __awaiter(void 0, [...args_1], void 0, function* (daysOld = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    return yield notification_1.NotificationModel.deleteMany({
      createdAt: { $lt: cutoffDate },
      deletedAt: { $ne: null }
    });
  });
// ─── HELPERS ───────────────────────────────────────────────────────────────────
/**
 * Crear notificacions en bulk per a múltiples clients
 */
const createBulkNotifications = (customer_ids, notificationData) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const documents = customer_ids.map((customer_id) => Object.assign({ _id: new mongoose_1.default.Types.ObjectId(), customer_id, isRead: false, fcmSent: false }, notificationData));
    return yield notification_1.NotificationModel.insertMany(documents);
  });
const toFcmData = (data) => Object.fromEntries(Object.entries(data !== null && data !== void 0 ? data : {}).map(([key, value]) => [key, value === undefined || value === null ? '' : String(value)]));
const createAndSendNotification = (data) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const notification = new notification_1.NotificationModel(Object.assign(Object.assign({ _id: new mongoose_1.default.Types.ObjectId() }, data), { isRead: false, fcmSent: false }));
    const saved = yield notification.save();
    const tokens = yield customerDeviceToken_1.CustomerDeviceTokenModel.find({
      customer_id: saved.customer_id,
      active: true,
      deletedAt: null
    }).distinct('token');
    if (!tokens.length) {
      yield notification_1.NotificationModel.findByIdAndUpdate(saved._id, {
        fcmSent: false,
        fcmError: 'No active device tokens'
      });
      return saved;
    }
    try {
      const result = yield (0, fcm_1.sendPushToTokens)(tokens, {
        title: saved.title,
        body: saved.message,
        data: Object.assign(
          { notification_id: String(saved._id), customer_id: String(saved.customer_id), restaurant_id: saved.restaurant_id ? String(saved.restaurant_id) : '', type: saved.type },
          toFcmData(saved.data)
        )
      });
      yield notification_1.NotificationModel.findByIdAndUpdate(saved._id, {
        fcmSent: result.failureCount === 0,
        fcmSentAt: new Date(),
        fcmError: result.failureCount > 0 ? `Failed tokens: ${result.failedTokens.join(', ')}` : null
      });
      return saved;
    } catch (error) {
      yield notification_1.NotificationModel.findByIdAndUpdate(saved._id, {
        fcmSent: false,
        fcmError: (_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : 'Unknown FCM error'
      });
      return saved;
    }
  });
exports.default = {
  // Create
  createNotification,
  createNotificationWithPopulate,
  createBulkNotifications,
  createAndSendNotification,
  // Read
  getNotification,
  getDeletedNotification,
  getByCustomer,
  getUnreadByCustomer,
  countUnreadByCustomer,
  getByType,
  getAllNotifications,
  getAllDeletedNotifications,
  // Update
  updateNotification,
  markAsRead,
  markAllAsReadByCustomer,
  updateFcmStatus,
  // Delete
  softDeleteNotification,
  restoreNotification,
  hardDeleteNotification,
  deleteOldNotifications
};
//# sourceMappingURL=notification.js.map
