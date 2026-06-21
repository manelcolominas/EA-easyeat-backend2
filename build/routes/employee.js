"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const employee_1 = __importDefault(require("../controllers/employee"));
const employeeStats_1 = __importDefault(require("../controllers/employeeStats"));
const joi_1 = require("../middleware/joi");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
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
router.post('/', auth_1.authenticate, (0, auth_1.requireRole)('owner', 'admin'), (0, joi_1.ValidateJoi)(joi_1.Schemas.employee.create), employee_1.default.createEmployee);
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
router.get('/', auth_1.authenticate, (0, auth_1.requireRole)('admin', 'owner', 'staff'), employee_1.default.readAll);
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
router.get('/deleted', auth_1.authenticate, (0, auth_1.requireRole)('admin', 'owner', 'staff'), employee_1.default.readAllDeleted);
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
router.get('/restaurant/:restaurant_id', auth_1.authenticate, (0, auth_1.requireRole)('owner', 'admin', 'staff'), (0, auth_1.requireRestaurantAccess)('restaurant_id'), employee_1.default.readByRestaurant);
/**
 * @openapi
 * /employees/restaurant/{restaurant_id}/stats:
 *   get:
 *     summary: List employees for a restaurant with calculated stats
 *     tags: [Employees]
 *     parameters:
 *       - name: restaurant_id
 *         in: path
 *         required: true
 *         description: MongoDB ObjectId of the restaurant
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/restaurant/:restaurant_id/stats', auth_1.authenticate, (0, auth_1.requireRole)('admin', 'owner', 'employee', 'staff'), (0, auth_1.requireRestaurantAccess)('restaurant_id'), employee_1.default.getEmployeesByRestaurantStats);
/**
 * @openapi
 * /employees/restaurant/{restaurant_id}/statistics:
 *   get:
 *     summary: List employees for a restaurant with calculated stats
 *     tags: [Employees]
 *     parameters:
 *       - name: restaurant_id
 *         in: path
 *         required: true
 *         description: MongoDB ObjectId of the restaurant
 *         schema:
 *           type: string
 *           example: 605c9b6f2f1e3b2a1c0d4f5e
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/restaurant/:restaurant_id/statistics', auth_1.authenticate, (0, auth_1.requireRole)('owner', 'admin', 'staff'), (0, auth_1.requireSelfOrAdmin)('employee_id'), (0, auth_1.requireRestaurantAccess)('restaurant_id'), employeeStats_1.default.getEmployeeStatistics);
/**
 * @openapi
 * /employees/{employee_id}/statistics:
 *   get:
 *     summary: List employees for a restaurant with calculated stats
 *     tags: [Employees]
 *     parameters:
 *       - name: employee_id
 *         in: path
 *         required: true
 *         description: MongoDB ObjectId of the restaurant
 *         schema:
 *           type: string
 *           example: 605c9b6f2f1e3b2a1c0d4f5e
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/:employee_id/statistics', auth_1.authenticate, (0, auth_1.requireRole)('owner', 'admin', 'staff'), (0, auth_1.requireSelfOrAdmin)('employee_id'), employeeStats_1.default.getEmployeeStatistics);
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
router.get('/restaurant/:restaurant_id/deleted', auth_1.authenticate, (0, auth_1.requireRole)('owner', 'admin', 'staff'), (0, auth_1.requireRestaurantAccess)('restaurant_id'), employee_1.default.readDeletedByRestaurant);
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
router.get('/:employee_id', auth_1.authenticate, (0, auth_1.requireRole)('owner', 'admin', 'staff'), employee_1.default.readEmployee);
// ─── GET /employees/:employee_id/statistics ────────────────────────────────────
/**
 * @openapi
 * /employees/{employee_id}/statistics:
 *   get:
 *     summary: Gets statistics for an employee
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: employee_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employee statistics
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Server error
 */
router.get('/:employee_id/statistics', auth_1.authenticate, (0, auth_1.requireRole)('owner', 'admin', 'staff'), employeeStats_1.default.getEmployeeStatistics);
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
router.get('/:employee_id/deleted', auth_1.authenticate, (0, auth_1.requireRole)('admin', 'owner', 'staff'), employee_1.default.readDeletedEmployee);
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
router.put('/:employee_id', auth_1.authenticate, (0, auth_1.requireRole)('owner', 'admin'), (0, joi_1.ValidateJoi)(joi_1.Schemas.employee.update), employee_1.default.updateEmployee);
/**
 * @openapi
 * /employees/{employee_id}/soft:
 *   delete:
 *     summary: Deletes an employee by ID
 *     tags: [Employees]
 */
router.delete('/:employee_id/soft', auth_1.authenticate, (0, auth_1.requireRole)('owner', 'admin'), employee_1.default.softDeleteEmployee);
/**
 * @openapi
 * /employees/{employee_id}/restore:
 *   patch:
 *     summary: Restore a soft-deleted employee by ID
 *     tags: [Employees]
 */
router.patch('/:employee_id/restore', auth_1.authenticate, (0, auth_1.requireRole)('admin', 'owner', 'staff'), employee_1.default.restoreEmployee);
/**
 * @openapi
 * /employees/{employee_id}/hard:
 *   delete:
 *     summary: Hard delete an employee by ID
 *     tags: [Employees]
 */
router.delete('/:employee_id/hard', auth_1.authenticate, (0, auth_1.requireRole)('admin', 'owner', 'staff'), employee_1.default.hardDeleteEmployee);
exports.default = router;
//# sourceMappingURL=employee.js.map