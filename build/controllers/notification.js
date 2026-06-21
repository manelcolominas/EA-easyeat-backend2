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
const notification_1 = __importDefault(require('../services/notification'));
const pagination_1 = require('../utils/pagination');
// ─── CREATE ────────────────────────────────────────────────────────────────────
const createNotification = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const savedNotification = yield notification_1.default.createNotification(req.body);
      return res.status(201).json(savedNotification);
    } catch (error) {
      return res.status(500).json({ error });
    }
  });
// ─── READ ──────────────────────────────────────────────────────────────────────
const readNotification = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const notification_id = req.params.notification_id;
    try {
      const notification = yield notification_1.default.getNotification(notification_id);
      return notification ? res.status(200).json(notification) : res.status(404).json({ message: 'not found' });
    } catch (error) {
      return res.status(500).json({ error });
    }
  });
const readDeletedNotification = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const notification_id = req.params.notification_id;
    try {
      const notification = yield notification_1.default.getDeletedNotification(notification_id);
      return notification ? res.status(200).json(notification) : res.status(404).json({ message: 'not found' });
    } catch (error) {
      return res.status(500).json({ error });
    }
  });
const readAll = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
      const { notifications, total } = yield notification_1.default.getAllNotifications(skip, limit);
      return res.status(200).json({
        data: notifications,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
      });
    } catch (error) {
      return res.status(500).json({ error });
    }
  });
const readAllDeleted = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
      const { notifications, total } = yield notification_1.default.getAllDeletedNotifications(skip, limit);
      return res.status(200).json({
        data: notifications,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
      });
    } catch (error) {
      return res.status(500).json({ error });
    }
  });
// ─── READ BY CUSTOMER ─────────────────────────────────────────────────────────
const readByCustomer = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const { customer_id } = req.params;
      const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
      const { notifications, total } = yield notification_1.default.getByCustomer(customer_id, skip, limit);
      return res.status(200).json({
        data: notifications,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
      });
    } catch (error) {
      return res.status(500).json({ error });
    }
  });
const readUnreadByCustomer = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const { customer_id } = req.params;
      const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
      const { notifications, total } = yield notification_1.default.getUnreadByCustomer(customer_id, skip, limit);
      return res.status(200).json({
        data: notifications,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
      });
    } catch (error) {
      return res.status(500).json({ error });
    }
  });
const countUnread = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const { customer_id } = req.params;
      const count = yield notification_1.default.countUnreadByCustomer(customer_id);
      return res.status(200).json({ unreadCount: count });
    } catch (error) {
      return res.status(500).json({ error });
    }
  });
// ─── UPDATE ────────────────────────────────────────────────────────────────────
const updateNotification = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const notification_id = req.params.notification_id;
    try {
      const updatedNotification = yield notification_1.default.updateNotification(notification_id, req.body);
      return updatedNotification ? res.status(201).json(updatedNotification) : res.status(404).json({ message: 'not found' });
    } catch (error) {
      return res.status(500).json({ error });
    }
  });
const markAsRead = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const notification_id = req.params.notification_id;
    try {
      const notification = yield notification_1.default.markAsRead(notification_id);
      return notification ? res.status(200).json(notification) : res.status(404).json({ message: 'not found' });
    } catch (error) {
      return res.status(500).json({ error });
    }
  });
const markAllAsRead = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const { customer_id } = req.params;
      const result = yield notification_1.default.markAllAsReadByCustomer(customer_id);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ error });
    }
  });
// ─── DELETE ────────────────────────────────────────────────────────────────────
const softDeleteNotification = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const notification_id = req.params.notification_id;
    try {
      const notification = yield notification_1.default.softDeleteNotification(notification_id);
      return notification ? res.status(200).json(notification) : res.status(404).json({ message: 'not found' });
    } catch (error) {
      return res.status(500).json({ error });
    }
  });
const restoreNotification = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const notification_id = req.params.notification_id;
    try {
      const notification = yield notification_1.default.restoreNotification(notification_id);
      return notification ? res.status(201).json(notification) : res.status(404).json({ message: 'not found' });
    } catch (error) {
      return res.status(500).json({ error });
    }
  });
const hardDeleteNotification = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const notification_id = req.params.notification_id;
    try {
      const notification = yield notification_1.default.hardDeleteNotification(notification_id);
      return notification ? res.status(200).json(notification) : res.status(404).json({ message: 'not found' });
    } catch (error) {
      return res.status(500).json({ error });
    }
  });
exports.default = {
  createNotification,
  readNotification,
  readDeletedNotification,
  readAll,
  readAllDeleted,
  readByCustomer,
  readUnreadByCustomer,
  countUnread,
  updateNotification,
  markAsRead,
  markAllAsRead,
  softDeleteNotification,
  restoreNotification,
  hardDeleteNotification
};
//# sourceMappingURL=notification.js.map
