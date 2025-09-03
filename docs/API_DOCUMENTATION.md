# AyuTrace Backend API Documentation

## Overview

AyuTrace is a comprehensive supply chain traceability system specifically designed for ayurvedic herbs. The system uses blockchain technology (Hyperledger Fabric) and traditional databases to ensure transparency, authenticity, and quality control throughout the ayurvedic herb supply chain.

## Architecture

The system follows a modular architecture with the following key components:

- **Authentication Module**: Handles user registration, login, and authorization
- **Collection Module**: Manages herb collection and batch creation
- **Processing Module**: Tracks herb processing and transformation
- **Laboratory Module**: Manages quality testing and certification
- **Manufacturing Module**: Handles finished product creation
- **Distribution Module**: Tracks product distribution and retail

## Technology Stack

- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL with PostGIS for geospatial data
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Blockchain**: Hyperledger Fabric (referenced)
- **Validation**: Zod
- **Documentation**: Swagger/OpenAPI 3.0

## User Roles and Permissions

### FARMER
- Collect herbs and create raw material batches
- View their own collection history
- Update batch status during collection

### COOP_ADMIN
- Manage cooperative operations
- Oversee multiple farmers
- Coordinate with processors and labs

### PROCESSOR
- Receive raw materials from cooperatives
- Process herbs into intermediate products
- Update processing status and quality metrics

### LAB_TECH
- Perform quality testing on raw materials and processed goods
- Generate test certificates and reports
- Approve or reject batches based on quality standards

### MANUFACTURER_QA
- Create finished goods from processed materials
- Ensure final product quality
- Generate manufacturing certificates

### REGULATOR_ADMIN
- Oversee entire supply chain
- Access all data for regulatory compliance
- Generate regulatory reports

## Security Features

- **JWT-based Authentication**: Secure token-based authentication with configurable expiration
- **Role-based Access Control**: Fine-grained permissions based on user roles
- **Password Security**: Bcrypt hashing with salt for password storage
- **Organization-level Isolation**: Users can only access data within their organization
- **Account Status Management**: Active/inactive status for users and organizations
- **Audit Logging**: Comprehensive logging of all system activities

## Data Models

### Core Entities

1. **Organization**: Represents entities in the supply chain (cooperatives, labs, manufacturers)
2. **User**: Individual user accounts with role-based permissions
3. **SpeciesRule**: Business rules for different herb species
4. **RawMaterialBatch**: Batches of collected raw herbs
5. **SupplyChainEvent**: Events that occur during processing
6. **FinishedGood**: Final products created from raw materials
7. **CollectionEvent**: Individual herb collection activities
8. **AuditLog**: System activity logging

### Enumerated Values

- **OrgType**: COOPERATIVE, PROCESSOR, LABORATORY, MANUFACTURER, REGULATOR
- **UserRole**: FARMER, COOP_ADMIN, PROCESSOR, LAB_TECH, MANUFACTURER_QA, REGULATOR_ADMIN
- **BatchStatus**: COLLECTED, IN_TRANSIT, PROCESSING, AWAITING_TEST, TEST_PASSED, TEST_FAILED, FORMULATED, RECALLED
- **SupplyEventType**: PROCESSING, QUALITY_TEST, CUSTODY_TRANSFER
- **DocumentType**: LAB_CERTIFICATE, HARVEST_PHOTO, SHIPPING_MANIFEST, ORGANIC_CERTIFICATION
- **AuditAction**: USER_LOGIN, USER_LOGOUT, CREATE_BATCH, UPDATE_BATCH_STATUS, etc.

## API Endpoints

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate user and get JWT token
- `GET /api/auth/me` - Get current user profile (requires authentication)

### Collection Endpoints (Coming Soon)

- `POST /api/collections` - Create a new collection event
- `GET /api/collections` - List collection events
- `GET /api/collections/:id` - Get specific collection event
- `PUT /api/collections/:id` - Update collection event

## Error Handling

The API uses standard HTTP status codes and returns consistent error responses:

```json
{
  "message": "Error description",
  "timestamp": "2025-09-03T12:00:00Z"
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `500` - Internal Server Error

## Authentication

The API uses Bearer token authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Tokens expire after 24 hours by default and need to be refreshed by logging in again.

## Rate Limiting

API endpoints may be rate-limited to prevent abuse:

- Authentication endpoints: 5 requests per minute
- General endpoints: 100 requests per hour (for authenticated users)

## Geospatial Features

The system includes geospatial capabilities for:

- Recording herb collection locations
- Validating collection within permitted geographic zones
- Tracking transportation routes
- Geographic analytics and reporting

## Blockchain Integration

While the database stores immediate operational data, the system is designed to integrate with Hyperledger Fabric for:

- Immutable audit trails
- Cross-organization data sharing
- Smart contract enforcement of business rules
- Decentralized identity management

## Environment Variables

The following environment variables should be configured:

```bash
DATABASE_URL=postgresql://username:password@localhost:5432/ayutrace
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=1d
PORT=3000
NODE_ENV=development
```

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up PostgreSQL with PostGIS extension
4. Configure environment variables
5. Run database migrations: `npx prisma migrate dev`
6. Start the server: `npm run dev`
7. Access API documentation at: `http://localhost:3000/api-docs`

## Support

For technical support or questions about the API, please contact:
- Email: support@ayutrace.com
- Documentation: Available at `/api-docs` endpoint
- Repository: [GitHub Repository Link]
