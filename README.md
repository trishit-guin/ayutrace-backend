# AyuTrace Backend

A comprehensive supply chain traceability system for ayurvedic herbs built with Node.js, Express, and Prisma.

## 🌿 Overview

AyuTrace is a blockchain-enabled supply chain management system specifically designed for the ayurvedic herb industry. It provides end-to-end traceability from farm to pharmacy, ensuring quality, authenticity, and regulatory compliance.

## 🚀 Features

- **Role-based Authentication**: Secure JWT-based authentication with multiple user roles
- **Supply Chain Tracking**: Complete traceability from herb collection to final product
- **Quality Management**: Integrated laboratory testing and certification workflows
- **Geospatial Support**: Location-based herb collection validation
- **Blockchain Integration**: Ready for Hyperledger Fabric integration
- **Comprehensive API**: RESTful API with detailed Swagger documentation
- **Audit Trails**: Complete audit logging for regulatory compliance

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with PostGIS
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod
- **Documentation**: Swagger/OpenAPI 3.0
- **Password Hashing**: bcryptjs

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher) with PostGIS extension
- npm or yarn package manager

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ayutrace-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and JWT secret
   ```

4. **Setup database**
   ```bash
   # Create PostgreSQL database and enable PostGIS
   createdb ayutrace
   psql ayutrace -c "CREATE EXTENSION postgis;"
   ```

5. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

6. **Generate Prisma client**
   ```bash
   npx prisma generate
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The API will be available at `http://localhost:3000`

## 📚 API Documentation

Once the server is running, you can access the interactive Swagger documentation at:
```
http://localhost:3000/api-docs
```

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ayutrace"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="1d"

# Server Configuration
PORT=3000
NODE_ENV="development"
```

## 🏗️ Project Structure

```
ayutrace-backend/
├── config/              # Configuration files
│   └── swagger.js       # Swagger configuration
├── docs/                # Documentation
│   ├── API_DOCUMENTATION.md
│   └── AyuTrace_API.postman_collection.json
├── modules/             # Feature modules
│   ├── Auth/           # Authentication module
│   ├── Collection/     # Collection management
│   ├── Labs/           # Laboratory module
│   └── Manufacturer/   # Manufacturing module
├── prisma/             # Database schema and migrations
│   ├── schema.prisma   # Database schema
│   └── migrations/     # Migration files
├── utils/              # Utility functions
├── server.js           # Application entry point
└── package.json        # Dependencies and scripts
```

## 👥 User Roles

- **FARMER**: Herb collection and batch creation
- **COOP_ADMIN**: Cooperative management and oversight
- **PROCESSOR**: Raw material processing operations
- **LAB_TECH**: Quality testing and certification
- **MANUFACTURER_QA**: Finished goods production
- **REGULATOR_ADMIN**: Regulatory oversight and compliance

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User authentication
- `GET /api/auth/me` - Get current user profile

### Collections
- `POST /api/collections` - Create collection event
- `GET /api/collections` - List collections
- `GET /api/collections/:id` - Get collection details

## 🧪 Testing

### Using Postman
Import the provided Postman collection from `docs/AyuTrace_API.postman_collection.json`

### Manual Testing
```bash
# Health check
curl http://localhost:3000/

# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "organizationId": "uuid-here",
    "role": "FARMER"
  }'
```

## 📊 Database Schema

The system uses a comprehensive database schema with the following key entities:

- **Organizations**: Supply chain participants
- **Users**: Individual user accounts
- **RawMaterialBatch**: Herb collection batches
- **SupplyChainEvent**: Processing and transfer events
- **FinishedGood**: Final products
- **AuditLog**: System activity logs

## 🔒 Security Features

- JWT-based authentication with configurable expiration
- Password hashing using bcrypt with salt
- Role-based access control (RBAC)
- Input validation using Zod schemas
- SQL injection prevention through Prisma ORM
- Account status management

## 🌍 Deployment

### Using Docker (Coming Soon)
```bash
docker build -t ayutrace-backend .
docker run -p 3000:3000 ayutrace-backend
```

### Manual Deployment
1. Set up PostgreSQL with PostGIS on your server
2. Configure environment variables
3. Run migrations: `npx prisma migrate deploy`
4. Start the application: `npm start`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Email: support@ayutrace.com
- Documentation: Available at `/api-docs` endpoint
- Issues: Create an issue on GitHub

## 🙏 Acknowledgments

- Built for Smart India Hackathon 2025
- Inspired by the need for transparency in ayurvedic medicine supply chains
- Uses open-source technologies for maximum compatibility and extensibility
