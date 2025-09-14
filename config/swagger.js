const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const fs = require('fs');
const { getAllSwaggerEnums } = require('./enums');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AyuTrace Backend API',
      version: '1.0.0',
      description: 'A comprehensive API for managing ayurvedic herbs supply chain traceability system',
      contact: {
        name: 'AyuTrace Team',
        email: 'support@ayutrace.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://api.ayutrace.com',
        description: 'Production server',
      },
    ],
    tags: [
      { name: 'Authentication', description: 'User authentication and authorization operations' },
      { name: 'Raw Material Batches', description: 'Raw material batch management for herbs collection and tracking' },
      { name: 'Supply Chain', description: 'Supply chain event tracking throughout the herb processing pipeline' },
      { name: 'Finished Goods', description: 'Finished product management with composition tracking' },
      { name: 'Documents', description: 'Document and file management for certificates, photos, and reports' },
      { name: 'QR Codes', description: 'QR code generation and scanning for product traceability' },
      { name: 'Species', description: 'Herb species management with conservation and regulatory information' },
      { name: 'Collection Events', description: 'Herb collection event tracking with quality metrics' },
      { name: 'Organization', description: 'Organization management operations' },
      { name: 'Labs', description: 'Laboratory testing and certification management for quality assurance' },
      { name: 'Utilities', description: 'Utility endpoints for testing and development - enum values and sample data' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from login endpoint',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              example: 'Error message',
            },
            message: {
              type: 'string',
              example: 'Detailed error message',
            },
          },
        },
        // Import all enum schemas
        ...getAllSwaggerEnums(),
        
        // User schemas
        User: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the user',
              example: 'b1c2d3e4-f5g6-7890-1234-567890abcdef',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address (unique)',
              example: 'rajesh.p@puneorganic.coop',
            },
            firstName: {
              type: 'string',
              description: 'User first name',
              example: 'Rajesh',
            },
            lastName: {
              type: 'string',
              description: 'User last name',
              example: 'Patil',
            },
            orgType: {
              $ref: '#/components/schemas/OrgType',
            },
            blockchainIdentity: {
              type: 'string',
              description: 'Blockchain identity for the user',
              example: 'user1@cooperative.prakritichain.com',
              nullable: true,
            },
            phone: {
              type: 'string',
              description: 'User phone number',
              example: '+919123456789',
              nullable: true,
            },
            lastLogin: {
              type: 'string',
              format: 'date-time',
              description: 'Last login timestamp',
              example: '2025-09-03T11:30:00Z',
              nullable: true,
            },
            isActive: {
              type: 'boolean',
              description: 'User active status',
              example: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation timestamp',
              example: '2025-09-02T12:00:00Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
              example: '2025-09-03T11:30:00Z',
            },
            latitude: {
              type: 'number',
              format: 'float',
              description: 'GPS latitude coordinate',
              example: 17.6868,
              nullable: true,
            },
            longitude: {
              type: 'number',
              format: 'float',
              description: 'GPS longitude coordinate',
              example: 74.0183,
              nullable: true,
            },
            location: {
              type: 'string',
              description: 'Location information',
              example: 'Satara District, Maharashtra',
              nullable: true,
            },
            organizationId: {
              type: 'string',
              format: 'uuid',
              description: 'Organization the user belongs to',
              example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
            },
          },
          required: ['userId', 'email', 'firstName', 'lastName', 'orgType', 'organizationId'],
        },
        
        UserRegistration: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'rajesh.p@puneorganic.coop',
            },
            password: {
              type: 'string',
              minLength: 8,
              description: 'User password (minimum 8 characters)',
              example: 'SecurePassword123!',
            },
            firstName: {
              type: 'string',
              minLength: 2,
              description: 'User first name',
              example: 'Rajesh',
            },
            lastName: {
              type: 'string',
              minLength: 2,
              description: 'User last name',
              example: 'Patil',
            },
            organizationId: {
              type: 'string',
              format: 'uuid',
              description: 'Organization ID the user belongs to',
              example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
            },
            orgType: {
              $ref: '#/components/schemas/OrgType',
            },
            blockchainIdentity: {
              type: 'string',
              description: 'Optional blockchain identity',
              example: 'user1@cooperative.prakritichain.com',
            },
            phone: {
              type: 'string',
              description: 'Optional phone number',
              example: '+919876543210',
            },
            location: {
              type: 'string',
              description: 'Location information',
              example: 'Satara District, Maharashtra',
            },
            latitude: {
              type: 'number',
              format: 'float',
              description: 'GPS latitude coordinate',
              example: 17.6868,
            },
            longitude: {
              type: 'number',
              format: 'float',
              description: 'GPS longitude coordinate',
              example: 74.0183,
            },
          },
          required: ['email', 'password', 'firstName', 'lastName', 'organizationId', 'orgType'],
        },
        
        UserLogin: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'rajesh.p@puneorganic.coop',
            },
            password: {
              type: 'string',
              description: 'User password',
              example: 'SecurePassword123!',
            },
          },
          required: ['email', 'password'],
        },
        
        // Organization schemas
        Organization: {
          type: 'object',
          properties: {
            organizationId: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the organization',
              example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
            },
            type: {
              $ref: '#/components/schemas/OrgType',
            },
          },
          required: ['organizationId', 'type'],
        },
        
        // Raw Material Batch schemas
        RawMaterialBatch: {
          type: 'object',
          properties: {
            batchId: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the batch',
              example: 'c1d2e3f4-g5h6-7890-1234-567890abcdef',
            },
            herbName: {
              type: 'string',
              description: 'Name of the herb',
              example: 'Ashwagandha',
            },
            scientificName: {
              type: 'string',
              description: 'Scientific name of the herb',
              example: 'Withania somnifera',
              nullable: true,
            },
            quantity: {
              type: 'number',
              description: 'Quantity of the batch',
              example: 100.5,
            },
            unit: {
              $ref: '#/components/schemas/QuantityUnit',
            },
            status: {
              $ref: '#/components/schemas/RawMaterialBatchStatus',
            },
            description: {
              type: 'string',
              description: 'Additional description',
              example: 'High quality organic ashwagandha roots',
              nullable: true,
            },
            notes: {
              type: 'string',
              description: 'Any additional notes',
              example: 'Harvested during optimal season',
              nullable: true,
            },
            currentOwnerId: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the current owner',
              nullable: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
              example: '2025-09-05T10:30:00Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
              example: '2025-09-05T10:30:00Z',
            },
          },
          required: ['batchId', 'herbName', 'quantity', 'unit', 'status'],
        },
        
        // Supply Chain Event schemas
        SupplyChainEvent: {
          type: 'object',
          properties: {
            eventId: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the event',
              example: 'd1e2f3g4-h5i6-7890-1234-567890abcdef',
            },
            eventType: {
              $ref: '#/components/schemas/SupplyChainEventType',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Event timestamp',
              example: '2025-09-05T10:30:00Z',
            },
            handlerId: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the person handling the event',
              example: 'b1c2d3e4-f5g6-7890-1234-567890abcdef',
            },
            fromLocationId: {
              type: 'string',
              format: 'uuid',
              description: 'Source location organization ID',
              example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
            },
            toLocationId: {
              type: 'string',
              format: 'uuid',
              description: 'Destination location organization ID',
              example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
            },
            rawMaterialBatchId: {
              type: 'string',
              format: 'uuid',
              description: 'Associated raw material batch ID',
              example: 'c1d2e3f4-g5h6-7890-1234-567890abcdef',
              nullable: true,
            },
            finishedGoodId: {
              type: 'string',
              format: 'uuid',
              description: 'Associated finished good ID',
              example: 'e1f2g3h4-i5j6-7890-1234-567890abcdef',
              nullable: true,
            },
            notes: {
              type: 'string',
              description: 'Additional notes about the event',
              example: 'Quality testing completed successfully',
              nullable: true,
            },
            custody: {
              type: 'object',
              description: 'Custody transfer information',
              nullable: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
              example: '2025-09-05T10:30:00Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
              example: '2025-09-05T10:30:00Z',
            },
          },
          required: ['eventId', 'eventType', 'timestamp', 'handlerId', 'fromLocationId', 'toLocationId'],
        },
        
        // Finished Good schemas
        FinishedGood: {
          type: 'object',
          properties: {
            productId: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the finished good',
              example: 'e1f2g3h4-i5j6-7890-1234-567890abcdef',
            },
            productName: {
              type: 'string',
              description: 'Name of the finished product',
              example: 'Ashwagandha Churna',
            },
            productType: {
              $ref: '#/components/schemas/FinishedGoodProductType',
            },
            quantity: {
              type: 'number',
              description: 'Quantity produced',
              example: 50.0,
            },
            unit: {
              $ref: '#/components/schemas/QuantityUnit',
            },
            manufacturerId: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the manufacturer',
              example: 'b1c2d3e4-f5g6-7890-1234-567890abcdef',
            },
            description: {
              type: 'string',
              description: 'Product description',
              example: 'Pure Ashwagandha powder for wellness',
              nullable: true,
            },
            batchNumber: {
              type: 'string',
              description: 'Batch number for the product',
              example: 'FG-2025-001',
              nullable: true,
            },
            expiryDate: {
              type: 'string',
              format: 'date-time',
              description: 'Product expiry date',
              example: '2027-09-05T08:00:00Z',
              nullable: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
              example: '2025-09-05T10:30:00Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
              example: '2025-09-05T10:30:00Z',
            },
          },
          required: ['productId', 'productName', 'productType', 'quantity', 'unit', 'manufacturerId'],
        },
        
        // Document schemas
        Document: {
          type: 'object',
          properties: {
            documentId: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the document',
              example: 'f1g2h3i4-j5k6-7890-1234-567890abcdef',
            },
            fileName: {
              type: 'string',
              description: 'Original file name',
              example: 'organic_certificate.pdf',
              nullable: true,
            },
            filePath: {
              type: 'string',
              description: 'File storage path',
              example: '/uploads/documents/f1g2h3i4-j5k6-7890-organic_certificate.pdf',
            },
            fileSize: {
              type: 'integer',
              description: 'File size in bytes',
              example: 2048576,
            },
            mimeType: {
              type: 'string',
              description: 'MIME type of the file',
              example: 'application/pdf',
            },
            documentType: {
              $ref: '#/components/schemas/DocumentType',
            },
            description: {
              type: 'string',
              description: 'Description of the document',
              example: 'Organic certification for batch',
              nullable: true,
            },
            uploadedBy: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the user who uploaded the document',
              nullable: true,
            },
            isPublic: {
              type: 'boolean',
              description: 'Whether the document is publicly accessible',
              example: false,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Upload timestamp',
              example: '2025-09-05T10:30:00Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
              example: '2025-09-05T10:30:00Z',
            },
            collectionEventId: {
              type: 'string',
              format: 'uuid',
              description: 'Associated collection event ID',
              nullable: true,
            },
            rawMaterialBatchId: {
              type: 'string',
              format: 'uuid',
              description: 'Associated raw material batch ID',
              nullable: true,
            },
            supplyChainEventId: {
              type: 'string',
              format: 'uuid',
              description: 'Associated supply chain event ID',
              nullable: true,
            },
            finishedGoodId: {
              type: 'string',
              format: 'uuid',
              description: 'Associated finished good ID',
              nullable: true,
            },
          },
          required: ['documentId', 'filePath', 'fileSize', 'mimeType', 'documentType'],
        },
        
        // QR Code schemas
        QRCode: {
          type: 'object',
          properties: {
            qrCodeId: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the QR code',
              example: 'g1h2i3j4-k5l6-7890-1234-567890abcdef',
            },
            qrHash: {
              type: 'string',
              description: 'Unique hash for the QR code',
              example: 'abc123def456ghi789jkl012mno345pqr678',
            },
            entityType: {
              $ref: '#/components/schemas/QREntityType',
            },
            entityId: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the entity',
              example: 'c1d2e3f4-g5h6-7890-1234-567890abcdef',
            },
            generatedBy: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the user who generated the QR code',
              nullable: true,
            },
            customData: {
              type: 'object',
              description: 'Additional custom data for the QR code',
              example: { batchInfo: 'Premium Ashwagandha', harvestDate: '2025-08-15' },
              nullable: true,
            },
            scanCount: {
              type: 'integer',
              description: 'Number of times the QR code has been scanned',
              example: 15,
            },
            lastScannedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last scan timestamp',
              example: '2025-09-05T14:30:00Z',
              nullable: true,
            },
            isActive: {
              type: 'boolean',
              description: 'Whether the QR code is active',
              example: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
              example: '2025-09-05T10:30:00Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
              example: '2025-09-05T10:30:00Z',
            },
          },
          required: ['qrCodeId', 'qrHash', 'entityType', 'entityId'],
        },
        
        // Species schemas
        HerbSpecies: {
          type: 'object',
          properties: {
            speciesId: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the species',
              example: 'h1i2j3k4-l5m6-7890-1234-567890abcdef',
            },
            commonName: {
              type: 'string',
              description: 'Common name of the herb',
              example: 'Ashwagandha',
            },
            scientificName: {
              type: 'string',
              description: 'Scientific name of the herb',
              example: 'Withania somnifera',
            },
            family: {
              type: 'string',
              description: 'Plant family',
              example: 'Solanaceae',
              nullable: true,
            },
            description: {
              type: 'string',
              description: 'Description of the herb species',
              example: 'A medicinal herb known for its adaptogenic properties',
              nullable: true,
            },
            medicinalUses: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Medicinal uses of the herb',
              example: ['Stress relief', 'Immune support', 'Energy enhancement'],
            },
            nativeRegions: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Native regions where the herb grows',
              example: ['India', 'Nepal', 'Sri Lanka'],
            },
            harvestingSeason: {
              type: 'string',
              description: 'Optimal harvesting season',
              example: 'Winter (December to February)',
              nullable: true,
            },
            partsUsed: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Parts of the plant used medicinally',
              example: ['Root', 'Leaves'],
            },
            conservationStatus: {
              $ref: '#/components/schemas/ConservationStatus',
            },
            regulatoryInfo: {
              type: 'object',
              description: 'Regulatory information',
              nullable: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
              example: '2025-09-05T10:30:00Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
              example: '2025-09-05T10:30:00Z',
            },
          },
          required: ['speciesId', 'commonName', 'scientificName'],
        },
        
        // Collection Event schemas
        CollectionEvent: {
          type: 'object',
          properties: {
            eventId: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the collection event',
              example: 'i1j2k3l4-m5n6-7890-1234-567890abcdef',
            },
            collectorId: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the collector',
              example: 'b1c2d3e4-f5g6-7890-1234-567890abcdef',
            },
            farmerId: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the farmer',
              example: 'b1c2d3e4-f5g6-7890-1234-567890abcdef',
              nullable: true,
            },
            herbSpeciesId: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the herb species',
              example: 'h1i2j3k4-l5m6-7890-1234-567890abcdef',
              nullable: true,
            },
            collectionDate: {
              type: 'string',
              format: 'date-time',
              description: 'Date of collection',
              example: '2025-09-05T08:00:00Z',
            },
            location: {
              type: 'string',
              description: 'Collection location',
              example: 'Satara District, Maharashtra',
              nullable: true,
            },
            latitude: {
              type: 'number',
              format: 'float',
              description: 'GPS latitude coordinate',
              example: 17.6868,
              nullable: true,
            },
            longitude: {
              type: 'number',
              format: 'float',
              description: 'GPS longitude coordinate',
              example: 74.0183,
              nullable: true,
            },
            quantity: {
              type: 'number',
              description: 'Quantity collected',
              example: 25.5,
              nullable: true,
            },
            unit: {
              type: 'string',
              description: 'Unit of measurement',
              example: 'KG',
              nullable: true,
            },
            qualityNotes: {
              type: 'string',
              description: 'Quality assessment notes',
              example: 'Good quality, mature roots',
              nullable: true,
            },
            notes: {
              type: 'string',
              description: 'Additional notes',
              example: 'Collected during optimal weather conditions',
              nullable: true,
            },
            batchId: {
              type: 'string',
              format: 'uuid',
              description: 'Associated batch ID',
              example: 'c1d2e3f4-g5h6-7890-1234-567890abcdef',
              nullable: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
              example: '2025-09-05T10:30:00Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
              example: '2025-09-05T10:30:00Z',
            },
          },
          required: ['eventId', 'collectorId', 'collectionDate'],
        },
        
        // Response schemas
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully',
            },
            data: {
              type: 'object',
              description: 'Response data',
              nullable: true,
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2025-09-03T12:00:00Z',
            },
          },
        },
        
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              example: 'Validation error',
            },
            message: {
              type: 'string',
              example: 'Required field is missing',
            },
            details: {
              type: 'object',
              description: 'Additional error details',
              nullable: true,
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2025-09-03T12:00:00Z',
            },
          },
        },
        
        ValidationError: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Validation failed',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    description: 'Field that failed validation',
                    example: 'email',
                  },
                  message: {
                    type: 'string',
                    description: 'Validation error message for the field',
                    example: 'A valid email is required',
                  },
                  code: {
                    type: 'string',
                    description: 'Validation error code',
                    example: 'invalid_email',
                  },
                },
              },
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2025-09-03T12:00:00Z',
            },
          },
        },
        
        LoginResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Login successful',
            },
            data: {
              type: 'object',
              properties: {
                user: {
                  $ref: '#/components/schemas/User',
                },
                token: {
                  type: 'string',
                  description: 'JWT authentication token',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                },
              },
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2025-09-03T12:00:00Z',
            },
          },
        },
        
        HealthCheck: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'OK',
            },
            message: {
              type: 'string',
              example: 'AyuTrace Backend Server is running',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2025-09-03T12:00:00Z',
            },
            version: {
              type: 'string',
              example: '1.0.0',
            },
          },
        },
      },
    },
  },
  apis: [
  './modules/Auth/auth.routes.js',
  './modules/Collection/collection.routes.js',
  './modules/RawMaterialBatch/rawMaterialBatch.routes.js',
  './modules/SupplyChain/supplyChain.routes.js',
  './modules/FinishedGoods/finishedGoods.routes.js',
  './modules/Documents/documents.routes.js',
  './modules/QRCode/qrCode.routes.js',
  './modules/Species/species.routes.js',
  './modules/Organization/organization.routes.js',
  './modules/Organization/organization.controller.js',
  './modules/Labs/labs.routes.js',
  './modules/Utils/utils.routes.js',
  ],
};

let specs;
try {
  console.log('🔄 Building Swagger documentation...');
  specs = swaggerJSDoc(options);
  
  // Write the full spec to a file for debugging
  fs.writeFileSync(
    path.join(__dirname, '../swagger-spec.json'), 
    JSON.stringify(specs, null, 2), 
    'utf8'
  );
  
  console.log('✅ Swagger documentation built successfully');
  console.log('📄 Full spec written to swagger-spec.json');
} catch (err) {
  console.error('❌ Swagger build failed:', err.message);
  
  const errorLog = [
    '❌ Swagger build failed',
    '',
    'Error:',
    err.stack || err.message,
    '',
    'Options definition:',
    JSON.stringify(options.definition, null, 2),
    '',
    'API files:',
    options.apis.join('\n'),
  ].join('\n');
  
  fs.writeFileSync(
    path.join(__dirname, '../swagger-error.log'), 
    errorLog, 
    'utf8'
  );
  
  console.log('📝 Error details written to swagger-error.log');
  process.exit(1);
}

module.exports = {
  specs,
  swaggerUi,
};