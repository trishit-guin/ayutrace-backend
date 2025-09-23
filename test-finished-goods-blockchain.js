require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

// Test data for finished goods creation
const testFinishedGoodData = {
  productName: "Ashwagandha Capsules Premium",
  productType: "CAPSULE",
  quantity: 1000,
  unit: "PIECES",
  description: "Premium quality Ashwagandha capsules made from organic roots",
  batchNumber: "FG-ASH-2024-001",
  expiryDate: "2026-09-17T00:00:00.000Z",
  composition: [
    {
      rawMaterialBatchId: "existing-raw-material-batch-id-1",
      percentage: 80.0,
      quantityUsed: 800
    },
    {
      rawMaterialBatchId: "existing-raw-material-batch-id-2", 
      percentage: 20.0,
      quantityUsed: 200
    }
  ]
};

async function testFinishedGoodsBlockchainIntegration() {
  try {
    console.log('🧪 Testing Finished Goods Blockchain Integration\n');

    // Step 1: Login to get authentication token
    console.log('1️⃣ Logging in to get authentication token...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'manufacturer@test.com',
      password: 'test123'
    });

    if (loginResponse.data.success) {
      const token = loginResponse.data.data.token;
      console.log('✅ Login successful');

      // Step 2: Create finished good with blockchain integration
      console.log('\n2️⃣ Creating finished good with blockchain integration...');
      const createResponse = await axios.post(
        `${API_BASE_URL}/finished-goods`,
        testFinishedGoodData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (createResponse.data.success) {
        console.log('✅ Finished good created successfully');
        console.log('📦 Product ID:', createResponse.data.data.productId);
        console.log('🏭 Product Name:', createResponse.data.data.productName);
        console.log('🔢 Batch Number:', createResponse.data.data.batchNumber);
        
        // Display composition info
        if (createResponse.data.data.composition) {
          console.log('\n📋 Composition:');
          createResponse.data.data.composition.forEach((comp, index) => {
            console.log(`   ${index + 1}. Raw Material: ${comp.rawMaterialBatch?.herbName}`);
            console.log(`      Batch ID: ${comp.rawMaterialBatchId}`);
            console.log(`      Percentage: ${comp.percentage}%`);
            console.log(`      Quantity Used: ${comp.quantityUsed}`);
          });
        }

        console.log('\n🔗 Blockchain integration completed automatically');
        console.log('✅ Check server logs for blockchain transaction details');
      } else {
        console.error('❌ Failed to create finished good:', createResponse.data.error);
      }
    } else {
      console.error('❌ Login failed:', loginResponse.data.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('📝 Response status:', error.response.status);
      console.error('📝 Response data:', error.response.data);
    }
  }
}

// Test blockchain service methods directly
async function testBlockchainServiceDirect() {
  console.log('\n🔧 Testing Blockchain Service Methods Directly\n');
  
  const blockchainService = require('./utils/blockchainService');
  
  // Test data preparation
  const mockFinishedGood = {
    productId: 'test-product-123',
    manufacturerId: 'manufacturer-456',
    productName: 'Test Ashwagandha Capsules',
    productType: 'CAPSULE',
    quantity: 500,
    unit: 'PIECES',
    description: 'Test product for blockchain',
    batchNumber: 'TEST-BATCH-001',
    expiryDate: new Date('2026-09-17'),
  };
  
  const mockCollectionEventIds = ['collection-event-1', 'collection-event-2'];
  
  try {
    // Test data preparation
    console.log('🔧 Testing finished good data preparation...');
    const preparedData = await blockchainService.prepareFinishedGoodData(mockFinishedGood, mockCollectionEventIds);
    console.log('✅ Data preparation successful:');
    console.log(JSON.stringify(preparedData, null, 2));
    
    // Test blockchain API call
    console.log('\n🚀 Testing blockchain API call...');
    const result = await blockchainService.sendFinishedGoodToBlockchain(preparedData);
    
    if (result.success) {
      console.log('✅ Blockchain API call successful:', result.status);
      console.log('📦 Response data:', result.data);
    } else {
      console.log('⚠️ Blockchain API call failed:', result.error);
      console.log('📝 Status:', result.status);
    }
    
  } catch (error) {
    console.error('❌ Direct test failed:', error.message);
  }
}

// Run tests
async function runAllTests() {
  await testBlockchainServiceDirect();
  await testFinishedGoodsBlockchainIntegration();
}

runAllTests();