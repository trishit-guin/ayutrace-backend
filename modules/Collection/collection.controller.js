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

// async function getCollectionsByFarmerHandler(req, res) {
//   try {
//     const farmerId = req.user.userId;
//     const { PrismaClient } = require('@prisma/client');
//     const prisma = new PrismaClient();
//     // const collections = await prisma.collectionEvent.findMany({
//     //   where: { farmerId },
//     //   orderBy: { collectionDate: 'desc' },
//     // });
//     const collections = await prisma.collectionEvent.findMany({
//       where: { farmerId },
//       orderBy: { collectionDate: 'desc' },
//       include: {
//         herbSpecies: { // relation name in Prisma schema
//           select: {
//             commonName: true,
//           },
//         },
//       },
//     });
//     const formattedCollections = collections.map(c => ({
//       eventId: c.eventId,
//       quantity: c.quantity,
//       location: c.location,
//       latitude: c.latitude,
//       longitude: c.longitude,
//       collectionDate: c.collectionDate,
//       speciesName: c.herbSpecies ? c.herbSpecies.commonName : null, // show name if exists
//     }));
    
    
//     // return res.status(200).json({
//     //   message: 'Collections fetched successfully',
//     //   data: collections,
//     // });
//     return res.status(200).json({
//       message: 'Collections fetched successfully',
//       data: formattedCollections,
//     });
    
//   } catch (error) {
//     console.error('Error fetching collections by farmer:', error);
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// }

async function getCollectionsByFarmerHandler(req, res) {
  try {
    const farmerId = req.user.userId;
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const collections = await prisma.collectionEvent.findMany({
      where: { farmerId },
      orderBy: { collectionDate: 'desc' },
      include: {
        herbSpecies: { // relation name in Prisma schema
          select: {
            commonName: true,
          },
        },
        // Include documents (photos) related to this collection
        documents: {
          where: {
            documentType: 'PHOTO'
          },
          select: {
            filePath: true,
            fileName: true,
          },
          take: 1 // Get only the first photo
        }
      },
    });

    const formattedCollections = collections.map(c => ({
      eventId: c.eventId,
      quantity: c.quantity,
      location: c.location,
      latitude: c.latitude,
      longitude: c.longitude,
      collectionDate: c.collectionDate,
      speciesName: c.herbSpecies ? c.herbSpecies.commonName : null,
      // Add photo URL if available
      photoUrl: c.documents && c.documents.length > 0 ? c.documents[0].filePath : null,
    }));
    
    return res.status(200).json({
      message: 'Collections fetched successfully',
      data: formattedCollections,
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