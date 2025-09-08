const {
  uploadDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  getDocumentsByEntity,
} = require('./documents.service');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/documents/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'));
    }
  }
});

/**
 * @swagger
 * /api/documents:
 *   post:
 *     summary: Upload a new document
 *     tags: [Documents]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - documentType
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               documentType:
 *                 type: string
 *                 enum: [CERTIFICATE, PHOTO, INVOICE, REPORT, TEST_RESULT, LICENSE, OTHER]
 *               collectionEventId:
 *                 type: string
 *                 format: uuid
 *                 description: Link to a collection event (optional)
 *               rawMaterialBatchId:
 *                 type: string
 *                 format: uuid
 *                 description: Link to a raw material batch (optional)
 *               supplyChainEventId:
 *                 type: string
 *                 format: uuid
 *                 description: Link to a supply chain event (optional)
 *               finishedGoodId:
 *                 type: string
 *                 format: uuid
 *                 description: Link to a finished good (optional)
 *               description:
 *                 type: string
 *                 description: Document description (optional)
 *               isPublic:
 *                 type: boolean
 *                 description: Is the document public? (optional)
 *     responses:
 *       201:
 *         description: Document uploaded successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Internal server error
 */
const uploadDocumentHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    // Remove entityType and entityId from req.body
    const {
      entityType, // ignore
      entityId, // ignore
      ...rest
    } = req.body;
    const documentData = {
      ...rest,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user?.userId, // From auth middleware if available
    };

    const result = await uploadDocument(documentData);
    res.status(201).json({
      success: true,
      data: result,
      message: 'Document uploaded successfully',
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
 * /api/documents:
 *   get:
 *     summary: Get all documents with pagination and filters
 *     tags: [Documents]
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
 *         name: documentType
 *         schema:
 *           type: string
 *           enum: [CERTIFICATE, PHOTO, INVOICE, REPORT, TEST_RESULT, LICENSE, OTHER]
 *       - in: query
 *         name: entityType
 *         schema:
 *           type: string
 *           enum: [COLLECTION_EVENT, RAW_MATERIAL_BATCH, SUPPLY_CHAIN_EVENT, FINISHED_GOOD, USER, ORGANIZATION]
 *       - in: query
 *         name: entityId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of documents
 *       500:
 *         description: Internal server error
 */
const getDocumentsHandler = async (req, res) => {
  try {
    const { page = 1, limit = 10, documentType, entityType, entityId } = req.query;
    const result = await getDocuments({
      page: parseInt(page),
      limit: parseInt(limit),
      documentType,
      entityType,
      entityId,
    });
    res.status(200).json({
      success: true,
      data: result,
      message: 'Documents retrieved successfully',
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
 * /api/documents/{id}:
 *   get:
 *     summary: Get a document by ID
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document details
 *       404:
 *         description: Document not found
 *       500:
 *         description: Internal server error
 */
const getDocumentByIdHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getDocumentById(id);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
      });
    }

    res.status(200).json({
      success: true,
      data: result,
      message: 'Document retrieved successfully',
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
 * /api/documents/entity/{entityType}/{entityId}:
 *   get:
 *     summary: Get documents for a specific entity
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: entityType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [COLLECTION_EVENT, RAW_MATERIAL_BATCH, SUPPLY_CHAIN_EVENT, FINISHED_GOOD, USER, ORGANIZATION]
 *       - in: path
 *         name: entityId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Entity documents
 *       500:
 *         description: Internal server error
 */
const getDocumentsByEntityHandler = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const result = await getDocumentsByEntity(entityType, entityId);
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'Entity documents retrieved successfully',
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
 * /api/documents/{id}:
 *   put:
 *     summary: Update document metadata
 *     tags: [Documents]
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
 *               documentType:
 *                 type: string
 *                 enum: [CERTIFICATE, PHOTO, INVOICE, REPORT, TEST_RESULT, LICENSE, OTHER]
 *               description:
 *                 type: string
 *               isPublic:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Document updated successfully
 *       404:
 *         description: Document not found
 *       500:
 *         description: Internal server error
 */
const updateDocumentHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updateDocument(id, req.body);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
      });
    }

    res.status(200).json({
      success: true,
      data: result,
      message: 'Document updated successfully',
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
 * /api/documents/{id}:
 *   delete:
 *     summary: Delete a document
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document deleted successfully
 *       404:
 *         description: Document not found
 *       500:
 *         description: Internal server error
 */
const deleteDocumentHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteDocument(id);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  upload,
  uploadDocumentHandler,
  getDocumentsHandler,
  getDocumentByIdHandler,
  getDocumentsByEntityHandler,
  updateDocumentHandler,
  deleteDocumentHandler,
};
