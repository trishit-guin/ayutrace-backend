
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import routes
// const authRoutes = require('./modules/Auth/auth.routes');
// const organizationRoutes = require('./modules/Organization/organization.routes');
// const collectionRoutes = require('./modules/Collection/collection.routes');
// const rawMaterialBatchRoutes = require('./modules/RawMaterialBatch/rawMaterialBatch.routes');
// const supplyChainRoutes = require('./modules/SupplyChain/supplyChain.routes');
// const finishedGoodsRoutes = require('./modules/FinishedGoods/finishedGoods.routes');
// const documentsRoutes = require('./modules/Documents/documents.routes');
// const qrCodeRoutes = require('./modules/QRCode/qrCode.routes');
// const speciesRoutes = require('./modules/Species/species.routes');

// Import swagger configuration
// const { specs, swaggerUi } = require('./config/swagger');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (for uploaded documents)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads', 'documents');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * @swagger
 * /:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns a simple health check message to verify the API is running
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is running successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "AyuTrace Backend API is running"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-09-03T12:00:00Z"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 */
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to AyuTrace Backend API',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/health'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'AyuTrace Backend Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Swagger Documentation
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
//   explorer: true,
//   customCss: '.swagger-ui .topbar { display: none }',
//   customSiteTitle: 'AyuTrace API Documentation',
//   swaggerOptions: {
//     persistAuthorization: true,
//     displayRequestDuration: true,
//     docExpansion: 'none',
//     filter: true,
//     showExtensions: true,
//     showCommonExtensions: true,
//   }
// }));

// API Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/organizations', organizationRoutes);
// app.use('/api/collections', collectionRoutes);
// app.use('/api/raw-material-batches', rawMaterialBatchRoutes);
// app.use('/api/supply-chain-events', supplyChainRoutes);
// app.use('/api/finished-goods', finishedGoodsRoutes);
// app.use('/api/documents', documentsRoutes);
// app.use('/api/qr-codes', qrCodeRoutes);
// app.use('/api/species', speciesRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  // Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: 'File too large. Maximum size is 10MB.',
    });
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      error: 'Invalid file field name.',
    });
  }

  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(400).json({
      success: false,
      error: 'Duplicate entry. This record already exists.',
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      error: 'Record not found.',
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token.',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired.',
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Handle 404 for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
    availableEndpoints: [
      '/api/auth',
      '/api/organizations',
      '/api/collections',
      '/api/raw-material-batches',
      '/api/supply-chain-events',
      '/api/finished-goods',
      '/api/documents',
      '/api/qr-codes',
      '/api/species',
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 AyuTrace Backend Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;