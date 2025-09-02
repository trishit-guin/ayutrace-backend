const { z } = require('zod');

const createCollectionEventSchema = z.object({
  body: z.object({
    speciesCode: z.string().min(1).optional(),
    quantityKg: z.number().positive('Quantity must be a positive number'),
    initialQualityMetrics: z.string().refine(
      (val) => {
        try {
          JSON.parse(val);
          return true;
        } catch (e) {
          return false;
        }
      },
      { message: 'Initial quality metrics must be a valid JSON string' }
    ),
    photoUrl: z.string().url('A valid photo URL is required').optional(),
    location: z.string().refine(
        (val) => {
            try {
                const parsed = JSON.parse(val);
                return typeof parsed.latitude === 'number' && typeof parsed.longitude === 'number';
            } catch (e) {
                return false;
            }
        }, { message: 'Location must be a valid JSON string with latitude and longitude' }
    )
  }),
});

module.exports = {
  createCollectionEventSchema,
};