const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

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
            organizationId: {
              type: 'string',
              format: 'uuid',
              description: 'Foreign key linking to the Organization',
              example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address used for login',
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
            role: {
              type: 'string',
              enum: ['FARMER', 'COOP_ADMIN', 'PROCESSOR', 'LAB_TECH', 'MANUFACTURER_QA', 'REGULATOR_ADMIN'],
              description: 'User role determining permissions',
              example: 'FARMER',
            },
            blockchainIdentity: {
              type: 'string',
              description: 'User unique identity within Fabric CA',
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
              description: 'Timestamp of last successful login',
              example: '2025-09-02T11:30:00Z',
              nullable: true,
            },
            isActive: {
              type: 'boolean',
              description: 'Flag to activate or deactivate user account',
              example: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp of creation',
              example: '2025-09-02T12:00:00Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp of last update',
              example: '2025-09-02T12:00:00Z',
            },
            organization: {
              $ref: '#/components/schemas/Organization',
              description: 'Associated organization details',
            },
          },
          required: ['userId', 'organizationId', 'email', 'firstName', 'lastName', 'role'],
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
      },
    },
    tags: [
      {
        name: 'Health',
        description: 'System health and status endpoints',
      },
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints for secure access to the system',
      },
      {
        name: 'Users',
        description: 'User profile management and information retrieval endpoints',
      },
      {
        name: 'Organizations',
        description: 'Organization management endpoints for supply chain entities',
      },
      {
        name: 'Collections',
        description: 'Herb collection and batch management endpoints',
      },
      {
        name: 'Supply Chain',
        description: 'Supply chain event tracking and management endpoints',
      },
    ],
  },
  apis: [
    path.join(__dirname, '../modules/Auth/auth.routes.js'),
    path.join(__dirname, '../modules/Collection/collection.routes.js'),
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
