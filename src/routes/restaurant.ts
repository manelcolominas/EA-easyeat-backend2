import express from 'express';
import controller from '../controllers/restaurant';
import { Schemas, ValidateJoi } from '../middleware/joi';
import { authenticate, requireRole, requireRestaurantAccess } from '../middleware/auth';

const router = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Restaurant:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "64a1f2b3c4d5e6f7a8b9c0d1"
 *         profile:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             description:
 *               type: string
 *             globalRating:
 *               type: number
 *             category:
 *               type: array
 *               items:
 *                 type: string
 *             timetable:
 *               type: object
 *               properties:
 *                 monday:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       open:
 *                         type: string
 *                       close:
 *                         type: string
 *                 tuesday:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       open:
 *                         type: string
 *                       close:
 *                         type: string
 *                 wednesday:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       open:
 *                         type: string
 *                       close:
 *                         type: string
 *                 thursday:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       open:
 *                         type: string
 *                       close:
 *                         type: string
 *                 friday:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       open:
 *                         type: string
 *                       close:
 *                         type: string
 *                 saturday:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       open:
 *                         type: string
 *                       close:
 *                         type: string
 *                 sunday:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       open:
 *                         type: string
 *                       close:
 *                         type: string
 *             image:
 *               type: array
 *               items:
 *                 type: string
 *             contact:
 *               type: object
 *               properties:
 *                 phone:
 *                   type: string
 *                 email:
 *                   type: string
 *             location:
 *               type: object
 *               properties:
 *                 city:
 *                   type: string
 *                 address:
 *                   type: string
 *                 googlePlaceId:
 *                   type: string
 *                 coordinates:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum: [Point]
 *                     coordinates:
 *                       type: array
 *                       items:
 *                         type: number
 *                       minItems: 2
 *                       maxItems: 2
 *         employees:
 *           type: array
 *           items:
 *             type: string
 *         dishes:
 *           type: array
 *           items:
 *             type: string
 *         rewards:
 *           type: array
 *           items:
 *             type: string
 *         statistics:
 *           type: string
 *         badges:
 *           type: array
 *           items:
 *             type: string
 *         reviews: 
 *           type: array
 *           items:
 *             type: string
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: "null = active; ISO date = soft-deleted at that timestamp"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     PaginatedRestaurants:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Restaurant'
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
 *     PaginatedCustomers:
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
 */

/**
 * @openapi
 * /restaurants:
 *   post:
 *     summary: Creates a restaurant
 *     tags: [Restaurants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - profile
 *             properties:
 *               profile:
 *                 type: object
 *                 required:
 *                   - name
 *                   - description
 *                   - category
 *                   - location
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: "La Pepita"
 *                   description:
 *                     type: string
 *                     example: "Cuina Catalana"
 *                   category:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["Espanyol"]
 *                   location:
 *                     type: object
 *                     required:
 *                       - city
 *                     properties:
 *                       city:
 *                         type: string
 *                         example: "Barcelona"
 *     responses:
 *       201:
 *         description: Restaurant created
 *       409:
 *         description: A restaurant with this name already exists in this city
 *       422:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', ValidateJoi(Schemas.restaurant.create), controller.createRestaurant);

/**
 * @openapi
 * /restaurants:
 *   get:
 *     summary: Lists all restaurants (paginated)
 *     tags: [Restaurants]
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedRestaurants'
 */
router.get('/', controller.readAll);

/**
 * @openapi
 * /restaurants/deleted:
 *   get:
 *     summary: Lists all deleted restaurants (paginated)
 *     tags: [Restaurants]
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedRestaurants'
 */
router.get('/deleted', authenticate, requireRole('admin'),controller.readAllDeleted);

/**
 * @openapi
 * /restaurants/filter:
 *   get:
 *     summary: Gets a filtered list of restaurants
 *     tags: [Restaurants]
 *     parameters:
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *         description: admin longitude (required if lat is provided)
 *         example: 2.1734
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *         description: admin latitude (required if lng is provided)
 *         example: 41.3851
 *       - in: query
 *         name: radiusMeters
 *         schema:
 *           type: number
 *           default: 5000
 *         description: Search radius in metres (only used when lng/lat are provided)
 *         example: 3000
 *       - in: query
 *         name: categories
 *         schema:
 *           type: string
 *         description: Comma-separated list of categories (must match schema enum)
 *         example: "Italià,Sushi"
 *       - in: query
 *         name: minglobalRating
 *         schema:
 *           type: number
 *           minimum: 0
 *           maximum: 10
 *         description: Minimum globalRating (inclusive)
 *         example: 7
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city name (case-insensitive)
 *         example: "Barcelona"
 *       - in: query
 *         name: openNow
 *         schema:
 *           type: boolean
 *           default: false
 *         description: If true, returns only restaurants open at the current time
 *         example: true
 *       - in: query
 *         name: openAt
 *         schema:
 *           type: string
 *           format: date-time
 *         description: ISO datetime — returns restaurants open at this specific time (overrides openNow)
 *         example: "2025-06-14T20:30:00"
 *     responses:
 *       200:
 *         description: List of matching restaurants, sorted by distance (if geo) or globalRating
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Restaurant'
 *                   - type: object
 *                     properties:
 *                       distance:
 *                         type: number
 *                         description: Distance in metres from the provided coordinates (only present when lng/lat are given)
 *                         example: 842.5
 *       500:
 *         description: Internal server error
 */
router.get('/filter', controller.getFiltered);

/**
 * @openapi
 * /restaurants/{restaurantId}:
 *   get:
 *     summary: Gets a restaurant by ID thought for the app mobile
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: The restaurant's ObjectId
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Restaurant'
 *       404:
 *         description: Restaurant not found
 */
router.get('/:restaurantId', controller.readRestaurant);

/**
 * @openapi
 * /restaurants/{restaurantId}/deleted:
 *   get:
 *     summary: Gets a deleted restaurant by ID
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: The restaurant's ObjectId
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Restaurant'
 *       404:
 *         description: Deleted restaurant not found
 */
router.get('/:restaurantId/deleted', authenticate, requireRole('admin'),controller.readDeletedRestaurant);

/**
 * @openapi
 * /restaurants/{restaurantId}/full:
 *   get:
 *     summary: Gets a restaurant with all populated fields thought for the backoffice
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: The restaurant's ObjectId
 *     responses:
 *       200:
 *         description: Restaurant with populated relations
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Restaurant'
 *       404:
 *         description: Restaurant not found
 */
router.get('/:restaurantId/full', controller.getRestaurantFull);

/**
 * @openapi
 * /restaurants/{restaurantId}/full/deleted:
 *   get:
 *     summary: Gets a deleted restaurant with all populated fields
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: The restaurant's ObjectId
 *     responses:
 *       200:
 *         description: Restaurant with populated relations
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Restaurant'
 *       404:
 *         description: Deleted restaurant not found
 */
router.get('/:restaurantId/full/deleted', authenticate, requireRole('admin'), controller.getDeletedRestaurantFull);

/**
 * @openapi
 * /restaurants/{restaurantId}:
 *   put:
 *     summary: Updates a restaurant by ID
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: The restaurant's ObjectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profile:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   globalRating:
 *                     type: number
 *                     minimum: 0
 *                     maximum: 10
 *                   category:
 *                     type: array
 *                     items:
 *                       type: string
 *                   timetable:
 *                     type: object
 *                     properties:
 *                       monday:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             open:
 *                               type: string
 *                             close:
 *                               type: string
 *                       tuesday:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             open:
 *                               type: string
 *                             close:
 *                               type: string
 *                       wednesday:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             open:
 *                               type: string
 *                             close:
 *                               type: string
 *                       thursday:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             open:
 *                               type: string
 *                             close:
 *                               type: string
 *                       friday:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             open:
 *                               type: string
 *                             close:
 *                               type: string
 *                       saturday:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             open:
 *                               type: string
 *                             close:
 *                               type: string
 *                       sunday:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             open:
 *                               type: string
 *                             close:
 *                               type: string
 *                   image:
 *                     type: array
 *                     items:
 *                       type: string
 *                       format: uri
 *                   contact:
 *                     type: object
 *                     properties:
 *                       phone:
 *                         type: string
 *                       email:
 *                         type: string
 *                         format: email
 *                   location:
 *                     type: object
 *                     properties:
 *                       city:
 *                         type: string
 *                       address:
 *                         type: string
 *                       googlePlaceId:
 *                         type: string
 *                       coordinates:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             enum: [Point]
 *                           coordinates:
 *                             type: array
 *                             items:
 *                               type: number
 *                             minItems: 2
 *                             maxItems: 2
 *               employees:
 *                 type: array
 *                 items:
 *                   type: string
 *               dishes:
 *                 type: array
 *                 items:
 *                   type: string
 *               rewards:
 *                 type: array
 *                 items:
 *                   type: string
 *               statistics:
 *                 type: string
 *               badges:
 *                 type: array
 *                 items:
 *                   type: string
 *           example:
 *             profile:
 *               name: "La Pepita"
 *               description: "Cuina catalana de mercat amb productes locals"
 *               globalRating: 4.5
 *               category: ["Espanyol", "Taperia", "Wine Bar"]
 *               timetable:
 *                 monday: []
 *                 tuesday:
 *                   - open: "13:00"
 *                     close: "16:00"
 *                   - open: "20:00"
 *                     close: "23:00"
 *                 wednesday:
 *                   - open: "13:00"
 *                     close: "16:00"
 *                   - open: "20:00"
 *                     close: "23:00"
 *                 thursday:
 *                   - open: "13:00"
 *                     close: "16:00"
 *                   - open: "20:00"
 *                     close: "23:00"
 *                 friday:
 *                   - open: "13:00"
 *                     close: "16:00"
 *                   - open: "20:00"
 *                     close: "23:30"
 *                 saturday:
 *                   - open: "13:00"
 *                     close: "23:30"
 *                 sunday: []
 *               image:
 *                 - "https://example.com/images/lapepita1.jpg"
 *                 - "https://example.com/images/lapepita2.jpg"
 *               contact:
 *                 phone: "+34 931 234 567"
 *                 email: "info@lapepita.cat"
 *               location:
 *                 city: "Barcelona"
 *                 address: "Carrer de Provença, 123"
 *                 googlePlaceId: "ChIJd8BlQ2BZwokRAFUEcm_qrcA"
 *                 coordinates:
 *                   type: "Point"
 *                   coordinates: [2.1734, 41.3851]
 *             employees:
 *               - "64a1f2b3c4d5e6f7a8b9c0d1"
 *             dishes:
 *               - "64a1f2b3c4d5e6f7a8b9c0d2"
 *             rewards:
 *               - "64a1f2b3c4d5e6f7a8b9c0d3"
 *             statistics: "64a1f2b3c4d5e6f7a8b9c0d4"
 *             badges:
 *               - "64a1f2b3c4d5e6f7a8b9c0d5"
 *     responses:
 *       200:
 *         description: Updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Restaurant'
 *       404:
 *         description: Restaurant not found
 *       422:
 *         description: Validation failed (Joi)
 */
router.put('/:restaurantId', ValidateJoi(Schemas.restaurant.update), controller.updateRestaurant);

// ─────────────────────────────────────────────────────────────────────────────
// Lifecycle  (soft-delete / restore / hard-delete)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /restaurants/{restaurantId}/soft:
 *   delete:
 *     summary: Soft-deletes a restaurant
 *     description: >
 *       Sets `deletedAt` to the current timestamp. The restaurant is hidden from
 *       all normal queries but remains in the database and can be restored.
 *       Returns 404 if the restaurant is not found or is already deactivated.
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: The restaurant's ObjectId
 *     responses:
 *       200:
 *         description: Restaurant deactivated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Restaurant deactivated."
 *                 restaurant:
 *                   $ref: '#/components/schemas/Restaurant'
 *       404:
 *         description: Restaurant not found or already deactivated
 *       500:
 *         description: Internal server error
 */
router.delete('/:restaurantId/soft', controller.softDelete);

/**
 * @openapi
 * /restaurants/{restaurantId}/restore:
 *   patch:
 *     summary: Restores a soft-deleted restaurant
 *     description: >
 *       Clears `deletedAt`, making the restaurant visible again in normal queries.
 *       Returns 404 if the restaurant is not found or is already active.
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: The restaurant's ObjectId
 *     responses:
 *       200:
 *         description: Restaurant restored
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Restaurant restored."
 *                 restaurant:
 *                   $ref: '#/components/schemas/Restaurant'
 *       404:
 *         description: Restaurant not found or already active
 *       500:
 *         description: Internal server error
 */
router.patch('/:restaurantId/restore', controller.restore);

/**
 * @openapi
 * /restaurants/{restaurantId}/hard:
 *   delete:
 *     summary: Permanently deletes a restaurant
 *     description: >
 *       Irreversibly removes the document from the database.
 *       Use only for admin operations or GDPR erasure requests.
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: The restaurant's ObjectId
 *     responses:
 *       200:
 *         description: Restaurant permanently deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Restaurant permanently deleted."
 *                 restaurant:
 *                   $ref: '#/components/schemas/Restaurant'
 *       404:
 *         description: Restaurant not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:restaurantId/hard', controller.hardDelete);

// ─────────────────────────────────────────────────────────────────────────────
// Read variants
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /restaurants/{restaurantId}/badges:
 *   get:
 *     summary: Gets all badges of a restaurant
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of badges
 *       404:
 *         description: Restaurant not found
 */
router.get('/:restaurantId/badges', controller.getBadges);

/**
 * @openapi
 * /restaurants/{restaurantId}/badges/deleted:
 *   get:
 *     summary: Gets all badges of a deleted restaurant
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of badges
 *       404:
 *         description: Deleted restaurant not found
 */
router.get('/:restaurantId/badges/deleted', authenticate, requireRole('admin'), controller.getDeletedRestaurantBadges);

/**
 * @openapi
 * /restaurants/{restaurantId}/statistics:
 *   get:
 *     summary: Gets the statistics of a restaurant
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Restaurant statistics
 *       404:
 *         description: Restaurant not found
 */
router.get(
    '/:restaurantId/statistics', authenticate, requireRole('admin', 'owner'),
    requireRestaurantAccess('restaurantId'), controller.getStatistics
);

/**
 * @openapi
 * /restaurants/{restaurantId}/statistics/deleted:
 *   get:
 *     summary: Gets the statistics of a deleted restaurant
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted restaurant statistics
 *       404:
 *         description: Deleted restaurant not found
 */
router.get('/:restaurantId/statistics/deleted', authenticate, requireRole('admin'), controller.getDeletedRestaurantStatistics);

/**
 * @openapi
 * /restaurants/{restaurantId}/employees:
 *   get:
 *     summary: Gets the employees of a restaurant
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Restaurant employees
 *       404:
 *         description: Restaurant not found
 */
router.get('/:restaurantId/employees', authenticate, requireRole('admin', 'owner'),
    requireRestaurantAccess('restaurantId'),
    controller.getEmployees
);

/**
 * @openapi
 * /restaurants/{restaurantId}/employees/deleted:
 *   get:
 *     summary: Gets the employees of a deleted restaurant
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted restaurant employees
 *       404:
 *         description: Deleted restaurant not found
 */
router.get('/:restaurantId/employees/deleted', authenticate, requireRole('admin'), controller.getDeletedRestaurantEmployees);

/**
 * @openapi
 * /restaurants/{restaurantId}/dishes:
 *   get:
 *     summary: Gets the dishes of a restaurant
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Restaurant dishes
 *       404:
 *         description: Restaurant not found
 */
router.get('/:restaurantId/dishes', controller.getDishes);

/**
 * @openapi
 * /restaurants/{restaurantId}/dishes/deleted:
 *   get:
 *     summary: Gets the dishes of a deleted restaurant
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted restaurant dishes
 *       404:
 *         description: Deleted restaurant not found
 */
router.get('/:restaurantId/dishes/deleted', authenticate, requireRole('admin'), controller.getDeletedRestaurantDishes);

/**
 * @openapi
 * /restaurants/{restaurantId}/rewards:
 *   get:
 *     summary: Gets the rewards of a restaurant
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Restaurant dishes
 *       404:
 *         description: Restaurant not found
 */
router.get('/:restaurantId/rewards',    controller.getRewards);

/**
 * @openapi
 * /restaurants/{restaurantId}/rewards/deleted:
 *   get:
 *     summary: Gets the rewards of a deleted restaurant
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted restaurant rewards
 *       404:
 *         description: Deleted restaurant not found
 */
router.get('/:restaurantId/rewards/deleted', authenticate, requireRole('admin'), controller.getDeletedRestaurantRewards);

/**
 * @openapi
 * /restaurants/{restaurantId}/visits:
 *   get:
 *     summary: Gets the visits of a restaurant
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Restaurant visits
 *       404:
 *         description: Restaurant not found
 */
router.get('/:restaurantId/visits',     controller.getVisits);

/**
 * @openapi
 * /restaurants/{restaurantId}/visits/deleted:
 *   get:
 *     summary: Gets the visits of a deleted restaurant
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted restaurant visits
 *       404:
 *         description: Deleted restaurant not found
 */
router.get('/:restaurantId/visits/deleted', authenticate, requireRole('admin'), controller.getDeletedRestaurantVisits);

/**
 * @openapi
 * /restaurants/{restaurantId}/reviews:
 *   get:
 *     summary: Gets the reviews of a restaurant
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Restaurant reviews
 *       404:
 *         description: Restaurant not found
 */
router.get('/:restaurantId/reviews', controller.getReviews);

/**
 * @openapi
 * /restaurants/{restaurantId}/reviews/deleted:
 *   get:
 *     summary: Gets the reviews of a deleted restaurant
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted restaurant reviews
 *       404:
 *         description: Deleted restaurant not found
 */
router.get('/:restaurantId/reviews/deleted', authenticate, requireRole('admin'), controller.getDeletedRestaurantReviews);

/**
 * @openapi
 * /restaurants/{restaurantId}/customers:
 *   get:
 *     summary: Gets the customers of a restaurant (paginated)
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: restaurantId
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
 *         description: List of customers
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedCustomers'
 *       404:
 *         description: Restaurant not found
 */
router.get('/:restaurantId/customers', controller.getRestaurantCustomers);

/**
 * @openapi
 * /restaurants/{restaurantId}/customers/deleted:
 *   get:
 *     summary: Gets the customers of a deleted restaurant (paginated)
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: restaurantId
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
 *         description: List of customers
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedCustomers'
 *       404:
 *         description: Restaurant not found
 */
router.get('/:restaurantId/customers/deleted', authenticate, requireRole('admin'), controller.getDeletedRestaurantCustomers);

/**
 * @openapi
 * /restaurants/{restaurantId}/top-dish:
 *   get:
 *     summary: Gets the top-rated dish for a restaurant
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: The restaurant's ObjectId
 *     responses:
 *       200:
 *         description: Top-rated dish
 *       404:
 *         description: No rated dishes found for this restaurant
 */
router.get('/:restaurantId/top-dish', controller.getTopDish);

export default router;
