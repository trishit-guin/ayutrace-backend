const { PrismaClient } = require('@prisma/client');
const { initSuperAdmin } = require('./utils/initSuperAdmin');

const prisma = new PrismaClient();

const testSuperAdminInit = async () => {
    try {
        console.log('🧪 Testing super admin initialization...');
        
        // First, let's check current state
        const existingSuperAdmins = await prisma.user.findMany({
            where: { role: 'SUPER_ADMIN' }
        });
        
        console.log(`📊 Found ${existingSuperAdmins.length} existing super admin(s)`);
        
        if (existingSuperAdmins.length > 0) {
            console.log('✅ Super admin initialization working correctly - existing admin detected');
            existingSuperAdmins.forEach(admin => {
                console.log(`   - ${admin.firstName} ${admin.lastName} (${admin.email})`);
            });
        }
        
        // Test the initialization function
        await initSuperAdmin();
        
        console.log('✅ Super admin initialization test completed successfully');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await prisma.$disconnect();
    }
};

// Run the test
testSuperAdminInit();