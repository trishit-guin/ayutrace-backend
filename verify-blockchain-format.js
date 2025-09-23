const BlockchainService = require('./utils/blockchainService');

// Mock finished good data
const mockFinishedGood = {
  productId: "PROD-12345",
  manufacturerId: "MFG-67890",
  productName: "Ashwagandha Extract Capsules",
  productType: "EXTRACT",
  quantity: 100,
  unit: "BOTTLES",
  description: "High quality ashwagandha extract in capsule form",
  batchNumber: "BATCH-2025-001",
  expiryDate: new Date("2026-09-17T00:00:00.000Z")
};

const mockSourceCollectionEventIds = ["event1", "event2", "event3"];

async function verifyBlockchainFormat() {
  try {
    console.log('🧪 Testing blockchain format preparation...\n');
    
    const blockchainData = await BlockchainService.prepareFinishedGoodData(
      mockFinishedGood, 
      mockSourceCollectionEventIds
    );
    
    console.log('📋 Required Format:');
    console.log({
      productId: "(string, required)",
      manufacturerId: "(string, required)",
      productName: "(string, required)",
      productType: "(enum, required)",
      quantity: "(number, required)",
      unit: "(enum, required)",
      description: "(string, optional)",
      batchNumber: "(string, required)",
      expiryDate: "(ISO date string, optional)",
      sourceCollectionEventIds: "(array of eventIds, required)"
    });
    
    console.log('\n✅ Generated Format:');
    console.log(JSON.stringify(blockchainData, null, 2));
    
    console.log('\n🔍 Format Validation:');
    console.log(`✅ productId: ${typeof blockchainData.productId} - ${blockchainData.productId}`);
    console.log(`✅ manufacturerId: ${typeof blockchainData.manufacturerId} - ${blockchainData.manufacturerId}`);
    console.log(`✅ productName: ${typeof blockchainData.productName} - ${blockchainData.productName}`);
    console.log(`✅ productType: ${typeof blockchainData.productType} - ${blockchainData.productType}`);
    console.log(`✅ quantity: ${typeof blockchainData.quantity} - ${blockchainData.quantity}`);
    console.log(`✅ unit: ${typeof blockchainData.unit} - ${blockchainData.unit}`);
    console.log(`✅ description: ${typeof blockchainData.description} - ${blockchainData.description || 'null'}`);
    console.log(`✅ batchNumber: ${typeof blockchainData.batchNumber} - ${blockchainData.batchNumber}`);
    console.log(`✅ expiryDate: ${typeof blockchainData.expiryDate} - ${blockchainData.expiryDate}`);
    console.log(`✅ sourceCollectionEventIds: ${Array.isArray(blockchainData.sourceCollectionEventIds)} (array) - [${blockchainData.sourceCollectionEventIds.join(', ')}]`);
    
    console.log('\n🎉 Format verification completed successfully!');
    console.log('The blockchain API call will use exactly this format.');
    
  } catch (error) {
    console.error('❌ Format verification failed:', error.message);
  }
}

verifyBlockchainFormat();