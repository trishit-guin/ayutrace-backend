const express = require('express');
const {
  generateQRCodeHandler,
  getQRCodesHandler,
  getQRCodeByIdHandler,
  scanQRCodeHandler,
  getQRCodeImageHandler,
  updateQRCodeHandler,
  deleteQRCodeHandler,
} = require('./qrCode.controller');
const { validate } = require('../Auth/middlewares/validate');
const {
  generateQRCodeSchema,
  updateQRCodeSchema,
  getQRCodesSchema,
} = require('./qrCode.validation');

const router = express.Router();

/**
 * @swagger
 * /api/qr-codes:
 *   post:
 *     summary: Generate a new QR code
 *     description: Generate a QR code for traceability of batches or finished goods
 *     tags: [QR Codes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - entityType
 *               - entityId
 *             properties:
 *               entityType:
 *                 $ref: '#/components/schemas/QREntityType'
 *               entityId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the entity to generate QR code for
 *                 example: "e1f2g3h4-i5j6-7890-1234-567890abcdef"
 *               purpose:
 *                 type: string
 *                 description: Purpose of the QR code
 *                 example: "Product traceability and authentication"
 *               customData:
 *                 type: object
 *                 description: Additional custom data for the QR code
 *                 example: {"batchInfo": "Premium Ashwagandha", "harvestDate": "2025-08-15"}
 *     responses:
 *       201:
 *         description: QR code generated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
// Generate a new QR code
router.post('/', validate(generateQRCodeSchema), generateQRCodeHandler);

/**
 * @swagger
 * /api/qr-codes:
 *   get:
 *     summary: Get all QR codes
 *     description: Retrieve QR codes with pagination and filtering
 *     tags: [QR Codes]
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
 *         name: entityType
 *         schema:
 *           $ref: '#/components/schemas/QREntityType'
 *         description: Filter by entity type
 *       - in: query
 *         name: entityId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by entity ID
 *     responses:
 *       200:
 *         description: List of QR codes
 *       401:
 *         description: Unauthorized
 */
// Get all QR codes with pagination and filters
router.get('/', validate(getQRCodesSchema), getQRCodesHandler);

/**
 * @swagger
 * /api/qr-codes/scan/{qrHash}:
 *   get:
 *     summary: Scan a QR code
 *     description: Scan a QR code and get complete traceability information
 *     tags: [QR Codes]
 *     parameters:
 *       - in: path
 *         name: qrHash
 *         required: true
 *         schema:
 *           type: string
 *         description: QR code hash to scan
 *     responses:
 *       200:
 *         description: Traceability information for the scanned QR code
 *       404:
 *         description: QR code not found
 */
// Scan a QR code and get traceability information
router.get('/scan/:qrHash', scanQRCodeHandler);

/**
 * @swagger
 * /api/qr-codes/{id}/image:
 *   get:
 *     summary: Get QR code as image
 *     description: Retrieve the QR code as a PNG image
 *     tags: [QR Codes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: QR code ID
 *     responses:
 *       200:
 *         description: QR code image (PNG)
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: QR code not found
 *       401:
 *         description: Unauthorized
 */
// Get QR code as image
router.get('/:id/image', getQRCodeImageHandler);

/**
 * @swagger
 * /api/qr-codes/{id}:
 *   get:
 *     summary: Get a QR code by ID
 *     description: Retrieve detailed information about a specific QR code
 *     tags: [QR Codes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: QR code ID
 *     responses:
 *       200:
 *         description: QR code details
 *       404:
 *         description: QR code not found
 *       401:
 *         description: Unauthorized
 */
// Get a QR code by ID
router.get('/:id', getQRCodeByIdHandler);

/**
 * @swagger
 * /api/qr-codes/{id}:
 *   put:
 *     summary: Update QR code metadata
 *     description: Update metadata of an existing QR code
 *     tags: [QR Codes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: QR code ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               purpose:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: QR code updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: QR code not found
 *       401:
 *         description: Unauthorized
 */
// Update QR code metadata
router.put('/:id', validate(updateQRCodeSchema), updateQRCodeHandler);

/**
 * @swagger
 * /api/qr-codes/{id}:
 *   delete:
 *     summary: Delete a QR code
 *     description: Delete a QR code from the system
 *     tags: [QR Codes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: QR code ID
 *     responses:
 *       200:
 *         description: QR code deleted successfully
 *       404:
 *         description: QR code not found
 *       401:
 *         description: Unauthorized
 */
// Delete a QR code
router.delete('/:id', deleteQRCodeHandler);

module.exports = router;
