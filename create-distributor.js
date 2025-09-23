const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createDistributorUser() {
  try {
    // Check if distributor organization exists
    let distributorOrg = await prisma.organization.findFirst({
      where: { type: 'DISTRIBUTOR' }
    });

    if (!distributorOrg) {
      console.log('Creating DISTRIBUTOR organization...');
      distributorOrg = await prisma.organization.create({
        data: {
          name: 'Green Valley Distributors',
          type: 'DISTRIBUTOR',
          address: 'Mumbai, Maharashtra, India',
          contactEmail: 'contact@greenvalley.com',
          contactPhone: '+91-9876543210',
          isActive: true
        }
      });
      console.log('✅ DISTRIBUTOR organization created');
    } else {
      console.log('✅ DISTRIBUTOR organization already exists');
    }

    // Check if distributor user exists
    const existingDistributor = await prisma.user.findFirst({
      where: { 
        email: 'distributor@ayutrace.com',
        orgType: 'DISTRIBUTOR'
      }
    });

    if (existingDistributor) {
      console.log('✅ Distributor user already exists');
      return;
    }

    // Create distributor user
    const hashedPassword = await bcrypt.hash('distributor123', 10);
    
    const distributorUser = await prisma.user.create({
      data: {
        email: 'distributor@ayutrace.com',
        passwordHash: hashedPassword,
        firstName: 'John',
        lastName: 'Distributor',
        orgType: 'DISTRIBUTOR',
        role: 'USER',
        isActive: true,
        isVerified: true,
        organizationId: distributorOrg.organizationId
      }
    });

    console.log('✅ Distributor user created successfully!');
    console.log('📧 Email: distributor@ayutrace.com');
    console.log('🔑 Password: distributor123');
    console.log('🔐 Role: USER (Distributor)');
    console.log('🏢 Organization:', distributorOrg.name);

    // Create some sample inventory items for testing
    await prisma.distributorInventory.createMany({
      data: [
        {
          distributorId: distributorUser.userId,
          productType: 'RAW_MATERIAL_BATCH',
          entityId: 'batch-001',
          quantity: 150,
          unit: 'KG',
          location: 'Warehouse A-1',
          warehouseSection: 'Section A',
          status: 'IN_STOCK',
          receivedDate: new Date(),
          expiryDate: new Date('2025-06-15'),
          supplierInfo: { name: 'Himalayan Herbs Ltd', contact: '+91-9876543211' },
          qualityNotes: 'Premium quality ashwagandha extract',
          storageConditions: 'Cool, dry place'
        },
        {
          distributorId: distributorUser.userId,
          productType: 'FINISHED_GOOD',
          entityId: 'product-002',
          quantity: 75,
          unit: 'BOTTLES',
          location: 'Warehouse B-2',
          warehouseSection: 'Section B',
          status: 'LOW_STOCK',
          receivedDate: new Date(),
          expiryDate: new Date('2025-08-20'),
          supplierInfo: { name: 'Ayurvedic Solutions Inc', contact: '+91-9876543212' },
          qualityNotes: 'Quality tested turmeric capsules',
          storageConditions: 'Room temperature'
        },
        {
          distributorId: distributorUser.userId,
          productType: 'RAW_MATERIAL_BATCH',
          entityId: 'batch-003',
          quantity: 0,
          unit: 'KG',
          location: 'Warehouse C-1',
          warehouseSection: 'Section C',
          status: 'OUT_OF_STOCK',
          receivedDate: new Date(),
          expiryDate: new Date('2025-04-10'),
          supplierInfo: { name: 'Natural Extracts Inc', contact: '+91-9876543213' },
          qualityNotes: 'Organic neem oil extract',
          storageConditions: 'Cool storage required'
        }
      ]
    });

    console.log('✅ Sample distributor inventory created');

  } catch (error) {
    console.error('❌ Error creating distributor user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDistributorUser();