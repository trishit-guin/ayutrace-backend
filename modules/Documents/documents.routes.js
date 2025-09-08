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
 *     summary: Upload a new document
 *     description: Upload a document file and associate it with an entity
 *     tags: [Documents]
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
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Document file to upload (max 10MB)
 *               documentType:
 *                 $ref: '#/components/schemas/DocumentType'
 
 *               description:
 *                 type: string
 *                 description: Description of the document
 *                 example: "Organic certification for ashwagandha batch #001"
 *               isPublic:
 *                 type: boolean
 *                 description: Whether the document is publicly accessible
 *                 example: true
 *     responses:
 *       201:
 *         description: Document uploaded successfully
 *       400:
 *         description: Validation error or file upload error
 *       401:
 *         description: Unauthorized
 */
// Upload a new document
router.post('/', upload.single('file'), uploadDocumentHandler);

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
 *           $ref: '#/components/schemas/DocumentType'
 *         description: Filter by document type
 
 *     responses:
 *       200:
 *         description: List of documents
 *       401:
 *         description: Unauthorized
 */
// Get all documents with pagination and filters
router.get('/', validate(getDocumentsSchema), getDocumentsHandler);

/**
 * @swagger
 
 */
// Get documents for a specific entity


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
