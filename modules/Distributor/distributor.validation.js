const Joi = require('joi');

const addInventoryItemSchema = Joi.object({
  productType: Joi.string().valid('RAW_MATERIAL_BATCH', 'FINISHED_GOOD').required(),
  entityId: Joi.string().uuid().required(),
  quantity: Joi.number().positive().required(),
  unit: Joi.string().valid('KG', 'TONNES', 'GRAMS', 'POUNDS', 'PIECES', 'BOTTLES', 'BOXES').required(),
  location: Joi.string().max(200).optional(),
  warehouseSection: Joi.string().max(100).optional(),
  status: Joi.string().valid('IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'RESERVED', 'DAMAGED', 'EXPIRED', 'QUARANTINED').default('IN_STOCK'),
  receivedDate: Joi.date().iso().optional(),
  expiryDate: Joi.date().iso().optional(),
  supplierInfo: Joi.object().optional(),
  qualityNotes: Joi.string().max(1000).optional(),
  storageConditions: Joi.string().max(500).optional(),
  supplierId: Joi.string().uuid().optional()
});

const updateInventoryItemSchema = Joi.object({
  quantity: Joi.number().positive().optional(),
  location: Joi.string().max(200).optional(),
  warehouseSection: Joi.string().max(100).optional(),
  status: Joi.string().valid('IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'RESERVED', 'DAMAGED', 'EXPIRED', 'QUARANTINED').optional(),
  expiryDate: Joi.date().iso().optional(),
  qualityNotes: Joi.string().max(1000).optional(),
  storageConditions: Joi.string().max(500).optional()
});

const createShipmentSchema = Joi.object({
  recipientType: Joi.string().valid('MANUFACTURER', 'DISTRIBUTOR', 'RETAILER', 'CUSTOMER', 'LAB').required(),
  recipientId: Joi.string().uuid().required(),
  recipientName: Joi.string().max(200).optional(),
  recipientAddress: Joi.string().max(500).required(),
  recipientPhone: Joi.string().max(20).optional(),
  shipmentDate: Joi.date().iso().optional(),
  expectedDelivery: Joi.date().iso().optional(),
  trackingNumber: Joi.string().max(100).optional(),
  carrierInfo: Joi.object().optional(),
  shippingCost: Joi.number().positive().optional(),
  totalValue: Joi.number().positive().optional(),
  notes: Joi.string().max(1000).optional(),
  specialInstructions: Joi.string().max(500).optional(),
  items: Joi.array().items(
    Joi.object({
      productType: Joi.string().valid('RAW_MATERIAL_BATCH', 'FINISHED_GOOD').required(),
      entityId: Joi.string().uuid().required(),
      productName: Joi.string().max(200).required(),
      quantity: Joi.number().positive().required(),
      unit: Joi.string().valid('KG', 'TONNES', 'GRAMS', 'POUNDS', 'PIECES', 'BOTTLES', 'BOXES').required(),
      unitPrice: Joi.number().positive().optional(),
      totalPrice: Joi.number().positive().optional(),
      batchNumber: Joi.string().max(50).optional(),
      expiryDate: Joi.date().iso().optional(),
      qualityGrade: Joi.string().max(50).optional()
    })
  ).optional()
});

const updateShipmentStatusSchema = Joi.object({
  status: Joi.string().valid('PREPARING', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'DELAYED', 'CANCELLED', 'RETURNED').required(),
  trackingNumber: Joi.string().max(100).optional(),
  carrierInfo: Joi.object().optional(),
  notes: Joi.string().max(1000).optional()
});

const createVerificationSchema = Joi.object({
  verificationType: Joi.string().valid(
    'INCOMING_GOODS_VERIFICATION',
    'QUALITY_CHECK',
    'AUTHENTICITY_VERIFICATION',
    'BATCH_VERIFICATION',
    'DOCUMENT_VERIFICATION',
    'STORAGE_CONDITION_CHECK',
    'EXPIRY_VERIFICATION'
  ).required(),
  entityType: Joi.string().valid('RAW_MATERIAL_BATCH', 'FINISHED_GOOD', 'SHIPMENT', 'INVENTORY_ITEM').required(),
  entityId: Joi.string().uuid().required(),
  verificationMethod: Joi.string().max(100).optional(),
  notes: Joi.string().max(1000).optional(),
  photosUrls: Joi.array().items(Joi.string().uri()).optional(),
  documentRefs: Joi.array().items(Joi.string().uuid()).optional()
});

const updateVerificationSchema = Joi.object({
  status: Joi.string().valid('PENDING', 'IN_PROGRESS', 'VERIFIED', 'REJECTED', 'REQUIRES_ATTENTION').optional(),
  results: Joi.object().optional(),
  notes: Joi.string().max(1000).optional(),
  photosUrls: Joi.array().items(Joi.string().uri()).optional(),
  documentRefs: Joi.array().items(Joi.string().uuid()).optional(),
  blockchainTxHash: Joi.string().max(200).optional()
});

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10)
});

const inventoryFilterSchema = Joi.object({
  status: Joi.string().valid('IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'RESERVED', 'DAMAGED', 'EXPIRED', 'QUARANTINED').optional(),
  productType: Joi.string().valid('RAW_MATERIAL_BATCH', 'FINISHED_GOOD').optional(),
  location: Joi.string().max(200).optional()
}).concat(paginationSchema);

const shipmentFilterSchema = Joi.object({
  status: Joi.string().valid('PREPARING', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'DELAYED', 'CANCELLED', 'RETURNED').optional(),
  recipientType: Joi.string().valid('MANUFACTURER', 'DISTRIBUTOR', 'RETAILER', 'CUSTOMER', 'LAB').optional(),
  trackingNumber: Joi.string().max(100).optional()
}).concat(paginationSchema);

const verificationFilterSchema = Joi.object({
  status: Joi.string().valid('PENDING', 'IN_PROGRESS', 'VERIFIED', 'REJECTED', 'REQUIRES_ATTENTION').optional(),
  verificationType: Joi.string().valid(
    'INCOMING_GOODS_VERIFICATION',
    'QUALITY_CHECK',
    'AUTHENTICITY_VERIFICATION',
    'BATCH_VERIFICATION',
    'DOCUMENT_VERIFICATION',
    'STORAGE_CONDITION_CHECK',
    'EXPIRY_VERIFICATION'
  ).optional(),
  entityType: Joi.string().valid('RAW_MATERIAL_BATCH', 'FINISHED_GOOD', 'SHIPMENT', 'INVENTORY_ITEM').optional()
}).concat(paginationSchema);

const analyticsQuerySchema = Joi.object({
  reportType: Joi.string().valid('INVENTORY_SUMMARY', 'SHIPMENT_ANALYSIS', 'QUALITY_METRICS', 'FINANCIAL_SUMMARY', 'PERFORMANCE_KPI').default('INVENTORY_SUMMARY')
});

module.exports = {
  addInventoryItemSchema,
  updateInventoryItemSchema,
  createShipmentSchema,
  updateShipmentStatusSchema,
  createVerificationSchema,
  updateVerificationSchema,
  inventoryFilterSchema,
  shipmentFilterSchema,
  verificationFilterSchema,
  analyticsQuerySchema
};