const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import database connection
const dbConnection = require('./utils/database');

// Import super admin initialization
const { initSuperAdmin } = require('./utils/initSuperAdmin');

// Import comprehensive data seeding
const { initAllDefaultData } = require('./utils/initComprehensiveSeeding');

// Import routes that we know work
const authRoutes = require('./modules/Auth/auth.routes');
const collectionRoutes = require('./modules/Collection/collection.routes');
const qrCodeRoutes = require('./modules/QRCode/qrCode.routes');
const rawMaterialBatchRoutes = require('./modules/RawMaterialBatch/rawMaterialBatch.routes');
const supplyChainRoutes = require('./modules/SupplyChain/supplyChain.routes');
const finishedGoodsRoutes = require('./modules/FinishedGoods/finishedGoods.routes');
const documentsRoutes = require('./modules/Documents/documents.routes');
const speciesRoutes = require('./modules/Species/species.routes');
const utilsRoutes = require('./modules/Utils/utils.routes');
const labsRoutes = require('./modules/Labs/labs.routes');
const adminRoutes = require('./modules/Admin/admin.routes');
const distributorRoutes = require('./modules/Distributor/distributor.routes');

// Import swagger
const { specs, swaggerUi } = require('./config/swagger');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
// Basic middleware
app.use(helmet());

// Configure CORS with flexible origins for development
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // If CORS_ORIGIN is set to "*", allow all origins
    if (process.env.CORS_ORIGIN === '*') {
      return callback(null, true);
    }
    
    // For development, allow all localhost origins
    if (process.env.NODE_ENV !== 'production') {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }
    
    // Production allowed origins
    const allowedOrigins = [
      'http://localhost:5173',  // Vite dev server
      'http://localhost:4173',  // Vite preview server
      'http://localhost:3001',  // Alternative port
      'http://localhost:3000',  // Current backend port
      'http://localhost:3002',  // Alternative frontend port
      'https://ayutrace-frontend.vercel.app',  // Production frontend
      'https://yourdomain.com',  // Add your production domain here
      process.env.CORS_ORIGIN   // Environment variable override
    ].filter(Boolean); // Remove undefined values
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      console.log('Allowed origins:', allowedOrigins);
      callback(null, true); // Temporarily allow all origins for debugging
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token', 'X-Requested-With'],
  exposedHeaders: ['Content-Disposition', 'X-Total-Count'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory
const uploadsDir = path.join(__dirname, 'uploads', 'documents');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to AyuTrace Backend API',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/health',
    endpoints: {
      auth: '/api/auth',
      collections: '/api/collections',
      rawMaterialBatches: '/api/raw-material-batches',
      supplyChainEvents: '/api/supply-chain',
      finishedGoods: '/api/finished-goods',
      documents: '/api/documents',
      qrCodes: '/api/qr-codes',
      species: '/api/species',
      utils: '/api/utils',
      labs: '/api/labs',
      admin: '/api/admin',
      distributor: '/api/distributor',
    }
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'AyuTrace Backend Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'AyuTrace API Documentation',
}));

// API Routes - only the ones that work
app.use('/api/auth', authRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/qr-codes', qrCodeRoutes);
app.use('/api/raw-material-batches', rawMaterialBatchRoutes);
app.use('/api/supply-chain', supplyChainRoutes);
app.use('/api/finished-goods', finishedGoodsRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/species', speciesRoutes);
app.use('/api/utils', utilsRoutes);
app.use('/api/labs', labsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/distributor', distributorRoutes);

// Debug endpoint
const { debugAuth } = require('./debug-auth');
app.get('/api/debug/auth', debugAuth);

// Register organization routes
const organizationRoutes = require('./modules/Organization/organization.routes');
app.use('/api/organization', organizationRoutes);

// Error handlers
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message,
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

app.listen(PORT, async () => {
  console.log(`🚀 AyuTrace Backend Server is running on port ${PORT}`);
  console.log(`📖 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
  
  // Initialize database connection
  try {
    await dbConnection.connect();
    console.log('🗄️  Database connection established');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
  
  // Initialize all default data if they don't exist
  try {
    await initAllDefaultData();
  } catch (error) {
    console.error('⚠️  Failed to initialize default data:', error.message);
  }

  // Initialize super admin if none exists
  try {
    await initSuperAdmin();
  } catch (error) {
    console.error('⚠️  Failed to initialize super admin:', error.message);
  }
});
