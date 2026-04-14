import express from 'express';
import controller from '../controllers/auth';

const router = express.Router();

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Log in as an admin, customer, or employee
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
 *                 example: admin@easyeat.com
 *               password:
 *                 type: string
 *                 example: Admin123
 *               role:
 *                 type: string
 *                 enum: [admin, customer, employee]
 *                 default: admin
 *                 description: The type of user logging in. Defaults to admin.
 *     responses:
 *       200:
 *         description: Auth successful — returns accessToken in body, refreshToken as httpOnly cookie
 *       400:
 *         description: Missing email or password
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
 * /auth/refresh:
 *   post:
 *     summary: Issue a new access token using the httpOnly refresh cookie
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Returns a new accessToken
 *       401:
 *         description: Missing or invalid refresh token
 */
router.post('/refresh', controller.refresh);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Log out — clears the refresh token cookie
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', controller.logout);

export default router;
