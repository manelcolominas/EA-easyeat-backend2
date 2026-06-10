import mongoose from 'mongoose';
import { NotificationModel, INotification, NotificationType } from '../models/notification';
import { CustomerDeviceTokenModel } from '../models/customerDeviceToken';
import { sendPushToTokens } from './fcm';

// ─── CREATE ────────────────────────────────────────────────────────────────────

const createNotification = async (data: Partial<INotification>) => {
  const notification = new NotificationModel({
    _id: new mongoose.Types.ObjectId(),
    ...data,
    isRead: false,
    fcmSent: false
  });

  return await notification.save();
};

/**
 * Crear notificació i retornar amb dades poblades
 */
const createNotificationWithPopulate = async (data: Partial<INotification>) => {
  const notification = await createNotification(data);
  return await notification.populate('customer_id', 'name email');
};

// ─── READ ──────────────────────────────────────────────────────────────────────

const getNotification = async (notification_id: string) => {
  return await NotificationModel.findById(notification_id).active();
};

const getDeletedNotification = async (notification_id: string) => {
  return await NotificationModel.findOne({ _id: notification_id, deletedAt: { $ne: null } }).lean();
};

// ─── READ BY CUSTOMER ─────────────────────────────────────────────────────────

const getByCustomer = async (customer_id: string, skip: number, limit: number) => {
  const query = { customer_id, deletedAt: null };
  const [notifications, total] = await Promise.all([NotificationModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean<INotification[]>(), NotificationModel.countDocuments(query)]);
  return { notifications, total };
};

const getUnreadByCustomer = async (customer_id: string, skip: number, limit: number) => {
  const query = { customer_id, isRead: false, deletedAt: null };
  const [notifications, total] = await Promise.all([NotificationModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean<INotification[]>(), NotificationModel.countDocuments(query)]);
  return { notifications, total };
};

const countUnreadByCustomer = async (customer_id: string): Promise<number> => {
  return await NotificationModel.countDocuments({ customer_id, isRead: false, deletedAt: null });
};

// ─── READ BY TYPE ────────────────────────────────────────────────────────────

const getByType = async (type: NotificationType, skip: number, limit: number) => {
  const query = { type, deletedAt: null };
  const [notifications, total] = await Promise.all([NotificationModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean<INotification[]>(), NotificationModel.countDocuments(query)]);
  return { notifications, total };
};

// ─── READ ALL ──────────────────────────────────────────────────────────────────

const getAllNotifications = async (skip: number, limit: number) => {
  const [notifications, total] = await Promise.all([
    NotificationModel.find({ deletedAt: null }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean<INotification[]>(),
    NotificationModel.countDocuments({ deletedAt: null })
  ]);
  return { notifications, total };
};

const getAllDeletedNotifications = async (skip: number, limit: number) => {
  const query = { deletedAt: { $ne: null } };
  const [notifications, total] = await Promise.all([NotificationModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean<INotification[]>(), NotificationModel.countDocuments(query)]);
  return { notifications, total };
};

// ─── UPDATE ────────────────────────────────────────────────────────────────────

const updateNotification = async (notification_id: string, data: Partial<INotification>) => {
  const notification = await NotificationModel.findById(notification_id);

  if (notification) {
    notification.set(data);
    return await notification.save();
  }

  return null;
};

/**
 * Marcar notificació com llegida
 */
const markAsRead = async (notification_id: string) => {
  return await NotificationModel.findByIdAndUpdate(
    notification_id,
    {
      isRead: true,
      readAt: new Date()
    },
    { new: true }
  ).lean();
};

/**
 * Marcar totes les notificacions d'un client com llegides
 */
const markAllAsReadByCustomer = async (customer_id: string) => {
  return await NotificationModel.updateMany(
    { customer_id, isRead: false, deletedAt: null },
    {
      isRead: true,
      readAt: new Date()
    }
  );
};

/**
 * Actualitzar estat d'enviament FCM
 */
const updateFcmStatus = async (notification_id: string, fcmSent: boolean, fcmError?: string) => {
  return await NotificationModel.findByIdAndUpdate(
    notification_id,
    {
      fcmSent,
      fcmSentAt: fcmSent ? new Date() : null,
      fcmError: fcmError || null
    },
    { new: true }
  ).lean();
};

// ─── DELETE ────────────────────────────────────────────────────────────────────

const softDeleteNotification = async (notification_id: string) => {
  return await NotificationModel.findByIdAndUpdate(notification_id, { deletedAt: new Date() }, { new: true }).lean();
};

const restoreNotification = async (notification_id: string) => {
  return await NotificationModel.findByIdAndUpdate(notification_id, { deletedAt: null }, { new: true }).lean();
};

const hardDeleteNotification = async (notification_id: string) => {
  return await NotificationModel.findByIdAndDelete(notification_id);
};

/**
 * Eliminar notificacions antigues (més de X dies)
 */
const deleteOldNotifications = async (daysOld: number = 90) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  return await NotificationModel.deleteMany({
    createdAt: { $lt: cutoffDate },
    deletedAt: { $ne: null }
  });
};

// ─── HELPERS ───────────────────────────────────────────────────────────────────

/**
 * Crear notificacions en bulk per a múltiples clients
 */
const createBulkNotifications = async (customer_ids: string[], notificationData: Omit<INotification, '_id' | 'customer_id' | 'isRead' | 'fcmSent'>) => {
  const documents = customer_ids.map((customer_id) => ({
    _id: new mongoose.Types.ObjectId(),
    customer_id,
    isRead: false,
    fcmSent: false,
    ...notificationData
  }));

  return await NotificationModel.insertMany(documents);
};

const toFcmData = (data?: Record<string, any>) => Object.fromEntries(Object.entries(data ?? {}).map(([key, value]) => [key, value === undefined || value === null ? '' : String(value)]));

const createAndSendNotification = async (data: Partial<INotification>) => {
  const notification = new NotificationModel({
    _id: new mongoose.Types.ObjectId(),
    ...data,
    isRead: false,
    fcmSent: false
  });

  const saved = await notification.save();

  const tokens = await CustomerDeviceTokenModel.find({
    customer_id: saved.customer_id,
    active: true,
    deletedAt: null
  }).distinct('token');

  if (!tokens.length) {
    await NotificationModel.findByIdAndUpdate(saved._id, {
      fcmSent: false,
      fcmError: 'No active device tokens'
    });
    return saved;
  }

  try {
    const result = await sendPushToTokens(tokens, {
      title: saved.title,
      body: saved.message,
      data: {
        notification_id: String(saved._id),
        customer_id: String(saved.customer_id),
        restaurant_id: saved.restaurant_id ? String(saved.restaurant_id) : '',
        type: saved.type,
        ...toFcmData(saved.data)
      }
    });

    await NotificationModel.findByIdAndUpdate(saved._id, {
      fcmSent: result.failureCount === 0,
      fcmSentAt: new Date(),
      fcmError: result.failureCount > 0 ? `Failed tokens: ${result.failedTokens.join(', ')}` : null
    });

    return saved;
  } catch (error: any) {
    await NotificationModel.findByIdAndUpdate(saved._id, {
      fcmSent: false,
      fcmError: error?.message ?? 'Unknown FCM error'
    });
    return saved;
  }
};

export default {
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
