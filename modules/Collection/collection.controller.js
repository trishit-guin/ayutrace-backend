const { createCollectionEvent } = require('./collection.service');

async function createCollectionEventHandler(req, res) {
  // The logged-in user is attached to `req.user` by the authMiddleware
  const collector = req.user;
  
  const eventData = {
    ...req.body,
    // Parse the JSON string from the request body into a JSON object
    initialQualityMetrics: JSON.parse(req.body.initialQualityMetrics),
  };

  try {
    const result = await createCollectionEvent(eventData, collector);
    return res.status(201).json({
      message: 'Collection event recorded successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error creating collection event:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function getCollectionsByFarmerHandler(req, res) {
  try {
    const farmerId = req.user.userId;
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const collections = await prisma.collectionEvent.findMany({
      where: { farmerId },
      orderBy: { collectionDate: 'desc' },
    });
    return res.status(200).json({
      message: 'Collections fetched successfully',
      data: collections,
    });
  } catch (error) {
    console.error('Error fetching collections by farmer:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
  createCollectionEventHandler,
  getCollectionsByFarmerHandler,
};