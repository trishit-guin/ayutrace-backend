# AyuTrace System - Complete Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Organization Types & Roles](#organization-types--roles)
3. [User Authentication & Authorization](#user-authentication--authorization)
4. [Admin Dashboard Features](#admin-dashboard-features)
5. [Supply Chain Flow](#supply-chain-flow)
6. [API Architecture](#api-architecture)
7. [Database Schema](#database-schema)
8. [Frontend Components](#frontend-components)
9. [Security Features](#security-features)
10. [System Workflow](#system-workflow)

---

## System Overview

**AyuTrace** is a comprehensive supply chain tracking and management system designed specifically for the Ayurvedic medicine industry. The platform provides end-to-end traceability from raw material sourcing to finished product distribution, ensuring quality, authenticity, and regulatory compliance.

### Key Objectives
- **Traceability**: Complete tracking of products through the entire supply chain
- **Quality Assurance**: Lab testing integration and certification management
- **Regulatory Compliance**: Documentation and audit trail for regulatory bodies
- **Transparency**: Real-time visibility for all stakeholders
- **Authentication**: QR code-based product verification for consumers

---

## Organization Types & Roles

### 1. FARMER 🌾
**Primary Function**: Raw material cultivation and initial supply

#### Features & Capabilities:
- **Raw Material Management**:
  - Register new raw material batches
  - Record cultivation details (location, methods, dates)
  - Upload certificates (organic, quality, etc.)
  - Track batch quantities and quality metrics

- **Collection Management**:
  - Schedule collection requests
  - Coordinate with collection agencies
  - Track collection status and transportation

- **Documentation**:
  - Upload cultivation certificates
  - Maintain harvest records
  - Quality assessment reports
  - Environmental compliance documents

#### Workflow:
1. Register raw material batches with cultivation details
2. Request collection when ready for harvest
3. Coordinate with collection agencies
4. Provide quality certificates and documentation
5. Track batch movement to manufacturers

### 2. MANUFACTURER 🏭
**Primary Function**: Processing raw materials into finished products

#### Features & Capabilities:
- **Raw Material Reception**:
  - Receive and verify raw material batches
  - Conduct quality checks and testing
  - Record batch utilization in production

- **Production Management**:
  - Create finished goods from raw materials
  - Maintain production records and formulations
  - Quality control at each production stage
  - Batch tracking through manufacturing process

- **Finished Goods Management**:
  - Generate QR codes for product identification
  - Package and prepare for distribution
  - Maintain inventory of finished products
  - Schedule shipments to distributors

- **Lab Integration**:
  - Send samples for lab testing
  - Receive and manage lab certificates
  - Ensure compliance with quality standards

#### Workflow:
1. Receive raw materials from farmers (via collection)
2. Conduct incoming quality inspections
3. Process materials into finished products
4. Generate QR codes for traceability
5. Obtain lab certifications
6. Package and ship to distributors

### 3. LABS 🔬
**Primary Function**: Quality testing and certification

#### Features & Capabilities:
- **Sample Management**:
  - Receive samples from manufacturers
  - Track sample testing progress
  - Maintain testing queues and priorities

- **Testing Services**:
  - Conduct various quality tests (purity, potency, contamination)
  - Heavy metal analysis
  - Microbiological testing
  - Ayurvedic-specific quality parameters

- **Certificate Management**:
  - Generate digital certificates
  - Maintain testing records and results
  - Provide compliance documentation
  - Track certificate validity and renewals

- **Reporting**:
  - Generate testing reports
  - Maintain audit trails
  - Compliance reporting for regulatory bodies

#### Workflow:
1. Receive sample testing requests
2. Conduct comprehensive quality testing
3. Generate certificates and reports
4. Upload results to the system
5. Notify manufacturers of test completion

### 4. DISTRIBUTOR 🚚
**Primary Function**: Distribution and retail management

#### Features & Capabilities:
- **Inventory Management**:
  - Receive finished goods from manufacturers
  - Track product inventory and stock levels
  - Manage product expiration dates
  - Handle returns and recalls

- **Distribution Network**:
  - Manage multiple retail outlets
  - Track product movement to end customers
  - Coordinate logistics and transportation
  - Maintain cold chain (if required)

- **Sales Management**:
  - Process customer orders
  - Generate sales reports
  - Track product performance
  - Manage customer relationships

- **Traceability**:
  - Scan QR codes for product verification
  - Maintain distribution records
  - Track product journey to consumers

#### Workflow:
1. Receive finished products from manufacturers
2. Distribute to retail outlets
3. Manage inventory and sales
4. Provide traceability data to consumers
5. Handle customer queries and returns

---

## User Authentication & Authorization

### Role Hierarchy
```
SUPER_ADMIN
    ├── Full system access
    ├── Create/manage admin users
    ├── System configuration
    └── Override all permissions

ADMIN
    ├── User management
    ├── Organization management
    ├── System monitoring
    ├── Report generation
    └── Audit trail access

USER
    ├── Organization-specific features
    ├── Data entry and management
    ├── Document upload
    └── Basic reporting
```

### Authentication Flow
1. **Registration**: Users register with email and organization type
2. **Verification**: Email verification required for account activation
3. **Login**: JWT-based authentication with role-based access
4. **Session Management**: Secure session handling with token refresh
5. **Password Security**: bcrypt hashing with salt

---

## Admin Dashboard Features

### Super Admin Capabilities
- **User Management**:
  - Create, edit, and delete users
  - Assign and modify user roles
  - Activate/deactivate user accounts
  - Password reset functionality

- **Organization Management**:
  - Create and manage organizations
  - Set organization types and permissions
  - Monitor organization activities
  - Generate organization reports

- **System Administration**:
  - System configuration and settings
  - Database maintenance
  - Security monitoring
  - Performance analytics

### Admin Features
- **Dashboard Analytics**:
  - User activity statistics
  - Organization breakdown
  - Supply chain metrics
  - System health monitoring

- **User Management**:
  - View all users and their activities
  - Update user status and verification
  - Monitor user permissions
  - Generate user reports

- **Supply Chain Monitoring**:
  - Track products through supply chain
  - Monitor quality compliance
  - Generate traceability reports
  - Alert management

- **System Alerts**:
  - Quality violations
  - Compliance issues
  - System errors
  - Security alerts

---

## Supply Chain Flow

### Complete Product Journey

```
🌾 FARMER
    ↓ (Raw Material Collection)
🚛 COLLECTION AGENCY
    ↓ (Transportation)
🏭 MANUFACTURER
    ↓ (Lab Testing)
🔬 LABS
    ↓ (Certification)
🏭 MANUFACTURER (Continued)
    ↓ (Finished Goods)
🚚 DISTRIBUTOR
    ↓ (Retail Distribution)
🛒 END CONSUMER
```

### Detailed Flow Steps

1. **Raw Material Stage**:
   - Farmer cultivates medicinal plants
   - Quality parameters recorded
   - Collection request initiated
   - Documentation uploaded

2. **Collection & Transportation**:
   - Collection agency schedules pickup
   - Transportation tracking
   - Chain of custody maintained
   - Delivery to manufacturer

3. **Manufacturing Stage**:
   - Raw material inspection
   - Production planning and execution
   - Quality control at each stage
   - Finished product creation

4. **Quality Assurance**:
   - Sample submission to labs
   - Comprehensive testing
   - Certificate generation
   - Compliance verification

5. **Distribution Stage**:
   - Product packaging with QR codes
   - Shipment to distributors
   - Inventory management
   - Retail distribution

6. **Consumer Access**:
   - QR code scanning for verification
   - Complete traceability information
   - Quality certificates access
   - Authenticity confirmation

---

## API Architecture

### Core Modules

#### Authentication Module (`/modules/Auth/`)
- **Routes**: Login, registration, password reset, profile management
- **Security**: JWT tokens, password hashing, email verification
- **Middleware**: Authentication, authorization, role-based access

#### Organization Module (`/modules/Organization/`)
- **Features**: CRUD operations for organizations
- **Types**: FARMER, MANUFACTURER, LABS, DISTRIBUTOR, ADMIN
- **Management**: Organization status, type validation

#### Supply Chain Modules

1. **Raw Material Batch** (`/modules/RawMaterialBatch/`)
   - Batch creation and management
   - Quality parameter tracking
   - Farmer-specific operations

2. **Collection** (`/modules/Collection/`)
   - Collection request management
   - Transportation tracking
   - Chain of custody

3. **Finished Goods** (`/modules/FinishedGoods/`)
   - Product creation from raw materials
   - Manufacturing process tracking
   - Quality control integration

4. **QR Code** (`/modules/QRCode/`)
   - QR code generation and management
   - Product-QR code mapping
   - Consumer verification

5. **Labs** (`/modules/Labs/`)
   - Sample management
   - Testing workflow
   - Certificate generation

6. **Documents** (`/modules/Documents/`)
   - File upload and management
   - Document verification
   - Compliance documentation

#### Admin Module (`/modules/Admin/`)
- **Dashboard**: Analytics and monitoring
- **User Management**: CRUD operations for users
- **System Monitoring**: Alerts, audit logs, reports
- **Super Admin**: Advanced user and system management

---

## Database Schema

### Core Entities

#### User Management
```sql
User
├── userId (Primary Key)
├── email (Unique)
├── passwordHash
├── firstName, lastName
├── role (USER, ADMIN, SUPER_ADMIN)
├── orgType (FARMER, MANUFACTURER, LABS, DISTRIBUTOR, ADMIN)
├── organizationId (Foreign Key)
├── isActive, isVerified
└── createdAt, updatedAt

Organization
├── organizationId (Primary Key)
├── type (FARMER, MANUFACTURER, LABS, DISTRIBUTOR, ADMIN)
├── isActive
└── createdAt, updatedAt
```

#### Supply Chain Entities
```sql
RawMaterialBatch
├── batchId (Primary Key)
├── farmerId (Foreign Key)
├── speciesId (Foreign Key)
├── quantity, unit
├── harvestDate
├── qualityParams (JSON)
└── status

FinishedGoods
├── productId (Primary Key)
├── manufacturerId (Foreign Key)
├── productName, description
├── batchNumber
├── manufacturingDate, expiryDate
├── ingredients (JSON)
└── qrCodeId (Foreign Key)

Collection
├── collectionId (Primary Key)
├── batchId (Foreign Key)
├── collectionDate
├── quantity
├── status
└── transportationDetails (JSON)

LabCertificate
├── certificateId (Primary Key)
├── labId (Foreign Key)
├── productId/batchId (Foreign Key)
├── testResults (JSON)
├── certificationDate
├── validUntil
└── status
```

#### System Management
```sql
AdminAction
├── actionId (Primary Key)
├── adminUserId (Foreign Key)
├── actionType
├── description
├── targetUserId (Foreign Key)
├── metadata (JSON)
└── timestamp

SystemAlert
├── alertId (Primary Key)
├── type
├── severity
├── message
├── isResolved
├── resolvedBy (Foreign Key)
└── createdAt, resolvedAt
```

---

## Frontend Components

### Main Application Structure
```
src/
├── components/
│   ├── Admin/
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminSidebar.jsx
│   │   ├── UserManagementSection.jsx
│   │   ├── OrganizationManagementSection.jsx
│   │   ├── AdminHomeSection.jsx
│   │   └── AlertsSection.jsx
│   ├── Auth/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── Profile.jsx
│   └── Common/
│       ├── Header.jsx
│       ├── Footer.jsx
│       └── LoadingSpinner.jsx
├── pages/
│   ├── Home.jsx
│   ├── Dashboard.jsx
│   └── NotFound.jsx
├── contexts/
│   └── AuthContext.jsx
├── utils/
│   └── api.js
└── App.jsx
```

### Key Frontend Features

#### Authentication Components
- **Login/Register Forms**: Form validation, error handling
- **Auth Context**: Global authentication state management
- **Protected Routes**: Role-based route protection
- **Profile Management**: User profile updates

#### Admin Dashboard
- **Responsive Design**: Mobile-first approach
- **Analytics Charts**: Recharts integration for data visualization
- **Data Tables**: Pagination, filtering, sorting
- **Modal Dialogs**: Create/edit forms with validation
- **Real-time Updates**: Live data refresh

#### User Experience
- **Tailwind CSS**: Utility-first styling
- **Loading States**: Skeleton screens and spinners
- **Error Handling**: User-friendly error messages
- **Form Validation**: Client-side and server-side validation
- **Responsive Design**: Works on all device sizes

---

## Security Features

### Authentication Security
- **Password Security**: bcrypt hashing with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Session Management**: Token expiration and refresh
- **Email Verification**: Account activation via email

### Authorization & Access Control
- **Role-Based Access Control (RBAC)**: Hierarchical permission system
- **Route Protection**: Middleware-based route security
- **API Endpoint Security**: Authentication middleware on all protected routes
- **Super Admin Controls**: Restricted administrative functions

### Data Security
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: Prisma ORM protection
- **XSS Protection**: Input sanitization
- **CORS Configuration**: Proper cross-origin request handling
- **Helmet.js**: Security headers implementation

### Audit & Monitoring
- **Admin Action Logging**: All administrative actions tracked
- **System Alerts**: Security and compliance monitoring
- **Error Logging**: Comprehensive error tracking
- **Access Logs**: User activity monitoring

---

## System Workflow

### 1. System Initialization
```
Server Startup → Check for Super Admin → Create if None Exists → Load Modules
```

### 2. User Onboarding
```
Registration → Email Verification → Profile Setup → Organization Assignment
```

### 3. Supply Chain Operations

#### For Farmers:
```
Create Raw Material Batch → Document Upload → Request Collection → Track Status
```

#### For Manufacturers:
```
Receive Raw Materials → Quality Check → Production → Lab Testing → Generate QR Codes → Ship Products
```

#### For Labs:
```
Receive Samples → Conduct Tests → Generate Certificates → Upload Results
```

#### For Distributors:
```
Receive Products → Inventory Management → Distribute to Retail → Track Sales
```

### 4. Admin Operations
```
Monitor System → Manage Users → Generate Reports → Handle Alerts → System Maintenance
```

### 5. Consumer Interaction
```
Scan QR Code → View Product Information → Verify Authenticity → Access Certificates
```

---

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs, helmet, cors
- **Documentation**: Swagger/OpenAPI
- **File Upload**: Multer
- **Environment**: dotenv

### Frontend
- **Framework**: React.js
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **HTTP Client**: Fetch API
- **State Management**: React Context API
- **Routing**: React Router DOM

### Development Tools
- **Nodemon**: Development server auto-restart
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Git**: Version control
- **VS Code**: Development environment

---

## Deployment & Scaling

### Environment Configuration
- **Development**: Local development with hot reload
- **Staging**: Testing environment with production-like setup
- **Production**: Optimized build with security hardening

### Database Management
- **Migrations**: Prisma migration system
- **Seeding**: Initial data population scripts
- **Backup**: Regular automated backups
- **Monitoring**: Performance and health monitoring

### Security Hardening
- **HTTPS**: SSL certificate implementation
- **Environment Variables**: Sensitive data protection
- **Rate Limiting**: API abuse prevention
- **Input Sanitization**: XSS and injection prevention

---

## Future Enhancements

### Planned Features
1. **Mobile Application**: React Native mobile app
2. **Blockchain Integration**: Immutable traceability records
3. **IoT Integration**: Sensor data from supply chain
4. **AI/ML Analytics**: Predictive quality analysis
5. **Multi-language Support**: Internationalization
6. **Advanced Reporting**: Custom report builder
7. **API Gateway**: Microservices architecture
8. **Real-time Notifications**: WebSocket integration

### Scalability Improvements
1. **Microservices**: Break down monolithic structure
2. **Caching**: Redis for performance optimization
3. **CDN**: Content delivery network for assets
4. **Load Balancing**: Horizontal scaling support
5. **Database Sharding**: Data distribution strategies

---

## Conclusion

The AyuTrace system provides a comprehensive solution for Ayurvedic medicine supply chain management, ensuring traceability, quality assurance, and regulatory compliance. With its modular architecture, role-based access control, and user-friendly interface, it serves all stakeholders in the supply chain while maintaining the highest standards of security and data integrity.

The system's flexibility allows for easy customization and scaling, making it suitable for organizations of all sizes in the Ayurvedic medicine industry. The complete audit trail and documentation capabilities ensure compliance with regulatory requirements while providing transparency to consumers about the products they purchase.