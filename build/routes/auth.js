"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../controllers/auth"));
const router = express_1.default.Router();
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
router.post('/login', auth_1.default.loginAdmin);
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
router.post('/register', auth_1.default.registerAdmin);
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
router.post('/refresh', auth_1.default.refresh);
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
router.post('/logout', auth_1.default.logout);
/**
 * @openapi
 * /auth/login/google:
 *   post:
 *     summary: Log in with Google OAuth
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *                 description: Google ID token from frontend authentication
 *     responses:
 *       200:
 *         description: Google login successful — returns accessToken in body, refreshToken as httpOnly cookie
 *       400:
 *         description: Missing ID token
 *       401:
 *         description: Google authentication failed
 */
router.post('/login/google', auth_1.default.loginGoogle);
/**
 * @openapi
 * /auth/register/google:
 *   post:
 *     summary: Register with Google OAuth
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *                 description: Google ID token from frontend authentication
 *     responses:
 *       201:
 *         description: Google registration successful — returns accessToken in body, refreshToken as httpOnly cookie
 *       400:
 *         description: Missing ID token or registration failed
 */
router.post('/register/google', auth_1.default.registerGoogle);
exports.default = router;
//# sourceMappingURL=auth.js.map