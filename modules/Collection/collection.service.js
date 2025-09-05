const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createCollectionEvent(data, collector) {
  const { speciesCode, quantityKg, initialQualityMetrics, photoUrl, location } = data;
  const { userId } = collector;

  const { latitude, longitude } = JSON.parse(location);

  const result = await prisma.$transaction(async (tx) => {
    // 1. Create the CollectionEvent using Prisma ORM
    const collectionEvent = await tx.collectionEvent.create({
      data: {
        collectorId: userId,
        farmerId: userId, // Ensure collectorId and farmerId are the same
        herbSpeciesId: speciesCode || null,
        collectionDate: new Date(),
        latitude: latitude,
        longitude: longitude,
        quantity: quantityKg,
        unit: 'kg',
        qualityNotes: JSON.stringify(initialQualityMetrics),
        notes: 'Collection event created via API'
      }
    });

    // 2. If a photoUrl was provided, create the Document record
    if (photoUrl) {
      await tx.document.create({
        data: {
          documentType: 'HARVEST_PHOTO',
          storageHash: photoUrl,
          originalFilename: 'harvest_photo.jpg',
          mimeType: 'image/jpeg',
          collectionEventId: collectionEvent.eventId,
          fileSizeBytes: 0,
        },
      });
    }

    // 3. Return the event details
    return { 
      eventId: collectionEvent.eventId,
      collectorId: userId,
      collectionDate: collectionEvent.collectionDate,
      quantity: quantityKg,
      location: `${latitude}, ${longitude}`,
      latitude: latitude,
      longitude: longitude
    };
  });

  return result;
}

module.exports = {
  createCollectionEvent,
};