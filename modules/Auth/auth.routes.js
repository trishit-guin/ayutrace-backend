const express = require('express');
const { validate } = require('./middlewares/validate'); // Adjust path
const { registerUserSchema, loginUserSchema } = require('./auth.validation');
const { registerUserHandler, loginUserHandler, getMeHandler } = require('./auth.controller');
const { authMiddleware } = require('./middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account in the system with role-based access control
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegistration'
 *           examples:
 *             farmer:
 *               summary: Farmer registration
 *               value:
 *                 email: "rajesh.p@puneorganic.coop"
 *                 password: "SecurePassword123!"
 *                 firstName: "Rajesh"
 *                 lastName: "Patil"
 *                 organizationId: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *                 role: "FARMER"
 *                 blockchainIdentity: "user1@cooperative.prakritichain.com"
 *             coopAdmin:
 *               summary: Cooperative admin registration
 *               value:
 *                 email: "admin@puneorganic.coop"
 *                 password: "AdminPassword123!"
 *                 firstName: "Priya"
 *                 lastName: "Sharma"
 *                 organizationId: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *                 role: "COOP_ADMIN"
 *             labTech:
 *               summary: Lab technician registration
 *               value:
 *                 email: "tech@qualitylab.com"
 *                 password: "LabTech123!"
 *                 firstName: "Dr. Amit"
 *                 lastName: "Kumar"
 *                 organizationId: "b2c3d4e5-f6g7-8901-2345-678901bcdefg"
 *                 role: "LAB_TECH"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegistrationResponse'
 *             example:
 *               message: "User created successfully"
 *               user:
 *                 userId: "b1c2d3e4-f5g6-7890-1234-567890abcdef"
 *                 organizationId: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *                 email: "rajesh.p@puneorganic.coop"
 *                 firstName: "Rajesh"
 *                 lastName: "Patil"
 *                 role: "FARMER"
 *                 blockchainIdentity: "user1@cooperative.prakritichain.com"
 *                 phone: null
 *                 lastLogin: null
 *                 isActive: true
 *                 createdAt: "2025-09-03T12:00:00Z"
 *                 updatedAt: "2025-09-03T12:00:00Z"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             example:
 *               message: "Validation failed"
 *               errors:
 *                 - field: "email"
 *                   message: "A valid email is required"
 *                 - field: "password"
 *                   message: "Password must be at least 8 characters long"
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "User with this email already exists"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Internal server error"
 */
// Register route with validation
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
 *             $ref: '#/components/schemas/UserLogin'
 *           examples:
 *             farmer:
 *               summary: Farmer login
 *               value:
 *                 email: "rajesh.p@puneorganic.coop"
 *                 password: "SecurePassword123!"
 *             admin:
 *               summary: Admin login
 *               value:
 *                 email: "admin@puneorganic.coop"
 *                 password: "AdminPassword123!"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *             example:
 *               message: "Login successful"
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiMWMyZDNlNC1mNWc2LTc4OTAtMTIzNC01Njc4OTBhYmNkZWYiLCJyb2xlIjoiRkFSTUVSIiwib3JnYW5pemF0aW9uSWQiOiJhMWIyYzNkNC1lNWY2LTc4OTAtMTIzNC01Njc4OTBhYmNkZWYiLCJpYXQiOjE3MjUzNjQ4MDAsImV4cCI6MTcyNTQ1MTIwMH0..."
 *         headers:
 *           X-RateLimit-Limit:
 *             description: Request limit per hour
 *             schema:
 *               type: integer
 *               example: 100
 *           X-RateLimit-Remaining:
 *             description: Remaining requests in the current window
 *             schema:
 *               type: integer
 *               example: 99
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             example:
 *               message: "Validation failed"
 *               errors:
 *                 - field: "email"
 *                   message: "A valid email is required"
 *                 - field: "password"
 *                   message: "Password is required"
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Invalid email or password"
 *       429:
 *         description: Too many login attempts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Too many login attempts. Please try again later."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Internal server error"
 */
// Login route with validation
router.post('/login', validate(loginUserSchema), loginUserHandler);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     description: Retrieves the profile information of the currently authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MeResponse'
 *             example:
 *               user:
 *                 userId: "b1c2d3e4-f5g6-7890-1234-567890abcdef"
 *                 organizationId: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *                 email: "rajesh.p@puneorganic.coop"
 *                 firstName: "Rajesh"
 *                 lastName: "Patil"
 *                 role: "FARMER"
 *                 blockchainIdentity: "user1@cooperative.prakritichain.com"
 *                 phone: "+919123456789"
 *                 lastLogin: "2025-09-03T11:30:00Z"
 *                 isActive: true
 *                 createdAt: "2025-09-02T12:00:00Z"
 *                 updatedAt: "2025-09-03T11:30:00Z"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingToken:
 *                 summary: Missing authorization token
 *                 value:
 *                   message: "Access denied. No token provided."
 *               invalidToken:
 *                 summary: Invalid token
 *                 value:
 *                   message: "Invalid token."
 *               expiredToken:
 *                 summary: Expired token
 *                 value:
 *                   message: "Token expired."
 *       403:
 *         description: Forbidden - User account is deactivated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "User account is deactivated"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Internal server error"
 */
// The authMiddleware will run first. If the token is valid, it will call getMeHandler.
router.get('/me', authMiddleware, getMeHandler);

module.exports = router;