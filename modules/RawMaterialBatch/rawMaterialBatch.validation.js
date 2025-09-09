const { z } = require('zod');
const { ENUMS } = require('../../config/enums');

// Schema for creating a raw material batch
const createRawMaterialBatchSchema = z.object({
  body: z.object({
    herbName: z.string().min(1, 'Herb name is required'),
    scientificName: z.string().optional(),
    quantity: z.number().positive('Quantity must be positive'),
    unit: z.enum(ENUMS.QuantityUnit.values),
    description: z.string().optional(),
    notes: z.string().optional(),
    collectionEventIds: z.array(z.string().uuid()).min(1, 'At least one collection event is required'),
  }),
});

// Schema for updating a raw material batch
const updateRawMaterialBatchSchema = z.object({
  body: z.object({
    herbName: z.string().min(1).optional(),
    scientificName: z.string().optional(),
    quantity: z.number().positive().optional(),
    unit: z.enum(ENUMS.QuantityUnit.values).optional(),
    description: z.string().optional(),
    notes: z.string().optional(),
    status: z.enum(ENUMS.RawMaterialBatchStatus.values).optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Batch ID is required'),
  }),
});

// Schema for getting raw material batches with filters
const getRawMaterialBatchesSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional(),
    herbName: z.string().optional(),
    status: z.enum(['CREATED', 'IN_PROCESSING', 'PROCESSED', 'QUARANTINED']).optional(),
  }),
});

module.exports = {
  createRawMaterialBatchSchema,
  updateRawMaterialBatchSchema,
  getRawMaterialBatchesSchema,
};
