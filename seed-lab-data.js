const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedLabData() {
  try {
    console.log('🌱 Starting lab data seeding...');

    // Create lab organizations
    const labOrgs = await Promise.all([
      prisma.organization.create({
        data: {
          type: 'LABS'
        }
      }),
      prisma.organization.create({
        data: {
          type: 'LABS'
        }
      })
    ]);

    console.log(`✅ Created ${labOrgs.length} lab organizations`);

    // Create lab users (technicians and requesters)
    const labUsers = await Promise.all([
      // Lab technicians
      prisma.user.create({
        data: {
          email: 'tech1@ayutracelab.com',
          passwordHash: '$2a$10$example.hash.for.password123', // bcrypt hash for 'password123'
          firstName: 'Dr. Priya',
          lastName: 'Sharma',
          orgType: 'LABS',
          phone: '+91-9876543210',
          location: 'Mumbai, Maharashtra',
          latitude: 19.0760,
          longitude: 72.8777,
          organizationId: labOrgs[0].organizationId
        }
      }),
      prisma.user.create({
        data: {
          email: 'tech2@ayutracelab.com',
          passwordHash: '$2a$10$example.hash.for.password123',
          firstName: 'Dr. Rajesh',
          lastName: 'Kumar',
          orgType: 'LABS',
          phone: '+91-9876543211',
          location: 'Delhi, Delhi',
          latitude: 28.7041,
          longitude: 77.1025,
          organizationId: labOrgs[1].organizationId
        }
      }),
      // Sample requesters (manufacturers/farmers)
      prisma.user.create({
        data: {
          email: 'manufacturer1@ayurvedicco.com',
          passwordHash: '$2a$10$example.hash.for.password123',
          firstName: 'Suresh',
          lastName: 'Patel',
          orgType: 'MANUFACTURER',
          phone: '+91-9876543212',
          location: 'Pune, Maharashtra',
          latitude: 18.5204,
          longitude: 73.8567,
          organizationId: labOrgs[0].organizationId // Using same org for simplicity
        }
      }),
      prisma.user.create({
        data: {
          email: 'farmer1@herbs.com',
          passwordHash: '$2a$10$example.hash.for.password123',
          firstName: 'Ramesh',
          lastName: 'Singh',
          orgType: 'FARMER',
          phone: '+91-9876543213',
          location: 'Haridwar, Uttarakhand',
          latitude: 29.9457,
          longitude: 78.1642,
          organizationId: labOrgs[1].organizationId // Using same org for simplicity
        }
      })
    ]);

    console.log(`✅ Created ${labUsers.length} lab users`);

    // Create sample herb species
    const herbSpecies = await Promise.all([
      prisma.herbSpecies.create({
        data: {
          commonName: 'Ashwagandha',
          scientificName: 'Withania somnifera',
          description: 'Adaptogenic herb used in Ayurvedic medicine',
          conservationStatus: 'LEAST_CONCERN'
        }
      }),
      prisma.herbSpecies.create({
        data: {
          commonName: 'Turmeric',
          scientificName: 'Curcuma longa',
          description: 'Anti-inflammatory spice with medicinal properties',
          conservationStatus: 'LEAST_CONCERN'
        }
      })
    ]);

    console.log(`✅ Created ${herbSpecies.length} herb species`);

    // Create sample raw material batches
    const rawBatches = await Promise.all([
      prisma.rawMaterialBatch.create({
        data: {
          herbName: 'Ashwagandha Root',
          scientificName: 'Withania somnifera',
          quantity: 50.0,
          unit: 'KG',
          status: 'PROCESSED',
          description: 'Premium quality ashwagandha roots from Rajasthan',
          currentOwnerId: labUsers[2].userId // Manufacturer
        }
      }),
      prisma.rawMaterialBatch.create({
        data: {
          herbName: 'Turmeric Powder',
          scientificName: 'Curcuma longa',
          quantity: 100.0,
          unit: 'KG',
          status: 'PROCESSED',
          description: 'Organic turmeric powder from Kerala',
          currentOwnerId: labUsers[3].userId // Farmer
        }
      })
    ]);

    console.log(`✅ Created ${rawBatches.length} raw material batches`);

    // Create sample finished goods
    const finishedGoods = await Promise.all([
      prisma.finishedGood.create({
        data: {
          productName: 'Ashwagandha Capsules Premium',
          productType: 'CAPSULE',
          quantity: 1000,
          unit: 'PIECES',
          manufacturerId: labUsers[2].userId,
          description: 'High-quality ashwagandha capsules for stress relief',
          batchNumber: 'ASH-2024-001',
          expiryDate: new Date('2026-12-31')
        }
      }),
      prisma.finishedGood.create({
        data: {
          productName: 'Turmeric Tablets',
          productType: 'TABLET',
          quantity: 500,
          unit: 'PIECES',
          manufacturerId: labUsers[2].userId,
          description: 'Curcumin-rich turmeric tablets for joint health',
          batchNumber: 'TUR-2024-001',
          expiryDate: new Date('2025-12-31')
        }
      })
    ]);

    console.log(`✅ Created ${finishedGoods.length} finished goods`);

    // Create sample lab tests
    const labTests = await Promise.all([
      // Pending test
      prisma.labTest.create({
        data: {
          testType: 'HEAVY_METALS_ANALYSIS',
          status: 'PENDING',
          sampleName: 'Ashwagandha Root Sample-001',
          sampleType: 'Raw Material',
          sampleDescription: 'Testing for lead, mercury, cadmium content',
          batchNumber: 'ASH-RM-2024-001',
          collectionDate: new Date('2024-09-10'),
          priority: 'HIGH',
          notes: 'Urgent testing required for export compliance',
          requesterId: labUsers[2].userId, // Manufacturer
          organizationId: labOrgs[0].organizationId,
          batchId: rawBatches[0].batchId
        }
      }),
      // In progress test
      prisma.labTest.create({
        data: {
          testType: 'ADULTERATION_TESTING',
          status: 'IN_PROGRESS',
          sampleName: 'Turmeric Powder Sample-002',
          sampleType: 'Raw Material',
          sampleDescription: 'Testing for synthetic additives and colorants',
          batchNumber: 'TUR-RM-2024-001',
          collectionDate: new Date('2024-09-12'),
          testDate: new Date('2024-09-13'),
          priority: 'MEDIUM',
          methodology: 'HPLC analysis with UV detection',
          equipment: 'Agilent 1260 HPLC System',
          notes: 'Initial screening completed, detailed analysis in progress',
          requesterId: labUsers[3].userId, // Farmer
          labTechnicianId: labUsers[1].userId, // Lab tech
          organizationId: labOrgs[1].organizationId,
          batchId: rawBatches[1].batchId
        }
      }),
      // Completed test
      prisma.labTest.create({
        data: {
          testType: 'MICROBIOLOGICAL_TESTING',
          status: 'COMPLETED',
          sampleName: 'Ashwagandha Capsules-001',
          sampleType: 'Finished Product',
          sampleDescription: 'Testing for bacterial and fungal contamination',
          batchNumber: 'ASH-2024-001',
          collectionDate: new Date('2024-09-05'),
          testDate: new Date('2024-09-06'),
          completionDate: new Date('2024-09-08'),
          priority: 'URGENT',
          methodology: 'USP microbial limits testing',
          equipment: 'Laminar flow hood, incubators',
          notes: 'All parameters within acceptable limits',
          cost: 2500.00,
          certificationNumber: 'CERT-2024-001',
          results: {
            total_aerobic_count: '< 10^3 CFU/g',
            yeast_mold_count: '< 10^2 CFU/g',
            e_coli: 'Absent',
            salmonella: 'Absent',
            conclusion: 'PASS - Product meets microbiological standards'
          },
          requesterId: labUsers[2].userId, // Manufacturer
          labTechnicianId: labUsers[0].userId, // Lab tech
          organizationId: labOrgs[0].organizationId,
          finishedGoodId: finishedGoods[0].productId
        }
      }),
      // Another completed test for certificate generation
      prisma.labTest.create({
        data: {
          testType: 'ACTIVE_INGREDIENT_ANALYSIS',
          status: 'COMPLETED',
          sampleName: 'Turmeric Tablets-001',
          sampleType: 'Finished Product',
          sampleDescription: 'Curcumin content analysis',
          batchNumber: 'TUR-2024-001',
          collectionDate: new Date('2024-09-01'),
          testDate: new Date('2024-09-02'),
          completionDate: new Date('2024-09-04'),
          priority: 'MEDIUM',
          methodology: 'HPLC with UV detection at 425nm',
          equipment: 'Shimadzu LC-20A HPLC',
          notes: 'Curcumin content meets specification',
          cost: 3000.00,
          certificationNumber: 'CERT-2024-002',
          results: {
            curcumin_content: '95.2%',
            moisture_content: '2.1%',
            ash_content: '0.8%',
            heavy_metals: 'Within limits',
            conclusion: 'PASS - Product meets quality specifications'
          },
          requesterId: labUsers[2].userId, // Manufacturer
          labTechnicianId: labUsers[1].userId, // Lab tech
          organizationId: labOrgs[1].organizationId,
          finishedGoodId: finishedGoods[1].productId
        }
      })
    ]);

    console.log(`✅ Created ${labTests.length} lab tests`);

    // Create sample certificates
    const certificates = await Promise.all([
      prisma.certificate.create({
        data: {
          certificateNumber: 'AYU-QUAL-2024-001',
          certificateType: 'QUALITY_CERTIFICATE',
          title: 'Quality Assurance Certificate - Ashwagandha Capsules',
          description: 'This certificate confirms that the tested batch meets all quality parameters for safety and efficacy',
          issueDate: new Date('2024-09-08'),
          expiryDate: new Date('2025-09-08'),
          organizationId: labOrgs[0].organizationId,
          issuerId: labUsers[0].userId, // Lab tech
          testId: labTests[2].testId,
          digitalSignature: 'SHA256:a1b2c3d4e5f6...',
          qrCodeData: JSON.stringify({
            certificateId: 'will-be-updated',
            issueDate: '2024-09-08',
            type: 'QUALITY_CERTIFICATE'
          })
        }
      }),
      prisma.certificate.create({
        data: {
          certificateNumber: 'AYU-COMP-2024-001',
          certificateType: 'AYUSH_COMPLIANCE',
          title: 'AYUSH Compliance Certificate - Turmeric Tablets',
          description: 'This certificate confirms compliance with AYUSH ministry guidelines for ayurvedic medicines',
          issueDate: new Date('2024-09-04'),
          expiryDate: new Date('2026-09-04'),
          organizationId: labOrgs[1].organizationId,
          issuerId: labUsers[1].userId, // Lab tech
          testId: labTests[3].testId,
          digitalSignature: 'SHA256:f6e5d4c3b2a1...',
          qrCodeData: JSON.stringify({
            certificateId: 'will-be-updated',
            issueDate: '2024-09-04',
            type: 'AYUSH_COMPLIANCE'
          })
        }
      })
    ]);

    console.log(`✅ Created ${certificates.length} certificates`);

    // Generate QR codes for lab tests and certificates
    const qrCodes = await Promise.all([
      // QR for completed lab test
      prisma.qRCode.create({
        data: {
          qrHash: 'lab-test-' + Math.random().toString(36).substring(7),
          entityType: 'LAB_TEST',
          entityId: labTests[2].testId,
          generatedBy: labUsers[0].userId,
          customData: {
            testType: 'MICROBIOLOGICAL_TESTING',
            status: 'COMPLETED',
            sampleName: 'Ashwagandha Capsules-001'
          },
          labTestId: labTests[2].testId
        }
      }),
      // QR for certificate
      prisma.qRCode.create({
        data: {
          qrHash: 'certificate-' + Math.random().toString(36).substring(7),
          entityType: 'CERTIFICATE',
          entityId: certificates[0].certificateId,
          generatedBy: labUsers[0].userId,
          customData: {
            certificateType: 'QUALITY_CERTIFICATE',
            certificateNumber: 'AYU-QUAL-2024-001'
          }
        }
      })
    ]);

    console.log(`✅ Created ${qrCodes.length} QR codes`);

    console.log('\n🎉 Lab data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • Lab Organizations: ${labOrgs.length}`);
    console.log(`   • Lab Users: ${labUsers.length}`);
    console.log(`   • Herb Species: ${herbSpecies.length}`);
    console.log(`   • Raw Material Batches: ${rawBatches.length}`);
    console.log(`   • Finished Goods: ${finishedGoods.length}`);
    console.log(`   • Lab Tests: ${labTests.length}`);
    console.log(`   • Certificates: ${certificates.length}`);
    console.log(`   • QR Codes: ${qrCodes.length}`);

    console.log('\n🔐 Sample Login Credentials:');
    console.log('   Lab Technician 1: tech1@ayutracelab.com / password123');
    console.log('   Lab Technician 2: tech2@ayutracelab.com / password123');
    console.log('   Manufacturer: manufacturer1@ayurvedicco.com / password123');
    console.log('   Farmer: farmer1@herbs.com / password123');

  } catch (error) {
    console.error('❌ Error seeding lab data:', error);
    throw error;
  }
}

// Run the seed function
if (require.main === module) {
  seedLabData()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { seedLabData };