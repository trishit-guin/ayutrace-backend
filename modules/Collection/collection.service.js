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

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createCollectionEvent(data, collector) {
  const { herbSpeciesId, quantityKg, initialQualityMetrics, photoUrl, location } = data;
  const { userId } = collector;

  const { latitude, longitude } = JSON.parse(location);

  const result = await prisma.$transaction(async (tx) => {
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

    if (photoUrl) {
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

  return result;
}

module.exports = { createCollectionEvent };
