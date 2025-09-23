// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();

// async function createCollectionEvent(data, collector) {
//   const { herbSpeciesId, quantityKg, initialQualityMetrics, photoUrl, location } = data;
//   const { userId } = collector;

//   const { latitude, longitude } = JSON.parse(location);

//   const result = await prisma.$transaction(async (tx) => {
//     // 1. Create the CollectionEvent using Prisma ORM
//     const collectionEvent = await tx.collectionEvent.create({
//       data: {
//         collectorId: userId,
//         farmerId: userId, // Ensure collectorId and farmerId are the same
//         herbSpeciesId: herbSpeciesId || null,
//         collectionDate: new Date(),
//         latitude: latitude,
//         longitude: longitude,
//         quantity: quantityKg,
//         unit: 'kg',
//         qualityNotes: JSON.stringify(initialQualityMetrics),
//         notes: 'Collection event created via API'
//       }
//     });

//     // 2. If a photoUrl was provided, create the Document record
//     if (photoUrl) {
//       await tx.document.create({
//         data: {
//           documentType: 'PHOTO',
//           filePath: photoUrl, // REQUIRED field
//           fileName: "harvest_photo.jpg",
//           fileSize: 0, // adjust if you know real size
//           mimeType: "image/jpeg",
//           collectionEventId: collectionEvent.eventId,
//           uploadedBy: userId, // optional but recommended
//         },
//       });
//     }

//     // 3. Return the event details
//     return { 
//       eventId: collectionEvent.eventId,
//       collectorId: userId,
//       collectionDate: collectionEvent.collectionDate,
//       quantity: quantityKg,
//       location: `${latitude}, ${longitude}`,
//       latitude: latitude,
//       longitude: longitude
//     };
//   });

//   return result;
// }

// module.exports = {
//   createCollectionEvent,
// };

const dbConnection = require('../../utils/database');
const blockchainService = require('../../utils/blockchainService');
const prisma = dbConnection.getClient();

async function createCollectionEvent(data, collector) {
  const { herbSpeciesId, quantityKg, initialQualityMetrics, photoUrl, location } = data;
  const { userId } = collector;

  console.log(`🌱 [CollectionService] Creating collection event for farmer: ${userId}`);
  console.log(`📊 [CollectionService] Collection data:`, { herbSpeciesId, quantityKg, location });

  const { latitude, longitude } = JSON.parse(location);

  const result = await prisma.$transaction(async (tx) => {
    console.log(`💾 [CollectionService] Starting database transaction`);
    
    const collectionEvent = await tx.collectionEvent.create({
      data: {
        collectorId: userId,
        farmerId: userId,
        herbSpeciesId: herbSpeciesId || null,
        collectionDate: new Date(),
        latitude,
        longitude,
        quantity: quantityKg,
        unit: 'kg',
        qualityNotes: JSON.stringify(initialQualityMetrics),
        notes: 'Collection event created via API'
      }
    });

    console.log(`✅ [CollectionService] Collection event created in database: ${collectionEvent.eventId}`);

    if (photoUrl) {
      console.log(`📸 [CollectionService] Adding photo document to collection`);
      await tx.document.create({
        data: {
          documentType: 'PHOTO',
          filePath: photoUrl,
          fileName: "harvest_photo.jpg",
          fileSize: 0,
          mimeType: "image/jpeg",
          collectionEventId: collectionEvent.eventId,
          uploadedBy: userId,
        },
      });
      console.log(`✅ [CollectionService] Photo document added successfully`);
    }

    // Send to blockchain after successful database creation
    try {
      console.log(`🔗 [CollectionService] Sending collection event to blockchain`);
      const blockchainData = await blockchainService.prepareCollectionEventData(collectionEvent, collector);
      const blockchainResult = await blockchainService.sendCollectionEvent(blockchainData);
      
      if (blockchainResult.success) {
        console.log(`✅ [CollectionService] Collection event successfully recorded on blockchain`);
      } else {
        console.error(`⚠️ [CollectionService] Failed to record on blockchain, but database record created:`, blockchainResult.error);
        // We don't throw here because the collection was successfully created in database
        // Blockchain integration failure shouldn't prevent the collection from being recorded
      }
    } catch (blockchainError) {
      console.error(`❌ [CollectionService] Blockchain integration error:`, blockchainError.message);
      // Continue execution - blockchain failure shouldn't prevent database success
    }

    return {
      eventId: collectionEvent.eventId,
      collectorId: userId,
      collectionDate: collectionEvent.collectionDate,
      quantity: quantityKg,
      location: `${latitude}, ${longitude}`,
      latitude,
      longitude
    };
  });

  console.log(`🎉 [CollectionService] Collection event creation completed successfully: ${result.eventId}`);
  return result;
}

module.exports = { createCollectionEvent };
