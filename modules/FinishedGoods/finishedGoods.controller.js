const {
  createFinishedGood,
  getFinishedGoods,
  getFinishedGoodById,
  updateFinishedGood,
  deleteFinishedGood,
  getFinishedGoodComposition,
} = require('./finishedGoods.service');

/**
 * @swagger
 * /api/finished-goods:
 *   post:
 *     summary: Create a new finished good product
 *     tags: [Finished Goods]
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
 *               - manufacturerId
 *               - composition
 *             properties:
 *               productName:
 *                 type: string
 *               productType:
 *                 type: string
 *                 enum: [POWDER, CAPSULE, TABLET, SYRUP, OIL, CREAM]
 *               quantity:
 *                 type: number
 *               unit:
 *                 type: string
 *                 enum: [KG, TONNES, GRAMS, POUNDS, PIECES, BOTTLES, BOXES]
 *               manufacturerId:
 *                 type: string
 *               description:
 *                 type: string
 *               batchNumber:
 *                 type: string
 *               expiryDate:
 *                 type: string
 *                 format: date
 *               composition:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     rawMaterialBatchId:
 *                       type: string
 *                     percentage:
 *                       type: number
 *                     quantityUsed:
 *                       type: number
 *     responses:
 *       201:
 *         description: Finished good created successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Internal server error
 */
const createFinishedGoodHandler = async (req, res) => {
  try {
    // Add the authenticated user as the manufacturer
    const productData = {
      ...req.body,
      manufacturerId: req.user?.userId || req.body.manufacturerId
    };
    
    const result = await createFinishedGood(productData);
    res.status(201).json({
      success: true,
      data: result,
      message: 'Finished good created successfully',
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
 * /api/finished-goods:
 *   get:
 *     summary: Get all finished goods with pagination and filters
 *     tags: [Finished Goods]
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
 *         name: productName
 *         schema:
 *           type: string
 *       - in: query
 *         name: productType
 *         schema:
 *           type: string
 *           enum: [POWDER, CAPSULE, TABLET, SYRUP, OIL, CREAM]
 *       - in: query
 *         name: manufacturerId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of finished goods
 *       500:
 *         description: Internal server error
 */
const getFinishedGoodsHandler = async (req, res) => {
  try {
    const { page = 1, limit = 10, productName, productType, manufacturerId } = req.query;
    const result = await getFinishedGoods({
      page: parseInt(page),
      limit: parseInt(limit),
      productName,
      productType,
      manufacturerId,
    });
    res.status(200).json({
      success: true,
      data: result,
      message: 'Finished goods retrieved successfully',
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
 * /api/finished-goods/{id}:
 *   get:
 *     summary: Get a finished good by ID
 *     tags: [Finished Goods]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Finished good details
 *       404:
 *         description: Finished good not found
 *       500:
 *         description: Internal server error
 */
const getFinishedGoodByIdHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getFinishedGoodById(id);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Finished good not found',
      });
    }

    res.status(200).json({
      success: true,
      data: result,
      message: 'Finished good retrieved successfully',
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
 * /api/finished-goods/{id}/composition:
 *   get:
 *     summary: Get detailed composition and traceability of a finished good
 *     tags: [Finished Goods]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Finished good composition and traceability
 *       404:
 *         description: Finished good not found
 *       500:
 *         description: Internal server error
 */
const getFinishedGoodCompositionHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getFinishedGoodComposition(id);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Finished good not found',
      });
    }

    res.status(200).json({
      success: true,
      data: result,
      message: 'Finished good composition retrieved successfully',
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
 * /api/finished-goods/{id}:
 *   put:
 *     summary: Update a finished good
 *     tags: [Finished Goods]
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
 *               productName:
 *                 type: string
 *               productType:
 *                 type: string
 *                 enum: [POWDER, CAPSULE, TABLET, SYRUP, OIL, CREAM]
 *               quantity:
 *                 type: number
 *               unit:
 *                 type: string
 *                 enum: [KG, TONNES, GRAMS, POUNDS, PIECES, BOTTLES, BOXES]
 *               description:
 *                 type: string
 *               batchNumber:
 *                 type: string
 *               expiryDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Finished good updated successfully
 *       404:
 *         description: Finished good not found
 *       500:
 *         description: Internal server error
 */
const updateFinishedGoodHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updateFinishedGood(id, req.body);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Finished good not found',
      });
    }

    res.status(200).json({
      success: true,
      data: result,
      message: 'Finished good updated successfully',
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
 * /api/finished-goods/{id}:
 *   delete:
 *     summary: Delete a finished good
 *     tags: [Finished Goods]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Finished good deleted successfully
 *       404:
 *         description: Finished good not found
 *       500:
 *         description: Internal server error
 */
const deleteFinishedGoodHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteFinishedGood(id);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Finished good not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Finished good deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get finished goods for the logged-in user (manufacturer)
const getFinishedGoodsByUserHandler = async (req, res) => {
  try {
    // userId from JWT (attached by authMiddleware)
    const userId = req.user.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not found in token' });
    }
    // Optionally support pagination
    const { page = 1, limit = 10 } = req.query;
    const result = await require('./finishedGoods.service').getFinishedGoods({
      page: parseInt(page),
      limit: parseInt(limit),
      manufacturerId: userId,
    });
    res.status(200).json({
      success: true,
      data: result,
      message: 'Finished goods for user retrieved successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createFinishedGoodHandler,
  getFinishedGoodsHandler,
  getFinishedGoodByIdHandler,
  getFinishedGoodCompositionHandler,
  updateFinishedGoodHandler,
  deleteFinishedGoodHandler,
  getFinishedGoodsByUserHandler,
};
