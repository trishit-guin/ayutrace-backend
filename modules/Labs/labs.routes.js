const express = require('express');
const { validate } = require('../Auth/middlewares/validate');
const { authMiddleware } = require('../Auth/middlewares/auth.middleware');
const {
  createLabTestSchema,
  updateLabTestSchema,
  createCertificateSchema,
  labTestQuerySchema,
  certificateQuerySchema,
  labsQuerySchema
} = require('./labs.validation');
const {
  getLabDashboardHandler,
  getLabTestsHandler,
  getLabTestByIdHandler,
  createLabTestHandler,
  updateLabTestHandler,
  deleteLabTestHandler,
  getLabCertificatesHandler,
  createCertificateHandler,
  getLabsHandler,
  downloadCertificateHandler
} = require('./labs.controller');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     LabTest:
 *       type: object
 *       required:
 *         - testType
 *         - sampleName
 *         - sampleType
 *         - collectionDate
 *         - requesterId
 *         - organizationId
 *       properties:
 *         testId:
 *           type: string
 *           format: uuid
 *         testType:
 *           type: string
 *           enum: [ADULTERATION_TESTING, HEAVY_METALS_ANALYSIS, MOISTURE_CONTENT, ACTIVE_INGREDIENT_ANALYSIS, MICROBIOLOGICAL_TESTING, PESTICIDE_RESIDUE_ANALYSIS, STABILITY_TESTING, STERILITY_TESTING, CONTAMINATION_TESTING, QUALITY_ASSURANCE]
 *         status:
 *           type: string
 *           enum: [PENDING, IN_PROGRESS, COMPLETED, REJECTED, CANCELLED, REQUIRES_RETEST]
 *           default: PENDING
 *         sampleName:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *         sampleType:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *         sampleDescription:
 *           type: string
 *           maxLength: 500
 *         batchNumber:
 *           type: string
 *           maxLength: 50
 *         collectionDate:
 *           type: string
 *           format: date-time
 *         testDate:
 *           type: string
 *           format: date-time
 *         completionDate:
 *           type: string
 *           format: date-time
 *         results:
 *           type: object
 *         methodology:
 *           type: string
 *           maxLength: 1000
 *         equipment:
 *           type: string
 *           maxLength: 500
 *         notes:
 *           type: string
 *           maxLength: 1000
 *         priority:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, URGENT]
 *           default: MEDIUM
 *         cost:
 *           type: number
 *           minimum: 0
 *         certificationNumber:
 *           type: string
 *           maxLength: 100
 *         blockchainTxHash:
 *           type: string
 *           maxLength: 200
 *         requesterId:
 *           type: string
 *           format: uuid
 *         labTechnicianId:
 *           type: string
 *           format: uuid
 *         organizationId:
 *           type: string
 *           format: uuid
 *         batchId:
 *           type: string
 *           format: uuid
 *         finishedGoodId:
 *           type: string
 *           format: uuid
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     Certificate:
 *       type: object
 *       required:
 *         - certificateNumber
 *         - certificateType
 *         - title
 *         - issueDate
 *         - organizationId
 *         - issuerId
 *       properties:
 *         certificateId:
 *           type: string
 *           format: uuid
 *         certificateNumber:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *         certificateType:
 *           type: string
 *           enum: [QUALITY_CERTIFICATE, AYUSH_COMPLIANCE, ADULTERATION_FREE, HEAVY_METALS_CLEARED, MICROBIOLOGICAL_CLEARED, ORGANIC_CERTIFICATION, GMP_COMPLIANCE, EXPORT_CERTIFICATE, BATCH_CERTIFICATE]
 *         title:
 *           type: string
 *           minLength: 3
 *           maxLength: 200
 *         description:
 *           type: string
 *           maxLength: 1000
 *         issueDate:
 *           type: string
 *           format: date-time
 *         expiryDate:
 *           type: string
 *           format: date-time
 *         isValid:
 *           type: boolean
 *           default: true
 *         blockchainTxHash:
 *           type: string
 *           maxLength: 200
 *         digitalSignature:
 *           type: string
 *           maxLength: 500
 *         qrCodeData:
 *           type: string
 *           maxLength: 1000
 *         testId:
 *           type: string
 *           format: uuid
 *         organizationId:
 *           type: string
 *           format: uuid
 *         issuerId:
 *           type: string
 *           format: uuid
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     LabMetrics:
 *       type: object
 *       properties:
 *         totalTests:
 *           type: integer
 *         pendingTests:
 *           type: integer
 *         completedTests:
 *           type: integer
 *         rejectedTests:
 *           type: integer
 *         certificatesIssued:
 *           type: integer
 *         testsThisMonth:
 *           type: integer
 *         pendingVerifications:
 *           type: integer
 *         recentTests:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/LabTest'
 */

/**
 * @swagger
 * /api/labs/dashboard:
 *   get:
 *     summary: Get lab dashboard metrics
 *     tags: [Labs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lab dashboard metrics retrieved successfully
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
 *                   $ref: '#/components/schemas/LabMetrics'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/dashboard', authMiddleware, getLabDashboardHandler);

/**
 * @swagger
 * /api/labs/tests:
 *   get:
 *     summary: Get lab tests with pagination and filtering
 *     tags: [Labs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, IN_PROGRESS, COMPLETED, REJECTED, CANCELLED, REQUIRES_RETEST]
 *         description: Filter by test status
 *       - in: query
 *         name: testType
 *         schema:
 *           type: string
 *           enum: [ADULTERATION_TESTING, HEAVY_METALS_ANALYSIS, MOISTURE_CONTENT, ACTIVE_INGREDIENT_ANALYSIS, MICROBIOLOGICAL_TESTING, PESTICIDE_RESIDUE_ANALYSIS, STABILITY_TESTING, STERILITY_TESTING, CONTAMINATION_TESTING, QUALITY_ASSURANCE]
 *         description: Filter by test type
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, URGENT]
 *         description: Filter by priority
 *     responses:
 *       200:
 *         description: Lab tests retrieved successfully
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
 *                     tests:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/LabTest'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/tests', authMiddleware, validate(labTestQuerySchema, 'query'), getLabTestsHandler);

/**
 * @swagger
 * /api/labs/tests/{testId}:
 *   get:
 *     summary: Get a specific lab test by ID
 *     tags: [Labs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: testId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Lab test ID
 *     responses:
 *       200:
 *         description: Lab test retrieved successfully
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
 *                   $ref: '#/components/schemas/LabTest'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Lab test not found
 *       500:
 *         description: Internal server error
 */
router.get('/tests/:testId', authMiddleware, getLabTestByIdHandler);

/**
 * @swagger
 * /api/labs/tests/{testId}/certificate/download:
 *   get:
 *     summary: Download certificate PDF for a completed lab test
 *     tags: [Labs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: testId
 *         required: true
 *         schema:
 *           type: string
 *         description: Lab test ID
 *     responses:
 *       200:
 *         description: Certificate PDF file
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Test not found or certificate not available
 *       500:
 *         description: Internal server error
 */
router.get('/tests/:testId/certificate/download', authMiddleware, downloadCertificateHandler);

/**
 * @swagger
 * /api/labs/tests:
 *   post:
 *     summary: Create a new lab test
 *     tags: [Labs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - testType
 *               - sampleName
 *               - sampleType
 *               - collectionDate
 *             properties:
 *               testType:
 *                 type: string
 *                 enum: [ADULTERATION_TESTING, HEAVY_METALS_ANALYSIS, MOISTURE_CONTENT, ACTIVE_INGREDIENT_ANALYSIS, MICROBIOLOGICAL_TESTING, PESTICIDE_RESIDUE_ANALYSIS, STABILITY_TESTING, STERILITY_TESTING, CONTAMINATION_TESTING, QUALITY_ASSURANCE]
 *               sampleName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               sampleType:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               sampleDescription:
 *                 type: string
 *                 maxLength: 500
 *               batchNumber:
 *                 type: string
 *                 maxLength: 50
 *               collectionDate:
 *                 type: string
 *                 format: date-time
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, URGENT]
 *                 default: MEDIUM
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *               batchId:
 *                 type: string
 *                 format: uuid
 *               finishedGoodId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Lab test created successfully
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
 *                   $ref: '#/components/schemas/LabTest'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/tests', authMiddleware, validate(createLabTestSchema), createLabTestHandler);

/**
 * @swagger
 * /api/labs/tests/{testId}:
 *   put:
 *     summary: Update a lab test
 *     tags: [Labs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: testId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Lab test ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, IN_PROGRESS, COMPLETED, REJECTED, CANCELLED, REQUIRES_RETEST]
 *               labTechnicianId:
 *                 type: string
 *                 format: uuid
 *               testDate:
 *                 type: string
 *                 format: date-time
 *               completionDate:
 *                 type: string
 *                 format: date-time
 *               results:
 *                 type: object
 *               methodology:
 *                 type: string
 *                 maxLength: 1000
 *               equipment:
 *                 type: string
 *                 maxLength: 500
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *               cost:
 *                 type: number
 *                 minimum: 0
 *               certificationNumber:
 *                 type: string
 *                 maxLength: 100
 *               blockchainTxHash:
 *                 type: string
 *                 maxLength: 200
 *     responses:
 *       200:
 *         description: Lab test updated successfully
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
 *                   $ref: '#/components/schemas/LabTest'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Lab test not found
 *       500:
 *         description: Internal server error
 */
router.put('/tests/:testId', authMiddleware, validate(updateLabTestSchema), updateLabTestHandler);

/**
 * @swagger
 * /api/labs/tests/{testId}:
 *   delete:
 *     summary: Delete a lab test
 *     tags: [Labs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: testId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Lab test ID
 *     responses:
 *       200:
 *         description: Lab test deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Lab test not found
 *       500:
 *         description: Internal server error
 */
router.delete('/tests/:testId', authMiddleware, deleteLabTestHandler);

/**
 * @swagger
 * /api/labs/certificates:
 *   get:
 *     summary: Get lab certificates with pagination and filtering
 *     tags: [Labs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: certificateType
 *         schema:
 *           type: string
 *           enum: [QUALITY_CERTIFICATE, AYUSH_COMPLIANCE, ADULTERATION_FREE, HEAVY_METALS_CLEARED, MICROBIOLOGICAL_CLEARED, ORGANIC_CERTIFICATION, GMP_COMPLIANCE, EXPORT_CERTIFICATE, BATCH_CERTIFICATE]
 *         description: Filter by certificate type
 *       - in: query
 *         name: isValid
 *         schema:
 *           type: boolean
 *         description: Filter by validity status
 *     responses:
 *       200:
 *         description: Lab certificates retrieved successfully
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
 *                     certificates:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Certificate'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/certificates', authMiddleware, validate(certificateQuerySchema, 'query'), getLabCertificatesHandler);

/**
 * @swagger
 * /api/labs/certificates:
 *   post:
 *     summary: Create a new certificate
 *     tags: [Labs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - certificateNumber
 *               - certificateType
 *               - title
 *               - issueDate
 *             properties:
 *               certificateNumber:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               certificateType:
 *                 type: string
 *                 enum: [QUALITY_CERTIFICATE, AYUSH_COMPLIANCE, ADULTERATION_FREE, HEAVY_METALS_CLEARED, MICROBIOLOGICAL_CLEARED, ORGANIC_CERTIFICATION, GMP_COMPLIANCE, EXPORT_CERTIFICATE, BATCH_CERTIFICATE]
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *               issueDate:
 *                 type: string
 *                 format: date-time
 *               expiryDate:
 *                 type: string
 *                 format: date-time
 *               testId:
 *                 type: string
 *                 format: uuid
 *               blockchainTxHash:
 *                 type: string
 *                 maxLength: 200
 *               digitalSignature:
 *                 type: string
 *                 maxLength: 500
 *               qrCodeData:
 *                 type: string
 *                 maxLength: 1000
 *     responses:
 *       201:
 *         description: Certificate created successfully
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
 *                   $ref: '#/components/schemas/Certificate'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Certificate number already exists
 *       500:
 *         description: Internal server error
 */
router.post('/certificates', authMiddleware, validate(createCertificateSchema), createCertificateHandler);

/**
 * @swagger
 * /api/labs:
 *   get:
 *     summary: Get list of lab organizations
 *     tags: [Labs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [LABS]
 *           default: LABS
 *         description: Organization type filter
 *     responses:
 *       200:
 *         description: Labs retrieved successfully
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
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       organizationId:
 *                         type: string
 *                         format: uuid
 *                       type:
 *                         type: string
 *                         enum: [LABS]
 *                       users:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             userId:
 *                               type: string
 *                               format: uuid
 *                             firstName:
 *                               type: string
 *                             lastName:
 *                               type: string
 *                             email:
 *                               type: string
 *                             phone:
 *                               type: string
 *                             location:
 *                               type: string
 *                       labTests:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             testId:
 *                               type: string
 *                               format: uuid
 *                             testType:
 *                               type: string
 *                             status:
 *                               type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', authMiddleware, validate(labsQuerySchema, 'query'), getLabsHandler);

module.exports = router;