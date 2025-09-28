const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

/**
 * Comprehensive one-time seeding with proper relationships for website display
 * This creates properly linked demo data for every entity in the system
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
  },
  {
    commonName: 'Brahmi',
    scientificName: 'Bacopa monnieri',
    family: 'Plantaginaceae',
    description: 'Memory-enhancing herb known for cognitive support and mental clarity.',
    medicinalUses: ['Memory enhancement', 'Cognitive support', 'Anxiety relief', 'Brain health'],
    nativeRegions: ['India', 'Southeast Asia'],
    harvestingSeason: 'Monsoon',
    partsUsed: ['Whole plant'],
    conservationStatus: 'LEAST_CONCERN'
  },
  {
    commonName: 'Neem',
    scientificName: 'Azadirachta indica',
    family: 'Meliaceae',
    description: 'Versatile medicinal tree with antibacterial and antifungal properties.',
    medicinalUses: ['Skin health', 'Immune support', 'Blood purification', 'Dental care'],
    nativeRegions: ['India', 'Myanmar'],
    harvestingSeason: 'Summer',
    partsUsed: ['Leaves', 'Bark', 'Oil'],
    conservationStatus: 'LEAST_CONCERN'
  }
];

async function seedAllTablesWithProperLinking() {
  console.log('🌱 Starting comprehensive database seeding with proper linking...');
  console.log('===============================================================');

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
      const org = await prisma.organization.create({
        data: {
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
      const species = await prisma.herbSpecies.create({
        data: {
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
      const user = await prisma.user.create({
        data: {
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

    // Step 4: Create Collection Events (Farmer collects herbs)
    console.log('\n📝 Creating Collection Events...');
    const collectionEvents = [];
    for (let i = 0; i < 5; i++) {
      const event = await prisma.collectionEvent.create({
        data: {
          collectorId: users.FARMER.userId,
          farmerId: users.FARMER.userId,
          herbSpeciesId: herbSpecies[i % herbSpecies.length].speciesId,
          collectionDate: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)), // Last 5 days
          location: `Farm Location ${i + 1}, Kerala`,
          latitude: 10.8505 + (i * 0.01),
          longitude: 76.2711 + (i * 0.01),
          quantity: 15 + (i * 5),
          unit: 'KG',
          qualityNotes: `Grade A quality ${herbSpecies[i % herbSpecies.length].commonName}, properly dried and stored. Collection batch ${i + 1}.`,
          notes: `Collection event ${i + 1} completed successfully by ${users.FARMER.firstName}.`
        }
      });
      collectionEvents.push(event);
      console.log(`   ✅ Created collection event ${i + 1}: ${herbSpecies[i % herbSpecies.length].commonName}`);
    }

    // Step 5: Create Raw Material Batches (Manufacturer receives from farmer)
    console.log('\n📦 Creating Raw Material Batches...');
    const rawMaterialBatches = [];
    for (let i = 0; i < 5; i++) {
      const batch = await prisma.rawMaterialBatch.create({
        data: {
          herbName: herbSpecies[i].commonName,
          scientificName: herbSpecies[i].scientificName,
          quantity: 40 + (i * 10),
          unit: 'KG',
          status: i === 0 ? 'PROCESSED' : i === 1 ? 'IN_PROCESSING' : i === 2 ? 'PROCESSED' : 'CREATED',
          description: `Raw material batch of ${herbSpecies[i].commonName} sourced from organic farms in Kerala`,
          notes: `Quality verified and approved for processing. Batch #${1000 + i}. Received from ${users.FARMER.firstName} Farmer.`,
          currentOwnerId: users.MANUFACTURER.userId
        }
      });
      rawMaterialBatches.push(batch);
      console.log(`   ✅ Created raw material batch: ${batch.herbName} (${batch.quantity}kg)`);
    }

    // Step 5.1: Link Collection Events to Raw Material Batches
    console.log('\n🔗 Linking Collection Events to Raw Material Batches...');
    for (let i = 0; i < Math.min(collectionEvents.length, rawMaterialBatches.length); i++) {
      await prisma.collectionEvent.update({
        where: { eventId: collectionEvents[i].eventId },
        data: { batchId: rawMaterialBatches[i].batchId }
      });
      console.log(`   ✅ Linked collection event ${i + 1} to batch: ${rawMaterialBatches[i].herbName}`);
    }

    // Step 6: Create Finished Goods (Manufacturer processes raw materials)
    console.log('\n🏭 Creating Finished Goods...');
    const finishedGoods = [];
    const productTypes = ['POWDER', 'CAPSULE', 'TABLET', 'POWDER', 'CAPSULE'];
    for (let i = 0; i < 3; i++) { // Only create finished goods from processed batches
      const product = await prisma.finishedGood.create({
        data: {
          productName: `Premium ${herbSpecies[i].commonName} ${productTypes[i]}`,
          productType: productTypes[i],
          quantity: 80 + (i * 20),
          unit: productTypes[i] === 'POWDER' ? 'KG' : 'PIECES',
          manufacturerId: users.MANUFACTURER.userId,
          description: `Premium quality ${herbSpecies[i].commonName} ${productTypes[i].toLowerCase()} manufactured using traditional Ayurvedic methods combined with modern processing techniques.`,
          batchNumber: `FG-${2000 + i}-${Date.now()}`,
          expiryDate: new Date(Date.now() + (2 * 365 * 24 * 60 * 60 * 1000)) // 2 years from now
        }
      });
      finishedGoods.push(product);
      console.log(`   ✅ Created finished good: ${product.productName} (${product.quantity} ${product.unit})`);
    }

    // Step 7: Create Finished Good Composition (Link finished goods to raw materials)
    console.log('\n🧪 Creating Product Compositions...');
    for (let i = 0; i < finishedGoods.length; i++) {
      await prisma.finishedGoodComposition.create({
        data: {
          finishedGoodId: finishedGoods[i].productId,
          rawMaterialBatchId: rawMaterialBatches[i].batchId,
          percentage: 100, // 100% single herb products
          quantityUsed: 15 + (i * 3)
        }
      });
      console.log(`   ✅ Created composition: ${finishedGoods[i].productName} ← ${rawMaterialBatches[i].herbName}`);
    }

    // Step 8: Create Lab Tests (Lab tests raw materials and finished goods)
    console.log('\n🔬 Creating Lab Tests...');
    const labTests = [];
    const testTypes = ['QUALITY_ASSURANCE', 'HEAVY_METALS_ANALYSIS', 'ACTIVE_INGREDIENT_ANALYSIS', 'MICROBIOLOGICAL_TESTING', 'PESTICIDE_RESIDUE_ANALYSIS'];
    
    // Test raw materials
    for (let i = 0; i < 3; i++) {
      const test = await prisma.labTest.create({
        data: {
          testType: testTypes[i],
          status: i === 0 ? 'COMPLETED' : i === 1 ? 'COMPLETED' : 'IN_PROGRESS',
          sampleName: `${rawMaterialBatches[i].herbName} Sample`,
          sampleType: 'Raw Material',
          sampleDescription: `Testing sample from raw material batch ${rawMaterialBatches[i].batchId}`,
          batchNumber: `TEST-RM-${3000 + i}-${Date.now()}`,
          collectionDate: new Date(Date.now() - (i * 12 * 60 * 60 * 1000)),
          testDate: i < 2 ? new Date(Date.now() - ((i + 1) * 6 * 60 * 60 * 1000)) : null,
          completionDate: i < 2 ? new Date(Date.now() - (i * 2 * 60 * 60 * 1000)) : null,
          results: i < 2 ? {
            purity: i === 0 ? '98.5%' : '97.8%',
            moisture: i === 0 ? '8.2%' : '9.1%',
            ash: i === 0 ? '5.1%' : '5.8%',
            extractiveValue: i === 0 ? '12.8%' : '11.2%',
            heavyMetals: 'Within permissible limits',
            microbialLoad: 'Acceptable as per standards',
            pesticides: 'Not detected',
            overallGrade: 'A+',
            complianceStatus: 'AYUSH Approved'
          } : null,
          methodology: 'HPLC, GC-MS, UV-Spectroscopy and traditional Ayurvedic testing methods as per pharmacopoeia standards',
          equipment: 'HPLC System, GC-MS, UV-Spectrophotometer, Digital Microscope',
          notes: `Comprehensive ${testTypes[i].replace('_', ' ').toLowerCase()} testing for ${rawMaterialBatches[i].herbName}`,
          priority: i === 0 ? 'HIGH' : 'MEDIUM',
          cost: 2500 + (i * 500),
          certificationNumber: i < 2 ? `CERT-TEST-${4000 + i}-${Date.now()}` : null,
          requesterId: users.MANUFACTURER.userId,
          labTechnicianId: users.LABS.userId,
          organizationId: organizations.LABS.organizationId,
          batchId: rawMaterialBatches[i].batchId
        }
      });
      labTests.push(test);
      console.log(`   ✅ Created lab test: ${test.testType} for ${test.sampleName}`);
    }

    // Test finished goods
    for (let i = 0; i < 2; i++) {
      const test = await prisma.labTest.create({
        data: {
          testType: testTypes[i + 3],
          status: 'COMPLETED',
          sampleName: `${finishedGoods[i].productName} Sample`,
          sampleType: 'Finished Product',
          sampleDescription: `Quality testing sample from finished goods batch ${finishedGoods[i].productId}`,
          batchNumber: `TEST-FG-${4000 + i}-${Date.now()}`,
          collectionDate: new Date(Date.now() - (24 * 60 * 60 * 1000)),
          testDate: new Date(Date.now() - (12 * 60 * 60 * 1000)),
          completionDate: new Date(Date.now() - (2 * 60 * 60 * 1000)),
          results: {
            purity: '99.2%',
            uniformity: 'Excellent',
            dissolution: 'Within limits',
            microbialLoad: 'Nil pathogenic organisms',
            heavyMetals: 'Below detection limits',
            activeIngredients: 'As per specifications',
            overallGrade: 'A+',
            shelfLife: '24 months',
            complianceStatus: 'AYUSH Approved'
          },
          methodology: 'Complete pharmacopoeial testing as per AYUSH guidelines',
          equipment: 'Complete analytical setup with modern instrumentation',
          notes: `Final product quality assurance testing for ${finishedGoods[i].productName}`,
          priority: 'HIGH',
          cost: 3500 + (i * 300),
          certificationNumber: `CERT-FG-${5000 + i}-${Date.now()}`,
          requesterId: users.MANUFACTURER.userId,
          labTechnicianId: users.LABS.userId,
          organizationId: organizations.LABS.organizationId,
          finishedGoodId: finishedGoods[i].productId
        }
      });
      labTests.push(test);
      console.log(`   ✅ Created lab test: ${test.testType} for ${test.sampleName}`);
    }

    // Step 9: Create Certificates (Lab issues certificates for completed tests)
    console.log('\n🏆 Creating Certificates...');
    const certificates = [];
    const completedTests = labTests.filter(test => test.status === 'COMPLETED' && test.certificationNumber);
    
    for (let i = 0; i < completedTests.length; i++) {
      const test = completedTests[i];
      const certificate = await prisma.certificate.create({
        data: {
          certificateNumber: `AYUSH-CERT-${6000 + i}-${Date.now()}`,
          certificateType: i % 2 === 0 ? 'QUALITY_CERTIFICATE' : 'AYUSH_COMPLIANCE',
          title: `${test.sampleType} Quality Certificate for ${test.sampleName}`,
          description: `This certificate validates that the tested sample meets all quality standards and regulatory requirements for Ayurvedic medicines as per AYUSH guidelines.`,
          issueDate: new Date(),
          expiryDate: new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)), // 1 year
          isValid: true,
          qrCodeData: `CERT-QR-${6000 + i}-${Date.now()}`,
          testId: test.testId,
          organizationId: organizations.LABS.organizationId,
          issuerId: users.LABS.userId,
          digitalSignature: `digital-signature-${6000 + i}-${Date.now()}`
        }
      });
      certificates.push(certificate);
      console.log(`   ✅ Created certificate: ${certificate.certificateNumber} for ${test.sampleName}`);
    }

    // Step 10: Create Supply Chain Events (Track movement between organizations)
    console.log('\n🔗 Creating Supply Chain Events...');
    const supplyChainEvents = [];
    
    // Farmer to Manufacturer events
    for (let i = 0; i < 3; i++) {
      const event = await prisma.supplyChainEvent.create({
        data: {
          eventType: 'DISTRIBUTION',
          handlerId: users.FARMER.userId,
          fromLocationId: organizations.FARMER.organizationId,
          toLocationId: organizations.MANUFACTURER.organizationId,
          rawMaterialBatchId: rawMaterialBatches[i].batchId,
          notes: `Transfer of ${rawMaterialBatches[i].herbName} raw materials from farmer to manufacturer`,
          custody: {
            temperature: '25°C',
            humidity: '45%',
            handler: `${users.FARMER.firstName} ${users.FARMER.lastName}`,
            transportMode: 'Cold Chain Truck',
            packagingType: 'Sealed Hemp Bags'
          },
          metadata: {
            eventSequence: i + 1,
            qualityCheck: true,
            documentation: 'Complete',
            transferDate: new Date(Date.now() - ((4 - i) * 24 * 60 * 60 * 1000)),
            weight: rawMaterialBatches[i].quantity,
            condition: 'Excellent'
          }
        }
      });
      supplyChainEvents.push(event);
      console.log(`   ✅ Created supply chain event: FARMER → MANUFACTURER (${rawMaterialBatches[i].herbName})`);
    }

    // Manufacturer to Lab events for testing
    for (let i = 0; i < 2; i++) {
      const event = await prisma.supplyChainEvent.create({
        data: {
          eventType: 'TESTING',
          handlerId: users.MANUFACTURER.userId,
          fromLocationId: organizations.MANUFACTURER.organizationId,
          toLocationId: organizations.LABS.organizationId,
          rawMaterialBatchId: rawMaterialBatches[i].batchId,
          finishedGoodId: i < finishedGoods.length ? finishedGoods[i].productId : null,
          notes: `Sample dispatch for quality testing of ${i < finishedGoods.length ? finishedGoods[i].productName : rawMaterialBatches[i].herbName}`,
          custody: {
            temperature: '20°C',
            humidity: '40%',
            handler: `${users.MANUFACTURER.firstName} ${users.MANUFACTURER.lastName}`,
            transportMode: 'Climate Controlled Vehicle',
            sampleSize: '100g'
          },
          metadata: {
            eventSequence: i + 4,
            qualityCheck: true,
            documentation: 'Complete',
            testType: labTests[i].testType,
            urgency: 'High Priority'
          }
        }
      });
      supplyChainEvents.push(event);
      console.log(`   ✅ Created supply chain event: MANUFACTURER → LAB (Testing)`);
    }

    // Manufacturer to Distributor events
    for (let i = 0; i < 2; i++) {
      const event = await prisma.supplyChainEvent.create({
        data: {
          eventType: 'DISTRIBUTION',
          handlerId: users.MANUFACTURER.userId,
          fromLocationId: organizations.MANUFACTURER.organizationId,
          toLocationId: organizations.DISTRIBUTOR.organizationId,
          finishedGoodId: finishedGoods[i].productId,
          notes: `Distribution of certified ${finishedGoods[i].productName} to authorized distributor`,
          custody: {
            temperature: '25°C',
            humidity: '50%',
            handler: `${users.MANUFACTURER.firstName} ${users.MANUFACTURER.lastName}`,
            transportMode: 'Refrigerated Truck',
            packagingType: 'Sealed Medical Grade Containers'
          },
          metadata: {
            eventSequence: i + 7,
            qualityCheck: true,
            documentation: 'Complete',
            certificateNumbers: certificates.filter(cert => 
              cert.testId && labTests.find(test => 
                test.testId === cert.testId && test.finishedGoodId === finishedGoods[i].productId
              )
            ).map(cert => cert.certificateNumber),
            quantity: Math.floor(finishedGoods[i].quantity * 0.7), // 70% goes to distributor
            batchVerified: true
          }
        }
      });
      supplyChainEvents.push(event);
      console.log(`   ✅ Created supply chain event: MANUFACTURER → DISTRIBUTOR (${finishedGoods[i].productName})`);
    }

    // Step 11: Create QR Codes (For tracking all entities)
    console.log('\n📱 Creating QR Codes...');
    const qrCodes = [];
    
    // QR codes for raw material batches
    for (let i = 0; i < 3; i++) {
      const qrCode = await prisma.qRCode.create({
        data: {
          qrHash: `QR-RM-${7000 + i}-${Date.now()}`,
          entityType: 'RAW_MATERIAL_BATCH',
          entityId: rawMaterialBatches[i].batchId,
          generatedBy: users.MANUFACTURER.userId,
          customData: {
            herbName: rawMaterialBatches[i].herbName,
            scientificName: rawMaterialBatches[i].scientificName,
            batchNumber: `RM-${1000 + i}`,
            collectionDate: collectionEvents[i].collectionDate.toISOString(),
            farmerName: `${users.FARMER.firstName} ${users.FARMER.lastName}`,
            quantity: rawMaterialBatches[i].quantity,
            unit: rawMaterialBatches[i].unit,
            status: rawMaterialBatches[i].status,
            qrGeneratedDate: new Date().toISOString()
          },
          rawMaterialBatchId: rawMaterialBatches[i].batchId
        }
      });
      qrCodes.push(qrCode);
      console.log(`   ✅ Created QR code for raw material: ${rawMaterialBatches[i].herbName}`);
    }

    // QR codes for finished goods
    for (let i = 0; i < finishedGoods.length; i++) {
      const relatedCertificates = certificates.filter(cert => 
        cert.testId && labTests.find(test => 
          test.testId === cert.testId && test.finishedGoodId === finishedGoods[i].productId
        )
      );

      const qrCode = await prisma.qRCode.create({
        data: {
          qrHash: `QR-FG-${8000 + i}-${Date.now()}`,
          entityType: 'FINISHED_GOOD',
          entityId: finishedGoods[i].productId,
          generatedBy: users.MANUFACTURER.userId,
          customData: {
            productName: finishedGoods[i].productName,
            productType: finishedGoods[i].productType,
            batchNumber: finishedGoods[i].batchNumber,
            createdDate: finishedGoods[i].createdAt.toISOString(),
            expiryDate: finishedGoods[i].expiryDate.toISOString(),
            manufacturerName: `${users.MANUFACTURER.firstName} ${users.MANUFACTURER.lastName}`,
            quantity: finishedGoods[i].quantity,
            unit: finishedGoods[i].unit,
            instructions: `Take as directed by Ayurvedic physician. ${finishedGoods[i].productType === 'POWDER' ? '1-2 grams twice daily' : '1-2 pieces twice daily'}`,
            certificateNumbers: relatedCertificates.map(cert => cert.certificateNumber),
            ayushApproved: true,
            qrGeneratedDate: new Date().toISOString()
          },
          finishedGoodId: finishedGoods[i].productId
        }
      });
      qrCodes.push(qrCode);
      console.log(`   ✅ Created QR code for finished good: ${finishedGoods[i].productName}`);
    }

    // QR codes for certificates
    for (let i = 0; i < certificates.length; i++) {
      const qrCode = await prisma.qRCode.create({
        data: {
          qrHash: `QR-CERT-${9000 + i}-${Date.now()}`,
          entityType: 'CERTIFICATE',
          entityId: certificates[i].certificateId,
          generatedBy: users.LABS.userId,
          customData: {
            certificateNumber: certificates[i].certificateNumber,
            certificateType: certificates[i].certificateType,
            title: certificates[i].title,
            issueDate: certificates[i].issueDate.toISOString(),
            expiryDate: certificates[i].expiryDate.toISOString(),
            isValid: certificates[i].isValid,
            issuerName: `${users.LABS.firstName} ${users.LABS.lastName}`,
            labName: 'Certified Ayurvedic Testing Laboratory',
            digitalSignature: certificates[i].digitalSignature,
            qrGeneratedDate: new Date().toISOString()
          }
        }
      });
      qrCodes.push(qrCode);
      console.log(`   ✅ Created QR code for certificate: ${certificates[i].certificateNumber}`);
    }

    // Step 12: Create Documents (Supporting documentation)
    console.log('\n📄 Creating Documents...');
    const documents = [];
    const documentTypes = ['CERTIFICATE', 'REPORT', 'PHOTO', 'INVOICE', 'TEST_RESULT', 'LICENSE'];
    
    // Documents for raw materials
    for (let i = 0; i < 3; i++) {
      const document = await prisma.document.create({
        data: {
          fileName: `${documentTypes[i % 3]}_RM_${rawMaterialBatches[i].herbName}_${i + 1}.pdf`,
          filePath: `/uploads/documents/raw-materials/${documentTypes[i % 3]}_RM_${rawMaterialBatches[i].herbName}_${i + 1}.pdf`,
          fileSize: 1024 * (150 + i * 75), // Varying file sizes
          mimeType: i === 2 ? 'image/jpeg' : 'application/pdf',
          documentType: documentTypes[i % 3],
          description: `${documentTypes[i % 3]} document for ${rawMaterialBatches[i].herbName} raw material batch`,
          uploadedBy: users.MANUFACTURER.userId,
          isPublic: i < 2, // First 2 are public
          rawMaterialBatchId: rawMaterialBatches[i].batchId
        }
      });
      documents.push(document);
      console.log(`   ✅ Created document: ${document.fileName}`);
    }

    // Documents for finished goods
    for (let i = 0; i < finishedGoods.length; i++) {
      const document = await prisma.document.create({
        data: {
          fileName: `${documentTypes[i + 3]}_FG_${finishedGoods[i].productName.replace(/\s+/g, '_')}_${i + 1}.pdf`,
          filePath: `/uploads/documents/finished-goods/${documentTypes[i + 3]}_FG_${finishedGoods[i].productName.replace(/\s+/g, '_')}_${i + 1}.pdf`,
          fileSize: 1024 * (200 + i * 100),
          mimeType: 'application/pdf',
          documentType: documentTypes[i + 3],
          description: `${documentTypes[i + 3]} document for ${finishedGoods[i].productName}`,
          uploadedBy: users.MANUFACTURER.userId,
          isPublic: true,
          finishedGoodId: finishedGoods[i].productId
        }
      });
      documents.push(document);
      console.log(`   ✅ Created document: ${document.fileName}`);
    }

    // Step 13: Create Distributor Inventory (Distributor receives goods)
    console.log('\n📦 Creating Distributor Inventory...');
    const distributorInventory = [];
    for (let i = 0; i < finishedGoods.length; i++) {
      const receivedQuantity = Math.floor(finishedGoods[i].quantity * 0.7); // 70% goes to distributor
      const inventory = await prisma.distributorInventory.create({
        data: {
          distributorId: users.DISTRIBUTOR.userId,
          productType: 'FINISHED_GOOD',
          entityId: finishedGoods[i].productId,
          quantity: receivedQuantity,
          unit: finishedGoods[i].unit,
          location: `Warehouse Section ${String.fromCharCode(65 + i)}-${i + 1}`, // A-1, B-2, C-3
          warehouseSection: `Section-${String.fromCharCode(65 + i)}`,
          status: i === 0 ? 'IN_STOCK' : i === 1 ? 'LOW_STOCK' : 'IN_STOCK',
          receivedDate: new Date(Date.now() - (i * 12 * 60 * 60 * 1000)),
          expiryDate: finishedGoods[i].expiryDate,
          supplierInfo: {
            supplierName: `${users.MANUFACTURER.firstName} ${users.MANUFACTURER.lastName}`,
            supplierContact: users.MANUFACTURER.phone,
            supplierEmail: users.MANUFACTURER.email,
            organizationType: 'MANUFACTURER'
          },
          qualityNotes: `Excellent quality, properly packaged and sealed. Certificate verified.`,
          storageConditions: 'Cool, dry place below 25°C',
          batchNumber: finishedGoods[i].batchNumber,
          unitPrice: 150 + (i * 50), // Varying prices
          totalValue: receivedQuantity * (150 + (i * 50)),
          reorderLevel: Math.floor(receivedQuantity * 0.2), // 20% reorder level
          metadata: {
            receivedFrom: users.MANUFACTURER.userId,
            qualityInspected: true,
            certificationVerified: true,
            storageOptimal: true
          }
        }
      });
      distributorInventory.push(inventory);
      console.log(`   ✅ Created inventory: ${finishedGoods[i].productName} (${receivedQuantity} ${finishedGoods[i].unit})`);
    }

    // Step 14: Create Distributor Shipments (Distributor ships to retailers)
    console.log('\n🚚 Creating Distributor Shipments...');
    const shipments = [];
    for (let i = 0; i < 2; i++) {
      const shipment = await prisma.distributorShipment.create({
        data: {
          distributorId: users.DISTRIBUTOR.userId,
          shipmentNumber: `SHIP-${10000 + i}-${Date.now()}`,
          recipientType: 'RETAILER',
          recipientId: `retailer-${i + 1}-id`, // Demo retailer ID
          recipientName: `Premium Ayurvedic Store ${i + 1}`,
          recipientAddress: `${123 + i} Health Street, Wellness District, ${i === 0 ? 'Mumbai' : 'Pune'}, Maharashtra, PIN-${400001 + i}`,
          recipientPhone: `+91-987654321${i}`,
          recipientEmail: `store${i + 1}@ayurvedic-retail.com`,
          shipmentDate: new Date(Date.now() - (i * 6 * 60 * 60 * 1000)),
          expectedDelivery: new Date(Date.now() + ((3 - i) * 24 * 60 * 60 * 1000)), // 3-2 days
          actualDelivery: i === 0 ? new Date(Date.now() - (2 * 60 * 60 * 1000)) : null, // First one delivered
          status: i === 0 ? 'DELIVERED' : 'IN_TRANSIT',
          trackingNumber: `TRK-${11000 + i}-${Date.now()}`,
          carrierInfo: {
            carrierName: 'Professional Medical Logistics',
            carrierContact: '+91-1800-MED-SHIP',
            driverName: `Driver ${i + 1}`,
            vehicleNumber: `MH-01-AB-${1234 + i}`
          },
          shippingCost: 750 + (i * 150),
          totalValue: (25 + (i * 10)) * (200 + (i * 75)), // quantity * unit price
          notes: `Premium delivery to authorized Ayurvedic retail store. All items properly certified and verified.`,
          specialInstructions: 'Handle with care, maintain cold chain, verify certificates on delivery',
          deliveryInstructions: 'Signature required, verify recipient credentials',
          metadata: {
            priority: 'High',
            requiresSignature: true,
            temperatureControlled: true,
            insuranceValue: (25 + (i * 10)) * (200 + (i * 75))
          }
        }
      });
      shipments.push(shipment);
      console.log(`   ✅ Created shipment: ${shipment.shipmentNumber} (${shipment.status})`);
    }

    // Step 15: Create Shipment Items (Items in each shipment)
    console.log('\n📋 Creating Shipment Items...');
    for (let i = 0; i < shipments.length; i++) {
      const quantity = 25 + (i * 10);
      const unitPrice = 200 + (i * 75);
      await prisma.shipmentItem.create({
        data: {
          shipmentId: shipments[i].shipmentId,
          productType: 'FINISHED_GOOD',
          entityId: finishedGoods[i].productId,
          productName: finishedGoods[i].productName,
          quantity: quantity,
          unit: finishedGoods[i].unit,
          unitPrice: unitPrice,
          totalPrice: quantity * unitPrice,
          batchNumber: finishedGoods[i].batchNumber,
          createdDate: finishedGoods[i].createdAt,
          expiryDate: finishedGoods[i].expiryDate,
          qualityGrade: 'Premium A+',
          certificationNumbers: certificates
            .filter(cert => cert.testId && labTests.find(test => 
              test.testId === cert.testId && test.finishedGoodId === finishedGoods[i].productId
            ))
            .map(cert => cert.certificateNumber),
          storageRequirements: 'Cool, dry place below 25°C',
          handlingInstructions: 'Keep upright, avoid direct sunlight, maintain temperature below 25°C'
        }
      });
      console.log(`   ✅ Created shipment item: ${finishedGoods[i].productName} (${quantity} ${finishedGoods[i].unit})`);
    }

    // Step 16: Create Admin Actions (System management tracking)
    console.log('\n👤 Creating Admin Actions...');
    const adminActions = [
      {
        actionType: 'ORGANIZATION_CREATED',
        description: 'Comprehensive demo organizations created with proper linking structure',
        adminUserId: users.ADMIN.userId,
        metadata: { 
          seedingType: 'comprehensive_linked', 
          organizationCount: 5,
          timestamp: new Date().toISOString(),
          version: '2.0'
        }
      },
      {
        actionType: 'USER_CREATED',
        description: 'Demo users created for all organization types with realistic data',
        adminUserId: users.ADMIN.userId,
        targetUserId: users.FARMER.userId,
        metadata: { 
          seedingType: 'comprehensive_linked', 
          userCount: 5,
          organizationsLinked: true
        }
      },
      {
        actionType: 'SYSTEM_CONFIG_UPDATED',
        description: 'System initialized with comprehensive demo data and proper entity relationships',
        adminUserId: users.ADMIN.userId,
        metadata: { 
          seedingType: 'comprehensive_linked', 
          timestamp: new Date().toISOString(),
          entitiesCreated: ['organizations', 'users', 'herbs', 'batches', 'products', 'tests', 'certificates', 'inventory', 'shipments'],
          relationshipsEstablished: true
        }
      },
      {
        actionType: 'DATA_EXPORT',
        description: 'Demo data structure exported for development and testing purposes',
        adminUserId: users.ADMIN.userId,
        metadata: {
          exportType: 'comprehensive_seed',
          recordCount: 50,
          linkedEntities: true
        }
      }
    ];

    for (const actionData of adminActions) {
      await prisma.adminAction.create({ data: actionData });
      console.log(`   ✅ Created admin action: ${actionData.actionType}`);
    }

    // Step 17: Create System Alerts (Monitoring and notifications)
    console.log('\n🚨 Creating System Alerts...');
    const systemAlerts = [
      {
        alertType: 'BATCH_EXPIRY',
        severity: 'MEDIUM',
        title: 'Raw Material Batch Expiry Warning',
        message: `Raw material batch of ${rawMaterialBatches[2].herbName} is approaching quality review date`,
        entityType: 'BATCH',
        entityId: rawMaterialBatches[2].batchId,
        isResolved: false,
        metadata: { 
          daysUntilReview: 45,
          herbName: rawMaterialBatches[2].herbName,
          batchNumber: rawMaterialBatches[2].batchId.slice(-8),
          currentOwner: users.MANUFACTURER.firstName
        }
      },
      {
        alertType: 'QUALITY_ISSUE',
        severity: 'LOW',
        title: 'Inventory Quality Check Due',
        message: `Periodic quality checks are due for ${distributorInventory[0].quantity} units of inventory`,
        entityType: 'FINISHED_GOOD',
        entityId: distributorInventory[0].entityId,
        isResolved: false,
        metadata: { 
          inventoryLocation: distributorInventory[0].location,
          checkType: 'periodic_quality',
          nextCheckDate: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString()
        }
      },
      {
        alertType: 'CERTIFICATE_EXPIRY',
        severity: 'HIGH',
        title: 'Certificate Renewal Required',
        message: `Quality certificate ${certificates[0].certificateNumber} requires renewal within 60 days`,
        entityType: 'CERTIFICATE',
        entityId: certificates[0].certificateId,
        isResolved: false,
        metadata: { 
          certificateNumber: certificates[0].certificateNumber,
          expiryDate: certificates[0].expiryDate.toISOString(),
          renewalRequired: true, 
          daysRemaining: 60,
          relatedProduct: certificates[0].title
        }
      },
      {
        alertType: 'UNUSUAL_ACTIVITY',
        severity: 'MEDIUM',
        title: 'High Demand Product Alert',
        message: `${finishedGoods[0].productName} showing increased distribution activity`,
        entityType: 'FINISHED_GOOD',
        entityId: finishedGoods[0].productId,
        isResolved: false,
        metadata: {
          productName: finishedGoods[0].productName,
          demandIncrease: '25%',
          recommendedAction: 'Consider increasing production',
          stockLevel: distributorInventory[0].quantity
        }
      }
    ];

    for (const alertData of systemAlerts) {
      await prisma.systemAlert.create({ data: alertData });
      console.log(`   ✅ Created system alert: ${alertData.title}`);
    }

    // Final Statistics and Summary
    console.log('\n📊 Seeding Complete! Database Statistics:');
    console.log('==========================================');
    
    const stats = {
      organizations: await prisma.organization.count(),
      users: await prisma.user.count(),
      herbSpecies: await prisma.herbSpecies.count(),
      collectionEvents: await prisma.collectionEvent.count(),
      rawMaterialBatches: await prisma.rawMaterialBatch.count(),
      finishedGoods: await prisma.finishedGood.count(),
      finishedGoodCompositions: await prisma.finishedGoodComposition.count(),
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

    console.log('\n🔗 Data Relationships Summary:');
    console.log('===============================');
    console.log(`   🌾 ${collectionEvents.length} collection events → ${rawMaterialBatches.length} raw material batches`);
    console.log(`   🏭 ${rawMaterialBatches.length} raw materials → ${finishedGoods.length} finished goods (via compositions)`);
    console.log(`   🔬 ${labTests.length} lab tests → ${certificates.length} certificates`);
    console.log(`   📦 ${finishedGoods.length} finished goods → ${distributorInventory.length} inventory items`);
    console.log(`   🚚 ${distributorInventory.length} inventory → ${shipments.length} shipments with ${shipments.length} items`);
    console.log(`   📱 ${qrCodes.length} QR codes linked to all major entities`);
    console.log(`   📄 ${documents.length} documents supporting raw materials and finished goods`);
    console.log(`   🔄 ${supplyChainEvents.length} supply chain events tracking full journey`);

    console.log('\n🔑 Demo User Credentials:');
    console.log('=========================');
    demoUsers.forEach(user => {
      console.log(`   📧 ${user.email}`);
      console.log(`      Password: ${user.password}`);
      console.log(`      Role: ${user.role} (${user.orgType})`);
      console.log(`      Name: ${user.firstName} ${user.lastName}`);
      console.log('');
    });

    console.log('🎉 Comprehensive database seeding with proper linking completed successfully!');
    console.log('🌐 All entities are properly linked and will display correctly on the website.');
    console.log('📊 You can now test complete traceability from farmer to end consumer.');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

// Run the seeding
seedAllTablesWithProperLinking()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });