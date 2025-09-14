/**
 * Centralized enum definitions that match the Prisma schema
 * This ensures consistency between database schema and API documentation
 */

const ENUMS = {
  OrgType: {
    values: ['FARMER', 'MANUFACTURER', 'LABS', 'DISTRIBUTOR'],
    description: 'Organization type for different stakeholders in the supply chain'
  },
  
  RawMaterialBatchStatus: {
    values: ['CREATED', 'IN_PROCESSING', 'PROCESSED', 'QUARANTINED'],
    description: 'Status of raw material batch in the processing pipeline'
  },
  
  SupplyChainEventType: {
    values: ['PROCESSING', 'TESTING', 'TRANSFER', 'STORAGE', 'PACKAGING'],
    description: 'Type of supply chain event'
  },
  
  FinishedGoodProductType: {
    values: ['POWDER', 'CAPSULE', 'TABLET', 'SYRUP', 'OIL', 'CREAM'],
    description: 'Type of finished ayurvedic product'
  },
  
  DocumentType: {
    values: ['CERTIFICATE', 'PHOTO', 'INVOICE', 'REPORT', 'TEST_RESULT', 'LICENSE', 'OTHER'],
    description: 'Type of document being uploaded'
  },
  
  DocumentEntityType: {
    values: ['COLLECTION_EVENT', 'RAW_MATERIAL_BATCH', 'SUPPLY_CHAIN_EVENT', 'FINISHED_GOOD'],
    description: 'Type of entity the document is associated with'
  },
  
  QREntityType: {
    values: ['RAW_MATERIAL_BATCH', 'FINISHED_GOOD', 'SUPPLY_CHAIN_EVENT', 'LAB_TEST', 'CERTIFICATE'],
    description: 'Type of entity that the QR code represents'
  },
  
  ConservationStatus: {
    values: ['LEAST_CONCERN', 'NEAR_THREATENED', 'VULNERABLE', 'ENDANGERED', 'CRITICALLY_ENDANGERED'],
    description: 'Conservation status of herb species'
  },
  
  QuantityUnit: {
    values: ['KG', 'TONNES', 'GRAMS', 'POUNDS', 'PIECES', 'BOTTLES', 'BOXES'],
    description: 'Unit of measurement for quantities'
  },

  TestType: {
    values: [
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
    ],
    description: 'Type of laboratory test being performed'
  },

  TestStatus: {
    values: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'CANCELLED', 'REQUIRES_RETEST'],
    description: 'Current status of laboratory test'
  },

  TestPriority: {
    values: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    description: 'Priority level of laboratory test'
  },

  CertificateType: {
    values: [
      'QUALITY_CERTIFICATE',
      'AYUSH_COMPLIANCE',
      'ADULTERATION_FREE',
      'HEAVY_METALS_CLEARED',
      'MICROBIOLOGICAL_CLEARED',
      'ORGANIC_CERTIFICATION',
      'GMP_COMPLIANCE',
      'EXPORT_CERTIFICATE',
      'BATCH_CERTIFICATE'
    ],
    description: 'Type of certificate issued by laboratory'
  }
};

/**
 * Generate Swagger enum schema for a given enum
 */
function getSwaggerEnum(enumName) {
  const enumDef = ENUMS[enumName];
  if (!enumDef) {
    console.warn(`⚠️ Enum ${enumName} not found`);
    return { type: 'string', enum: [], description: `Unknown enum: ${enumName}` };
  }
  return {
    type: 'string',
    enum: enumDef.values,
    description: enumDef.description,
    example: enumDef.values[0]
  };
}

/**
 * Generate all Swagger enum components
 */
function getAllSwaggerEnums() {
  const components = {};
  Object.keys(ENUMS).forEach(enumName => {
    components[enumName] = getSwaggerEnum(enumName);
  });
  return components;
}

module.exports = {
  ENUMS,
  getSwaggerEnum,
  getAllSwaggerEnums
};
