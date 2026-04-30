import express from 'express';
import controller from '../controllers/employee';
import { Schemas, ValidateJoi } from '../middleware/joi';
import { authenticate, requireRestaurantAccess, requireRole } from '../middleware/auth';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Employees
 *     description: CRUD endpoints for employees
 *
 * components:
 *   schemas:
 *     Employee:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB ObjectId
 *           example: "65f1c2a1b2c3d4e5f6789010"
 *         restaurant_id:
 *           type: string
 *           description: Reference to the Restaurant
 *           example: "65f1c2a1b2c3d4e5f6789000"
 *         profile:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               example: "Jane Doe"
 *             email:
 *               type: string
 *               example: "jane.doe@example.com"
 *             phone:
 *               type: string
 *               example: "+34612345678"
 *             role:
 *               type: string
 *               enum: [owner, staff]
 *               example: "staff"
 *         isActive:
 *           type: boolean
 *           example: true
 *
 *     EmployeeCreateUpdate:
 *       type: object
 *       required:
 *         - restaurant_id
 *         - profile
 *       properties:
 *         restaurant_id:
 *           type: string
 *           example: "65f1c2a1b2c3d4e5f6789000"
 *         profile:
 *           type: object
 *           required:
 *             - name
 *           properties:
 *             name:
 *               type: string
 *               example: "Jane Doe"
 *             password:
 *               type: string
 *               format: password
 *               example: "s3cur3P@ss"
 *             email:
 *               type: string
 *               example: "jane.doe@example.com"
 *             phone:
 *               type: string
 *               example: "+34612345678"
 *             role:
 *               type: string
 *               enum: [owner, staff]
 *               example: "staff"
 *         isActive:
 *           type: boolean
 *           example: true
 * 
 *     PaginatedEmployees:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Employee'
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
 * /employees:
 *   post:
 *     summary: Creates an employee
 *     tags: [Employees]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeCreateUpdate'
 *     responses:
 *       201:
 *         description: Created
 *       422:
 *         description: Validation failed (Joi)
 */
router.post(
  '/',
  authenticate,
  requireRole('owner', 'admin'),
  ValidateJoi(Schemas.employee.create),
  controller.createEmployee
);

/**
 * @openapi
 * /employees:
 *   get:
 *     summary: Lists all employees (paginated)
 *     tags: [Employees]
 *     responses:
 *       200:
 *         description: OK
 */
router.get(
  '/',
  authenticate,
  requireRole('admin', 'owner', 'staff'),
  controller.readAll
);

/**
 * @openapi
 * /employees/deleted:
 *   get:
 *     summary: List all deleted employees (paginated)
 *     tags: [Employees]
 *     responses:
 *       200:
 *         description: OK
 */
router.get(
  '/deleted',
  authenticate,
  requireRole('admin', 'owner', 'staff'),
  controller.readAllDeleted
);

/**
 * @openapi
 * /employees/restaurant/{restaurant_id}:
 *   get:
 *     summary: List all employees for a specific restaurant (paginated)
 *     tags: [Employees]
 *     responses:
 *       200:
 *         description: OK
 */
router.get(
  '/restaurant/:restaurant_id',
  authenticate,
  requireRole('owner', 'admin', 'staff'),
  requireRestaurantAccess('restaurant_id'),
  controller.readByRestaurant
);

/**
 * @openapi
 * /employees/restaurant/{restaurant_id}/stats:
 *   get:
 *     summary: List employees for a restaurant with calculated stats
 *     tags: [Employees]
 *     responses:
 *       200:
 *         description: OK
 */
router.get(
  '/restaurant/:restaurant_id/stats',
  authenticate,
  requireRole('owner', 'admin', 'staff'),
  requireRestaurantAccess('restaurant_id'),
  controller.readByRestaurantWithStats
);

/**
 * @openapi
 * /employees/restaurant/{restaurant_id}/deleted:
 *   get:
 *     summary: List all deleted employees for a specific restaurant (paginated)
 *     tags: [Employees]
 *     responses:
 *       200:
 *         description: OK
 */
router.get(
  '/restaurant/:restaurant_id/deleted',
  authenticate,
  requireRole('owner', 'admin', 'staff'),
  requireRestaurantAccess('restaurant_id'),
  controller.readDeletedByRestaurant
);

/**
 * @openapi
 * /employees/{employee_id}:
 *   get:
 *     summary: Gets an employee by ID
 *     tags: [Employees]
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 */
router.get(
  '/:employee_id',
  authenticate,
  requireRole('owner', 'admin', 'staff'),
  controller.readEmployee
);

/**
 * @openapi
 * /employees/{employee_id}/deleted:
 *   get:
 *     summary: Get a deleted employee by ID
 *     tags: [Employees]
 *     responses:
 *       200:
 *         description: OK
 */
router.get(
  '/:employee_id/deleted',
  authenticate,
  requireRole('admin', 'owner', 'staff'),
  controller.readDeletedEmployee
);

/**
 * @openapi
 * /employees/{employee_id}:
 *   put:
 *     summary: Updates an employee by ID
 *     tags: [Employees]
 *     responses:
 *       200:
 *         description: Updated
 */
router.put(
  '/:employee_id',
  authenticate,
  requireRole('owner', 'admin'),
  ValidateJoi(Schemas.employee.update),
  controller.updateEmployee
);

/**
 * @openapi
 * /employees/{employee_id}/soft:
 *   delete:
 *     summary: Deletes an employee by ID
 *     tags: [Employees]
 */
router.delete(
  '/:employee_id/soft',
  authenticate,
  requireRole('owner', 'admin'),
  controller.softDeleteEmployee
);

/**
 * @openapi
 * /employees/{employee_id}/restore:
 *   patch:
 *     summary: Restore a soft-deleted employee by ID
 *     tags: [Employees]
 */
router.patch(
  '/:employee_id/restore',
  authenticate,
  requireRole('admin', 'owner', 'staff'),
  controller.restoreEmployee
);

/**
 * @openapi
 * /employees/{employee_id}/hard:
 *   delete:
 *     summary: Hard delete an employee by ID
 *     tags: [Employees]
 */
router.delete(
  '/:employee_id/hard',
  authenticate,
  requireRole('admin', 'owner', 'staff'),
  controller.hardDeleteEmployee
);

export default router;