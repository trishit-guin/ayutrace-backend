const express = require('express');
const {
  createFinishedGoodHandler,
  getFinishedGoodsHandler,
  getFinishedGoodByIdHandler,
  getFinishedGoodCompositionHandler,
  updateFinishedGoodHandler,
  deleteFinishedGoodHandler,
} = require('./finishedGoods.controller');
const { validate } = require('../Auth/middlewares/validate');
const {
  createFinishedGoodSchema,
  updateFinishedGoodSchema,
  getFinishedGoodsSchema,
} = require('./finishedGoods.validation');

const router = express.Router();

/**
 * @swagger
 * /api/finished-goods:
 *   post:
 *     summary: Create a new finished good
 *     description: Creates a new finished product with its composition
 *     tags: [Finished Goods]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productName
 *               - productType
 *               - quantity
 *               - unit
 *             properties:
 *               productName:
 *                 type: string
 *                 description: Name of the finished product
 *                 example: "Ashwagandha Churna"
 *               productType:
 *                 $ref: '#/components/schemas/FinishedGoodProductType'
 *               description:
 *                 type: string
 *                 description: Product description
 *                 example: "Pure Ashwagandha powder for wellness"
 *               quantity:
 *                 type: number
 *                 description: Quantity produced
 *                 example: 50.0
 *               unit:
 *                 $ref: '#/components/schemas/QuantityUnit'
 *               batchNumber:
 *                 type: string
 *                 description: Batch number for the product
 *                 example: "FG-ASH-2025-001"
 *               expiryDate:
 *                 type: string
 *                 format: date-time
 *                 description: Product expiry date
 *                 example: "2027-09-05T00:00:00Z"
 *               manufacturerId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the manufacturer
 *                 example: "b1c2d3e4-f5g6-7890-1234-567890abcdef"
 *     responses:
 *       201:
 *         description: Finished good created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
// Create a new finished good
router.post('/', validate(createFinishedGoodSchema), createFinishedGoodHandler);

/**
 * @swagger
 * /api/finished-goods:
 *   get:
 *     summary: Get all finished goods
 *     description: Retrieve finished goods with pagination and filtering
 *     tags: [Finished Goods]
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
 *         name: productType
 *         schema:
 *           $ref: '#/components/schemas/FinishedGoodProductType'
 *         description: Filter by product type
 *       - in: query
 *         name: productName
 *         schema:
 *           type: string
 *         description: Filter by product name
 *       - in: query
 *         name: manufacturerId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by manufacturer ID
 *     responses:
 *       200:
 *         description: List of finished goods
 *       401:
 *         description: Unauthorized
 */
// Get all finished goods with pagination and filters
router.get('/', validate(getFinishedGoodsSchema), getFinishedGoodsHandler);

/**
 * @swagger
 * /api/finished-goods/{id}:
 *   get:
 *     summary: Get a finished good by ID
 *     description: Retrieve detailed information about a specific finished good
 *     tags: [Finished Goods]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Finished good ID
 *     responses:
 *       200:
 *         description: Finished good details
 *       404:
 *         description: Finished good not found
 *       401:
 *         description: Unauthorized
 */
// Get a finished good by ID
router.get('/:id', getFinishedGoodByIdHandler);

/**
 * @swagger
 * /api/finished-goods/{id}/composition:
 *   get:
 *     summary: Get finished good composition
 *     description: Retrieve detailed composition and traceability of a finished good
 *     tags: [Finished Goods]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Finished good ID
 *     responses:
 *       200:
 *         description: Finished good composition and traceability
 *       404:
 *         description: Finished good not found
 *       401:
 *         description: Unauthorized
 */
// Get detailed composition and traceability of a finished good
router.get('/:id/composition', getFinishedGoodCompositionHandler);

/**
 * @swagger
 * /api/finished-goods/{id}:
 *   put:
 *     summary: Update a finished good
 *     description: Update an existing finished good's information
 *     tags: [Finished Goods]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Finished good ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productName:
 *                 type: string
 *               description:
 *                 type: string
 *               quantity:
 *                 type: number
 *               unit:
 *                 $ref: '#/components/schemas/QuantityUnit'
 *               batchNumber:
 *                 type: string
 *               manufacturingDate:
 *                 type: string
 *                 format: date-time
 *               expiryDate:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Finished good updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Finished good not found
 *       401:
 *         description: Unauthorized
 */
// Update a finished good
router.put('/:id', validate(updateFinishedGoodSchema), updateFinishedGoodHandler);

/**
 * @swagger
 * /api/finished-goods/{id}:
 *   delete:
 *     summary: Delete a finished good
 *     description: Delete a finished good from the system
 *     tags: [Finished Goods]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Finished good ID
 *     responses:
 *       200:
 *         description: Finished good deleted successfully
 *       404:
 *         description: Finished good not found
 *       401:
 *         description: Unauthorized
 */
// Delete a finished good
router.delete('/:id', deleteFinishedGoodHandler);

module.exports = router;
