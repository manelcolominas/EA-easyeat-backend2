"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const review_1 = __importDefault(require("../controllers/review"));
const joi_1 = require("../middleware/joi");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
/**
 * @openapi
 * tags:
 *   - name: Reviews
 *     description: CRUD endpoints for reviews
 *
 * components:
 *   schemas:
 *     ratings:
 *       type: object
 *       properties:
 *         foodQuality:
 *           type: number
 *           example: 8
 *         staffService:
 *           type: number
 *           example: 9
 *         cleanliness:
 *           type: number
 *           example: 7
 *         environment:
 *           type: number
 *           example: 8
 *
 *     Review:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         customer_id:
 *           type: string
 *           description: Customer ObjectId
 *         restaurant_id:
 *           type: string
 *           description: Restaurant ObjectId
 *         date:
 *           type: string
 *           format: date
 *         globalRating:
 *           type: number
 *           example: 9
 *         ratings:
 *           $ref: '#/components/schemas/ratings'
 *         comment:
 *           type: string
 *           example: "Amazing food!"
 *         likes:
 *           type: number
 *           example: 10
 *
 *     ReviewCreateUpdate:
 *       type: object
 *       required:
 *         - customer_id
 *         - restaurant_id
 *         - globalRating
 *       properties:
 *         customer_id:
 *           type: string
 *         restaurant_id:
 *           type: string
 *         date:
 *           type: string
 *           format: date
 *         globalRating:
 *           type: number
 *           minimum: 1
 *           maximum: 10
 *         ratings:
 *           $ref: '#/components/schemas/ratings'
 *         comment:
 *           type: string
 *         likes:
 *           type: number
 *           example: 10
 */
/**
 * @openapi
 * /reviews:
 *   post:
 *     summary: Creates a review
 *     tags: [Reviews]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReviewCreateUpdate'
 *     responses:
 *       201:
 *         description: Created
 *       422:
 *         description: Validation error
 */
router.post('/', auth_1.authenticate, (0, auth_1.requireRole)('customer', 'admin'), (0, joi_1.ValidateJoi)(joi_1.Schemas.review.create), review_1.default.createReview);
/**
 * @openapi
 * /reviews:
 *   get:
 *     summary: Lists all reviews
 *     tags: [Reviews]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: List of reviews
 */
router.get('/', auth_1.authenticate, (0, auth_1.requireRole)('admin', 'owner', 'staff'), review_1.default.readAll);
/**
 * @openapi
 * /reviews/deleted:
 *   get:
 *     summary: Lists all deleted reviews
 *     tags: [Reviews]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: List of deleted reviews
 */
router.get('/deleted', auth_1.authenticate, (0, auth_1.requireRole)('admin'), review_1.default.readAllDeleted);
// ========================
// GET BY RESTAURANT
// ========================
/**
 * @openapi
 * /reviews/restaurant/{restaurant_id}:
 *   get:
 *     summary: Get reviews by restaurant
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: restaurant_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: List of reviews
 */
router.get('/restaurant/:restaurant_id', review_1.default.readByRestaurant);
/**
 * @openapi
 * /reviews/restaurant/{restaurant_id}/deleted:
 *   get:
 *     summary: Get deleted reviews by restaurant
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: restaurant_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: List of deleted reviews
 */
router.get('/restaurant/:restaurant_id/deleted', auth_1.authenticate, (0, auth_1.requireRole)('admin', 'owner', 'staff'), review_1.default.readDeletedByRestaurant);
// ========================
// GET BY CUSTOMER
// ========================
/**
 * @openapi
 * /reviews/customer/{customer_id}:
 *   get:
 *     summary: Get reviews by customer
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: customer_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 0
 *       - in: query
 *         name: minGlobalRating
 *         schema:
 *           type: number
 *       - in: query
 *         name: sortByLikes
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of reviews
 */
router.get('/customer/:customer_id', auth_1.authenticate, (0, auth_1.requireCustomerAccess)('customer_id'), review_1.default.readByCustomer);
/**
 * @openapi
 * /reviews/customer/{customer_id}/deleted:
 *   get:
 *     summary: Get deleted reviews by customer
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: customer_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 0
 *       - in: query
 *         name: minGlobalRating
 *         schema:
 *           type: number
 *       - in: query
 *         name: sortByLikes
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of deleted reviews
 */
router.get('/customer/:customer_id/deleted', auth_1.authenticate, (0, auth_1.requireRole)('admin', 'owner', 'staff'), review_1.default.readDeletedByCustomer);
// ========================
// GET ONE
// ========================
/**
 * @openapi
 * /reviews/{review_id}:
 *   get:
 *     summary: Get review by ID
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: review_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review found
 *       404:
 *         description: Not found
 */
router.get('/:review_id', review_1.default.readReview);
/**
 * @openapi
 * /reviews/{review_id}/deleted:
 *   get:
 *     summary: Get deleted review by ID
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: review_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review found
 *       404:
 *         description: Not found
 */
router.get('/:review_id/deleted', auth_1.authenticate, (0, auth_1.requireRole)('admin'), review_1.default.readDeletedReview);
// ========================
// UPDATE
// ========================
/**
 * @openapi
 * /reviews/{review_id}:
 *   put:
 *     summary: Update review
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: review_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Not found
 */
router.put('/:review_id', auth_1.authenticate, (0, auth_1.requireRole)('customer', 'admin'), (0, joi_1.ValidateJoi)(joi_1.Schemas.review.update), review_1.default.updateReview);
// ========================
// DELETE
// ========================
/**
 * @openapi
 * /reviews/{review_id}/soft:
 *   delete:
 *     summary: Delete review
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: review_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 *       404:
 *         description: Not found
 */
router.delete('/:review_id/soft', auth_1.authenticate, (0, auth_1.requireSelfOrAdmin)('customer_id'), review_1.default.softDeleteReview);
/**
 * @openapi
 * /reviews/{review_id}/restore:
 *   patch:
 *     summary: Restore review
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: review_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Restored
 *       404:
 *         description: Not found
 */
router.patch('/:review_id/restore', auth_1.authenticate, (0, auth_1.requireRole)('admin'), review_1.default.restoreReview);
/**
 * @openapi
 * /reviews/{review_id}/hard:
 *   delete:
 *     summary: Hard delete review
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: review_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 *       404:
 *         description: Not found
 */
router.delete('/:review_id/hard', auth_1.authenticate, (0, auth_1.requireRole)('admin'), review_1.default.hardDeleteReview);
exports.default = router;
//# sourceMappingURL=review.js.map