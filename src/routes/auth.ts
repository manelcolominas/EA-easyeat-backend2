import express from 'express';
import controller from '../controllers/auth';

const router = express.Router();

// ─── POST /auth/customer/login ───────────────────────────────────────────────
/**
 * @openapi
 * /auth/customer/login:
 *   post:
 *     summary: Log in a customer
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
 *         description: OK
 *       401:
 *         description: Invalid credentials
 */
router.post('/customer/login', controller.loginCustomer);

// ─── POST /auth/employee/login ───────────────────────────────────────────────
/**
 * @openapi
 * /auth/employee/login:
 *   post:
 *     summary: Log in an employee (owner/staff)
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
 *         description: OK
 *       401:
 *         description: Invalid credentials
 */
router.post('/employee/login', controller.loginEmployee);

// ─── POST /auth/login (Admin / Backoffice) ──────────────────────────────────
/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Log in an admin (Backoffice)
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
 *         description: OK
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', controller.loginAdmin);

// ─── POST /auth/refresh ──────────────────────────────────────────────────────
/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: No refresh token or invalid
 */
router.post('/refresh', controller.refresh);

// ─── POST /auth/logout ───────────────────────────────────────────────────────
/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Log out (clears cookie)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: OK
 */
router.post('/logout', controller.logout);

export default router;
