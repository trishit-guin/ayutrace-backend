const express = require('express');
const { authMiddleware } = require('../Auth/middlewares/auth.middleware');
const { validate } = require('../Auth/middlewares/validate');
const { createOrganizationHandler, getOrganizationIdByTypeHandler } = require('./organization.controller');

const router = express.Router();


router.post('/', createOrganizationHandler);
router.get('/by-type/:type', getOrganizationIdByTypeHandler);

module.exports = router;
