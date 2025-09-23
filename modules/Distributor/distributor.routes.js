const express = require('express');
const { validate } = require('../Auth/middlewares/validate');
const { authMiddleware } = require('../Auth/middlewares/auth.middleware');
const {
  addInventoryItemSchema,
  updateInventoryItemSchema,
  createShipmentSchema,
  updateShipmentStatusSchema,
  createVerificationSchema,
  updateVerificationSchema,
  inventoryFilterSchema,
  shipmentFilterSchema,
  verificationFilterSchema,
  analyticsQuerySchema
} = require('./distributor.validation');
const {
  getDistributorDashboardHandler,
  getInventoryHandler,
  addInventoryItemHandler,
  updateInventoryItemHandler,
  getShipmentsHandler,
  createShipmentHandler,
  updateShipmentStatusHandler,
  getVerificationsHandler,
  createVerificationHandler,
  updateVerificationHandler,
  generateAnalyticsHandler,
  scanQRCodeHandler
} = require('./distributor.controller');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     DistributorInventory:
 *       type: object
 *       required:
 *         - distributorId
 *         - productType
 *         - entityId
 *         - quantity
 *         - unit
 *       properties:
 *         inventoryId:
 *           type: string
 *           format: uuid
 *         distributorId:
 *           type: string
 *           format: uuid
 *         productType:
 *           type: string
 *           enum: [RAW_MATERIAL_BATCH, FINISHED_GOOD]
 *         entityId:
 *           type: string
 *           format: uuid
 *         quantity:
 *           type: number
 *           minimum: 0
 *         unit:
 *           type: string
 *           enum: [KG, TONNES, GRAMS, POUNDS, PIECES, BOTTLES, BOXES]
 *         location:
 *           type: string
 *         warehouseSection:
 *           type: string
 *         status:
 *           type: string
 *           enum: [IN_STOCK, LOW_STOCK, OUT_OF_STOCK, RESERVED, DAMAGED, EXPIRED, QUARANTINED]
 *           default: IN_STOCK
 *         receivedDate:
 *           type: string
 *           format: date-time
 *         expiryDate:
 *           type: string
 *           format: date-time
 *         supplierInfo:
 *           type: object
 *         qualityNotes:
 *           type: string
 *         storageConditions:
 *           type: string
 *         lastUpdated:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *     
 *     DistributorShipment:
 *       type: object
 *       required:
 *         - distributorId
 *         - recipientType
 *         - recipientId
 *         - recipientAddress
 *       properties:
 *         shipmentId:
 *           type: string
 *           format: uuid
 *         distributorId:
 *           type: string
 *           format: uuid
 *         shipmentNumber:
 *           type: string
 *         recipientType:
 *           type: string
 *           enum: [MANUFACTURER, DISTRIBUTOR, RETAILER, CUSTOMER, LAB]
 *         recipientId:
 *           type: string
 *           format: uuid
 *         recipientName:
 *           type: string
 *         recipientAddress:
 *           type: string
 *         recipientPhone:
 *           type: string
 *         shipmentDate:
 *           type: string
 *           format: date-time
 *         expectedDelivery:
 *           type: string
 *           format: date-time
 *         actualDelivery:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [PREPARING, DISPATCHED, IN_TRANSIT, DELIVERED, DELAYED, CANCELLED, RETURNED]
 *           default: PREPARING
 *         trackingNumber:
 *           type: string
 *         carrierInfo:
 *           type: object
 *         shippingCost:
 *           type: number
 *         totalValue:
 *           type: number
 *         notes:
 *           type: string
 *         specialInstructions:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     DistributorVerification:
 *       type: object
 *       required:
 *         - distributorId
 *         - verificationType
 *         - entityType
 *         - entityId
 *       properties:
 *         verificationId:
 *           type: string
 *           format: uuid
 *         distributorId:
 *           type: string
 *           format: uuid
 *         verificationType:
 *           type: string
 *           enum: [INCOMING_GOODS_VERIFICATION, QUALITY_CHECK, AUTHENTICITY_VERIFICATION, BATCH_VERIFICATION, DOCUMENT_VERIFICATION, STORAGE_CONDITION_CHECK, EXPIRY_VERIFICATION]
 *         entityType:
 *           type: string
 *           enum: [RAW_MATERIAL_BATCH, FINISHED_GOOD, SHIPMENT, INVENTORY_ITEM]
 *         entityId:
 *           type: string
 *           format: uuid
 *         status:
 *           type: string
 *           enum: [PENDING, IN_PROGRESS, VERIFIED, REJECTED, REQUIRES_ATTENTION]
 *           default: PENDING
 *         verificationDate:
 *           type: string
 *           format: date-time
 *         verifiedBy:
 *           type: string
 *           format: uuid
 *         verificationMethod:
 *           type: string
 *         results:
 *           type: object
 *         notes:
 *           type: string
 *         photosUrls:
 *           type: array
 *           items:
 *             type: string
 *         documentRefs:
 *           type: array
 *           items:
 *             type: string
 *         blockchainTxHash:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/distributor/dashboard:
 *   get:
 *     summary: Get distributor dashboard metrics
 *     tags: [Distributor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalInventoryItems:
 *                       type: number
 *                     totalInventoryValue:
 *                       type: number
 *                     lowStockItems:
 *                       type: number
 *                     expiringSoonItems:
 *                       type: number
 *                     totalShipments:
 *                       type: number
 *                     pendingShipments:
 *                       type: number
 *                     completedShipments:
 *                       type: number
 *                     shipmentsThisMonth:
 *                       type: number
 *                     verificationsPerformed:
 *                       type: number
 *                     recentShipments:
 *                       type: array
 *                     inventorySummary:
 *                       type: object
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/dashboard', authMiddleware, getDistributorDashboardHandler);

/**
 * @swagger
 * /api/distributor/inventory:
 *   get:
 *     summary: Get distributor inventory
 *     tags: [Distributor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [IN_STOCK, LOW_STOCK, OUT_OF_STOCK, RESERVED, DAMAGED, EXPIRED, QUARANTINED]
 *       - in: query
 *         name: productType
 *         schema:
 *           type: string
 *           enum: [RAW_MATERIAL_BATCH, FINISHED_GOOD]
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Inventory retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Add inventory item
 *     tags: [Distributor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productType
 *               - entityId
 *               - quantity
 *               - unit
 *             properties:
 *               productType:
 *                 type: string
 *                 enum: [RAW_MATERIAL_BATCH, FINISHED_GOOD]
 *               entityId:
 *                 type: string
 *                 format: uuid
 *               quantity:
 *                 type: number
 *                 minimum: 0
 *               unit:
 *                 type: string
 *                 enum: [KG, TONNES, GRAMS, POUNDS, PIECES, BOTTLES, BOXES]
 *               location:
 *                 type: string
 *               warehouseSection:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [IN_STOCK, LOW_STOCK, OUT_OF_STOCK, RESERVED, DAMAGED, EXPIRED, QUARANTINED]
 *               receivedDate:
 *                 type: string
 *                 format: date-time
 *               expiryDate:
 *                 type: string
 *                 format: date-time
 *               supplierInfo:
 *                 type: object
 *               qualityNotes:
 *                 type: string
 *               storageConditions:
 *                 type: string
 *               supplierId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Inventory item added successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Entity not found
 *       500:
 *         description: Internal server error
 */
router.get('/inventory', authMiddleware, validate(inventoryFilterSchema, 'query'), getInventoryHandler);
router.post('/inventory', authMiddleware, validate(addInventoryItemSchema), addInventoryItemHandler);

/**
 * @swagger
 * /api/distributor/inventory/{inventoryId}:
 *   patch:
 *     summary: Update inventory item
 *     tags: [Distributor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: inventoryId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *                 minimum: 0
 *               location:
 *                 type: string
 *               warehouseSection:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [IN_STOCK, LOW_STOCK, OUT_OF_STOCK, RESERVED, DAMAGED, EXPIRED, QUARANTINED]
 *               expiryDate:
 *                 type: string
 *                 format: date-time
 *               qualityNotes:
 *                 type: string
 *               storageConditions:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inventory item updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Inventory item not found
 *       500:
 *         description: Internal server error
 */
router.patch('/inventory/:inventoryId', authMiddleware, validate(updateInventoryItemSchema), updateInventoryItemHandler);

/**
 * @swagger
 * /api/distributor/shipments:
 *   get:
 *     summary: Get distributor shipments
 *     tags: [Distributor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PREPARING, DISPATCHED, IN_TRANSIT, DELIVERED, DELAYED, CANCELLED, RETURNED]
 *       - in: query
 *         name: recipientType
 *         schema:
 *           type: string
 *           enum: [MANUFACTURER, DISTRIBUTOR, RETAILER, CUSTOMER, LAB]
 *       - in: query
 *         name: trackingNumber
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Shipments retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Create shipment
 *     tags: [Distributor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DistributorShipment'
 *     responses:
 *       201:
 *         description: Shipment created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Recipient not found
 *       500:
 *         description: Internal server error
 */
router.get('/shipments', authMiddleware, validate(shipmentFilterSchema, 'query'), getShipmentsHandler);
router.post('/shipments', authMiddleware, validate(createShipmentSchema), createShipmentHandler);

/**
 * @swagger
 * /api/distributor/shipments/{shipmentId}/status:
 *   patch:
 *     summary: Update shipment status
 *     tags: [Distributor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shipmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PREPARING, DISPATCHED, IN_TRANSIT, DELIVERED, DELAYED, CANCELLED, RETURNED]
 *               trackingNumber:
 *                 type: string
 *               carrierInfo:
 *                 type: object
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Shipment status updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Shipment not found
 *       500:
 *         description: Internal server error
 */
router.patch('/shipments/:shipmentId/status', authMiddleware, validate(updateShipmentStatusSchema), updateShipmentStatusHandler);

/**
 * @swagger
 * /api/distributor/verifications:
 *   get:
 *     summary: Get distributor verifications
 *     tags: [Distributor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, IN_PROGRESS, VERIFIED, REJECTED, REQUIRES_ATTENTION]
 *       - in: query
 *         name: verificationType
 *         schema:
 *           type: string
 *           enum: [INCOMING_GOODS_VERIFICATION, QUALITY_CHECK, AUTHENTICITY_VERIFICATION, BATCH_VERIFICATION, DOCUMENT_VERIFICATION, STORAGE_CONDITION_CHECK, EXPIRY_VERIFICATION]
 *       - in: query
 *         name: entityType
 *         schema:
 *           type: string
 *           enum: [RAW_MATERIAL_BATCH, FINISHED_GOOD, SHIPMENT, INVENTORY_ITEM]
 *     responses:
 *       200:
 *         description: Verifications retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Create verification
 *     tags: [Distributor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DistributorVerification'
 *     responses:
 *       201:
 *         description: Verification created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/verifications', authMiddleware, validate(verificationFilterSchema, 'query'), getVerificationsHandler);
router.post('/verifications', authMiddleware, validate(createVerificationSchema), createVerificationHandler);

/**
 * @swagger
 * /api/distributor/verifications/{verificationId}:
 *   patch:
 *     summary: Update verification
 *     tags: [Distributor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: verificationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, IN_PROGRESS, VERIFIED, REJECTED, REQUIRES_ATTENTION]
 *               results:
 *                 type: object
 *               notes:
 *                 type: string
 *               photosUrls:
 *                 type: array
 *                 items:
 *                   type: string
 *               documentRefs:
 *                 type: array
 *                 items:
 *                   type: string
 *               blockchainTxHash:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verification updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Verification not found
 *       500:
 *         description: Internal server error
 */
router.patch('/verifications/:verificationId', authMiddleware, validate(updateVerificationSchema), updateVerificationHandler);

/**
 * @swagger
 * /api/distributor/analytics:
 *   get:
 *     summary: Generate distributor analytics
 *     tags: [Distributor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: reportType
 *         schema:
 *           type: string
 *           enum: [INVENTORY_SUMMARY, SHIPMENT_ANALYSIS, QUALITY_METRICS, FINANCIAL_SUMMARY, PERFORMANCE_KPI]
 *           default: INVENTORY_SUMMARY
 *     responses:
 *       200:
 *         description: Analytics generated successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/analytics', authMiddleware, validate(analyticsQuerySchema, 'query'), generateAnalyticsHandler);

/**
 * @swagger
 * /api/distributor/scan-qr:
 *   post:
 *     summary: Scan QR code for product verification
 *     tags: [Distributor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - qrCode
 *             properties:
 *               qrCode:
 *                 type: string
 *                 description: QR code data to scan
 *     responses:
 *       200:
 *         description: QR code scanned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   description: QR code information
 *       400:
 *         description: Invalid QR code data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/scan-qr', authMiddleware, scanQRCodeHandler);

module.exports = router;