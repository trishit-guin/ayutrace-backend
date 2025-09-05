const { z } = require('zod');

// Schema for creating a herb species
const createSpeciesSchema = z.object({
  body: z.object({
    commonName: z.string()
      .min(1, 'Common name is required')
      .max(100, 'Common name must be less than 100 characters'),
    scientificName: z.string()
      .min(1, 'Scientific name is required')
      .max(100, 'Scientific name must be less than 100 characters')
      .regex(/^[A-Z][a-z]+ [a-z]+/, 'Scientific name must follow binomial nomenclature (e.g., "Withania somnifera")'),
    family: z.string().optional(),
    description: z.string().optional(),
    medicinalUses: z.array(z.string()).optional(),
    nativeRegions: z.array(z.string()).optional(),
    harvestingSeason: z.string().optional(),
    partsUsed: z.array(z.string()).optional(),
    conservationStatus: z.enum([
      'LEAST_CONCERN',
      'NEAR_THREATENED',
      'VULNERABLE',
      'ENDANGERED',
      'CRITICALLY_ENDANGERED'
    ]).optional(),
    regulatoryInfo: z.object({
      isRegulated: z.boolean().optional(),
      permitRequired: z.boolean().optional(),
      restrictions: z.array(z.string()).optional(),
    }).optional(),
  }),
});

// Schema for updating a herb species
const updateSpeciesSchema = z.object({
  body: z.object({
    commonName: z.string().min(1).optional(),
    scientificName: z.string().min(1).optional(),
    family: z.string().optional(),
    description: z.string().optional(),
    medicinalUses: z.array(z.string()).optional(),
    nativeRegions: z.array(z.string()).optional(),
    harvestingSeason: z.string().optional(),
    partsUsed: z.array(z.string()).optional(),
    conservationStatus: z.enum([
      'LEAST_CONCERN',
      'NEAR_THREATENED',
      'VULNERABLE',
      'ENDANGERED',
      'CRITICALLY_ENDANGERED'
    ]).optional(),
    regulatoryInfo: z.object({
      isRegulated: z.boolean().optional(),
      permitRequired: z.boolean().optional(),
      restrictions: z.array(z.string()).optional(),
    }).optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Species ID is required'),
  }),
});

// Schema for getting herb species with filters
const getSpeciesSchema = z.object({
  query: z.object({
    page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional(),
    commonName: z.string().optional(),
    scientificName: z.string().optional(),
    family: z.string().optional(),
    conservationStatus: z.enum([
      'LEAST_CONCERN',
      'NEAR_THREATENED',
      'VULNERABLE',
      'ENDANGERED',
      'CRITICALLY_ENDANGERED'
    ]).optional(),
  }),
});

module.exports = {
  createSpeciesSchema,
  updateSpeciesSchema,
  getSpeciesSchema,
};
