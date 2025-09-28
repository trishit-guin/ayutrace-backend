const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

/**
 * Comprehensive one-time seeding for all tables
 * This creates demo data for every entity in the system
 */

const DEMO_PASSWORD = 'demo123'; // Same password for all demo users

const demoUsers = [
  {
    email: 'farmer@demo.com',
    password: DEMO_PASSWORD,
    firstName: 'Rajesh',
    lastName: 'Farmer',
    orgType: 'FARMER',
    role: 'USER',
    phone: '+91-9876543210',
    location: 'Kerala, India',
    latitude: 10.8505,
    longitude: 76.2711
  },
  {
    email: 'manufacturer@demo.com',
    password: DEMO_PASSWORD,
    firstName: 'Priya',
    lastName: 'Manufacturer',
    orgType: 'MANUFACTURER',
    role: 'USER',
    phone: '+91-9876543211',
    location: 'Maharashtra, India',
    latitude: 19.7515,
    longitude: 75.7139
  },
  {
    email: 'lab@demo.com',
    password: DEMO_PASSWORD,
    firstName: 'Dr. Amit',
    lastName: 'LabTech',
    orgType: 'LABS',
    role: 'USER',
    phone: '+91-9876543212',
    location: 'Karnataka, India',
    latitude: 15.3173,
    longitude: 75.7139
  },
  {
    email: 'distributor@demo.com',
    password: DEMO_PASSWORD,
    firstName: 'Sanjay',
    lastName: 'Distributor',
    orgType: 'DISTRIBUTOR',
    role: 'USER',
    phone: '+91-9876543213',
    location: 'Gujarat, India',
    latitude: 23.0225,
    longitude: 72.5714
  },
  {
    email: 'admin@demo.com',
    password: DEMO_PASSWORD,
    firstName: 'Super',
    lastName: 'Admin',
    orgType: 'ADMIN',
    role: 'SUPER_ADMIN',
    phone: '+91-9876543214',
    location: 'Delhi, India',
    latitude: 28.7041,
    longitude: 77.1025
  }
];

const demoHerbSpecies = [
  {
    commonName: 'Ashwagandha',
    scientificName: 'Withania somnifera',
    family: 'Solanaceae',
    description: 'A popular adaptogenic herb used in Ayurvedic medicine for stress relief and vitality.',
    medicinalUses: ['Stress relief', 'Energy boost', 'Immune support', 'Sleep aid'],
    nativeRegions: ['India', 'Middle East', 'Africa'],
    harvestingSeason: 'Winter',
    partsUsed: ['Root', 'Leaves'],
    conservationStatus: 'LEAST_CONCERN'
  },
  {
    commonName: 'Turmeric',
    scientificName: 'Curcuma longa',
    family: 'Zingiberaceae',
    description: 'Golden spice with powerful anti-inflammatory and antioxidant properties.',
    medicinalUses: ['Anti-inflammatory', 'Antioxidant', 'Digestive health', 'Joint health'],
    nativeRegions: ['India', 'Southeast Asia'],
    harvestingSeason: 'Post-monsoon',
    partsUsed: ['Rhizome'],
    conservationStatus: 'LEAST_CONCERN'
  },
  {
    commonName: 'Holy Basil',
    scientificName: 'Ocimum tenuiflorum',
    family: 'Lamiaceae',
    description: 'Sacred herb in Hinduism, known for its adaptogenic and respiratory benefits.',
    medicinalUses: ['Respiratory health', 'Stress management', 'Immune support', 'Blood sugar'],
    nativeRegions: ['India', 'Southeast Asia'],
    harvestingSeason: 'Year-round',
    partsUsed: ['Leaves', 'Seeds'],
    conservationStatus: 'LEAST_CONCERN'
  }
];

async function seedAllTables() {
  console.log('🌱 Starting comprehensive database seeding...');
  console.log('==============================================');

  try {
    // Clear existing data first
    console.log('🧹 Clearing existing data...');
    await prisma.systemAlert.deleteMany({});
    await prisma.adminAction.deleteMany({});
    await prisma.shipmentItem.deleteMany({});
    await prisma.distributorShipment.deleteMany({});
    await prisma.distributorInventory.deleteMany({});
    await prisma.document.deleteMany({});
    await prisma.qRCode.deleteMany({});
    await prisma.supplyChainEvent.deleteMany({});
    await prisma.certificate.deleteMany({});
    await prisma.labTest.deleteMany({});
    await prisma.finishedGoodComposition.deleteMany({});
    await prisma.finishedGood.deleteMany({});
    await prisma.rawMaterialBatch.deleteMany({});
    await prisma.collectionEvent.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.herbSpecies.deleteMany({});
    await prisma.organization.deleteMany({});
    console.log('   ✅ Database cleared');
    // Step 1: Create Organizations
    console.log('\n🏢 Creating Organizations...');
    const organizations = {};
    const orgTypes = ['FARMER', 'MANUFACTURER', 'LABS', 'DISTRIBUTOR', 'ADMIN'];
    
    for (const orgType of orgTypes) {
      const org = await prisma.organization.upsert({
        where: { organizationId: `demo-${orgType.toLowerCase()}` },
        update: {},
        create: {
          organizationId: `demo-${orgType.toLowerCase()}`,
          type: orgType,
          isActive: true
        }
      });
      organizations[orgType] = org;
      console.log(`   ✅ Created ${orgType} organization`);
    }

    // Step 2: Create Herb Species
    console.log('\n🌿 Creating Herb Species...');
    const herbSpecies = [];
    for (const speciesData of demoHerbSpecies) {
      const species = await prisma.herbSpecies.upsert({
        where: { scientificName: speciesData.scientificName },
        update: {},
        create: {
          ...speciesData,
          regulatoryInfo: {
            status: 'approved',
            certifications: ['organic', 'ayush'],
            restrictions: null
          }
        }
      });
      herbSpecies.push(species);
      console.log(`   ✅ Created species: ${speciesData.commonName}`);
    }

    // Step 3: Create Users
    console.log('\n👥 Creating Demo Users...');
    const users = {};
    for (const userData of demoUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: {
          email: userData.email,
          passwordHash: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          orgType: userData.orgType,
          role: userData.role,
          phone: userData.phone,
          location: userData.location,
          latitude: userData.latitude,
          longitude: userData.longitude,
          isActive: true,
          isVerified: true,
          organizationId: organizations[userData.orgType].organizationId,
          blockchainIdentity: `blockchain-${userData.orgType.toLowerCase()}-${Date.now()}`
        }
      });
      users[userData.orgType] = user;
      console.log(`   ✅ Created user: ${userData.email} (${userData.firstName} ${userData.lastName})`);
    }

    // Step 4: Create Collection Events
    console.log('\n📝 Creating Collection Events...');
    const collectionEvents = [];
    for (let i = 0; i < 3; i++) {
      const event = await prisma.collectionEvent.create({
        data: {
          collectorId: users.FARMER.userId,
          farmerId: users.FARMER.userId,
          herbSpeciesId: herbSpecies[i % herbSpecies.length].speciesId,
          collectionDate: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)), // Last 3 days
          location: `Farm Location ${i + 1}, Kerala`,
          latitude: 10.8505 + (i * 0.01),
          longitude: 76.2711 + (i * 0.01),
          quantity: 10 + (i * 5),
          unit: 'KG',
          qualityNotes: `Grade A quality herbs, properly dried and stored. Batch ${i + 1}.`,
          notes: `Collection event ${i + 1} completed successfully.`
        }
      });
      collectionEvents.push(event);
      console.log(`   ✅ Created collection event ${i + 1}`);
    }

    // Step 5: Create Raw Material Batches
    console.log('\n📦 Creating Raw Material Batches...');
    const rawMaterialBatches = [];
    for (let i = 0; i < 3; i++) {
      const batch = await prisma.rawMaterialBatch.create({
        data: {
          herbName: herbSpecies[i].commonName,
          scientificName: herbSpecies[i].scientificName,
          quantity: 50 + (i * 10),
          unit: 'KG',
          status: i === 0 ? 'PROCESSED' : i === 1 ? 'IN_PROCESSING' : 'CREATED',
          description: `Batch of ${herbSpecies[i].commonName} from organic farms`,
          notes: `Quality checked and approved for processing. Batch #${1000 + i}`,
          currentOwnerId: users.MANUFACTURER.userId
        }
      });
      rawMaterialBatches.push(batch);
      console.log(`   ✅ Created raw material batch: ${batch.herbName}`);
    }

    // Step 6: Create Finished Goods
    console.log('\n🏭 Creating Finished Goods...');
    const finishedGoods = [];
    const productTypes = ['POWDER', 'CAPSULE', 'TABLET'];
    for (let i = 0; i < 3; i++) {
      const product = await prisma.finishedGood.create({
        data: {
          productName: `${herbSpecies[i].commonName} ${productTypes[i]}`,
          productType: productTypes[i],
          quantity: 100 + (i * 20),
          unit: productTypes[i] === 'POWDER' ? 'KG' : 'PIECES',
          manufacturerId: users.MANUFACTURER.userId,
          description: `Premium ${herbSpecies[i].commonName} ${productTypes[i].toLowerCase()} for Ayurvedic wellness`,
          batchNumber: `FG-${2000 + i}`,
          expiryDate: new Date(Date.now() + (2 * 365 * 24 * 60 * 60 * 1000)) // 2 years from now
        }
      });
      finishedGoods.push(product);
      console.log(`   ✅ Created finished good: ${product.productName}`);
    }

    // Step 7: Create Finished Good Composition
    console.log('\n🧪 Creating Product Compositions...');
    for (let i = 0; i < finishedGoods.length; i++) {
      await prisma.finishedGoodComposition.create({
        data: {
          finishedGoodId: finishedGoods[i].productId,
          rawMaterialBatchId: rawMaterialBatches[i].batchId,
          percentage: 100, // 100% single herb products
          quantityUsed: 10 + (i * 2)
        }
      });
      console.log(`   ✅ Created composition for ${finishedGoods[i].productName}`);
    }

    // Step 8: Create Lab Tests
    console.log('\n🔬 Creating Lab Tests...');
    const labTests = [];
    const testTypes = ['QUALITY_ASSURANCE', 'HEAVY_METALS_ANALYSIS', 'ACTIVE_INGREDIENT_ANALYSIS'];
    for (let i = 0; i < 3; i++) {
      const test = await prisma.labTest.create({
        data: {
          testType: testTypes[i],
          status: i === 0 ? 'COMPLETED' : i === 1 ? 'IN_PROGRESS' : 'PENDING',
          sampleName: `${herbSpecies[i].commonName} Sample`,
          sampleType: 'Raw Material',
          sampleDescription: `Testing sample from batch ${rawMaterialBatches[i].batchId}`,
          batchNumber: `TEST-${3000 + i}`,
          collectionDate: new Date(Date.now() - (i * 12 * 60 * 60 * 1000)), // Last 12 hours each
          testDate: i === 0 ? new Date(Date.now() - (6 * 60 * 60 * 1000)) : null,
          completionDate: i === 0 ? new Date(Date.now() - (2 * 60 * 60 * 1000)) : null,
          results: i === 0 ? {
            purity: '98.5%',
            moisture: '8.2%',
            ash: '5.1%',
            extractiveValue: '12.8%',
            heavyMetals: 'Within limits',
            microbialLoad: 'Acceptable',
            pesticides: 'Not detected'
          } : null,
          methodology: 'HPLC, GC-MS, and traditional Ayurvedic testing methods',
          equipment: 'HPLC System, GC-MS, Microscope',
          notes: `Comprehensive testing for ${herbSpecies[i].commonName}`,
          priority: i === 0 ? 'HIGH' : 'MEDIUM',
          cost: 2500 + (i * 500),
          certificationNumber: i === 0 ? `CERT-${4000 + i}-${Date.now()}` : null,
          requesterId: users.MANUFACTURER.userId,
          labTechnicianId: users.LABS.userId,
          organizationId: organizations.LABS.organizationId,
          batchId: rawMaterialBatches[i].batchId
        }
      });
      labTests.push(test);
      console.log(`   ✅ Created lab test: ${test.testType} for ${test.sampleName}`);
    }

    // Step 9: Create Certificates
    console.log('\n🏆 Creating Certificates...');
    const certificates = [];
    for (let i = 0; i < 2; i++) { // Only for completed tests
      if (labTests[i].status === 'COMPLETED') {
        const certificate = await prisma.certificate.create({
          data: {
            certificateNumber: `AYUSH-CERT-${5000 + i}`,
            certificateType: 'QUALITY_CERTIFICATE',
            title: `Quality Certificate for ${herbSpecies[i].commonName}`,
            description: `This certifies that the tested sample meets all quality standards for Ayurvedic medicines.`,
            issueDate: new Date(),
            expiryDate: new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)), // 1 year
            isValid: true,
            qrCodeData: `CERT-QR-${5000 + i}`,
            testId: labTests[i].testId,
            organizationId: organizations.LABS.organizationId,
            issuerId: users.LABS.userId,
            digitalSignature: `digital-signature-${5000 + i}`
          }
        });
        certificates.push(certificate);
        console.log(`   ✅ Created certificate: ${certificate.certificateNumber}`);
      }
    }

    // Step 10: Create Supply Chain Events
    console.log('\n🔗 Creating Supply Chain Events...');
    const supplyChainEvents = [];
    for (let i = 0; i < 2; i++) {
      const event = await prisma.supplyChainEvent.create({
        data: {
          eventType: i === 0 ? 'TESTING' : 'DISTRIBUTION',
          handlerId: i === 0 ? users.LABS.userId : users.DISTRIBUTOR.userId,
          fromLocationId: i === 0 ? organizations.MANUFACTURER.organizationId : organizations.MANUFACTURER.organizationId,
          toLocationId: i === 0 ? organizations.LABS.organizationId : organizations.DISTRIBUTOR.organizationId,
          rawMaterialBatchId: rawMaterialBatches[i].batchId,
          finishedGoodId: i === 1 ? finishedGoods[i].productId : null,
          notes: `${i === 0 ? 'Testing' : 'Distribution'} event for batch processing`,
          custody: {
            temperature: '25°C',
            humidity: '45%',
            handler: i === 0 ? 'Lab Technician' : 'Distribution Manager'
          },
          metadata: {
            eventSequence: i + 1,
            qualityCheck: true,
            documentation: 'Complete'
          }
        }
      });
      supplyChainEvents.push(event);
      console.log(`   ✅ Created supply chain event: ${event.eventType}`);
    }

    // Step 11: Create QR Codes
    console.log('\n📱 Creating QR Codes...');
    const qrCodes = [];
    for (let i = 0; i < 3; i++) {
      const qrCode = await prisma.qRCode.create({
        data: {
          qrHash: `QR-${6000 + i}-${Date.now()}`,
          entityType: i === 0 ? 'RAW_MATERIAL_BATCH' : i === 1 ? 'FINISHED_GOOD' : 'LAB_TEST',
          entityId: i === 0 ? rawMaterialBatches[i].batchId : i === 1 ? finishedGoods[i].productId : labTests[i].testId,
          generatedBy: users.MANUFACTURER.userId,
          customData: {
            productInfo: i === 0 ? rawMaterialBatches[i].herbName : i === 1 ? finishedGoods[i].productName : labTests[i].sampleName,
            batchNumber: i === 0 ? `RM-${1000 + i}` : i === 1 ? finishedGoods[i].batchNumber : labTests[i].batchNumber,
            generationDate: new Date().toISOString()
          },
          rawMaterialBatchId: i === 0 ? rawMaterialBatches[i].batchId : null,
          finishedGoodId: i === 1 ? finishedGoods[i].productId : null,
          labTestId: i === 2 ? labTests[i].testId : null
        }
      });
      qrCodes.push(qrCode);
      console.log(`   ✅ Created QR code for ${qrCode.entityType}`);
    }

    // Step 12: Create Documents
    console.log('\n📄 Creating Documents...');
    const documents = [];
    const documentTypes = ['CERTIFICATE', 'REPORT', 'PHOTO', 'INVOICE'];
    for (let i = 0; i < 4; i++) {
      const document = await prisma.document.create({
        data: {
          fileName: `${documentTypes[i]}_${i + 1}.pdf`,
          filePath: `/uploads/documents/${documentTypes[i]}_${i + 1}.pdf`,
          fileSize: 1024 * (100 + i * 50), // Varying file sizes
          mimeType: documentTypes[i] === 'PHOTO' ? 'image/jpeg' : 'application/pdf',
          documentType: documentTypes[i],
          description: `${documentTypes[i]} document for batch processing`,
          uploadedBy: users.MANUFACTURER.userId,
          isPublic: i < 2, // First 2 are public
          rawMaterialBatchId: i < 2 ? rawMaterialBatches[i].batchId : null,
          finishedGoodId: i >= 2 ? finishedGoods[i - 2].productId : null
        }
      });
      documents.push(document);
      console.log(`   ✅ Created document: ${document.fileName}`);
    }

    // Step 13: Create Distributor Inventory
    console.log('\n📦 Creating Distributor Inventory...');
    const distributorInventory = [];
    for (let i = 0; i < 2; i++) {
      const inventory = await prisma.distributorInventory.create({
        data: {
          distributorId: users.DISTRIBUTOR.userId,
          productType: 'FINISHED_GOOD',
          entityId: finishedGoods[i].productId,
          quantity: 50 + (i * 20),
          unit: finishedGoods[i].unit,
          location: `Warehouse Section ${i + 1}`,
          warehouseSection: `A-${i + 1}`,
          status: 'IN_STOCK',
          receivedDate: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)),
          expiryDate: finishedGoods[i].expiryDate,
          supplierInfo: {
            supplierName: users.MANUFACTURER.firstName + ' ' + users.MANUFACTURER.lastName,
            supplierContact: users.MANUFACTURER.phone
          },
          qualityNotes: 'Excellent quality, properly packaged',
          storageConditions: 'Cool, dry place below 25°C'
        }
      });
      distributorInventory.push(inventory);
      console.log(`   ✅ Created inventory item: ${finishedGoods[i].productName}`);
    }

    // Step 14: Create Distributor Shipments
    console.log('\n🚚 Creating Distributor Shipments...');
    const shipments = [];
    for (let i = 0; i < 2; i++) {
      const shipment = await prisma.distributorShipment.create({
        data: {
          distributorId: users.DISTRIBUTOR.userId,
          shipmentNumber: `SHIP-${7000 + i}`,
          recipientType: 'RETAILER',
          recipientId: users.MANUFACTURER.userId, // Using manufacturer as recipient for demo
          recipientName: 'Ayurvedic Retail Store',
          recipientAddress: `123 Health Street, City ${i + 1}, State, PIN-123456`,
          recipientPhone: `+91-987654321${i}`,
          shipmentDate: new Date(),
          expectedDelivery: new Date(Date.now() + (3 * 24 * 60 * 60 * 1000)), // 3 days
          status: i === 0 ? 'IN_TRANSIT' : 'PREPARING',
          trackingNumber: `TRK-${8000 + i}`,
          carrierInfo: {
            carrierName: 'Express Logistics',
            carrierContact: '+91-1800-CARRIER'
          },
          shippingCost: 500 + (i * 100),
          totalValue: 5000 + (i * 1000),
          notes: `Shipment ${i + 1} for retail distribution`,
          specialInstructions: 'Handle with care, keep cool and dry'
        }
      });
      shipments.push(shipment);
      console.log(`   ✅ Created shipment: ${shipment.shipmentNumber}`);
    }

    // Step 15: Create Shipment Items
    console.log('\n📋 Creating Shipment Items...');
    for (let i = 0; i < shipments.length; i++) {
      await prisma.shipmentItem.create({
        data: {
          shipmentId: shipments[i].shipmentId,
          productType: 'FINISHED_GOOD',
          entityId: finishedGoods[i].productId,
          productName: finishedGoods[i].productName,
          quantity: 20 + (i * 10),
          unit: finishedGoods[i].unit,
          unitPrice: 100 + (i * 25),
          totalPrice: (20 + (i * 10)) * (100 + (i * 25)),
          batchNumber: finishedGoods[i].batchNumber,
          expiryDate: finishedGoods[i].expiryDate,
          qualityGrade: 'A+'
        }
      });
      console.log(`   ✅ Created shipment item for ${finishedGoods[i].productName}`);
    }

    // Step 16: Create Admin Actions
    console.log('\n👤 Creating Admin Actions...');
    const adminActions = [
      {
        actionType: 'ORGANIZATION_CREATED',
        description: 'Demo organizations created during comprehensive seeding',
        adminUserId: users.ADMIN.userId,
        metadata: { seedingType: 'comprehensive', organizationCount: 5 }
      },
      {
        actionType: 'USER_CREATED',
        description: 'Demo users created for all organization types',
        adminUserId: users.ADMIN.userId,
        targetUserId: users.FARMER.userId,
        metadata: { seedingType: 'comprehensive', userCount: 5 }
      },
      {
        actionType: 'SYSTEM_CONFIG_UPDATED',
        description: 'System initialized with comprehensive demo data',
        adminUserId: users.ADMIN.userId,
        metadata: { seedingType: 'comprehensive', timestamp: new Date().toISOString() }
      }
    ];

    for (const actionData of adminActions) {
      await prisma.adminAction.create({ data: actionData });
      console.log(`   ✅ Created admin action: ${actionData.actionType}`);
    }

    // Step 17: Create System Alerts
    console.log('\n🚨 Creating System Alerts...');
    const systemAlerts = [
      {
        alertType: 'BATCH_EXPIRY',
        severity: 'MEDIUM',
        title: 'Batch Expiry Warning',
        message: 'Some raw material batches are approaching expiry date',
        entityType: 'BATCH',
        entityId: rawMaterialBatches[0].batchId,
        metadata: { daysUntilExpiry: 30 }
      },
      {
        alertType: 'QUALITY_ISSUE',
        severity: 'LOW',
        title: 'Quality Check Reminder',
        message: 'Periodic quality checks are due for finished goods',
        entityType: 'FINISHED_GOOD',
        entityId: finishedGoods[0].productId,
        metadata: { checkType: 'periodic_quality' }
      },
      {
        alertType: 'COMPLIANCE_VIOLATION',
        severity: 'HIGH',
        title: 'Certificate Renewal',
        message: 'Quality certificates require renewal within 60 days',
        entityType: 'CERTIFICATE',
        entityId: certificates.length > 0 ? certificates[0].certificateId : null,
        metadata: { renewalRequired: true, daysRemaining: 60 }
      }
    ];

    for (const alertData of systemAlerts) {
      await prisma.systemAlert.create({ data: alertData });
      console.log(`   ✅ Created system alert: ${alertData.title}`);
    }

    // Final Statistics
    console.log('\n📊 Seeding Complete! Database Statistics:');
    console.log('==========================================');
    
    const stats = {
      organizations: await prisma.organization.count(),
      users: await prisma.user.count(),
      herbSpecies: await prisma.herbSpecies.count(),
      collectionEvents: await prisma.collectionEvent.count(),
      rawMaterialBatches: await prisma.rawMaterialBatch.count(),
      finishedGoods: await prisma.finishedGood.count(),
      labTests: await prisma.labTest.count(),
      certificates: await prisma.certificate.count(),
      supplyChainEvents: await prisma.supplyChainEvent.count(),
      qrCodes: await prisma.qRCode.count(),
      documents: await prisma.document.count(),
      distributorInventory: await prisma.distributorInventory.count(),
      distributorShipments: await prisma.distributorShipment.count(),
      shipmentItems: await prisma.shipmentItem.count(),
      adminActions: await prisma.adminAction.count(),
      systemAlerts: await prisma.systemAlert.count()
    };

    Object.entries(stats).forEach(([table, count]) => {
      console.log(`   📋 ${table}: ${count} records`);
    });

    console.log('\n🔑 Demo User Credentials:');
    console.log('=========================');
    demoUsers.forEach(user => {
      console.log(`   📧 ${user.email}`);
      console.log(`      Password: ${user.password}`);
      console.log(`      Role: ${user.role} (${user.orgType})`);
      console.log(`      Name: ${user.firstName} ${user.lastName}`);
      console.log('');
    });

    console.log('🎉 Comprehensive database seeding completed successfully!');
    console.log('🌐 You can now test all API endpoints with the demo data and credentials above.');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

// Run the seeding
seedAllTables()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });