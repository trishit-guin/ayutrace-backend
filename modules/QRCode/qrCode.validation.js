const { z } = require('zod');

// Schema for generating a QR code
const generateQRCodeSchema = z.object({
  body: z.object({
    entityType: z.enum(['RAW_MATERIAL_BATCH', 'FINISHED_GOOD', 'SUPPLY_CHAIN_EVENT']),
    entityId: z.string().min(1, 'Entity ID is required'),
    generatedBy: z.string().uuid().optional(),
    customData: z.record(z.any()).optional(),
  }),
});

// Schema for updating QR code metadata
const updateQRCodeSchema = z.object({
  body: z.object({
    customData: z.record(z.any()).optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'QR Code ID is required'),
  }),
});

// Schema for getting QR codes with filters
const getQRCodesSchema = z.object({
  query: z.object({
    page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional(),
    entityType: z.enum(['RAW_MATERIAL_BATCH', 'FINISHED_GOOD', 'SUPPLY_CHAIN_EVENT']).optional(),
    entityId: z.string().optional(),
  }),
});

module.exports = {
  generateQRCodeSchema,
  updateQRCodeSchema,
  getQRCodesSchema,
};
