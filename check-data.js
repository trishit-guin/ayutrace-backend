const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkExistingData() {
  try {
    console.log('🔍 Checking existing data in database...\n');

    // Check organizations
    const organizations = await prisma.organization.findMany({
      take: 5,
      select: {
        organizationId: true,
        type: true
      }
    });

    console.log('📋 Organizations:');
    if (organizations.length > 0) {
      organizations.forEach(org => {
        console.log(`  - ${org.organizationId} (${org.type})`);
      });
    } else {
      console.log('  No organizations found');
    }
    console.log('');

    // Check users
    const users = await prisma.user.findMany({
      take: 5,
      select: {
        userId: true,
        firstName: true,
        lastName: true,
        organizationId: true
      }
    });

    console.log('👥 Users:');
    if (users.length > 0) {
      users.forEach(user => {
        console.log(`  - ${user.userId} (${user.firstName} ${user.lastName}) - Org: ${user.organizationId}`);
      });
    } else {
      console.log('  No users found');
    }
    console.log('');

    // Check lab tests
    const labTests = await prisma.labTest.count();
    console.log(`🧪 Lab Tests: ${labTests}`);

    // Check supply chain events
    const supplyChainEvents = await prisma.supplyChainEvent.count();
    console.log(`🔗 Supply Chain Events: ${supplyChainEvents}`);

    // Check QR codes
    const qrCodes = await prisma.qRCode.count();
    console.log(`📱 QR Codes: ${qrCodes}`);

    // Check certificates
    const certificates = await prisma.certificate.count();
    console.log(`🏆 Certificates: ${certificates}`);

  } catch (error) {
    console.error('❌ Error checking data:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkExistingData();