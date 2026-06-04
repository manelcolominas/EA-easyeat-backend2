import express from 'express';
import controller from '../controllers/notification';
import { Schemas, ValidateJoi } from '../middleware/joi';
import { authenticate, requireRole, requireSelfOrAdmin } from '../middleware/auth';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Notifications
 *     description: CRUD endpoints for notifications
 *
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB ObjectId
 *           example: "65f1c2a1b2c3d4e5f6789020"
 *         customer_id:
 *           type: string
 *           description: Customer ObjectId
 *           example: "65f1c2a1b2c3d4e5f6789013"
 *         restaurant_id:
 *           type: string
 *           description: Restaurant ObjectId (optional)
 *           example: "65f1c2a1b2c3d4e5f6789010"
 *         type:
 *           type: string
 *           enum: [points_expiring, new_reward, new_dish, reactivation_offer, promotion, new_message, review_liked, points_awarded]
 *           example: "new_reward"
 *         title:
 *           type: string
 *           example: "Nova recompensa disponible"
 *         message:
 *           type: string
 *           example: "Tens una nova recompensa desblocat al teu restaurant favorit"
 *         isRead:
 *           type: boolean
 *           example: false
 *         readAt:
 *           type: string
 *           format: date-time
 *         fcmSent:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     NotificationCreate:
 *       type: object
 *       required:
 *         - customer_id
 *         - type
 *         - title
 *         - message
 *       properties:
 *         customer_id:
 *           type: string
 *         restaurant_id:
 *           type: string
 *         type:
 *           type: string
 *           enum: [points_expiring, new_reward, new_dish, reactivation_offer, promotion, new_message, review_liked, points_awarded]
 *         title:
 *           type: string
 *         message:
 *           type: string
 *         description:
 *           type: string
 *         data:
 *           type: object
 */

/**
 * @openapi
 * /notifications:
 *   post:
 *     summary: Creates a notification
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotificationCreate'
 *     responses:
 *       201:
 *         description: Created
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Validation failed
 */
router.post('/', authenticate, requireRole('admin', 'owner'), controller.createNotification);

/**
 * @openapi
 * /notifications:
 *   get:
 *     summary: Lists all notifications
 *     tags: [Notifications]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/', controller.readAll);

/**
 * @openapi
 * /notifications/deleted:
 *   get:
 *     summary: Lists all deleted notifications
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/deleted', authenticate, requireRole('admin'), controller.readAllDeleted);

/**
 * @openapi
 * /notifications/customer/{customer_id}:
 *   get:
 *     summary: Lists notifications for a customer
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customer_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/customer/:customer_id', authenticate, requireSelfOrAdmin('customer_id'), controller.readByCustomer);

/**
 * @openapi
 * /notifications/customer/{customer_id}/unread:
 *   get:
 *     summary: Lists unread notifications for a customer
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customer_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/customer/:customer_id/unread', authenticate, requireSelfOrAdmin('customer_id'), controller.readUnreadByCustomer);

/**
 * @openapi
 * /notifications/customer/{customer_id}/count-unread:
 *   get:
 *     summary: Get unread notification count for a customer
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customer_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/customer/:customer_id/count-unread', authenticate, requireSelfOrAdmin('customer_id'), controller.countUnread);

/**
 * @openapi
 * /notifications/{notification_id}:
 *   get:
 *     summary: Gets a notification by ID
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: notification_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 */
router.get('/:notification_id', controller.readNotification);

/**
 * @openapi
 * /notifications/{notification_id}/deleted:
 *   get:
 *     summary: Gets a deleted notification by ID
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notification_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/:notification_id/deleted', authenticate, requireRole('admin'), controller.readDeletedNotification);

/**
 * @openapi
 * /notifications/{notification_id}:
 *   put:
 *     summary: Updates a notification
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notification_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotificationCreate'
 *     responses:
 *       201:
 *         description: Updated
 *       404:
 *         description: Not found
 */
router.put('/:notification_id', authenticate, requireRole('admin', 'owner'), controller.updateNotification);

/**
 * @openapi
 * /notifications/{notification_id}/read:
 *   patch:
 *     summary: Marks a notification as read
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notification_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.patch('/:notification_id/read', authenticate, controller.markAsRead);

/**
 * @openapi
 * /notifications/customer/{customer_id}/read-all:
 *   patch:
 *     summary: Marks all notifications as read for a customer
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customer_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.patch('/customer/:customer_id/read-all', authenticate, requireSelfOrAdmin('customer_id'), controller.markAllAsRead);

/**
 * @openapi
 * /notifications/{notification_id}/soft:
 *   delete:
 *     summary: Soft deletes a notification
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notification_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.delete('/:notification_id/soft', authenticate, controller.softDeleteNotification);

/**
 * @openapi
 * /notifications/{notification_id}/restore:
 *   patch:
 *     summary: Restores a deleted notification
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notification_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Restored
 */
router.patch('/:notification_id/restore', authenticate, requireRole('admin'), controller.restoreNotification);

/**
 * @openapi
 * /notifications/{notification_id}/hard:
 *   delete:
 *     summary: Hard deletes a notification
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notification_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.delete('/:notification_id/hard', authenticate, requireRole('admin'), controller.hardDeleteNotification);

export default router;
