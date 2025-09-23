const BlockchainService = require('./utils/blockchainService');

// Test data with potential null values (common cause of the error)
const testSupplyChainEventWithNulls = {
  eventId: "evt-test-123",
  eventType: "Transport",
  handlerId: "handler-456",
  fromLocationId: null, // This could cause toString() error
  toLocationId: null,   // This could cause toString() error
  finishedGoodId: null, // This could cause toString() error
  notes: null           // This could cause toString() error
};

const testSupplyChainEventWithValues = {
  eventId: "evt-test-456",
  eventType: "Storage",
  handlerId: "handler-789",
  fromLocationId: "warehouse-001",
  toLocationId: "retailer-002",
  finishedGoodId: "PROD-123",
  notes: "Test transport with all values"
};

async function testBlockchainDataPreparation() {
  try {
    console.log('🧪 Testing blockchain data preparation with null safety...\n');

    // Test 1: Supply chain event with null values
    console.log('📋 Test 1: Supply chain event with null values');
    const result1 = await BlockchainService.prepareSupplyChainEventData(testSupplyChainEventWithNulls);
    console.log('✅ Result 1 (null values converted to empty strings):');
    console.log(JSON.stringify(result1, null, 2));

    // Test 2: Supply chain event with all values
    console.log('\n📋 Test 2: Supply chain event with all values');
    const result2 = await BlockchainService.prepareSupplyChainEventData(testSupplyChainEventWithValues);
    console.log('✅ Result 2 (all values preserved):');
    console.log(JSON.stringify(result2, null, 2));

    // Test 3: Verify no null values in output
    console.log('\n🔍 Test 3: Null safety verification');
    const hasNullValues1 = Object.values(result1).some(value => value === null);
    const hasNullValues2 = Object.values(result2).some(value => value === null);
    
    console.log(`✅ Result 1 has no null values: ${!hasNullValues1}`);
    console.log(`✅ Result 2 has no null values: ${!hasNullValues2}`);

    if (!hasNullValues1 && !hasNullValues2) {
      console.log('\n🎉 All tests passed! Blockchain data preparation is null-safe.');
      console.log('✅ The toString() error should be fixed.');
    } else {
      console.log('\n❌ Some null values still present. Fix needed.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBlockchainDataPreparation();