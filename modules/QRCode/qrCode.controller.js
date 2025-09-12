const {
  generateQRCode,
  getQRCodes,
  getQRCodeById,
  updateQRCode,
  deleteQRCode,
  scanQRCode,
} = require('./qrCode.service');
const QRCode = require('qrcode');

// Get QR code image by entity ID
const getQRCodeImageByEntityIdHandler = async (req, res) => {
  try {
    const { entityId } = req.params;
    // Find QR code for this entity using proper foreign key relationships
    let qrCode = null;
    
    // Try to find QR code by checking all entity types
    const rawMaterialQR = await require('./qrCode.service').getQRCodes({ 
      page: 1, 
      limit: 1, 
      entityType: 'RAW_MATERIAL_BATCH',
      entityId 
    });
    
    const finishedGoodQR = await require('./qrCode.service').getQRCodes({ 
      page: 1, 
      limit: 1, 
      entityType: 'FINISHED_GOOD',
      entityId 
    });
    
    const supplyChainQR = await require('./qrCode.service').getQRCodes({ 
      page: 1, 
      limit: 1, 
      entityType: 'SUPPLY_CHAIN_EVENT',
      entityId 
    });
    
    if (rawMaterialQR.qrCodes?.length > 0) {
      qrCode = rawMaterialQR.qrCodes[0];
    } else if (finishedGoodQR.qrCodes?.length > 0) {
      qrCode = finishedGoodQR.qrCodes[0];
    } else if (supplyChainQR.qrCodes?.length > 0) {
      qrCode = supplyChainQR.qrCodes[0];
    }
    
    if (!qrCode) {
      return res.status(404).send('QR code not found for entity');
    }
    
    const qrData = JSON.stringify({
      entityType: qrCode.entityType,
      entityId: qrCode.entityId,
      qrHash: qrCode.qrHash,
      customData: qrCode.customData
    });
    
    // Generate PNG image
    const qrImageBuffer = await QRCode.toBuffer(qrData, { type: 'png' });
    res.set('Content-Type', 'image/png');
    res.send(qrImageBuffer);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

/**
 * @swagger
 * /api/qr-codes:
 *   post:
 *     summary: Generate a new QR code for traceability
 *     tags: [QR Codes]
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
 *                 type: string
 *                 enum: [RAW_MATERIAL_BATCH, FINISHED_GOOD, SUPPLY_CHAIN_EVENT]
 *               entityId:
 *                 type: string
 *               generatedBy:
 *                 type: string
 *               customData:
 *                 type: object
 *     responses:
 *       201:
 *         description: QR code generated successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Internal server error
 */
const generateQRCodeHandler = async (req, res) => {
  try {
    // Add the authenticated user as the generator
    const qrData = {
      ...req.body,
      generatedBy: req.user?.userId || req.body.generatedBy
    };
    
    const result = await generateQRCode(qrData);
    const qrDataForImage = JSON.stringify({
      entityType: req.body.entityType,
      entityId: req.body.entityId,
      customData: req.body.customData,
      qrHash: result.qrHash
    });
    const qrImage = await QRCode.toDataURL(qrDataForImage);
    res.status(201).json({
      success: true,
      data: {
        ...result,
        qrImage
      },
      message: 'QR code generated successfully',
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
 * /api/qr-codes:
 *   get:
 *     summary: Get all QR codes with pagination and filters
 *     tags: [QR Codes]
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
 *         name: entityType
 *         schema:
 *           type: string
 *           enum: [RAW_MATERIAL_BATCH, FINISHED_GOOD, SUPPLY_CHAIN_EVENT]
 *       - in: query
 *         name: entityId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of QR codes
 *       500:
 *         description: Internal server error
 */
const getQRCodesHandler = async (req, res) => {
  try {
    const { page = 1, limit = 10, entityType, entityId } = req.query;
    const result = await getQRCodes({
      page: parseInt(page),
      limit: parseInt(limit),
      entityType,
      entityId,
    });
    res.status(200).json({
      success: true,
      data: result,
      message: 'QR codes retrieved successfully',
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
 * /api/qr-codes/{id}:
 *   get:
 *     summary: Get a QR code by ID
 *     tags: [QR Codes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: QR code details
 *       404:
 *         description: QR code not found
 *       500:
 *         description: Internal server error
 */
const getQRCodeByIdHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getQRCodeById(id);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'QR code not found',
      });
    }

    res.status(200).json({
      success: true,
      data: result,
      message: 'QR code retrieved successfully',
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
 * /api/qr-codes/scan/{qrHash}:
 *   get:
 *     summary: Scan a QR code and get traceability information
 *     tags: [QR Codes]
 *     parameters:
 *       - in: path
 *         name: qrHash
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: QR code scan results with traceability data
 *       404:
 *         description: QR code not found
 *       500:
 *         description: Internal server error
 */
const scanQRCodeHandler = async (req, res) => {
  try {
    const { qrHash } = req.params;
    const result = await scanQRCode(qrHash);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'QR code not found or invalid',
      });
    }

    res.status(200).json({
      success: true,
      data: result,
      message: 'QR code scanned successfully',
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
 * /api/qr-codes/{id}/image:
 *   get:
 *     summary: Get QR code as image
 *     tags: [QR Codes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [png, svg]
 *           default: png
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 200
 *     responses:
 *       200:
 *         description: QR code image
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *           image/svg+xml:
 *             schema:
 *               type: string
 *       404:
 *         description: QR code not found
 *       500:
 *         description: Internal server error
 */
const getQRCodeImageHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'png', size = 200 } = req.query;
    
    const qrCode = await getQRCodeById(id);
    if (!qrCode) {
      return res.status(404).json({
        success: false,
        error: 'QR code not found',
      });
    }

    const qrOptions = {
      width: parseInt(size),
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    };

    if (format === 'svg') {
      const svgString = await QRCode.toString(qrCode.qrHash, { type: 'svg', ...qrOptions });
      res.setHeader('Content-Type', 'image/svg+xml');
      res.send(svgString);
    } else {
      const pngBuffer = await QRCode.toBuffer(qrCode.qrHash, { type: 'png', ...qrOptions });
      res.setHeader('Content-Type', 'image/png');
      res.send(pngBuffer);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/qr-codes/{id}:
 *   put:
 *     summary: Update QR code metadata
 *     tags: [QR Codes]
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
 *               customData:
 *                 type: object
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: QR code updated successfully
 *       404:
 *         description: QR code not found
 *       500:
 *         description: Internal server error
 */
const updateQRCodeHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updateQRCode(id, req.body);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'QR code not found',
      });
    }

    res.status(200).json({
      success: true,
      data: result,
      message: 'QR code updated successfully',
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
 * /api/qr-codes/{id}:
 *   delete:
 *     summary: Delete a QR code
 *     tags: [QR Codes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: QR code deleted successfully
 *       404:
 *         description: QR code not found
 *       500:
 *         description: Internal server error
 */
const deleteQRCodeHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteQRCode(id);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'QR code not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'QR code deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  generateQRCodeHandler,
  getQRCodesHandler,
  getQRCodeByIdHandler,
  scanQRCodeHandler,
  getQRCodeImageHandler,
  getQRCodeImageByEntityIdHandler,
  updateQRCodeHandler,
  deleteQRCodeHandler,
};
