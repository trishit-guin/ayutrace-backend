const {
  createSupplyChainEvent,
  getSupplyChainEvents,
  getSupplyChainEventById,
  updateSupplyChainEvent,
  deleteSupplyChainEvent,
  getSupplyChainByBatch,
} = require('./supplyChain.service');

const { scanQRCode } = require('../QRCode/qrCode.service');

/**
 * @swagger
 * /api/supply-chain-events:
 *   post:
 *     summary: Create a new supply chain event
 *     tags: [Supply Chain Events]
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
 *                 type: string
 *                 enum: [TESTING, DISTRIBUTION]
 *               handlerId:
 *                 type: string
 *               fromLocationId:
 *                 type: string
 *               toLocationId:
 *                 type: string
 *               rawMaterialBatchId:
 *                 type: string
 *               finishedGoodId:
 *                 type: string
 *               notes:
 *                 type: string
 *               custody:
 *                 type: object
 *                 properties:
 *                   transferredBy:
 *                     type: string
 *                   receivedBy:
 *                     type: string
 *                   transferNotes:
 *                     type: string
 *     responses:
 *       201:
 *         description: Supply chain event created successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Internal server error
 */
const createSupplyChainEventHandler = async (req, res) => {
  try {
    console.log(`📥 [SupplyChainController] Received supply chain event creation request:`, {
      eventType: req.body.eventType,
      handlerId: req.body.handlerId || req.user?.userId,
      finishedGoodId: req.body.finishedGoodId,
      qrHash: req.body.qrHash,
      qrData: req.body.qrData,
      userAgent: req.headers['user-agent']
    });

    let finishedGoodId = req.body.finishedGoodId;
    let additionalProductData = {};

    // Method 1: If full QR data object is provided directly
    if (req.body.qrData && typeof req.body.qrData === 'object') {
      console.log(`🔍 [SupplyChainController] Extracting data from provided QR data object:`, req.body.qrData);
      
      if (req.body.qrData.entityType === 'FINISHED_GOOD') {
        finishedGoodId = req.body.qrData.entityId;
        additionalProductData = {
          productInfo: req.body.qrData.customData?.productInfo,
          batchNumber: req.body.qrData.customData?.batchNumber,
          productType: req.body.qrData.customData?.productType
        };
        console.log(`✅ [SupplyChainController] Extracted from QR data - finishedGoodId: ${finishedGoodId}`, additionalProductData);
      }
    }
    // Method 2: If QR code hash is provided, scan it from database
    else if (req.body.qrHash && !finishedGoodId) {
      console.log(`🔍 [SupplyChainController] Extracting finished good ID from QR code hash: ${req.body.qrHash}`);
      
      try {
        const qrData = await scanQRCode(req.body.qrHash);
        
        if (qrData && qrData.entityType === 'FINISHED_GOOD') {
          finishedGoodId = qrData.entityId;
          console.log(`✅ [SupplyChainController] Extracted finished good ID from QR hash: ${finishedGoodId}`);
        } else {
          console.warn(`⚠️ [SupplyChainController] QR code does not contain finished good data:`, qrData?.entityType);
        }
      } catch (qrError) {
        console.error(`❌ [SupplyChainController] Failed to scan QR code:`, qrError.message);
      }
    }

    // Add the authenticated user as the handler and extracted finishedGoodId
    const eventData = {
      ...req.body,
      handlerId: req.user?.userId || req.body.handlerId,
      finishedGoodId: finishedGoodId,
      // Add additional product data for reference
      ...additionalProductData
    };

    console.log(`📦 [SupplyChainController] Final event data:`, {
      eventType: eventData.eventType,
      handlerId: eventData.handlerId,
      finishedGoodId: eventData.finishedGoodId,
      productInfo: eventData.productInfo,
      batchNumber: eventData.batchNumber,
      productType: eventData.productType
    });
    
    const result = await createSupplyChainEvent(eventData);
    
    console.log(`✅ [SupplyChainController] Supply chain event created successfully:`, {
      eventId: result.eventId,
      eventType: result.eventType
    });
    
    res.status(201).json({
      success: true,
      data: result,
      message: 'Supply chain event created successfully',
    });
  } catch (error) {
    console.error(`❌ [SupplyChainController] Failed to create supply chain event:`, {
      error: error.message,
      body: req.body
    });
    
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/supply-chain-events:
 *   get:
 *     summary: Get all supply chain events with pagination and filters
 *     tags: [Supply Chain Events]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: eventType
 *         schema:
 *           type: string
 *           enum: [TESTING, DISTRIBUTION]
 *       - in: query
 *         name: handlerId
 *         schema:
 *           type: string
 *       - in: query
 *         name: batchId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of supply chain events
 *       500:
 *         description: Internal server error
 */
const getSupplyChainEventsHandler = async (req, res) => {
  try {
    const { page = 1, limit = 10, eventType, handlerId, batchId } = req.query;
    const result = await getSupplyChainEvents({
      page: parseInt(page),
      limit: parseInt(limit),
      eventType,
      handlerId,
      batchId,
    });
    res.status(200).json({
      success: true,
      data: result,
      message: 'Supply chain events retrieved successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/supply-chain-events/{id}:
 *   get:
 *     summary: Get a supply chain event by ID
 *     tags: [Supply Chain Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Supply chain event details
 *       404:
 *         description: Supply chain event not found
 *       500:
 *         description: Internal server error
 */
const getSupplyChainEventByIdHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getSupplyChainEventById(id);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Supply chain event not found',
      });
    }

    res.status(200).json({
      success: true,
      data: result,
      message: 'Supply chain event retrieved successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/supply-chain-events/batch/{batchId}:
 *   get:
 *     summary: Get supply chain events for a specific batch
 *     tags: [Supply Chain Events]
 *     parameters:
 *       - in: path
 *         name: batchId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Supply chain events for the batch
 *       404:
 *         description: Batch not found
 *       500:
 *         description: Internal server error
 */
const getSupplyChainByBatchHandler = async (req, res) => {
  try {
    const { batchId } = req.params;
    const result = await getSupplyChainByBatch(batchId);
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'Supply chain for batch retrieved successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/supply-chain-events/{id}:
 *   put:
 *     summary: Update a supply chain event
 *     tags: [Supply Chain Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventType:
 *                 type: string
 *                 enum: [TESTING, DISTRIBUTION]
 *               notes:
 *                 type: string
 *               custody:
 *                 type: object
 *     responses:
 *       200:
 *         description: Supply chain event updated successfully
 *       404:
 *         description: Supply chain event not found
 *       500:
 *         description: Internal server error
 */
const updateSupplyChainEventHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updateSupplyChainEvent(id, req.body);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Supply chain event not found',
      });
    }

    res.status(200).json({
      success: true,
      data: result,
      message: 'Supply chain event updated successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/supply-chain-events/{id}:
 *   delete:
 *     summary: Delete a supply chain event
 *     tags: [Supply Chain Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Supply chain event deleted successfully
 *       404:
 *         description: Supply chain event not found
 *       500:
 *         description: Internal server error
 */
const deleteSupplyChainEventHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteSupplyChainEvent(id);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Supply chain event not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Supply chain event deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  createSupplyChainEventHandler,
  getSupplyChainEventsHandler,
  getSupplyChainEventByIdHandler,
  getSupplyChainByBatchHandler,
  updateSupplyChainEventHandler,
  deleteSupplyChainEventHandler,
};
