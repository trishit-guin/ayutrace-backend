
# AyuTrace Backend

AyuTrace is a robust supply chain traceability system for ayurvedic herbs, built with Node.js, Express, and Prisma ORM. It provides secure, end-to-end tracking from farm to finished product, ensuring quality, authenticity, and compliance.


## 🌿 Overview

AyuTrace enables:
- End-to-end traceability for ayurvedic herbs and products
- Role-based authentication and authorization
- Quality management and document uploads
- QR code-based tracking
- Comprehensive RESTful API with Swagger documentation


## 🚀 Features

- **Role-based Authentication** (JWT)
- **Supply Chain Tracking** (Collection, Processing, Transfer, Finished Goods)
- **Quality Management** (Document uploads, batch status)
- **QR Code Integration** (Batch, Product, Event tracking)
- **Comprehensive REST API** (Swagger & Postman docs)
- **Audit Logging**


## 🛠️ Technology Stack

- **Node.js** (Express.js)
- **PostgreSQL** (with PostGIS)
- **Prisma ORM**
- **JWT Authentication**
- **Zod Validation**
- **Swagger/OpenAPI**
- **bcryptjs**


## 📋 Prerequisites

- Node.js (v16+)
- PostgreSQL (v12+) with PostGIS
- npm or yarn


## 🔧 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ayutrace-backend
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your DB credentials and JWT secret
   ```
4. **Setup database**
   ```bash
   createdb ayutrace
   psql ayutrace -c "CREATE EXTENSION postgis;"
   npx prisma migrate dev
   npx prisma generate
   ```
5. **Run the server**
   ```bash
   npm run dev   # Development
   npm start     # Production
   ```


API available at: `http://localhost:3000`


## 📚 API Documentation

- **Swagger UI:** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- **Postman Collection:** See `docs/AyuTrace_API.postman_collection.json`


## 🔐 Environment Variables

Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/ayutrace"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="1d"
PORT=3000
NODE_ENV="development"
```


## 🏗️ Project Structure

```
ayutrace-backend/
├── config/              # Configuration files
│   ├── enums.js
│   └── swagger.js
├── docs/                # Documentation & API collections
│   ├── API_DOCUMENTATION.md
│   ├── AyuTrace_API.postman_collection.json
│   └── SWAGGER_IMPLEMENTATION.md
├── modules/             # Feature modules
│   ├── Auth/            # Authentication
│   ├── Collection/      # Herb collection
│   ├── Documents/       # Document uploads
│   ├── FinishedGoods/   # Finished product management
│   ├── Organization/    # Organization management
│   ├── QRCode/          # QR code generation & tracking
│   ├── RawMaterialBatch/# Raw material batch management
│   ├── Species/         # Herb species
│   ├── SupplyChain/     # Supply chain events
│   └── Utils/           # Utility routes
├── prisma/              # Database schema & migrations
│   ├── schema.prisma
│   └── migrations/
├── uploads/             # Uploaded files
├── utils/               # Utility functions
├── server.js            # App entry point
└── package.json         # Dependencies & scripts
```


## 👥 User Roles

- **FARMER**: Herb collection, batch creation
- **MANUFACTURER**: Finished goods production
- **LABS**: Quality testing
- **DISTRIBUTOR**: Distribution and transfer


## 🔗 Main API Endpoints

### Auth
- `POST /api/auth/register` — Register user
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get profile

### Collection
- `POST /api/collection` — Create collection event
- `GET /api/collection` — List collection events
- `GET /api/collection/:id` — Get event details

### Documents
- `POST /api/documents` — Upload document
- `GET /api/documents/:id` — Get document info

### Finished Goods
- `POST /api/finishedGoods` — Create finished good
- `GET /api/finishedGoods` — List finished goods

### Organization
- `GET /api/organization` — List organizations

### QRCode
- `POST /api/qrCode/generate` — Generate QR code
- `GET /api/qrCode/:id` — Get QR code info

### Raw Material Batch
- `POST /api/rawMaterialBatch` — Create batch
- `GET /api/rawMaterialBatch` — List batches

### Species
- `GET /api/species` — List herb species

### Supply Chain
- `POST /api/supplyChain` — Create supply chain event
- `GET /api/supplyChain` — List events


## 🧪 Testing

- Import the Postman collection from `docs/AyuTrace_API.postman_collection.json`
- Health check: `curl http://localhost:3000/`


## 📊 Database Schema (Key Entities)

- **User**: Individual user accounts
- **Organization**: Supply chain participants
- **HerbSpecies**: Herb species info
- **CollectionEvent**: Herb collection events
- **RawMaterialBatch**: Herb batches
- **SupplyChainEvent**: Processing, transfer, storage
- **FinishedGood**: Final products
- **Document**: Uploaded documents
- **QRCode**: QR code tracking


## 🔒 Security Features

- JWT authentication
- Password hashing (bcrypt)
- Role-based access control
- Input validation (Zod)
- Prisma ORM for SQL safety


## 🌍 Deployment

### Manual Deployment
1. Set up PostgreSQL with PostGIS
2. Configure environment variables
3. Run migrations: `npx prisma migrate deploy`
4. Start the app: `npm start`


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to your branch
5. Open a Pull Request


## 📝 License

MIT License — see LICENSE file


## 📞 Support

- Documentation: `/api-docs` endpoint
- Issues: Create an issue on GitHub


## 🙏 Acknowledgments

- Built for Smart India Hackathon 2025
- Inspired by the need for transparency in ayurvedic medicine supply chains
- Uses open-source technologies for compatibility and extensibility
