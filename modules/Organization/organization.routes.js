const express = require('express');
const { authMiddleware } = require('../Auth/middlewares/auth.middleware');
const { validate } = require('../Auth/middlewares/validate');
const { createOrganizationHandler } = require('./organization.controller');

const router = express.Router();

router.post('/', createOrganizationHandler);

module.exports = router;
