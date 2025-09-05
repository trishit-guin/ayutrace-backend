const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const { getAllSwaggerEnums, getSwaggerEnum } = require('./enums');

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
      {
        name: 'Authentication',
        description: 'User authentication and authorization operations',
      },
      {
        name: 'Raw Material Batches',
        description: 'Raw material batch management for herbs collection and tracking',
      },
      {
        name: 'Supply Chain',
        description: 'Supply chain event tracking throughout the herb processing pipeline',
      },
      {
        name: 'Finished Goods',
        description: 'Finished product management with composition tracking',
      },
      {
        name: 'Documents',
        description: 'Document and file management for certificates, photos, and reports',
      },
      {
        name: 'QR Codes',
        description: 'QR code generation and scanning for product traceability',
      },
      {
        name: 'Species',
        description: 'Herb species management with conservation and regulatory information',
      },
      {
        name: 'Utilities',
        description: 'Utility endpoints for testing and development - enum values and sample data',
      },
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
        Organization: {
          type: 'object',
          properties: {
            organizationId: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the organization',
              example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
            },
            name: {
              type: 'string',
              description: 'Legal name of the organization',
              example: 'Pune Organic Farmers Cooperative',
            },
            type: {
              type: 'string',
              enum: ['COOPERATIVE', 'PROCESSOR', 'LABORATORY', 'MANUFACTURER', 'REGULATOR'],
              description: 'Type of organization',
              example: 'COOPERATIVE',
            },
            mspId: {
              type: 'string',
              description: 'Hyperledger Fabric MSP ID',
              example: 'CooperativeMSP',
            },
            contactInfo: {
              type: 'object',
              description: 'Contact information',
              example: {
                phone: '+919876543210',
                address: '123 Agri St, Pune, Maharashtra',
                email: 'contact@puneorganic.coop'
              },
              nullable: true,
            },
            registrationDetails: {
              type: 'object',
              description: 'Registration and license details',
              example: {
                licenseNumber: 'FSSAI123456',
                gstin: '27ABCDE1234F1Z5'
              },
              nullable: true,
            },
            isActive: {
              type: 'boolean',
              description: 'Organization active status',
              example: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
              example: '2025-09-02T12:00:00Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
              example: '2025-09-02T12:00:00Z',
            },
          },
          required: ['organizationId', 'name', 'type', 'mspId'],
        },
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
              ...getSwaggerEnum('OrgType'),
              description: 'Organization type the user belongs to',
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
          },
          required: ['userId', 'email', 'firstName', 'lastName', 'orgType'],
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
            role: {
              type: 'string',
              enum: ['FARMER', 'COOP_ADMIN', 'PROCESSOR', 'LAB_TECH', 'MANUFACTURER_QA', 'REGULATOR_ADMIN'],
              description: 'User role in the organization',
              example: 'FARMER',
            },
            blockchainIdentity: {
              type: 'string',
              description: 'Optional blockchain identity',
              example: 'user1@cooperative.prakritichain.com',
            },
          },
          required: ['email', 'password', 'firstName', 'lastName', 'organizationId', 'role'],
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
        LoginResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Success message',
              example: 'Login successful',
            },
            token: {
              type: 'string',
              description: 'JWT authentication token',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Response timestamp',
              example: '2025-09-03T12:00:00Z',
            },
          },
        },
        RegistrationResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Success message',
              example: 'User created successfully',
            },
            user: {
              $ref: '#/components/schemas/User',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Response timestamp',
              example: '2025-09-03T12:00:00Z',
            },
          },
        },
        MeResponse: {
          type: 'object',
          properties: {
            user: {
              $ref: '#/components/schemas/User',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Response timestamp',
              example: '2025-09-03T12:00:00Z',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message',
              example: 'Invalid email or password',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Error timestamp',
              example: '2025-09-03T12:00:00Z',
            },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Validation error message',
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
              description: 'Error timestamp',
              example: '2025-09-03T12:00:00Z',
            },
          },
        },
        HealthCheck: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Health status message',
              example: 'AyuTrace Backend API is running',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Response timestamp',
              example: '2025-09-03T12:00:00Z',
            },
            version: {
              type: 'string',
              description: 'API version',
              example: '1.0.0',
            },
          },
        },
        RawMaterialBatch: {
          type: 'object',
          properties: {
            id: {
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
            },
            quantity: {
              type: 'number',
              description: 'Quantity of the batch',
              example: 100.5,
            },
            unit: {
              ...getSwaggerEnum('QuantityUnit'),
              description: 'Unit of measurement',
            },
            status: {
              ...getSwaggerEnum('RawMaterialBatchStatus'),
              description: 'Current status of the batch',
            },
            description: {
              type: 'string',
              description: 'Additional description',
              example: 'High quality organic ashwagandha roots',
            },
            notes: {
              type: 'string',
              description: 'Any additional notes',
              example: 'Harvested during optimal season',
            },
            currentOwnerId: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the current owner',
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
          required: ['herbName', 'quantity', 'unit'],
        },
        SupplyChainEvent: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the event',
              example: 'd1e2f3g4-h5i6-7890-1234-567890abcdef',
            },
            eventType: {
              ...getSwaggerEnum('SupplyChainEventType'),
              description: 'Type of supply chain event',
            },
            eventDate: {
              type: 'string',
              format: 'date-time',
              description: 'Date and time when the event occurred',
              example: '2025-09-05T10:30:00Z',
            },
            batchId: {
              type: 'string',
              format: 'uuid',
              description: 'Associated batch ID',
              nullable: true,
            },
            finishedGoodId: {
              type: 'string',
              format: 'uuid',
              description: 'Associated finished good ID',
              nullable: true,
            },
            handlerId: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the person handling the event',
            },
            locationLat: {
              type: 'number',
              description: 'Latitude coordinate of the event location',
              example: 19.076,
            },
            locationLng: {
              type: 'number',
              description: 'Longitude coordinate of the event location',
              example: 72.8777,
            },
            details: {
              type: 'string',
              description: 'Additional details about the event',
              example: 'Herbs collected from organic farm',
            },
            notes: {
              type: 'string',
              description: 'Any additional notes',
              example: 'Good quality harvest',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
              example: '2025-09-05T10:30:00Z',
            },
          },
          required: ['eventType', 'eventDate', 'handlerId', 'locationLat', 'locationLng'],
        },
        FinishedGood: {
          type: 'object',
          properties: {
            id: {
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
              ...getSwaggerEnum('FinishedGoodProductType'),
              description: 'Type of the product',
            },
            description: {
              type: 'string',
              description: 'Product description',
              example: 'Pure Ashwagandha powder for wellness',
            },
            quantity: {
              type: 'number',
              description: 'Quantity produced',
              example: 50.0,
            },
            unit: {
              ...getSwaggerEnum('QuantityUnit'),
              description: 'Unit of measurement',
            },
            batchNumber: {
              type: 'string',
              description: 'Batch number for the product',
              example: 'FG-2025-001',
            },
            manufacturingDate: {
              type: 'string',
              format: 'date-time',
              description: 'Date of manufacturing',
              example: '2025-09-05T08:00:00Z',
            },
            expiryDate: {
              type: 'string',
              format: 'date-time',
              description: 'Product expiry date',
              example: '2027-09-05T08:00:00Z',
            },
            notes: {
              type: 'string',
              description: 'Additional notes',
            },
            manufacturerId: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the manufacturer',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
              example: '2025-09-05T10:30:00Z',
            },
          },
          required: ['productName', 'productType', 'quantity', 'unit'],
        },
        Document: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the document',
              example: 'f1g2h3i4-j5k6-7890-1234-567890abcdef',
            },
            fileName: {
              type: 'string',
              description: 'Original file name',
              example: 'organic_certificate.pdf',
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
              ...getSwaggerEnum('DocumentType'),
              description: 'Type of document',
            },
            entityType: {
              ...getSwaggerEnum('DocumentEntityType'),
              description: 'Type of entity the document is associated with',
            },
            entityId: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the entity',
            },
            description: {
              type: 'string',
              description: 'Description of the document',
              example: 'Organic certification for batch',
            },
            notes: {
              type: 'string',
              description: 'Additional notes',
            },
            uploadedBy: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the user who uploaded the document',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Upload timestamp',
              example: '2025-09-05T10:30:00Z',
            },
          },
          required: ['fileName', 'documentType', 'entityType', 'entityId'],
        },
        QRCode: {
          type: 'object',
          properties: {
            id: {
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
              ...getSwaggerEnum('QREntityType'),
              description: 'Type of entity the QR code is for',
            },
            entityId: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the entity',
            },
            purpose: {
              type: 'string',
              description: 'Purpose of the QR code',
              example: 'Product traceability',
            },
            notes: {
              type: 'string',
              description: 'Additional notes',
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
            createdBy: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the user who created the QR code',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
              example: '2025-09-05T10:30:00Z',
            },
          },
          required: ['entityType', 'entityId'],
        },
        Species: {
          type: 'object',
          properties: {
            id: {
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
            description: {
              type: 'string',
              description: 'Description of the herb species',
              example: 'A medicinal herb known for its adaptogenic properties',
            },
            conservationStatus: {
              ...getSwaggerEnum('ConservationStatus'),
              description: 'Conservation status of the species',
            },
            nativeRegion: {
              type: 'string',
              description: 'Native region of the species',
              example: 'India, Middle East, Africa',
            },
            regulatoryStatus: {
              type: 'string',
              description: 'Regulatory status information',
              example: 'Generally recognized as safe (GRAS)',
            },
            notes: {
              type: 'string',
              description: 'Additional notes',
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
          required: ['commonName', 'scientificName', 'conservationStatus', 'nativeRegion'],
        },
        Error: {
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
          },
        },
        Success: {
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
          },
        },
        
        // Enum Components for Dynamic Dropdown Testing
        ...getAllSwaggerEnums(),
      },
    },
  },
  apis: [
    path.join(__dirname, '../modules/Auth/auth.routes.js'),
    path.join(__dirname, '../modules/Collection/collection.routes.js'),
    path.join(__dirname, '../modules/RawMaterialBatch/rawMaterialBatch.routes.js'),
    path.join(__dirname, '../modules/SupplyChain/supplyChain.routes.js'),
    path.join(__dirname, '../modules/FinishedGoods/finishedGoods.routes.js'),
    path.join(__dirname, '../modules/Documents/documents.routes.js'),
    path.join(__dirname, '../modules/QRCode/qrCode.routes.js'),
    path.join(__dirname, '../modules/Species/species.routes.js'),
    path.join(__dirname, '../modules/Utils/utils.routes.js'),
    path.join(__dirname, '../modules/Organization/organization.controller.js'),
    path.join(__dirname, '../modules/Organization/organization.routes.js'),
    path.join(__dirname, '../server.js'),
  ],
};

const specs = swaggerJSDoc(options);

module.exports = {
  specs,
  swaggerUi,
};
