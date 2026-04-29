import express from 'express';
import controller from '../controllers/customer';
import { Schemas, ValidateJoi } from '../middleware/joi';
import { authenticate, requireRole, requireSelfOrAdmin } from '../middleware/auth';

const router = express.Router();

/**
 * =========================
 * CREATE CUSTOMER
 * =========================
 */
router.post(
  '/',
  ValidateJoi(Schemas.customer.create),
  controller.createCustomer
);

/**
 * =========================
 * GET ALL CUSTOMERS 🚀 (SIN AUTH)
 * =========================
 */
router.get(
  '/',
  controller.readAll
);

/**
 * =========================
 * GET DELETED CUSTOMERS
 * =========================
 */
router.get(
  '/deleted',
  authenticate,
  requireRole('admin', 'owner', 'staff'),
  controller.readAllDeleted
);

/**
 * =========================
 * GET CUSTOMER BY ID
 * =========================
 */
router.get(
  '/:customer_id',
  authenticate,
  requireSelfOrAdmin('customer_id'),
  controller.readCustomer
);

/**
 * =========================
 * GET CUSTOMER FULL
 * =========================
 */
router.get(
  '/:customer_id/full',
  authenticate,
  requireSelfOrAdmin('customer_id'),
  controller.readCustomerFull
);

/**
 * =========================
 * GET CUSTOMER BADGES
 * =========================
 */
router.get(
  '/:customer_id/badges',
  authenticate,
  requireSelfOrAdmin('customer_id'),
  controller.getCustomerAllBadges
);

/**
 * =========================
 * GET CUSTOMER RESTAURANTS
 * =========================
 */
router.get(
  '/:customer_id/favouriteRestaurants',
  authenticate,
  requireSelfOrAdmin('customer_id'),
  controller.getCustomerAllFavouriteRestaurants
);

/**
 * =========================
 * GET CUSTOMER WALLET
 * =========================
 */
router.get(
  '/:customer_id/pointsWallet',
  authenticate,
  requireSelfOrAdmin('customer_id'),
  controller.getCustomerAllPointsWallet
);

/**
 * =========================
 * GET CUSTOMER REVIEWS
 * =========================
 */
router.get(
  '/:customer_id/reviews',
  authenticate,
  requireSelfOrAdmin('customer_id'),
  controller.getCustomerAllReviews
);

/**
 * =========================
 * GET CUSTOMER VISITS
 * =========================
 */
router.get(
  '/:customer_id/visits',
  authenticate,
  requireSelfOrAdmin('customer_id'),
  controller.getCustomerAllVisits
);

/**
 * =========================
 * GET CUSTOMER BY RESTAURANT
 * =========================
 */
router.get(
  '/restaurant/:restaurant_id',
  authenticate,
  requireRole('admin', 'owner', 'staff'),
  controller.getCustomersByRestaurant
);
/**
 * =========================
 * UPDATE CUSTOMER
 * =========================
 */
router.put(
  '/:customer_id',
  authenticate,
  requireSelfOrAdmin('customer_id'),
  ValidateJoi(Schemas.customer.update),
  controller.updateCustomer
);

/**
 * =========================
 * SOFT DELETE
 * =========================
 */
router.delete(
  '/:customer_id/soft',
  authenticate,
  requireSelfOrAdmin('customer_id'),
  controller.softDeleteCustomer
);

/**
 * =========================
 * RESTORE CUSTOMER
 * =========================
 */
router.patch(
  '/:customer_id/restore',
  authenticate,
  requireSelfOrAdmin('customer_id'),
  controller.restoreCustomer
);

/**
 * =========================
 * HARD DELETE
 * =========================
 */
router.delete(
  '/:customer_id/hard',
  authenticate,
  requireSelfOrAdmin('customer_id'),
  controller.hardDeleteCustomer
);

export default router;