const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

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

// Import swagger
const { specs, swaggerUi } = require('./config/swagger');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
// Basic middleware
app.use(helmet());
app.use(cors());
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

app.listen(PORT, () => {
  console.log(`🚀 AyuTrace Backend Server is running on port ${PORT}`);
  console.log(`📖 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
});
