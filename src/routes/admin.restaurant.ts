import express from 'express';
import controller from '../controllers/restaurant';
import { Schemas, ValidateJoi } from '../middleware/joi';
import { requireAdmin, requireAuth} from '../middleware/auth';

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
 */

/**
 * @openapi
 * /admin/restaurants:
 *   get:
 *     summary: Lists all restaurants for the backoffice
 *     tags: [Restaurants]
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Restaurant'
 */
router.get('/', controller.readAll);


/**
 * @openapi
 * /admin/restaurants:
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
 * /admin/restaurants/{restaurantId}/full:
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
 * /admin/restaurants/{restaurantId}:
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
 * /admin/restaurants/{restaurantId}/soft:
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
 * /admin/restaurants/{restaurantId}/restore:
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
 * /admin/restaurants/{restaurantId}/hard:
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


export default router;