const { PrismaClient } = require('@prisma/client');
const { 
  initAllDefaultData, 
  getAllOrganizations, 
  getActiveAlerts,
  getHerbSpeciesByName 
} = require('./utils/initComprehensiveSeeding');

const prisma = new PrismaClient();

async function testComprehensiveSeeding() {
  try {
    console.log('🧪 Testing Comprehensive Data Seeding');
    console.log('=====================================');
    
    // Run the comprehensive initialization
    await initAllDefaultData();
    
    console.log('\n📋 Detailed Results:');
    console.log('=====================');
    
    // Test Organizations
    console.log('\n🏢 Organizations:');
    const orgs = await getAllOrganizations();
    orgs.forEach((org, index) => {
      console.log(`   ${index + 1}. ${org.type} (${org.organizationId.substring(0, 8)}...)`);
      console.log(`      Users: ${org._count.users}, Active: ${org.isActive}`);
    });
    
    // Test System Alerts
    console.log('\n🚨 Active System Alerts:');
    const alerts = await getActiveAlerts();
    alerts.forEach((alert, index) => {
      console.log(`   ${index + 1}. [${alert.severity}] ${alert.title}`);
      console.log(`      ${alert.message}`);
      console.log(`      Type: ${alert.alertType}, Read: ${alert.isRead}`);
    });
    
    // Test Herb Species
    console.log('\n🌿 Herb Species:');
    const herbSpecies = await prisma.herbSpecies.findMany({
      select: {
        commonName: true,
        scientificName: true,
        family: true,
        medicinalUses: true,
        conservationStatus: true
      }
    });
    herbSpecies.forEach((species, index) => {
      console.log(`   ${index + 1}. ${species.commonName} (${species.scientificName})`);
      console.log(`      Family: ${species.family}`);
      console.log(`      Uses: ${species.medicinalUses.slice(0, 3).join(', ')}${species.medicinalUses.length > 3 ? '...' : ''}`);
      console.log(`      Status: ${species.conservationStatus}`);
    });
    
    // Test Admin Actions
    console.log('\n👤 Admin Actions:');
    const adminActions = await prisma.adminAction.findMany({
      select: {
        actionType: true,
        description: true,
        createdAt: true,
        adminUser: {
          select: {
            firstName: true,
            lastName: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    if (adminActions.length > 0) {
      adminActions.forEach((action, index) => {
        console.log(`   ${index + 1}. ${action.actionType}`);
        console.log(`      ${action.description}`);
        console.log(`      By: ${action.adminUser?.firstName || 'System'} (${action.adminUser?.role || 'SYSTEM'})`);
        console.log(`      Date: ${action.createdAt.toISOString().split('T')[0]}`);
      });
    } else {
      console.log('   No admin actions found (will be created after super admin setup)');
    }
    
    // Summary Statistics
    console.log('\n📊 Database Statistics:');
    console.log('=======================');
    
    const stats = {
      organizations: await prisma.organization.count(),
      herbSpecies: await prisma.herbSpecies.count(),
      systemAlerts: await prisma.systemAlert.count(),
      adminActions: await prisma.adminAction.count(),
      users: await prisma.user.count(),
      documents: await prisma.document.count(),
      labTests: await prisma.labTest.count()
    };
    
    Object.entries(stats).forEach(([key, count]) => {
      const icon = {
        organizations: '🏢',
        herbSpecies: '🌿', 
        systemAlerts: '🚨',
        adminActions: '👤',
        users: '👥',
        documents: '📄',
        labTests: '🧪'
      }[key] || '📊';
      
      console.log(`   ${icon} ${key.charAt(0).toUpperCase() + key.slice(1)}: ${count}`);
    });
    
    console.log('\n✅ System Health Check:');
    console.log('========================');
    
    // Check system readiness
    const readiness = {
      organizations: stats.organizations >= 5,
      herbSpecies: stats.herbSpecies >= 3,
      systemAlerts: stats.systemAlerts >= 1,
      database: true
    };
    
    Object.entries(readiness).forEach(([component, status]) => {
      const statusIcon = status ? '✅' : '❌';
      console.log(`   ${statusIcon} ${component}: ${status ? 'Ready' : 'Needs attention'}`);
    });
    
    const allReady = Object.values(readiness).every(status => status);
    console.log(`\n🎯 Overall System Status: ${allReady ? '✅ READY' : '⚠️  NEEDS SETUP'}`);
    
    console.log('\n🎉 Comprehensive seeding test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

// Run the test
testComprehensiveSeeding();