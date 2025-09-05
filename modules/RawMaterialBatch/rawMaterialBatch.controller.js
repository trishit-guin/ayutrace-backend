const {
  createRawMaterialBatch,
  getRawMaterialBatches,
  getRawMaterialBatchById,
  updateRawMaterialBatch,
  deleteRawMaterialBatch,
} = require('./rawMaterialBatch.service');

/**
 * @swagger
 * /api/raw-material-batches:
 *   post:
 *     summary: Create a new raw material batch
 *     tags: [Raw Material Batches]
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
 *               - collectionEventIds
 *             properties:
 *               herbName:
 *                 type: string
 *               scientificName:
 *                 type: string
 *               quantity:
 *                 type: number
 *               unit:
 *                 type: string
 *                 enum: [KG, TONNES, GRAMS, POUNDS]
 *               description:
 *                 type: string
 *               notes:
 *                 type: string
 *               collectionEventIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Raw material batch created successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Internal server error
 */
const createRawMaterialBatchHandler = async (req, res) => {
  try {
    const result = await createRawMaterialBatch(req.body);
    res.status(201).json({
      success: true,
      data: result,
      message: 'Raw material batch created successfully',
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
 * /api/raw-material-batches:
 *   get:
 *     summary: Get all raw material batches with pagination and filters
 *     tags: [Raw Material Batches]
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
 *         name: herbName
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [CREATED, IN_PROCESSING, PROCESSED, QUARANTINED]
 *     responses:
 *       200:
 *         description: List of raw material batches
 *       500:
 *         description: Internal server error
 */
const getRawMaterialBatchesHandler = async (req, res) => {
  try {
    const { page = 1, limit = 10, herbName, status } = req.query;
    const result = await getRawMaterialBatches({
      page: parseInt(page),
      limit: parseInt(limit),
      herbName,
      status,
    });
    res.status(200).json({
      success: true,
      data: result,
      message: 'Raw material batches retrieved successfully',
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
 * /api/raw-material-batches/{id}:
 *   get:
 *     summary: Get a raw material batch by ID
 *     tags: [Raw Material Batches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Raw material batch details
 *       404:
 *         description: Raw material batch not found
 *       500:
 *         description: Internal server error
 */
const getRawMaterialBatchByIdHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getRawMaterialBatchById(id);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Raw material batch not found',
      });
    }

    res.status(200).json({
      success: true,
      data: result,
      message: 'Raw material batch retrieved successfully',
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
 * /api/raw-material-batches/{id}:
 *   put:
 *     summary: Update a raw material batch
 *     tags: [Raw Material Batches]
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
 *               herbName:
 *                 type: string
 *               scientificName:
 *                 type: string
 *               quantity:
 *                 type: number
 *               unit:
 *                 type: string
 *                 enum: [KG, TONNES, GRAMS, POUNDS]
 *               description:
 *                 type: string
 *               notes:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [CREATED, IN_PROCESSING, PROCESSED, QUARANTINED]
 *     responses:
 *       200:
 *         description: Raw material batch updated successfully
 *       404:
 *         description: Raw material batch not found
 *       500:
 *         description: Internal server error
 */
const updateRawMaterialBatchHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updateRawMaterialBatch(id, req.body);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Raw material batch not found',
      });
    }

    res.status(200).json({
      success: true,
      data: result,
      message: 'Raw material batch updated successfully',
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
 * /api/raw-material-batches/{id}:
 *   delete:
 *     summary: Delete a raw material batch
 *     tags: [Raw Material Batches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Raw material batch deleted successfully
 *       404:
 *         description: Raw material batch not found
 *       500:
 *         description: Internal server error
 */
const deleteRawMaterialBatchHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteRawMaterialBatch(id);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Raw material batch not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Raw material batch deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  createRawMaterialBatchHandler,
  getRawMaterialBatchesHandler,
  getRawMaterialBatchByIdHandler,
  updateRawMaterialBatchHandler,
  deleteRawMaterialBatchHandler,
};
