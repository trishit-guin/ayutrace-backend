const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const initSuperAdmin = async () => {
    try {
        console.log('🔍 Checking for existing super admin...');
        
        // Check if any super admin exists
        const existingSuperAdmin = await prisma.user.findFirst({
            where: { role: 'SUPER_ADMIN' }
        });

        if (existingSuperAdmin) {
            console.log('✅ Super admin already exists:', existingSuperAdmin.email);
            return;
        }

        console.log('🚀 No super admin found. Creating default super admin...');

        // Get or create admin organization
        let adminOrg = await prisma.organization.findFirst({
            where: { type: 'ADMIN' }
        });

        if (!adminOrg) {
            adminOrg = await prisma.organization.create({
                data: {
                    type: 'ADMIN',
                    isActive: true
                }
            });
            console.log('📋 Created admin organization');
        }

        // Hash default password
        const defaultPassword = 'superadmin123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(defaultPassword, salt);

        // Create super admin user
        const superAdmin = await prisma.user.create({
            data: {
                email: 'superadmin@ayutrace.com',
                passwordHash: hashedPassword,
                firstName: 'Super',
                lastName: 'Admin',
                orgType: 'ADMIN',
                role: 'SUPER_ADMIN',
                isActive: true,
                isVerified: true,
                organizationId: adminOrg.organizationId
            }
        });

        console.log('✅ Super admin created successfully!');
        console.log('📧 Email: superadmin@ayutrace.com');
        console.log('🔑 Password: superadmin123');
        console.log('⚠️  Please change the password after first login!');

    } catch (error) {
        console.error('❌ Error initializing super admin:', error);
        throw error;
    }
};

module.exports = { initSuperAdmin };