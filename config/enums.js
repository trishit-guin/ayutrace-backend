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
    values: ['RAW_MATERIAL_BATCH', 'FINISHED_GOOD', 'SUPPLY_CHAIN_EVENT', 'COLLECTION_EVENT'],
    description: 'Type of entity the document is associated with'
  },
  
  QREntityType: {
    values: ['RAW_MATERIAL_BATCH', 'FINISHED_GOOD', 'SUPPLY_CHAIN_EVENT'],
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
  
  DocumentEntityType: {
    values: ['COLLECTION_EVENT', 'RAW_MATERIAL_BATCH', 'SUPPLY_CHAIN_EVENT', 'FINISHED_GOOD'],
    description: 'Type of entity that a document can be associated with'
  }
};

/**
 * Generate Swagger enum schema for a given enum
 */
function getSwaggerEnum(enumName) {
  const enumDef = ENUMS[enumName];
  if (!enumDef) {
    throw new Error(`Enum ${enumName} not found`);
  }
  
  return {
    type: 'string',
    enum: enumDef.values,
    description: enumDef.description,
    example: enumDef.values[0] // Use first value as default example
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
