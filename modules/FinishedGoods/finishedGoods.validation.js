const { z } = require('zod');

// Schema for creating a finished good
const createFinishedGoodSchema = z.object({
  body: z.object({
    productName: z.string().min(1, 'Product name is required'),
    productType: z.enum(['POWDER', 'CAPSULE', 'TABLET', 'SYRUP', 'OIL', 'CREAM']),
    quantity: z.number().positive('Quantity must be positive'),
    unit: z.enum(['KG', 'TONNES', 'GRAMS', 'POUNDS', 'PIECES', 'BOTTLES', 'BOXES']),
    manufacturerId: z.string().uuid('Valid manufacturer ID is required'),
    description: z.string().optional(),
    batchNumber: z.string().optional(),
    expiryDate: z.string().datetime().optional(),
    composition: z.array(z.object({
      rawMaterialBatchId: z.string().min(1, 'Raw material batch ID is required'),
      percentage: z.number().min(0).max(100, 'Percentage must be between 0 and 100'),
      quantityUsed: z.number().positive('Quantity used must be positive'),
    })).min(1, 'At least one composition item is required'),
  }),
});

// Schema for updating a finished good
const updateFinishedGoodSchema = z.object({
  body: z.object({
    productName: z.string().min(1).optional(),
    productType: z.enum(['POWDER', 'CAPSULE', 'TABLET', 'SYRUP', 'OIL', 'CREAM']).optional(),
    quantity: z.number().positive().optional(),
    unit: z.enum(['KG', 'TONNES', 'GRAMS', 'POUNDS', 'PIECES', 'BOTTLES', 'BOXES']).optional(),
    description: z.string().optional(),
    batchNumber: z.string().optional(),
    expiryDate: z.string().datetime().optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Product ID is required'),
  }),
});

// Schema for getting finished goods with filters
const getFinishedGoodsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional(),
    productName: z.string().optional(),
    productType: z.enum(['POWDER', 'CAPSULE', 'TABLET', 'SYRUP', 'OIL', 'CREAM']).optional(),
    manufacturerId: z.string().uuid().optional(),
  }),
});

module.exports = {
  createFinishedGoodSchema,
  updateFinishedGoodSchema,
  getFinishedGoodsSchema,
};
