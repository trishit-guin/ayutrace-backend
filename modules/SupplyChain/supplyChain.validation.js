const { z } = require('zod');

// Schema for creating a supply chain event
const createSupplyChainEventSchema = z.object({
  body: z.object({
  eventType: z.enum(['TESTING', 'DISTRIBUTION']),
    handlerId: z.string().uuid('Valid handler ID is required'),
    fromLocationId: z.string().uuid('Valid from location ID is required'),
    toLocationId: z.string().uuid('Valid to location ID is required'),
    rawMaterialBatchId: z.string().optional(),
    finishedGoodId: z.string().optional(),
    notes: z.string().optional(),
    custody: z.object({
      transferredBy: z.string().optional(),
      receivedBy: z.string().optional(),
      transferNotes: z.string().optional(),
    }).optional(),
  }).refine(
    (data) => data.rawMaterialBatchId || data.finishedGoodId,
    {
      message: "Either rawMaterialBatchId or finishedGoodId must be provided",
      path: ["rawMaterialBatchId"],
    }
  ),
});

// Schema for updating a supply chain event
const updateSupplyChainEventSchema = z.object({
  body: z.object({
  eventType: z.enum(['TESTING', 'DISTRIBUTION']).optional(),
    notes: z.string().optional(),
    custody: z.object({
      transferredBy: z.string().optional(),
      receivedBy: z.string().optional(),
      transferNotes: z.string().optional(),
    }).optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Event ID is required'),
  }),
});

// Schema for getting supply chain events with filters
const getSupplyChainEventsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional(),
  eventType: z.enum(['TESTING', 'DISTRIBUTION']).optional(),
    handlerId: z.string().uuid().optional(),
    batchId: z.string().optional(),
  }),
});

module.exports = {
  createSupplyChainEventSchema,
  updateSupplyChainEventSchema,
  getSupplyChainEventsSchema,
};
