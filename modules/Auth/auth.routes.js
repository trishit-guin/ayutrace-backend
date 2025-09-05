const express = require('express');
const { validate } = require('./middlewares/validate');
const { registerUserSchema, loginUserSchema } = require('./auth.validation');
const { registerUserHandler, loginUserHandler, getMeHandler } = require('./auth.controller');
const { authMiddleware } = require('./middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - passwordHash
 *         - firstName
 *         - lastName
 *         - orgType
 *         - organizationId
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *         email:
 *           type: string
 *           format: email
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         orgType:
 *           $ref: '#/components/schemas/OrgType'
 *         organizationId:
 *           type: string
 *           format: uuid
 *           description: Organization the user belongs to
 *         organization:
 *           $ref: '#/components/schemas/Organization'
 *         blockchainIdentity:
 *           type: string
 *           description: Optional blockchain identity for the user
 *         phone:
 *           type: string
 *           description: Optional phone number
 *         location:
 *           type: string
 *           description: Location information (especially for farmers)
 *         latitude:
 *           type: number
 *           format: float
 *           description: GPS latitude coordinate
 *         longitude:
 *           type: number
 *           format: float
 *           description: GPS longitude coordinate
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account in the system with organization type-based access control
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *           example:
 *             email: "rajesh.p@puneorganic.coop"
 *             password: "SecurePassword123!"
 *             firstName: "Rajesh"
 *             lastName: "Patil"
 *             orgType: "FARMER"
 *             organizationId: "550e8400-e29b-41d4-a716-446655440000"
 *             blockchainIdentity: "user1@cooperative.prakritichain.com"
 *             phone: "+919876543210"
 *             location: "Satara District, Maharashtra"
 *             latitude: 17.6868
 *             longitude: 74.0183
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User registered successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *                       description: JWT authentication token
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Validation error or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register', validate(registerUserSchema), registerUserHandler);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate user
 *     description: Authenticates user credentials and returns a JWT token for accessing protected endpoints
 *     tags: [Authentication]
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
 *                 format: email
 *                 description: User's email address
 *                 example: "rajesh.p@puneorganic.coop"
 *               password:
 *                 type: string
 *                 description: User's password
 *                 example: "SecurePassword123!"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *                       description: JWT authentication token
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', validate(loginUserSchema), loginUserHandler);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     description: Retrieves the profile information of the currently authenticated user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/me', authMiddleware, getMeHandler);

module.exports = router;
