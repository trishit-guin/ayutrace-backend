const express = require('express');
const {
  upload,
  uploadDocumentHandler,
  getDocumentsHandler,
  getDocumentByIdHandler,
  getDocumentsByEntityHandler,
  updateDocumentHandler,
  deleteDocumentHandler,
} = require('./documents.controller');
const { validate } = require('../Auth/middlewares/validate');
const {
  updateDocumentSchema,
  getDocumentsSchema,
} = require('./documents.validation');

const router = express.Router();

/**
 * @swagger
 * /api/documents:
 *   post:
 *     summary: Upload a new document and link to an entity
 *     description: Upload a document file and associate it with a specific entity (batch, event, etc.)
 *     tags:
 *       - Documents
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - documentType
 *               - entityType
 *               - entityId
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Document file to upload (max 10MB)
 *               documentType:
 *                 type: string
 *                 enum:
 *                   - CERTIFICATE
 *                   - PHOTO
 *                   - INVOICE
 *                   - REPORT
 *                   - TEST_RESULT
 *                   - LICENSE
 *                   - OTHER
 *                 description: Type of document being uploaded
 *               entityType:
 *                 type: string
 *                 enum:
 *                   - COLLECTION_EVENT
 *                   - RAW_MATERIAL_BATCH
 *                   - SUPPLY_CHAIN_EVENT
 *                   - FINISHED_GOOD
 *                 description: Type of entity to link the document to (required)
 *                 example: RAW_MATERIAL_BATCH
 *               entityId:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of the entity to link the document to (required)
 *                 example: "a1b2c3d4-e5f6-7890-abcd-1234567890ab"
 *               description:
 *                 type: string
 *                 description: Description of the document
 *                 example: "Organic certification for ashwagandha batch #001"
 *     responses:
 *       201:
 *         description: Document uploaded successfully
 *       400:
 *         description: Validation error or file upload error
 *       401:
 *         description: Unauthorized (missing or invalid token)
 */
// Upload a new document
const { authMiddleware } = require('../Auth/middlewares/auth.middleware');
router.post('/', authMiddleware, upload.single('file'), uploadDocumentHandler);

/**
 * @swagger
 * /api/documents:
 *   get:
 *     summary: Get all documents
 *     description: Retrieve documents with pagination and filtering
 *     tags: [Documents]
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
 *         name: documentType
 *         schema:
 *           type: string
 *         description: Filter by document type
 *     responses:
 *       200:
 *         description: List of documents
 *       401:
 *         description: Unauthorized
 */
// Get all documents with pagination and filters
router.get('/', validate(getDocumentsSchema), getDocumentsHandler);

// Get documents for a specific entity - this endpoint might be implemented later


/**
 * @swagger
 * /api/documents/{id}:
 *   get:
 *     summary: Get a document by ID
 *     description: Retrieve detailed information about a specific document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document details
 *       404:
 *         description: Document not found
 *       401:
 *         description: Unauthorized
 */
// Get a document by ID
router.get('/:id', getDocumentByIdHandler);

/**
 * @swagger
 * /api/documents/{id}:
 *   put:
 *     summary: Update document metadata
 *     description: Update metadata of an existing document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Document ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               documentType:
 *                 $ref: '#/components/schemas/DocumentType'
 *               description:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Document metadata updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Document not found
 *       401:
 *         description: Unauthorized
 */
// Update document metadata
router.put('/:id', validate(updateDocumentSchema), updateDocumentHandler);

/**
 * @swagger
 * /api/documents/{id}:
 *   delete:
 *     summary: Delete a document
 *     description: Delete a document and its file from the system
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document deleted successfully
 *       404:
 *         description: Document not found
 *       401:
 *         description: Unauthorized
 */
// Delete a document
router.delete('/:id', deleteDocumentHandler);

module.exports = router;
