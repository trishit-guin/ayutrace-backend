const { PrismaClient } = require('@prisma/client');
const { initDefaultOrganizations, getAllOrganizations } = require('./utils/initDefaultOrganizations');

const prisma = new PrismaClient();

async function testOrganizationCreation() {
  try {
    console.log('🧪 Testing Default Organizations Creation');
    console.log('=====================================');
    
    // Initialize default organizations
    await initDefaultOrganizations();
    
    // Get and display all organizations
    console.log('\n📋 All Organizations:');
    const orgs = await getAllOrganizations();
    
    orgs.forEach((org, index) => {
      console.log(`${index + 1}. ${org.type}`);
      console.log(`   ID: ${org.organizationId}`);
      console.log(`   Active: ${org.isActive}`);
      console.log(`   Users: ${org._count.users}`);
      console.log('');
    });
    
    console.log(`✅ Total organizations: ${orgs.length}`);
    console.log('🎉 Organization creation test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

// Run the test
testOrganizationCreation();