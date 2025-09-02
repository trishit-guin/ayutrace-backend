const express = require('express');
const { authMiddleware } = require('./../Auth/middlewares/auth.middleware');
const { validate } = require('./../Auth/middlewares/validate');
const { createCollectionEventSchema } = require('./collection.validation');
const { createCollectionEventHandler } = require('./collection.controller');

const router = express.Router();

// Define the route for creating a new collection event.
// It is protected, so only authenticated users (farmers) can access it.
router.post(
  '/',
  authMiddleware,
  validate(createCollectionEventSchema),
  createCollectionEventHandler
);

module.exports = router;