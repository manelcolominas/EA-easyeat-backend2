import express from 'express';
import controller from '../controllers/dish';
import { Schemas, ValidateJoi } from '../middleware/joi';
import { authenticate, requireRole, requireRestaurantAccess } from '../middleware/auth';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Dishes
 *     description: CRUD endpoints for restaurant dishes
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     DishCreateUpdate:
 *       type: object
 *       required:
 *         - restaurant_id
 *         - name
 *         - section
 *         - price
 *         - availableAt
 *       properties:
 *         restaurant_id:
 *           type: string
 *           description: MongoDB ObjectId of the owning restaurant
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         section:
 *           type: string
 *           enum: [Starters, Mains, Desserts, Drinks, Sides, Specials]
 *         price:
 *           type: number
 *           minimum: 0
 *         images:
 *           type: array
 *           items:
 *             type: string
 *         active:
 *           type: boolean
 *           default: true
 *         availableAt:
 *           type: array
 *           items:
 *             type: string
 *             enum: [breakfast, brunch, lunch, happy-hour, dinner, all-day]
 *           minItems: 1
 *         ingredients:
 *           type: array
 *           items:
 *             type: string
 *         allergens:
 *           type: array
 *           items:
 *             type: string
 *             enum: [gluten, shellfish, nuts, dairy, eggs, soy, fish, sesame, mustard, celery, lupins, molluscs, sulphites]
 *         dietaryFlags:
 *           type: array
 *           items:
 *             type: string
 *             enum: [vegan, vegetarian, gluten-free, halal, kosher, dairy-free, nut-free]
 *         flavorProfile:
 *           type: array
 *           items:
 *             type: string
 *             enum: [spicy, mild, sweet, sour, salty, bitter, umami, smoky, rich, light, creamy, tangy, fresh, hearty, nutty]
 *         cuisineTags:
 *           type: array
 *           items:
 *             type: string
 *         portionSize:
 *           type: string
 *           enum: [small, medium, large, sharing]
 *
 *     DishResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/DishCreateUpdate'
 *         - type: object
 *           properties:
 *             _id:
 *               type: string
 *             createdAt:
 *               type: string
 *               format: date-time
 *             updatedAt:
 *               type: string
 *               format: date-time
 * 
 *     PaginatedDishes:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DishResponse'
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
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *
 *   parameters:
 *     dish_id:
 *       in: path
 *       name: dish_id
 *       required: true
 *       schema:
 *         type: string
 *       description: MongoDB ObjectId of the dish
 *     restaurant_id:
 *       in: path
 *       name: restaurant_id
 *       required: true
 *       schema:
 *         type: string
 *       description: MongoDB ObjectId of the restaurant
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

// ─── Create ───────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /dishes:
 *   post:
 *     summary: Create a new dish
 *     description: Creates a dish for a restaurant. Requires admin or owner role with access to the target restaurant.
 *     tags: [Dishes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DishCreateUpdate'
 *           example:
 *             restaurant_id: "64a1f2c3e4b0f8a2d3c1e5f6"
 *             name: "Patatas Bravas"
 *             section: "Starters"
 *             price: 6.50
 *             availableAt: ["lunch", "dinner"]
 *             allergens: ["gluten"]
 *             dietaryFlags: ["vegan"]
 *             flavorProfile: ["spicy", "crispy"]
 *             portionSize: "medium"
 *     responses:
 *       201:
 *         description: Dish created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DishResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized – missing or invalid token
 *       403:
 *         description: Forbidden – insufficient role or no restaurant access
 *       422:
 *         description: Validation failed (Joi)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', authenticate, requireRole('admin', 'owner'), requireRestaurantAccess('restaurant_id'),
    ValidateJoi(Schemas.dish.create),
    controller.createDish
);

// ─── Read all ─────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /dishes:
 *   get:
 *     summary: List all dishes (paginated)
 *     description: Returns all dishes across all restaurants. Supports optional query filters.
 *     tags: [Dishes]
 *     parameters:
 *       - in: query
 *         name: section
 *         schema:
 *           type: string
 *           enum: [Starters, Mains, Desserts, Drinks, Sides, Specials]
 *         description: Filter by menu section
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: dietaryFlags
 *         schema:
 *           type: string
 *         description: Comma-separated dietary flags to filter by (e.g. vegan,gluten-free)
 *       - in: query
 *         name: availableAt
 *         schema:
 *           type: string
 *           enum: [breakfast, brunch, lunch, happy-hour, dinner, all-day]
 *         description: Filter by service period
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Max number of results to return
 *     responses:
 *       200:
 *         description: List of dishes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedDishes'
 */
router.get('/', controller.readAll);

/**
 * @openapi
 * /dishes/deleted:
 *   get:
 *     summary: List all deleted dishes (paginated)
 *     description: Returns all deleted dishes across all restaurants.
 *     tags: [Dishes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Max number of results to return
 *     responses:
 *       200:
 *         description: List of deleted dishes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedDishes'
 */
router.get('/deleted', authenticate, requireRole('admin'), controller.readAllDeleted);

// ─── Read one ─────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /dishes/{dish_id}:
 *   get:
 *     summary: Get a dish by ID
 *     description: Returns a single dish. Publicly accessible.
 *     tags: [Dishes]
 *     parameters:
 *       - $ref: '#/components/parameters/dish_id'
 *     responses:
 *       200:
 *         description: Dish found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DishResponse'
 *       400:
 *         description: Invalid dish ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Dish not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:dish_id', controller.readDish);

/**
 * @openapi
 * /dishes/{dish_id}/deleted:
 *   get:
 *     summary: Get a deleted dish by ID
 *     description: Returns a single deleted dish. Publicly accessible.
 *     tags: [Dishes]
 *     parameters:
 *       - $ref: '#/components/parameters/dish_id'
 *     responses:
 *       200:
 *         description: Dish found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DishResponse'
 *       400:
 *         description: Invalid dish ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Dish not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:dish_id/deleted', authenticate, requireRole('admin'), controller.readDeletedDish);

// ─── Full update ──────────────────────────────────────────────────────────────

/**
 * @openapi
 * /dishes/{dish_id}:
 *   put:
 *     summary: Replace a dish by ID
 *     description: Fully replaces a dish document. All required fields must be provided.
 *     tags: [Dishes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/dish_id'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DishCreateUpdate'
 *     responses:
 *       200:
 *         description: Dish updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DishResponse'
 *       400:
 *         description: Invalid dish ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized – missing or invalid token
 *       403:
 *         description: Forbidden – insufficient role or no restaurant access
 *       404:
 *         description: Dish not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       422:
 *         description: Validation failed (Joi)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:dish_id', authenticate, requireRole('admin', 'owner'), requireRestaurantAccess('restaurant_id'),
    ValidateJoi(Schemas.dish.update),
    controller.updateDish
);

// ─── Delete ───────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /dishes/{dish_id}/soft:
 *   delete:
 *     summary: Soft delete a dish by ID
 *     description: Soft deletes a dish (marks as inactive). Requires admin or owner role with access to the target restaurant.
 *     tags: [Dishes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/dish_id'
 *     responses:
 *       200:
 *         description: Dish soft deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Dish soft deleted successfully
 *       400:
 *         description: Invalid dish ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized – missing or invalid token
 *       403:
 *         description: Forbidden – insufficient role or no restaurant access
 *       404:
 *         description: Dish not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:dish_id/soft', authenticate, requireRole('admin', 'owner'), requireRestaurantAccess('restaurant_id'),
    controller.softDeleteDish
);

/**
 * @openapi
 * /dishes/{dish_id}/restore:
 *   patch:
 *     summary: Restore a soft-deleted dish by ID
 *     description: Restores a previously soft-deleted dish (marks as active). Requires admin or owner role with access to the target restaurant.
 *     tags: [Dishes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/dish_id'
 *     responses:
 *       200:
 *         description: Dish restored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Dish restored successfully
 *       400:
 *         description: Invalid dish ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized – missing or invalid token
 *       403:
 *         description: Forbidden – insufficient role or no restaurant access
 *       404:
 *         description: Dish not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/:dish_id/restore', authenticate, requireRole('admin'), controller.restoreDish);

/**
 * @openapi
 * /dishes/{dish_id}/hard:
 *   delete:
 *     summary: Hard delete a dish by ID
 *     description: Permanently removes a soft-deleted dish from the database. Requires admin role.
 *     tags: [Dishes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/dish_id'
 *     responses:
 *       200:
 *         description: Dish permanently deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Dish permanently deleted successfully
 *       400:
 *         description: Invalid dish ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized – missing or invalid token
 *       403:
 *         description: Forbidden – insufficient role (not admin)
 *       404:
 *         description: Dish not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:dish_id/hard', authenticate, requireRole('admin'), controller.hardDeleteDish);

export default router;
