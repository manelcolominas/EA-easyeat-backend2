import { NextFunction, Request, Response } from 'express';
import NotificationService from '../services/notification';
import { getPaginationOptions } from '../utils/pagination';

// ─── CREATE ────────────────────────────────────────────────────────────────────

const createNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const savedNotification = await NotificationService.createNotification(req.body);
    return res.status(201).json(savedNotification);
  } catch (error) {
    return res.status(500).json({ error });
  }
};

// ─── READ ──────────────────────────────────────────────────────────────────────

const readNotification = async (req: Request, res: Response, next: NextFunction) => {
  const notification_id = req.params.notification_id;

  try {
    const notification = await NotificationService.getNotification(notification_id);
    return notification ? res.status(200).json(notification) : res.status(404).json({ message: 'not found' });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

const readDeletedNotification = async (req: Request, res: Response, next: NextFunction) => {
  const notification_id = req.params.notification_id;

  try {
    const notification = await NotificationService.getDeletedNotification(notification_id);
    return notification ? res.status(200).json(notification) : res.status(404).json({ message: 'not found' });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

const readAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = getPaginationOptions(req.query);
    const { notifications, total } = await NotificationService.getAllNotifications(skip, limit);
    return res.status(200).json({
      data: notifications,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

const readAllDeleted = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = getPaginationOptions(req.query);
    const { notifications, total } = await NotificationService.getAllDeletedNotifications(skip, limit);
    return res.status(200).json({
      data: notifications,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

// ─── READ BY CUSTOMER ─────────────────────────────────────────────────────────

const readByCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { customer_id } = req.params;
    const { page, limit, skip } = getPaginationOptions(req.query);
    const { notifications, total } = await NotificationService.getByCustomer(customer_id, skip, limit);

    return res.status(200).json({
      data: notifications,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

const readUnreadByCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { customer_id } = req.params;
    const { page, limit, skip } = getPaginationOptions(req.query);
    const { notifications, total } = await NotificationService.getUnreadByCustomer(customer_id, skip, limit);

    return res.status(200).json({
      data: notifications,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

const countUnread = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { customer_id } = req.params;
    const count = await NotificationService.countUnreadByCustomer(customer_id);
    return res.status(200).json({ unreadCount: count });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

// ─── UPDATE ────────────────────────────────────────────────────────────────────

const updateNotification = async (req: Request, res: Response, next: NextFunction) => {
  const notification_id = req.params.notification_id;
  try {
    const updatedNotification = await NotificationService.updateNotification(notification_id, req.body);
    return updatedNotification ? res.status(201).json(updatedNotification) : res.status(404).json({ message: 'not found' });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  const notification_id = req.params.notification_id;
  try {
    const notification = await NotificationService.markAsRead(notification_id);
    return notification ? res.status(200).json(notification) : res.status(404).json({ message: 'not found' });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

const markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { customer_id } = req.params;
    const result = await NotificationService.markAllAsReadByCustomer(customer_id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error });
  }
};

// ─── DELETE ────────────────────────────────────────────────────────────────────

const softDeleteNotification = async (req: Request, res: Response, next: NextFunction) => {
  const notification_id = req.params.notification_id;
  try {
    const notification = await NotificationService.softDeleteNotification(notification_id);
    return notification ? res.status(200).json(notification) : res.status(404).json({ message: 'not found' });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

const restoreNotification = async (req: Request, res: Response, next: NextFunction) => {
  const notification_id = req.params.notification_id;
  try {
    const notification = await NotificationService.restoreNotification(notification_id);
    return notification ? res.status(201).json(notification) : res.status(404).json({ message: 'not found' });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

const hardDeleteNotification = async (req: Request, res: Response, next: NextFunction) => {
  const notification_id = req.params.notification_id;
  try {
    const notification = await NotificationService.hardDeleteNotification(notification_id);
    return notification ? res.status(200).json(notification) : res.status(404).json({ message: 'not found' });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

export default {
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
