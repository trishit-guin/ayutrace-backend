const express = require('express');
const {
  createRawMaterialBatchHandler,
  getRawMaterialBatchesHandler,
  getRawMaterialBatchByIdHandler,
  updateRawMaterialBatchHandler,
  deleteRawMaterialBatchHandler,
} = require('./rawMaterialBatch.controller');
const { validate } = require('../Auth/middlewares/validate');
const {
  createRawMaterialBatchSchema,
  updateRawMaterialBatchSchema,
  getRawMaterialBatchesSchema,
} = require('./rawMaterialBatch.validation');

const router = express.Router();

/**
 * @swagger
 * /api/raw-material-batches:
 *   post:
 *     summary: Create a new raw material batch
 *     description: Creates a new raw material batch for tracking herbs through the supply chain
 *     tags: [Raw Material Batches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - herbName
 *               - quantity
 *               - unit
 *             properties:
 *               herbName:
 *                 type: string
 *                 description: Name of the herb
 *                 example: "Ashwagandha"
 *               scientificName:
 *                 type: string
 *                 description: Scientific name of the herb
 *                 example: "Withania somnifera"
 *               quantity:
 *                 type: number
 *                 description: Quantity of the batch
 *                 example: 100.5
 *               unit:
 *                 $ref: '#/components/schemas/QuantityUnit'
 *               description:
 *                 type: string
 *                 description: Additional description
 *                 example: "High quality organic ashwagandha roots"
 *               notes:
 *                 type: string
 *                 description: Any additional notes
 *                 example: "Harvested during optimal season"
 *               currentOwnerId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the current owner
 *                 example: "b1c2d3e4-f5g6-7890-1234-567890abcdef"
 *               collectionEventIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Array of collection event IDs associated with this batch
 *                 example: ["a1b2c3d4-e5f6-7890-1234-567890abcdef"]
 *     responses:
 *       201:
 *         description: Raw material batch created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
// Create a new raw material batch
router.post('/', validate(createRawMaterialBatchSchema), createRawMaterialBatchHandler);

/**
 * @swagger
 * /api/raw-material-batches:
 *   get:
 *     summary: Get all raw material batches
 *     description: Retrieve a list of raw material batches with pagination and filtering
 *     tags: [Raw Material Batches]
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
 *         name: status
 *         schema:
 *           $ref: '#/components/schemas/RawMaterialBatchStatus'
 *         description: Filter by batch status
 *       - in: query
 *         name: herbName
 *         schema:
 *           type: string
 *         description: Filter by herb name
 *     responses:
 *       200:
 *         description: List of raw material batches
 *       401:
 *         description: Unauthorized
 */
// Get all raw material batches with pagination and filters
router.get('/', validate(getRawMaterialBatchesSchema), getRawMaterialBatchesHandler);

/**
 * @swagger
 * /api/raw-material-batches/{id}:
 *   get:
 *     summary: Get a raw material batch by ID
 *     description: Retrieve detailed information about a specific raw material batch
 *     tags: [Raw Material Batches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Raw material batch ID
 *     responses:
 *       200:
 *         description: Raw material batch details
 *       404:
 *         description: Raw material batch not found
 *       401:
 *         description: Unauthorized
 */
// Get a raw material batch by ID
router.get('/:id', getRawMaterialBatchByIdHandler);

/**
 * @swagger
 * /api/raw-material-batches/{id}:
 *   put:
 *     summary: Update a raw material batch
 *     description: Update an existing raw material batch's information
 *     tags: [Raw Material Batches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Raw material batch ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               herbName:
 *                 type: string
 *               scientificName:
 *                 type: string
 *               quantity:
 *                 type: number
 *               unit:
 *                 $ref: '#/components/schemas/QuantityUnit'
 *               status:
 *                 $ref: '#/components/schemas/RawMaterialBatchStatus'
 *               description:
 *                 type: string
 *               notes:
 *                 type: string
 *               currentOwnerId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Raw material batch updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Raw material batch not found
 *       401:
 *         description: Unauthorized
 */
// Update a raw material batch
router.put('/:id', validate(updateRawMaterialBatchSchema), updateRawMaterialBatchHandler);

/**
 * @swagger
 * /api/raw-material-batches/{id}:
 *   delete:
 *     summary: Delete a raw material batch
 *     description: Delete a raw material batch from the system
 *     tags: [Raw Material Batches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Raw material batch ID
 *     responses:
 *       200:
 *         description: Raw material batch deleted successfully
 *       404:
 *         description: Raw material batch not found
 *       401:
 *         description: Unauthorized
 */
// Delete a raw material batch
router.delete('/:id', deleteRawMaterialBatchHandler);

module.exports = router;
