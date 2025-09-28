const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const defaultOrganizations = [
  {
    type: 'FARMER',
    name: 'Default Farmer Organization',
    description: 'Default organization for farmers collecting medicinal herbs'
  },
  {
    type: 'MANUFACTURER',
    name: 'Default Manufacturer Organization', 
    description: 'Default organization for manufacturers processing medicinal herbs'
  },
  {
    type: 'LABS',
    name: 'Default Laboratory Organization',
    description: 'Default organization for laboratories testing medicinal herbs'
  },
  {
    type: 'DISTRIBUTOR',
    name: 'Default Distributor Organization',
    description: 'Default organization for distributors handling medicinal herb products'
  },
  {
    type: 'ADMIN',
    name: 'Default Admin Organization',
    description: 'Default organization for system administrators'
  }
];

/**
 * Initialize default organizations if they don't exist
 */
const initDefaultOrganizations = async () => {
  try {
    console.log('🏢 Checking for default organizations...');
    
    for (const orgData of defaultOrganizations) {
      // Check if organization of this type already exists
      const existingOrg = await prisma.organization.findFirst({
        where: {
          type: orgData.type
        }
      });

      if (!existingOrg) {
        // Create the default organization
        const createdOrg = await prisma.organization.create({
          data: {
            type: orgData.type,
            isActive: true
          }
        });

        console.log(`✅ Created default ${orgData.type} organization: ${createdOrg.organizationId}`);
      } else {
        console.log(`🔍 ${orgData.type} organization already exists: ${existingOrg.organizationId}`);
      }
    }

    console.log('🎉 Default organizations initialization completed');
    
    // Log summary of all organizations
    const allOrgs = await prisma.organization.findMany({
      select: {
        organizationId: true,
        type: true,
        isActive: true,
        _count: {
          select: {
            users: true
          }
        }
      }
    });

    console.log('📊 Current organizations summary:');
    allOrgs.forEach(org => {
      console.log(`   • ${org.type}: ${org.organizationId} (${org._count.users} users, ${org.isActive ? 'active' : 'inactive'})`);
    });

  } catch (error) {
    console.error('❌ Failed to initialize default organizations:', error.message);
    console.error('Full error:', error);
    throw error;
  }
};

/**
 * Get organization by type
 */
const getOrganizationByType = async (orgType) => {
  try {
    const organization = await prisma.organization.findFirst({
      where: {
        type: orgType,
        isActive: true
      }
    });
    return organization;
  } catch (error) {
    console.error(`❌ Failed to get ${orgType} organization:`, error.message);
    throw error;
  }
};

/**
 * Get all organizations
 */
const getAllOrganizations = async () => {
  try {
    const organizations = await prisma.organization.findMany({
      where: {
        isActive: true
      },
      include: {
        _count: {
          select: {
            users: true
          }
        }
      }
    });
    return organizations;
  } catch (error) {
    console.error('❌ Failed to get organizations:', error.message);
    throw error;
  }
};

module.exports = {
  initDefaultOrganizations,
  getOrganizationByType,
  getAllOrganizations,
  defaultOrganizations
};