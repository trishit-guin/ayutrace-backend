const express = require('express');
const {
  createSupplyChainEventHandler,
  getSupplyChainEventsHandler,
  getSupplyChainEventByIdHandler,
  getSupplyChainByBatchHandler,
  updateSupplyChainEventHandler,
  deleteSupplyChainEventHandler,
} = require('./supplyChain.controller');
const { validate } = require('../Auth/middlewares/validate');
const { authMiddleware } = require('../Auth/middlewares/auth.middleware');
const {
  createSupplyChainEventSchema,
  updateSupplyChainEventSchema,
  getSupplyChainEventsSchema,
} = require('./supplyChain.validation');

const router = express.Router();

/**
 * @swagger
 * /api/supply-chain:
 *   post:
 *     summary: Create a new supply chain event
 *     description: Records a new event in the supply chain tracking system
 *     tags: [Supply Chain]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventType
 *               - handlerId
 *               - fromLocationId
 *               - toLocationId
 *             properties:
 *               eventType:
 *                 $ref: '#/components/schemas/SupplyChainEventType'
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *                 description: Event timestamp (defaults to current time)
 *                 example: "2025-09-05T10:30:00Z"
 *               rawMaterialBatchId:
 *                 type: string
 *                 format: uuid
 *                 description: Associated raw material batch ID (optional)
 *                 example: "c1d2e3f4-g5h6-7890-1234-567890abcdef"
 *               finishedGoodId:
 *                 type: string
 *                 format: uuid
 *                 description: Associated finished good ID (optional)
 *                 example: "e1f2g3h4-i5j6-7890-1234-567890abcdef"
 *               handlerId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the user handling the event
 *                 example: "b1c2d3e4-f5g6-7890-1234-567890abcdef"
 *               fromLocationId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the source organization/location
 *                 example: "f1g2h3i4-j5k6-7890-1234-567890abcdef"
 *               toLocationId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the destination organization/location
 *                 example: "g1h2i3j4-k5l6-7890-1234-567890abcdef"
 *               notes:
 *                 type: string
 *                 description: Additional notes about the event
 *                 example: "Quality check passed, transferred to processing facility"
 *               custody:
 *                 type: object
 *                 description: Custody information as JSON
 *                 example: {"temperature": "20°C", "humidity": "45%", "transportMethod": "refrigerated truck"}
 *     responses:
 *       201:
 *         description: Supply chain event created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
// Create a new supply chain event
router.post('/', authMiddleware, validate(createSupplyChainEventSchema), createSupplyChainEventHandler);

/**
 * @swagger
 * /api/supply-chain:
 *   get:
 *     summary: Get all supply chain events
 *     description: Retrieve supply chain events with pagination and filtering
 *     tags: [Supply Chain]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: eventType
 *         schema:
 *           $ref: '#/components/schemas/SupplyChainEventType'
 *         description: Filter by event type
 *       - in: query
 *         name: batchId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by batch ID
 *       - in: query
 *         name: handlerId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by handler ID
 *     responses:
 *       200:
 *         description: List of supply chain events
 *       401:
 *         description: Unauthorized
 */
// Get all supply chain events with pagination and filters
router.get('/', validate(getSupplyChainEventsSchema), getSupplyChainEventsHandler);

/**
 * @swagger
 * /api/supply-chain/batch/{batchId}:
 *   get:
 *     summary: Get supply chain events for a specific batch
 *     description: Retrieve all supply chain events associated with a batch
 *     tags: [Supply Chain]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: batchId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Batch ID to get events for
 *     responses:
 *       200:
 *         description: Supply chain events for the batch
 *       404:
 *         description: Batch not found
 *       401:
 *         description: Unauthorized
 */
// Get supply chain events for a specific batch
router.get('/batch/:batchId', getSupplyChainByBatchHandler);

/**
 * @swagger
 * /api/supply-chain/{id}:
 *   get:
 *     summary: Get a supply chain event by ID
 *     description: Retrieve detailed information about a specific supply chain event
 *     tags: [Supply Chain]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Supply chain event ID
 *     responses:
 *       200:
 *         description: Supply chain event details
 *       404:
 *         description: Supply chain event not found
 *       401:
 *         description: Unauthorized
 */
// Get a supply chain event by ID
router.get('/:id', getSupplyChainEventByIdHandler);

/**
 * @swagger
 * /api/supply-chain/{id}:
 *   put:
 *     summary: Update a supply chain event
 *     description: Update an existing supply chain event
 *     tags: [Supply Chain]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Supply chain event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventType:
 *                 $ref: '#/components/schemas/SupplyChainEventType'
 *               eventDate:
 *                 type: string
 *                 format: date-time
 *               locationLat:
 *                 type: number
 *               locationLng:
 *                 type: number
 *               details:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Supply chain event updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Supply chain event not found
 *       401:
 *         description: Unauthorized
 */
// Update a supply chain event
router.put('/:id', validate(updateSupplyChainEventSchema), updateSupplyChainEventHandler);

/**
 * @swagger
 * /api/supply-chain/{id}:
 *   delete:
 *     summary: Delete a supply chain event
 *     description: Delete a supply chain event from the system
 *     tags: [Supply Chain]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Supply chain event ID
 *     responses:
 *       200:
 *         description: Supply chain event deleted successfully
 *       404:
 *         description: Supply chain event not found
 *       401:
 *         description: Unauthorized
 */
// Delete a supply chain event
router.delete('/:id', deleteSupplyChainEventHandler);

module.exports = router;
