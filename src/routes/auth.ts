import express from 'express';
import controller from '../controllers/auth';


const router = express.Router();

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Log in as an admin
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Auth successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', controller.loginAdmin);

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register an admin (Dev/Ops only)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Admin created successfully
 *       400:
 *         description: Missing fields
 *       409:
 *         description: Admin with this email already exists
 */
router.post('/register', controller.registerAdmin);

/**
 * @openapi
 * /login/customer:
 *   post:
 *     summary: Log in as a customer
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Auth successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login/customer', controller.loginCustomer);

export default router;
