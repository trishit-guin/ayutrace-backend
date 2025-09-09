const { z } = require('zod');

// Schema for updating document metadata
const updateDocumentSchema = z.object({
  body: z.object({
    documentType: z.enum(['CERTIFICATE', 'PHOTO', 'INVOICE', 'REPORT', 'TEST_RESULT', 'LICENSE', 'OTHER']).optional(),
    description: z.string().optional(),
    isPublic: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Document ID is required'),
  }),
});

// Schema for getting documents with filters
const getDocumentsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional(),
    documentType: z.enum(['CERTIFICATE', 'PHOTO', 'INVOICE', 'REPORT', 'TEST_RESULT', 'LICENSE', 'OTHER']).optional(),
  // entityType and entityId removed; use relation fields instead
  }),
});

module.exports = {
  updateDocumentSchema,
  getDocumentsSchema,
};
