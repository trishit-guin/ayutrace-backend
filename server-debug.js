const express = require('express');
const cors = require('cors');

// Test swagger import
const { specs, swaggerUi } = require('./config/swagger');

// Import routes one by one
const authRoutes = require('./modules/Auth/auth.routes');
const collectionRoutes = require('./modules/Collection/collection.routes');
const qrCodeRoutes = require('./modules/QRCode/qrCode.routes');
const rawMaterialBatchRoutes = require('./modules/RawMaterialBatch/rawMaterialBatch.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Test server' });
});

// Add auth routes
app.use('/api/auth', authRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/qr-codes', qrCodeRoutes);

// Add swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
