const express = require('express');
const { ENUMS } = require('../../config/enums');
const router = express.Router();

/**
 * @swagger
 * /api/utils/enums:
 *   get:
 *     summary: Get all available enum values for testing
 *     description: Returns all enum values used in the API for easy testing and validation
 *     tags: [Utilities]
 *     responses:
 *       200:
 *         description: Successfully retrieved all enum values
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     enums:
 *                       type: object
 *                       description: All available enum values organized by type
 *                       example:
 *                         OrgType: ["FARMER", "MANUFACTURER", "LABS", "DISTRIBUTOR"]
 *                         QuantityUnit: ["KG", "TONNES", "GRAMS", "POUNDS", "PIECES", "BOTTLES", "BOXES"]
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-09-05T10:30:00Z"
 */
router.get('/enums', (req, res) => {
  try {
    const enumValues = {};
    
    Object.keys(ENUMS).forEach(enumName => {
      enumValues[enumName] = ENUMS[enumName].values;
    });

    res.status(200).json({
      success: true,
      data: {
        enums: enumValues,
        descriptions: Object.keys(ENUMS).reduce((acc, enumName) => {
          acc[enumName] = ENUMS[enumName].description;
          return acc;
        }, {})
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Get enums error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve enum values',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @swagger
 * /api/utils/test-data:
 *   get:
 *     summary: Get sample test data for all endpoints
 *     description: Returns sample data objects for testing all API endpoints with valid enum values
 *     tags: [Utilities]
 *     responses:
 *       200:
 *         description: Successfully retrieved test data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     sampleData:
 *                       type: object
 *                       description: Sample data for testing each endpoint
 */
router.get('/test-data', (req, res) => {
  try {
    const testData = {
      user: {
        email: "test.farmer@example.com",
        password: "password123",
        firstName: "Test",
        lastName: "Farmer",
        orgType: ENUMS.OrgType.values[0], // FARMER
        phone: "+919876543210",
        location: "Pune, Maharashtra",
        latitude: 18.5204,
        longitude: 73.8567
      },
      rawMaterialBatch: {
        herbName: "Ashwagandha",
        scientificName: "Withania somnifera",
        quantity: 100.5,
        unit: ENUMS.QuantityUnit.values[0], // KG
        status: ENUMS.RawMaterialBatchStatus.values[0], // CREATED
        description: "High quality organic ashwagandha roots",
        notes: "Harvested during optimal season"
      },
      supplyChainEvent: {
        eventType: ENUMS.SupplyChainEventType.values[0], // PROCESSING
        notes: "Initial processing of ashwagandha batch",
        custody: {
          temperature: "20°C",
          humidity: "45%"
        }
      },
      finishedGood: {
        productName: "Ashwagandha Churna",
        productType: ENUMS.FinishedGoodProductType.values[0], // POWDER
        quantity: 50.0,
        unit: ENUMS.QuantityUnit.values[0], // KG
        description: "Pure Ashwagandha powder for wellness",
        batchNumber: "FG-2025-001"
      },
      document: {
        fileName: "organic-certificate.pdf",
        documentType: ENUMS.DocumentType.values[0], // CERTIFICATE
        description: "Organic certification for batch",
        isPublic: true
      },
      qrCode: {
        entityType: ENUMS.QREntityType.values[0], // RAW_MATERIAL_BATCH
        customData: {
          displayName: "Ashwagandha Batch #001",
          qrVersion: "v1.0"
        }
      },
      species: {
        commonName: "Ashwagandha",
        scientificName: "Withania somnifera",
        family: "Solanaceae",
        description: "Winter cherry, known for its adaptogenic properties",
        medicinalUses: ["Stress relief", "Immunity booster", "Sleep aid"],
        nativeRegions: ["India", "Middle East", "Africa"],
        harvestingSeason: "Winter",
        partsUsed: ["Roots", "Leaves"],
        conservationStatus: ENUMS.ConservationStatus.values[0] // LEAST_CONCERN
      }
    };

    res.status(200).json({
      success: true,
      data: {
        sampleData: testData,
        usage: "Use these sample objects as request bodies for testing API endpoints",
        note: "All enum values are set to the first option from each enum. You can replace them with other valid enum values."
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Get test data error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve test data',
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = router;
