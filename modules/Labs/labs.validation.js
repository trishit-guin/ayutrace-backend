const Joi = require('joi');

const createLabTestSchema = Joi.object({
  testType: Joi.string().valid(
    'ADULTERATION_TESTING',
    'HEAVY_METALS_ANALYSIS', 
    'MOISTURE_CONTENT',
    'ACTIVE_INGREDIENT_ANALYSIS',
    'MICROBIOLOGICAL_TESTING',
    'PESTICIDE_RESIDUE_ANALYSIS',
    'STABILITY_TESTING',
    'STERILITY_TESTING',
    'CONTAMINATION_TESTING',
    'QUALITY_ASSURANCE'
  ).required(),
  sampleName: Joi.string().min(2).max(100).required(),
  sampleType: Joi.string().min(2).max(50).required(),
  sampleDescription: Joi.string().max(500).optional(),
  batchNumber: Joi.string().max(50).optional(),
  collectionDate: Joi.date().iso().required(),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').default('MEDIUM'),
  notes: Joi.string().max(1000).optional(),
  batchId: Joi.string().uuid().optional(),
  finishedGoodId: Joi.string().uuid().optional(),
  // QR code data for product/batch linking
  qrData: Joi.object({
    qrHash: Joi.string().optional(),
    entityType: Joi.string().optional(),
    entityId: Joi.string().optional(),
    customData: Joi.object().optional(),
    rawQRData: Joi.string().optional()
  }).optional()
});

const updateLabTestSchema = Joi.object({
  status: Joi.string().valid(
    'PENDING',
    'IN_PROGRESS', 
    'COMPLETED',
    'REJECTED',
    'CANCELLED',
    'REQUIRES_RETEST'
  ).optional(),
  labTechnicianId: Joi.string().uuid().optional(),
  testDate: Joi.date().iso().optional(),
  completionDate: Joi.date().iso().optional(),
  results: Joi.object().optional(),
  methodology: Joi.string().max(1000).optional(),
  equipment: Joi.string().max(500).optional(),
  notes: Joi.string().max(1000).optional(),
  cost: Joi.number().positive().optional(),
  certificationNumber: Joi.string().max(100).optional(),
  blockchainTxHash: Joi.string().max(200).optional()
});

const createCertificateSchema = Joi.object({
  certificateNumber: Joi.string().min(3).max(100).required(),
  certificateType: Joi.string().valid(
    'QUALITY_CERTIFICATE',
    'AYUSH_COMPLIANCE',
    'ADULTERATION_FREE',
    'HEAVY_METALS_CLEARED',
    'MICROBIOLOGICAL_CLEARED',
    'ORGANIC_CERTIFICATION',
    'GMP_COMPLIANCE',
    'EXPORT_CERTIFICATE',
    'BATCH_CERTIFICATE'
  ).required(),
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().max(1000).optional(),
  issueDate: Joi.date().iso().required(),
  expiryDate: Joi.date().iso().greater(Joi.ref('issueDate')).optional(),
  testId: Joi.string().uuid().optional(),
  blockchainTxHash: Joi.string().max(200).optional(),
  digitalSignature: Joi.string().max(500).optional(),
  qrCodeData: Joi.string().max(1000).optional()
});

const labTestQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid(
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED', 
    'REJECTED',
    'CANCELLED',
    'REQUIRES_RETEST'
  ).optional(),
  testType: Joi.string().valid(
    'ADULTERATION_TESTING',
    'HEAVY_METALS_ANALYSIS',
    'MOISTURE_CONTENT',
    'ACTIVE_INGREDIENT_ANALYSIS',
    'MICROBIOLOGICAL_TESTING',
    'PESTICIDE_RESIDUE_ANALYSIS',
    'STABILITY_TESTING',
    'STERILITY_TESTING',
    'CONTAMINATION_TESTING',
    'QUALITY_ASSURANCE'
  ).optional(),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').optional()
});

const certificateQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  certificateType: Joi.string().valid(
    'QUALITY_CERTIFICATE',
    'AYUSH_COMPLIANCE',
    'ADULTERATION_FREE',
    'HEAVY_METALS_CLEARED',
    'MICROBIOLOGICAL_CLEARED',
    'ORGANIC_CERTIFICATION',
    'GMP_COMPLIANCE',
    'EXPORT_CERTIFICATE',
    'BATCH_CERTIFICATE'
  ).optional(),
  isValid: Joi.boolean().optional()
});

const labsQuerySchema = Joi.object({
  type: Joi.string().valid('LABS').default('LABS')
});

module.exports = {
  createLabTestSchema,
  updateLabTestSchema,
  createCertificateSchema,
  labTestQuerySchema,
  certificateQuerySchema,
  labsQuerySchema
};