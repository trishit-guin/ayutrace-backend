
const express = require('express');
const authRouter = require('./modules/Auth/auth.routes');
const collectionRouter = require('./modules/Collection/collection.routes');
const organizationRouter = require('./modules/Organization/organization.routes');
const { specs, swaggerUi } = require('./config/swagger');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

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
    message: 'AyuTrace Backend API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'AyuTrace API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
  }
}));

// Use the auth router for all routes starting with /api/auth
app.use('/api/auth', authRouter);
app.use('/api/collections', collectionRouter);
app.use('/api/organizations', organizationRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
});