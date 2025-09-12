// const express = require('express');
// const { authMiddleware } = require('./../Auth/middlewares/auth.middleware');
// const { validate } = require('./../Auth/middlewares/validate');
// const { createCollectionEventSchema } = require('./collection.validation');
// const { createCollectionEventHandler } = require('./collection.controller');

// const router = express.Router();

// /**
//  * @swagger
//  * /api/collections:
//  *   post:
//  *     summary: Create a new collection event
//  *     description: Record a new herb collection event with quality metrics and location data
//  *     tags: [Collection Events]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - quantityKg
//  *               - initialQualityMetrics
//  *               - location
//  *             properties:
//  *               speciesCode:
//  *                 type: string
//  *                 description: Species identifier code (optional)
//  *                 example: "ASH-001"
//  *               quantityKg:
//  *                 type: number
//  *                 format: float
//  *                 minimum: 0.1
//  *                 description: Quantity of herbs collected in kilograms
//  *                 example: 15.5
//  *               initialQualityMetrics:
//  *                 type: string
//  *                 description: JSON string containing quality assessment data
//  *                 example: '{"moisture": 12.5, "purity": 95, "color": "green", "aroma": "strong"}'
//  *               filePath:
//  *                 type: string
//  *                 format: uri
//  *                 description: URL of collection photo (optional)
//  *                 example: "https://example.com/collection-photo.jpg"
//  *               location:
//  *                 type: string
//  *                 description: JSON string with GPS coordinates
//  *                 example: '{"latitude": 17.6868, "longitude": 74.0183}'
//  *     responses:
//  *       201:
//  *         description: Collection event recorded successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   example: "Collection event recorded successfully"
//  *                 data:
//  *                   type: object
//  *                   properties:
//  *                     eventId:
//  *                       type: string
//  *                       format: uuid
//  *                       example: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
//  *                     collectorId:
//  *                       type: string
//  *                       format: uuid
//  *                       example: "b1c2d3e4-f5g6-7890-1234-567890abcdef"
//  *                     collectionDate:
//  *                       type: string
//  *                       format: date-time
//  *                       example: "2025-09-05T10:30:00Z"
//  *                     quantity:
//  *                       type: number
//  *                       example: 15.5
//  *                     location:
//  *                       type: string
//  *                       example: "Farm Location"
//  *                     latitude:
//  *                       type: number
//  *                       example: 17.6868
//  *                     longitude:
//  *                       type: number
//  *                       example: 74.0183
//  *       400:
//  *         description: Validation error
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                   example: false
//  *                 error:
//  *                   type: string
//  *                   example: "Validation failed"
//  *                 message:
//  *                   type: string
//  *                   example: "Quantity must be a positive number"
//  *       401:
//  *         description: Unauthorized - Invalid or missing token
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   example: "Access denied. No token provided."
//  *       500:
//  *         description: Internal server error
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   example: "Internal server error"
//  */
// router.post(
//   '/',
//   authMiddleware,
//   validate(createCollectionEventSchema),
//   createCollectionEventHandler
// );


// /**
//  * @swagger
//  * /api/collections/by-farmer:
//  *   get:
//  *     summary: Get all collection events for the logged-in farmer
//  *     description: Returns all collection events created by the authenticated farmer (farmerId from JWT)
//  *     tags: [Collection Events]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Collections fetched successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   example: Collections fetched successfully
//  *                 data:
//  *                   type: array
//  *                   items:
//  *                     $ref: '#/components/schemas/CollectionEvent'
//  *       401:
//  *         description: Unauthorized - Invalid or missing token
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   example: Access denied. No token provided.
//  *       500:
//  *         description: Internal server error
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   example: Internal server error
//  */
// const { getCollectionsByFarmerHandler } = require('./collection.controller');
// router.get('/by-farmer', authMiddleware, getCollectionsByFarmerHandler);

// module.exports = router;






const express = require('express');
const { authMiddleware } = require('./../Auth/middlewares/auth.middleware');
const { validate } = require('./../Auth/middlewares/validate');
const { createCollectionEventSchema } = require('./collection.validation');
const {
  createCollectionEventHandler,
  getCollectionsByFarmerHandler,
} = require('./collection.controller');

const router = express.Router();

/**
 * @swagger
 * /api/collections:
 *   post:
 *     summary: Create a new collection event
 *     description: Record a new herb collection event with quality metrics and location data
 *     tags: [Collection Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantityKg
 *               - initialQualityMetrics
 *               - location
 *             properties:
 *               herbSpeciesId:
 *                 type: string
 *                 format: uuid
 *                 description: Species UUID (optional)
 *                 example: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *               quantityKg:
 *                 type: number
 *                 format: float
 *                 minimum: 0.1
 *                 description: Quantity of herbs collected in kilograms
 *                 example: 15.5
 *               initialQualityMetrics:
 *                 type: string
 *                 description: JSON string containing quality assessment data
 *                 example: '{"moisture": 12.5, "purity": 95, "color": "green", "aroma": "strong"}'
 *               photoUrl:
 *                 type: string
 *                 format: uri
 *                 description: URL of collection photo (optional)
 *                 example: "https://example.com/collection-photo.jpg"
 *               location:
 *                 type: string
 *                 description: JSON string with GPS coordinates
 *                 example: '{"latitude": 17.6868, "longitude": 74.0183}'
 *     responses:
 *       201:
 *         description: Collection event recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Collection event recorded successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     eventId:
 *                       type: string
 *                       format: uuid
 *                     collectorId:
 *                       type: string
 *                       format: uuid
 *                     collectionDate:
 *                       type: string
 *                       format: date-time
 *                     quantity:
 *                       type: number
 *                     location:
 *                       type: string
 *                     latitude:
 *                       type: number
 *                     longitude:
 *                       type: number
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.post(
  '/',
  authMiddleware,
  validate(createCollectionEventSchema),
  createCollectionEventHandler
);

/**
 * @swagger
 * /api/collections/by-farmer:
 *   get:
 *     summary: Get all collection events for the logged-in farmer
 *     description: Returns all collection events created by the authenticated farmer (farmerId from JWT)
 *     tags: [Collection Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Collections fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Collections fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CollectionEvent'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/by-farmer', authMiddleware, getCollectionsByFarmerHandler);

module.exports = router;
