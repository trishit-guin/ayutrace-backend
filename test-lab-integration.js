const { PrismaClient } = require('@prisma/client');
const { createLabTest, updateLabTest } = require('./modules/Labs/labs.service');

const prisma = new PrismaClient();

async function testLabIntegration() {
  try {
    console.log('🧪 Testing Lab Service Integration...\n');

    // Test data for creating a lab test
    const testData = {
      testType: 'QUALITY_ASSURANCE',
      sampleName: 'Test Herb Sample',
      sampleType: 'Raw Material',
      sampleDescription: 'Quality testing for herb batch verification',
      batchNumber: 'HERB001', // This might link to existing batch if found
      collectionDate: new Date().toISOString(),
      priority: 'HIGH',
      notes: 'Automated test for integration verification',
      requesterId: '6633c2f0-c432-4665-9a8e-022fabfafc5b', // Praful Bhalgat (Lab user)
      organizationId: '30610f8b-aaa1-4da3-b84c-5ec90c66b367' // LABS organization
    };

    console.log('1️⃣ Creating lab test...');
    const createdTest = await createLabTest(testData);
    console.log('✅ Lab test created successfully!');
    console.log('Test ID:', createdTest.testId);
    console.log('Supply Chain Event:', createdTest.supplyChainEvent?.eventId || 'Not linked');
    console.log('');

    // Update test to completed to trigger certificate creation
    console.log('2️⃣ Updating test status to COMPLETED...');
    const updateData = {
      status: 'COMPLETED',
      testDate: new Date().toISOString(),
      completionDate: new Date().toISOString(),
      results: {
        'Overall Quality': 'PASS',
        'Purity Level': '95%',
        'Active Compounds': 'Within Standards',
        'Contamination': 'None Detected'
      },
      labTechnicianId: '952e94ea-7234-403f-bd0f-25f5524ed5e1' // Another lab user
    };

    const updatedTest = await updateLabTest(createdTest.testId, updateData, testData.organizationId);
    console.log('✅ Lab test updated successfully!');
    console.log('Status:', updatedTest.status);
    console.log('');

    // Check if certificate was created
    console.log('3️⃣ Checking for auto-generated certificate...');
    const certificates = await prisma.certificate.findMany({
      where: {
        organizationId: testData.organizationId
      },
      orderBy: {
        issueDate: 'desc'
      },
      take: 5
    });

    if (certificates.length > 0) {
      console.log('✅ Found certificates:');
      certificates.forEach(cert => {
        console.log(`  - ${cert.certificateType} (ID: ${cert.certificateId})`);
      });
    } else {
      console.log('⚠️ No certificates found');
    }
    console.log('');

    // Check supply chain events
    console.log('4️⃣ Checking supply chain events...');
    const events = await prisma.supplyChainEvent.findMany({
      where: {
        eventType: 'TESTING'
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 5
    });

    if (events.length > 0) {
      console.log('✅ Found supply chain events:');
      events.forEach(event => {
        console.log(`  - ${event.eventType} (ID: ${event.eventId})`);
        console.log(`    Notes: ${event.notes}`);
        if (event.metadata) {
          console.log(`    Metadata: ${JSON.stringify(event.metadata)}`);
        }
      });
    } else {
      console.log('⚠️ No supply chain events found');
    }
    console.log('');

    // Check QR codes
    console.log('5️⃣ Checking QR codes...');
    const qrCodes = await prisma.qRCode.findMany({
      where: {
        entityType: 'SUPPLY_CHAIN_EVENT'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    if (qrCodes.length > 0) {
      console.log('✅ Found QR codes:');
      qrCodes.forEach(qr => {
        console.log(`  - QR ID: ${qr.qrCodeId}`);
        console.log(`    Entity: ${qr.entityType} (${qr.entityId})`);
        console.log(`    Data preview: ${qr.data?.substring(0, 100)}...`);
      });
    } else {
      console.log('⚠️ No QR codes found');
    }

    console.log('\n🎉 Integration test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
if (require.main === module) {
  testLabIntegration();
}

module.exports = { testLabIntegration };