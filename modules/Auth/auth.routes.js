const express = require('express');
const { validate } = require('./middlewares/validate'); // Adjust path
const { registerUserSchema, loginUserSchema } = require('./auth.validation');
const { registerUserHandler, loginUserHandler, getMeHandler } = require('./auth.controller');
const { authMiddleware } = require('./middlewares/auth.middleware');

const router = express.Router();

// Register route with validation
router.post('/register', validate(registerUserSchema), registerUserHandler);

// Login route with validation
router.post('/login', validate(loginUserSchema), loginUserHandler);

// The authMiddleware will run first. If the token is valid, it will call getMeHandler.
router.get('/me', authMiddleware, getMeHandler);

module.exports = router;