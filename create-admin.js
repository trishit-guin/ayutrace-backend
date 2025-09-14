const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Check if admin organization exists
    let adminOrg = await prisma.organization.findFirst({
      where: { type: 'ADMIN' }
    });

    if (!adminOrg) {
      console.log('Creating ADMIN organization...');
      adminOrg = await prisma.organization.create({
        data: {
          type: 'ADMIN',
          isActive: true
        }
      });
      console.log('✅ ADMIN organization created');
    } else {
      console.log('✅ ADMIN organization already exists');
    }

    // Check if admin user exists
    const existingAdmin = await prisma.user.findFirst({
      where: { 
        email: 'admin@ayutrace.com',
        orgType: 'ADMIN'
      }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@ayutrace.com',
        passwordHash: hashedPassword,
        firstName: 'System',
        lastName: 'Administrator',
        orgType: 'ADMIN',
        role: 'SUPER_ADMIN',
        isActive: true,
        isVerified: true,
        organizationId: adminOrg.organizationId
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@ayutrace.com');
    console.log('🔑 Password: admin123');
    console.log('🔐 Role: SUPER_ADMIN');

    // Create some sample system alerts for demo
    await prisma.systemAlert.createMany({
      data: [
        {
          alertType: 'SYSTEM_ERROR',
          severity: 'HIGH',
          title: 'Database Connection Issue',
          message: 'Temporary database connection timeout detected',
          isRead: false,
          isResolved: false
        },
        {
          alertType: 'SECURITY_BREACH',
          severity: 'CRITICAL',
          title: 'Multiple Failed Login Attempts',
          message: 'Suspicious login activity detected from IP 192.168.1.100',
          isRead: false,
          isResolved: false
        },
        {
          alertType: 'QUALITY_ISSUE',
          severity: 'MEDIUM',
          title: 'Lab Test Anomaly',
          message: 'Unusual test results detected in batch #BT001',
          isRead: false,
          isResolved: false
        }
      ]
    });

    console.log('✅ Sample system alerts created');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();