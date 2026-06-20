"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const customer_1 = __importDefault(require("../controllers/customer"));
const customerStats_1 = __importDefault(require("../controllers/customerStats"));
const joi_1 = require("../middleware/joi");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
/**
 * Middleware personalizado para clientes.
 *
 * Permite acceso a:
 * 1. El propio cliente, si el ID del token coincide con el customer_id de la URL.
 * 2. Usuarios del dashboard: admin, owner, employee o staff.
 *
 * Esto arregla el error:
 * "Access denied: You can only access your own data"
 *
 * Ese error ocurría porque requireCustomerAccess solo permitía que
 * un cliente viera sus propios datos, pero en el dashboard un owner/admin/staff
 * necesita poder ver la ficha completa de los clientes.
 */
const requireCustomerSelfOrDashboardUser = (paramName) => {
    return (req, res, next) => {
        var _a, _b, _c, _d, _e, _f;
        const customerId = req.params[paramName];
        const user = req.user;
        const userId = ((_b = (_a = user === null || user === void 0 ? void 0 : user._id) === null || _a === void 0 ? void 0 : _a.toString) === null || _b === void 0 ? void 0 : _b.call(_a)) || ((_d = (_c = user === null || user === void 0 ? void 0 : user.id) === null || _c === void 0 ? void 0 : _c.toString) === null || _d === void 0 ? void 0 : _d.call(_c)) || ((_f = (_e = user === null || user === void 0 ? void 0 : user.userId) === null || _e === void 0 ? void 0 : _e.toString) === null || _f === void 0 ? void 0 : _f.call(_e));
        const userRole = user === null || user === void 0 ? void 0 : user.role;
        const isSameCustomer = userId === customerId;
        const isDashboardUser = ['admin', 'owner', 'employee', 'staff'].includes(userRole);
        if (isSameCustomer || isDashboardUser) {
            return next();
        }
        return res.status(403).json({
            message: 'Access denied: You can only access your own data'
        });
    };
};
/**
 * @openapi
 * tags:
 *   - name: Customer
 *     description: CRUD endpoints for customers.
 *
 * components:
 *   schemas:
 *     Customer:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "65f1c2a1b2c3d4e5f6789012"
 *         name:
 *           type: string
 *           example: "Nizar"
 *         email:
 *           type: string
 *           example: "nizar@gmail.com"
 *         isActive:
 *           type: boolean
 *           example: true
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: null
 *         profilePictures:
 *           type: array
 *           items:
 *             type: string
 *         pointsWallet:
 *           type: array
 *           items:
 *             type: string
 *         visitHistory:
 *           type: array
 *           items:
 *             type: string
 *         favoriteRestaurants:
 *           type: array
 *           items:
 *             type: string
 *         badges:
 *           type: array
 *           items:
 *             type: string
 *         reviews:
 *           type: array
 *           items:
 *             type: string
 *
 *     CreateCustomer:
 *       type: object
 *       required:
 *         - name
 *         - email
 *       properties:
 *         name:
 *           type: string
 *           example: "Nizar"
 *         email:
 *           type: string
 *           example: "nizar@gmail.com"
 *         password:
 *           type: string
 *           example: "password123"
 *
 *     PaginatedCustomers:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Customer'
 *         meta:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *             page:
 *               type: integer
 *             limit:
 *               type: integer
 *             totalPages:
 *               type: integer
 *
 *     PaginatedBadges:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             type: object
 *         meta:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *             page:
 *               type: integer
 *             limit:
 *               type: integer
 *             totalPages:
 *               type: integer
 *
 *     PaginatedRestaurants:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             type: object
 *         meta:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *             page:
 *               type: integer
 *             limit:
 *               type: integer
 *             totalPages:
 *               type: integer
 *
 *     PaginatedPointsWallet:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             type: object
 *         meta:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *             page:
 *               type: integer
 *             limit:
 *               type: integer
 *             totalPages:
 *               type: integer
 *
 *     PaginatedReviews:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             type: object
 *         meta:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *             page:
 *               type: integer
 *             limit:
 *               type: integer
 *             totalPages:
 *               type: integer
 *
 *     PaginatedVisits:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             type: object
 *         meta:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *             page:
 *               type: integer
 *             limit:
 *               type: integer
 *             totalPages:
 *               type: integer
 *
 *     CustomerStatistics:
 *       type: object
 *       properties:
 *         totalVisits:
 *           type: integer
 *           example: 15
 *         totalReviews:
 *           type: integer
 *           example: 7
 *         totalFavoriteRestaurants:
 *           type: integer
 *           example: 3
 *         totalBadges:
 *           type: integer
 *           example: 5
 *         totalPoints:
 *           type: integer
 *           example: 1200
 */
// ─── POST /customers ──────────────────────────────────────────────────────────
/**
 * @openapi
 * /customers:
 *   post:
 *     summary: Creates a new customer
 *     tags: [Customer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCustomer'
 *     responses:
 *       201:
 *         description: Created
 *       422:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/', (0, joi_1.ValidateJoi)(joi_1.Schemas.customer.create), customer_1.default.createCustomer);
// ─── GET /customers ───────────────────────────────────────────────────────────
/**
 * @openapi
 * /customers:
 *   get:
 *     summary: Lists all active customers (paginated)
 *     tags: [Customer]
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
 *           default: 20
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedCustomers'
 */
router.get('/', auth_1.authenticate, customer_1.default.readAll);
/**
 * @openapi
 * /customers/deleted:
 *   get:
 *     summary: Lists all deleted customers (paginated)
 *     tags: [Customer]
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
 *           default: 20
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedCustomers'
 */
router.get('/deleted', auth_1.authenticate, (0, auth_1.requireRole)('admin', 'employee', 'owner', 'staff'), customer_1.default.readAllDeleted);
/**
 * =========================
 * GET CUSTOMER BY RESTAURANT
 * =========================
 *
 * IMPORTANTE:
 * Esta ruta debe ir ANTES de /:customer_id.
 *
 * Si se pone después, Express puede interpretar "restaurant" como si fuera
 * un customer_id y la ruta /customers/restaurant/:restaurant_id no funcionará bien.
 */
router.get('/restaurant/:restaurant_id', auth_1.authenticate, (0, auth_1.requireRole)('admin', 'owner', 'employee', 'staff'), customer_1.default.getCustomersByRestaurant);
// ─── GET /customers/:customer_id ───────────────────────────────────────────────
/**
 * @openapi
 * /customers/{customer_id}:
 *   get:
 *     summary: Gets an active customer by ID
 *     tags: [Customer]
 *     parameters:
 *       - in: path
 *         name: customer_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found or soft-deleted
 */
router.get('/:customer_id', auth_1.authenticate, requireCustomerSelfOrDashboardUser('customer_id'), customer_1.default.readCustomer);
/**
 * @openapi
 * /customers/{customer_id}/deleted:
 *   get:
 *     summary: Gets a deleted customer by ID
 *     tags: [Customer]
 *     parameters:
 *       - in: path
 *         name: customer_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 */
router.get('/:customer_id/deleted', auth_1.authenticate, (0, auth_1.requireRole)('admin', 'employee', 'owner', 'staff'), customer_1.default.readDeletedCustomer);
/**
 * @openapi
 * /customers/{customer_id}/full:
 *   get:
 *     summary: Gets a customer with all populated relations
 *     tags: [Customer]
 *     parameters:
 *       - in: path
 *         name: customer_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer with all relations populated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       403:
 *         description: Access denied
 *       404:
 *         description: Customer not found
 */
router.get('/:customer_id/full', auth_1.authenticate, requireCustomerSelfOrDashboardUser('customer_id'), customer_1.default.readCustomerFull);
/**
 * @openapi
 * /customers/{customer_id}/full/deleted:
 *   get:
 *     summary: Gets a deleted customer with all populated relations
 *     tags: [Customer]
 *     parameters:
 *       - in: path
 *         name: customer_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer with all relations populated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Customer not found
 */
router.get('/:customer_id/full/deleted', auth_1.authenticate, (0, auth_1.requireRole)('admin', 'owner', 'employee', 'staff'), customer_1.default.readDeletedCustomerFull);
// ─── GET /customers/:customer_id/statistics ─────────────────────────────────────
/**
 * @openapi
 * /customers/{customer_id}/statistics:
 *   get:
 *     summary: Gets statistics for a customer
 *     tags: [Customer]
 *     parameters:
 *       - in: path
 *         name: customer_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomerStatistics'
 *       404:
 *         description: Customer not found
 */
router.get('/:customer_id/statistics', auth_1.authenticate, (0, auth_1.requireSelfOrAdmin)('customer_id'), customerStats_1.default.getCustomerStatistics);
// ─── GET /customers/:customer_id/badges ─────────────────────────────────────────
/**
 * @openapi
 * /customers/{customer_id}/badges:
 *   get:
 *     summary: Gets all badges earned by the customer (paginated)
 *     tags: [Customer]
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
 *         description: List of badges
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedBadges'
 *       404:
 *         description: Customer not found
 */
router.get('/:customer_id/badges', auth_1.authenticate, requireCustomerSelfOrDashboardUser('customer_id'), customer_1.default.getCustomerAllBadges);
// ─── GET /customers/:customer_id/favouriteRestaurants ─────────────────────────
/**
 * @openapi
 * /customers/{customer_id}/favouriteRestaurants:
 *   get:
 *     summary: Gets all favourite restaurants for the customer (paginated)
 *     tags: [Customer]
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
 *         description: List of favourite restaurants
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedRestaurants'
 *       404:
 *         description: Customer not found
 */
router.get('/:customer_id/favouriteRestaurants', auth_1.authenticate, requireCustomerSelfOrDashboardUser('customer_id'), customer_1.default.getCustomerAllFavouriteRestaurants);
// ─── GET /customers/:customer_id/pointsWallet ─────────────────────────────────
/**
 * @openapi
 * /customers/{customer_id}/pointsWallet:
 *   get:
 *     summary: Gets all points wallet entries for the customer (paginated)
 *     tags: [Customer]
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
 *         description: List of points wallet entries
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedPointsWallet'
 *       404:
 *         description: Customer not found
 */
router.get('/:customer_id/pointsWallet', auth_1.authenticate, requireCustomerSelfOrDashboardUser('customer_id'), customer_1.default.getCustomerAllPointsWallet);
// ─── GET /customers/:customer_id/reviews ──────────────────────────────────────
/**
 * @openapi
 * /customers/{customer_id}/reviews:
 *   get:
 *     summary: Gets all reviews written by the customer (paginated)
 *     tags: [Customer]
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
 *         description: List of reviews
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedReviews'
 *       404:
 *         description: Customer not found
 */
router.get('/:customer_id/reviews', auth_1.authenticate, requireCustomerSelfOrDashboardUser('customer_id'), customer_1.default.getCustomerAllReviews);
// ─── GET /customers/:customer_id/visits ───────────────────────────────────────
/**
 * @openapi
 * /customers/{customer_id}/visits:
 *   get:
 *     summary: Gets all visits for the customer (paginated)
 *     tags: [Customer]
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
 *         description: List of visits
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedVisits'
 *       404:
 *         description: Customer not found
 */
router.get('/:customer_id/visits', auth_1.authenticate, requireCustomerSelfOrDashboardUser('customer_id'), customer_1.default.getCustomerAllVisits);
/**
 * @openapi
 * /customers/{customer_id}/visits/deleted:
 *   get:
 *     summary: Gets all deleted visits for the customer (paginated)
 *     tags: [Customer]
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
 *         description: List of deleted visits
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedVisits'
 *       404:
 *         description: Customer not found
 */
router.get('/:customer_id/visits/deleted', auth_1.authenticate, (0, auth_1.requireRole)('admin', 'employee', 'owner', 'staff'), customer_1.default.getCustomerAllDeletedVisits);
// ─── PUT /customers/:customer_id ──────────────────────────────────────────────
/**
 * @openapi
 * /customers/{customer_id}:
 *   put:
 *     summary: Updates an active customer by ID
 *     tags: [Customer]
 *     parameters:
 *       - in: path
 *         name: customer_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCustomer'
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Not found or already deleted
 *       422:
 *         description: Validation failed
 */
router.put('/:customer_id', auth_1.authenticate, (0, auth_1.requireSelfOrAdmin)('customer_id'), (0, joi_1.ValidateJoi)(joi_1.Schemas.customer.update), customer_1.default.updateCustomer);
// ─── DELETE /customers/:customer_id/soft ──────────────────────────────────────
/**
 * @openapi
 * /customers/{customer_id}/soft:
 *   delete:
 *     summary: Soft-deletes a customer (sets isActive=false, stamps deletedAt)
 *     tags: [Customer]
 *     parameters:
 *       - in: path
 *         name: customer_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer deactivated
 *       404:
 *         description: Not found
 */
router.delete('/:customer_id/soft', auth_1.authenticate, (0, auth_1.requireSelfOrAdmin)('customer_id'), customer_1.default.softDeleteCustomer);
// ─── PATCH /customers/:customer_id/restore ────────────────────────────────────
/**
 * @openapi
 * /customers/{customer_id}/restore:
 *   patch:
 *     summary: Restores a soft-deleted customer
 *     tags: [Customer]
 *     parameters:
 *       - in: path
 *         name: customer_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer restored
 *       404:
 *         description: Not found
 */
router.patch('/:customer_id/restore', auth_1.authenticate, (0, auth_1.requireSelfOrAdmin)('customer_id'), customer_1.default.restoreCustomer);
// ─── DELETE /customers/:customer_id/hard ──────────────────────────────────────
/**
 * @openapi
 * /customers/{customer_id}/hard:
 *   delete:
 *     summary: Permanently deletes a customer (admin only)
 *     tags: [Customer]
 *     parameters:
 *       - in: path
 *         name: customer_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer permanently deleted
 *       404:
 *         description: Not found
 */
router.delete('/:customer_id/hard', auth_1.authenticate, (0, auth_1.requireSelfOrAdmin)('customer_id'), customer_1.default.hardDeleteCustomer);
exports.default = router;
//# sourceMappingURL=customer.js.map