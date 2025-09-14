const {
  createSupplyChainEvent,
  getSupplyChainEvents,
  getSupplyChainEventById,
  updateSupplyChainEvent,
  deleteSupplyChainEvent,
  getSupplyChainByBatch,
} = require('./supplyChain.service');

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
    // Add the authenticated user as the handler
    const eventData = {
      ...req.body,
      handlerId: req.user?.userId || req.body.handlerId
    };
    
    const result = await createSupplyChainEvent(eventData);
    res.status(201).json({
      success: true,
      data: result,
      message: 'Supply chain event created successfully',
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
