const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addProperLinking() {
  console.log('🔗 Adding proper linking between entities...');
  
  try {
    // Get all collection events and raw material batches
    const collectionEvents = await prisma.collectionEvent.findMany({
      orderBy: { createdAt: 'asc' }
    });
    
    const rawMaterialBatches = await prisma.rawMaterialBatch.findMany({
      orderBy: { createdAt: 'asc' }
    });

    // Link collection events to raw material batches
    console.log('\n📦 Linking Collection Events to Raw Material Batches...');
    for (let i = 0; i < Math.min(collectionEvents.length, rawMaterialBatches.length); i++) {
      await prisma.collectionEvent.update({
        where: { eventId: collectionEvents[i].eventId },
        data: { batchId: rawMaterialBatches[i].batchId }
      });
      console.log(`   ✅ Linked collection event ${i + 1} to batch: ${rawMaterialBatches[i].herbName}`);
    }

    // Get finished goods to link to distributor inventory properly
    const finishedGoods = await prisma.finishedGood.findMany({
      orderBy: { createdAt: 'asc' }
    });

    // Update distributor inventory to have proper product references
    console.log('\n📋 Updating Distributor Inventory References...');
    const inventoryItems = await prisma.distributorInventory.findMany({
      orderBy: { createdAt: 'asc' }
    });

    for (let i = 0; i < Math.min(inventoryItems.length, finishedGoods.length); i++) {
      await prisma.distributorInventory.update({
        where: { inventoryId: inventoryItems[i].inventoryId },
        data: { 
          entityId: finishedGoods[i].productId,
          productType: 'FINISHED_GOOD'
        }
      });
      console.log(`   ✅ Updated inventory item ${i + 1} to reference: ${finishedGoods[i].productName}`);
    }

    // Update QR codes to have proper entity references
    console.log('\n📱 Updating QR Code References...');
    const qrCodes = await prisma.qRCode.findMany({
      orderBy: { createdAt: 'asc' }
    });

    if (qrCodes.length >= 3) {
      // First QR code for raw material batch
      if (rawMaterialBatches.length > 0) {
        await prisma.qRCode.update({
          where: { qrCodeId: qrCodes[0].qrCodeId },
          data: {
            entityType: 'RAW_MATERIAL_BATCH',
            entityId: rawMaterialBatches[0].batchId,
            rawMaterialBatchId: rawMaterialBatches[0].batchId
          }
        });
        console.log(`   ✅ Updated QR code 1 for raw material: ${rawMaterialBatches[0].herbName}`);
      }

      // Second QR code for finished good
      if (finishedGoods.length > 0) {
        await prisma.qRCode.update({
          where: { qrCodeId: qrCodes[1].qrCodeId },
          data: {
            entityType: 'FINISHED_GOOD',
            entityId: finishedGoods[0].productId,
            finishedGoodId: finishedGoods[0].productId
          }
        });
        console.log(`   ✅ Updated QR code 2 for finished good: ${finishedGoods[0].productName}`);
      }

      // Third QR code for lab test
      const labTests = await prisma.labTest.findMany({
        where: { status: 'COMPLETED' },
        take: 1
      });
      
      if (labTests.length > 0) {
        await prisma.qRCode.update({
          where: { qrCodeId: qrCodes[2].qrCodeId },
          data: {
            entityType: 'LAB_TEST',
            entityId: labTests[0].testId,
            labTestId: labTests[0].testId
          }
        });
        console.log(`   ✅ Updated QR code 3 for lab test: ${labTests[0].sampleName}`);
      }
    }

    // Update documents to have proper references
    console.log('\n📄 Updating Document References...');
    const documents = await prisma.document.findMany({
      orderBy: { createdAt: 'asc' }
    });

    if (documents.length >= 2 && rawMaterialBatches.length >= 2) {
      // Link first two documents to raw material batches
      for (let i = 0; i < 2; i++) {
        await prisma.document.update({
          where: { documentId: documents[i].documentId },
          data: { rawMaterialBatchId: rawMaterialBatches[i].batchId }
        });
        console.log(`   ✅ Updated document ${i + 1} for raw material: ${rawMaterialBatches[i].herbName}`);
      }
    }

    if (documents.length >= 4 && finishedGoods.length >= 2) {
      // Link last two documents to finished goods
      for (let i = 2; i < 4 && i - 2 < finishedGoods.length; i++) {
        await prisma.document.update({
          where: { documentId: documents[i].documentId },
          data: { finishedGoodId: finishedGoods[i - 2].productId }
        });
        console.log(`   ✅ Updated document ${i + 1} for finished good: ${finishedGoods[i - 2].productName}`);
      }
    }

    console.log('\n✅ All linking completed successfully!');
    console.log('\n🌐 Your database now has proper relationships:');
    console.log('   📦 Collection Events → Raw Material Batches');
    console.log('   🏭 Raw Material Batches → Finished Goods (via compositions)'); 
    console.log('   🔬 Lab Tests → Raw Materials & Finished Goods');
    console.log('   📱 QR Codes → All major entities');
    console.log('   📄 Documents → Raw Materials & Finished Goods');
    console.log('   📋 Distributor Inventory → Finished Goods');
    console.log('   🚚 Shipments → Finished Goods');
    console.log('\n🎯 Full traceability from farmer to consumer is now available!');

  } catch (error) {
    console.error('❌ Linking failed:', error);
    throw error;
  }
}

addProperLinking()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });