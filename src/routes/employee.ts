import express from 'express';
import controller from '../controllers/employee';
import { Schemas, ValidateJoi } from '../middleware/joi';
import { authenticate, requireRestaurantAccess, requireRole, requireSelfOrAdmin } from '../middleware/auth';

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
router.post('/', ValidateJoi(Schemas.employee.create), controller.createEmployee);

/**
 * @openapi
 * /employees:
 *   get:
 *     summary: Lists all employees (paginated)
 *     tags: [Employees]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedEmployees'
 */
router.get('/', authenticate, requireRole('admin', 'owner'), requireRestaurantAccess('restaurant_id'), controller.readAll);

/**
 * @openapi
 * /employees/deleted:
 *   get:
 *     summary: List all deleted employees (paginated)
 *     tags: [Employees]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedEmployees'
 */
router.get('/deleted', authenticate, requireRole('admin'), controller.readAllDeleted);

/**
 * @openapi
 * /employees/{employee_id}:
 *   get:
 *     summary: Gets an employee by ID
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: employee_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The employee's ObjectId
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 */
router.get('/:employee_id', authenticate, requireSelfOrAdmin('employee_id'), controller.readEmployee);

/**
 * @openapi
 * /employees/{employee_id}/deleted:
 *   get:
 *     summary: Get a deleted employee by ID
 *     description: Returns a single deleted employee.
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: employee_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The employee's ObjectId
 *     responses:
 *       200:
 *         description: Employee found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmployeeResponse'
 *       400:
 *         description: Invalid employee ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Employee not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:employee_id/deleted', authenticate, requireRole('admin'), controller.readDeletedEmployee);

/**
 * @openapi
 * /employees/{employee_id}:
 *   put:
 *     summary: Updates an employee by ID
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: employee_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The employee's ObjectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeCreateUpdate'
 *     responses:
 *       201:
 *         description: Updated
 *       404:
 *         description: Not found
 *       422:
 *         description: Validation failed (Joi)
 */
router.put('/:employee_id', authenticate, requireSelfOrAdmin('employee_id'), ValidateJoi(Schemas.employee.update), controller.updateEmployee);

/**
 * @openapi
 * /employees/{employee_id}/soft:
 *   delete:
 *     summary: Deletes an employee by ID
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: employee_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The employee's ObjectId
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 */
router.delete('/:employee_id/soft', authenticate, requireRole('owner', 'admin'), requireRestaurantAccess('restaurant_id'), controller.softDeleteEmployee);

/**
 * @openapi
 * /employees/{employee_id}/restore:
 *   patch:
 *     summary: Restore a soft-deleted employee by ID
 *     description: Restores a previously soft-deleted employee (marks as active). Requires admin or owner role with access to the target restaurant.
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employee_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The employee's ObjectId
 *     responses:
 *       200:
 *         description: Employee restored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Employee restored successfully
 *       400:
 *         description: Invalid employee ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized – missing or invalid token
 *       403:
 *         description: Forbidden – insufficient role or no restaurant access
 *       404:
 *         description: Employee not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/:employee_id/restore', authenticate, requireRole('admin'), controller.restoreEmployee);

/**
 * @openapi
 * /employees/{employee_id}/hard:
 *   delete:
 *     summary: Hard delete an employee by ID
 *     description: Permanently removes a soft-deleted employee from the database. Requires admin role.
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employee_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The employee's ObjectId
 *     responses:
 *       200:
 *         description: Employee permanently deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Employee permanently deleted successfully
 *       400:
 *         description: Invalid employee ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized – missing or invalid token
 *       403:
 *         description: Forbidden – insufficient role (not admin)
 *       404:
 *         description: Employee not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:employee_id/hard', authenticate, requireRole('admin'), controller.hardDeleteEmployee);

export default router;
