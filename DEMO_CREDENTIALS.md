# Demo User Credentials & API Testing Guide

## 🔑 Login Credentials
All demo users use the same password: **`demo123`**

| Email | Password | Role | Organization | Full Name |
|-------|----------|------|--------------|-----------|
| `farmer@demo.com` | `demo123` | USER | FARMER | Rajesh Farmer |
| `manufacturer@demo.com` | `demo123` | USER | MANUFACTURER | Priya Manufacturer |
| `lab@demo.com` | `demo123` | USER | LABS | Dr. Amit LabTech |
| `distributor@demo.com` | `demo123` | USER | DISTRIBUTOR | Sanjay Distributor |
| `admin@demo.com` | `demo123` | SUPER_ADMIN | ADMIN | Super Admin |

## 📊 Sample Data Created

### Organizations (5)
- `demo-farmer` - FARMER
- `demo-manufacturer` - MANUFACTURER  
- `demo-labs` - LABS
- `demo-distributor` - DISTRIBUTOR
- `demo-admin` - ADMIN

### Herb Species (3)
- Ashwagandha (Withania somnifera)
- Turmeric (Curcuma longa)
- Holy Basil (Ocimum tenuiflorum)

### Products & Batches
- 3 Raw Material Batches (different herbs)
- 3 Finished Goods (Powder, Capsule, Tablet)
- 3 Collection Events from farmer
- 3 Lab Tests (Quality, Purity, Potency)
- 2 Certificates for completed tests

### Supply Chain
- 2 Supply Chain Events (Testing, Distribution)
- 2 Distributor Inventory items
- 2 Distributor Shipments with items
- 3 QR Codes for tracking

### Documents & Admin
- 4 Documents (Certificate, Report, Photo, Invoice)
- 3 Admin Actions logged
- 3 System Alerts (Expiry, Quality, Compliance)

## 🧪 API Testing Routes

### Authentication
```bash
POST /api/auth/login
{
  "email": "farmer@demo.com",
  "password": "demo123"
}
```

### Key Endpoints to Test

#### Organizations
- `GET /api/organizations` - List all organizations
- `GET /api/organizations/demo-farmer` - Get specific org

#### Users  
- `GET /api/users/profile` - Get current user profile
- `GET /api/users` - List users (admin only)

#### Raw Materials
- `GET /api/raw-material-batches` - List all batches
- `POST /api/raw-material-batches` - Create new batch

#### Finished Goods
- `GET /api/finished-goods` - List products
- `GET /api/finished-goods/:id` - Get specific product

#### Lab Tests
- `GET /api/lab-tests` - List tests
- `POST /api/lab-tests` - Create new test
- `PUT /api/lab-tests/:id/complete` - Complete test

#### Supply Chain
- `GET /api/supply-chain` - Track supply chain events
- `POST /api/supply-chain/events` - Add new event

#### QR Codes
- `GET /api/qr-codes` - List QR codes
- `POST /api/qr-codes/generate` - Generate new QR

#### Distributor
- `GET /api/distributor/inventory` - View inventory
- `GET /api/distributor/shipments` - View shipments
- `POST /api/distributor/shipments` - Create shipment

#### Admin
- `GET /api/admin/actions` - View admin actions
- `GET /api/admin/alerts` - View system alerts
- `POST /api/admin/organizations` - Create organization

## 🎯 Testing Scenarios

### 1. **Farmer Login & Collection**
- Login as `farmer@demo.com`
- View collection events: `GET /api/collection-events`
- Create new collection: `POST /api/collection-events`

### 2. **Manufacturer Processing**
- Login as `manufacturer@demo.com`
- View raw materials: `GET /api/raw-material-batches`
- Create finished goods: `POST /api/finished-goods`
- Generate QR codes: `POST /api/qr-codes/generate`

### 3. **Lab Testing**
- Login as `lab@demo.com`
- View pending tests: `GET /api/lab-tests?status=PENDING`
- Complete tests: `PUT /api/lab-tests/:id/complete`
- Issue certificates: `POST /api/certificates`

### 4. **Distribution**
- Login as `distributor@demo.com`
- View inventory: `GET /api/distributor/inventory`
- Create shipments: `POST /api/distributor/shipments`
- Track deliveries: `GET /api/distributor/shipments/:id`

### 5. **Admin Management**
- Login as `admin@demo.com`
- View all data across organizations
- Manage users: `GET /api/users`
- Monitor alerts: `GET /api/admin/alerts`
- View system actions: `GET /api/admin/actions`

## 🚀 Quick Start Commands

```bash
# Run the comprehensive seeding
cd ayutrace-backend
node seed-all-tables.js

# Start the server
npm run dev

# Test authentication
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"farmer@demo.com","password":"demo123"}'

# View Swagger documentation
http://localhost:5000/api-docs
```

## 📱 Frontend Testing
- Use any of the login credentials above
- Test the responsive UI with real data
- Navigate through different user roles and permissions
- Verify QR code generation and scanning features

---
**Note**: This is demo data for testing purposes. In production, use strong passwords and proper security measures.