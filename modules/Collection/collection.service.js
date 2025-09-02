const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid'); // To generate a new ID
const prisma = new PrismaClient();

async function createCollectionEvent(data, collector) {
  const { speciesCode, quantityKg, initialQualityMetrics, photoUrl, location } = data;
  const { userId } = collector;

  const metricsWithSpecies = { ...initialQualityMetrics };
  if (speciesCode) {
    metricsWithSpecies.speciesCode = speciesCode;
  }

  const newEventId = uuidv4(); // Generate the ID beforehand
  const { latitude, longitude } = JSON.parse(location);

  const result = await prisma.$transaction(async (tx) => {
    // 1. Use a single, direct SQL query to insert the CollectionEvent
    await tx.$executeRaw`
      INSERT INTO "CollectionEvent" (
        "eventId", "collector_id", "collection_time", "quantity_kg", 
        "initial_quality_metrics", "location"
      ) VALUES (
        ${newEventId}, 
        ${userId}::uuid, 
        NOW(), 
        ${quantityKg}, 
        ${JSON.stringify(metricsWithSpecies)}::jsonb,
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
      );
    `;

    // 2. If a photoUrl was provided, create the Document record as before
    if (photoUrl) {
      await tx.document.create({
        data: {
          documentType: 'HARVEST_PHOTO',
          storageHash: photoUrl,
          originalFilename: 'harvest_photo.jpg',
          mimeType: 'image/jpeg',
          collectionEventId: newEventId, // Use the ID we generated
          fileSizeBytes: 0,
        },
      });
    }

    // 3. Return the ID of the new event
    return { eventId: newEventId };
  });

  return result;
}

module.exports = {
  createCollectionEvent,
};