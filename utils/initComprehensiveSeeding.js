const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Comprehensive seeding data for the AyuTrace system
 */

// Default Organizations
const defaultOrganizations = [
  { type: 'FARMER', description: 'Default organization for herb farmers and collectors' },
  { type: 'MANUFACTURER', description: 'Default organization for Ayurvedic medicine manufacturers' },
  { type: 'LABS', description: 'Default organization for quality testing laboratories' },
  { type: 'DISTRIBUTOR', description: 'Default organization for distributors and retailers' },
  { type: 'ADMIN', description: 'Default organization for system administrators' }
];

// Default System Alerts
const defaultSystemAlerts = [
  {
    alertType: 'SYSTEM_ERROR',
    severity: 'LOW',
    title: 'System Initialization',
    message: 'AyuTrace backend system has been successfully initialized with default data.',
    isRead: false,
    isResolved: true,
    entityType: 'SYSTEM',
    entityId: 'init',
    resolvedAt: new Date()
  },
  {
    alertType: 'DATA_ANOMALY',
    severity: 'MEDIUM',
    title: 'Default Organizations Created',
    message: 'System has automatically created default organizations for all entity types.',
    isRead: false,
    isResolved: true,
    entityType: 'ORGANIZATION',
    resolvedAt: new Date()
  },
  {
    alertType: 'COMPLIANCE_VIOLATION',
    severity: 'HIGH',
    title: 'Setup Super Admin',
    message: 'Please ensure a super admin user is created for system management.',
    isRead: false,
    isResolved: false,
    entityType: 'USER'
  }
];

// Default Herb Species (Popular Ayurvedic herbs)
const defaultHerbSpecies = [
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
    description: 'Memory-enhancing herb used for cognitive support and mental clarity.',
    medicinalUses: ['Memory enhancement', 'Cognitive support', 'Anxiety relief', 'Brain health'],
    nativeRegions: ['India', 'Australia', 'Europe'],
    harvestingSeason: 'Summer',
    partsUsed: ['Whole plant'],
    conservationStatus: 'LEAST_CONCERN'
  },
  {
    commonName: 'Neem',
    scientificName: 'Azadirachta indica',
    family: 'Meliaceae',
    description: 'Versatile medicinal tree known for its antimicrobial and purifying properties.',
    medicinalUses: ['Antimicrobial', 'Skin health', 'Blood purification', 'Dental care'],
    nativeRegions: ['India', 'Myanmar', 'Bangladesh'],
    harvestingSeason: 'Year-round',
    partsUsed: ['Leaves', 'Bark', 'Seeds', 'Oil'],
    conservationStatus: 'LEAST_CONCERN'
  }
];

/**
 * Initialize default organizations
 */
const initDefaultOrganizations = async () => {
  console.log('🏢 Initializing default organizations...');
  const createdOrgs = [];
  
  for (const orgData of defaultOrganizations) {
    const existingOrg = await prisma.organization.findFirst({
      where: { type: orgData.type }
    });

    if (!existingOrg) {
      const createdOrg = await prisma.organization.create({
        data: {
          type: orgData.type,
          isActive: true
        }
      });
      createdOrgs.push(createdOrg);
      console.log(`   ✅ Created ${orgData.type} organization`);
    } else {
      console.log(`   🔍 ${orgData.type} organization already exists`);
    }
  }
  
  return createdOrgs;
};

/**
 * Initialize system alerts
 */
const initSystemAlerts = async () => {
  console.log('🚨 Initializing system alerts...');
  const createdAlerts = [];
  
  for (const alertData of defaultSystemAlerts) {
    const existingAlert = await prisma.systemAlert.findFirst({
      where: {
        title: alertData.title,
        alertType: alertData.alertType
      }
    });

    if (!existingAlert) {
      const createdAlert = await prisma.systemAlert.create({
        data: {
          ...alertData,
          metadata: {
            source: 'system_initialization',
            timestamp: new Date().toISOString()
          }
        }
      });
      createdAlerts.push(createdAlert);
      console.log(`   ✅ Created alert: ${alertData.title}`);
    } else {
      console.log(`   🔍 Alert already exists: ${alertData.title}`);
    }
  }
  
  return createdAlerts;
};

/**
 * Initialize default herb species
 */
const initDefaultHerbSpecies = async () => {
  console.log('🌿 Initializing default herb species...');
  const createdSpecies = [];
  
  for (const speciesData of defaultHerbSpecies) {
    const existingSpecies = await prisma.herbSpecies.findFirst({
      where: {
        OR: [
          { scientificName: speciesData.scientificName },
          { commonName: speciesData.commonName }
        ]
      }
    });

    if (!existingSpecies) {
      const createdSpecies_item = await prisma.herbSpecies.create({
        data: {
          ...speciesData,
          regulatoryInfo: {
            status: 'approved',
            certifications: ['organic', 'ayush'],
            restrictions: null
          }
        }
      });
      createdSpecies.push(createdSpecies_item);
      console.log(`   ✅ Created species: ${speciesData.commonName} (${speciesData.scientificName})`);
    } else {
      console.log(`   🔍 Species already exists: ${speciesData.commonName}`);
    }
  }
  
  return createdSpecies;
};

/**
 * Initialize admin actions for system events
 */
const initSystemAdminActions = async () => {
  console.log('👤 Initializing system admin actions...');
  
  // Get admin organization
  const adminOrg = await prisma.organization.findFirst({
    where: { type: 'ADMIN' }
  });
  
  if (!adminOrg) {
    console.log('   ⚠️  No admin organization found, skipping admin actions');
    return [];
  }

  // Check if we have any admin users
  const adminUser = await prisma.user.findFirst({
    where: {
      organizationId: adminOrg.organizationId,
      role: { in: ['ADMIN', 'SUPER_ADMIN'] }
    }
  });

  if (!adminUser) {
    console.log('   ⚠️  No admin users found, will create system actions after super admin is created');
    return [];
  }

  const systemActions = [
    {
      actionType: 'ORGANIZATION_CREATED',
      description: 'System automatically created default organizations during initialization',
      adminUserId: adminUser.userId,
      metadata: {
        organizationsCreated: defaultOrganizations.map(org => org.type),
        source: 'system_initialization'
      }
    },
    {
      actionType: 'SYSTEM_CONFIG_UPDATED',
      description: 'Initial system configuration completed with default data seeding',
      adminUserId: adminUser.userId,
      metadata: {
        configType: 'default_data_seeding',
        source: 'system_initialization'
      }
    }
  ];

  const createdActions = [];
  for (const actionData of systemActions) {
    const createdAction = await prisma.adminAction.create({
      data: actionData
    });
    createdActions.push(createdAction);
    console.log(`   ✅ Created admin action: ${actionData.description}`);
  }
  
  return createdActions;
};

/**
 * Master initialization function
 */
const initAllDefaultData = async () => {
  try {
    console.log('🚀 Starting comprehensive system data initialization...');
    console.log('===============================================');
    
    // Initialize organizations first (required for other entities)
    const organizations = await initDefaultOrganizations();
    
    // Initialize herb species
    const herbSpecies = await initDefaultHerbSpecies();
    
    // Initialize system alerts
    const alerts = await initSystemAlerts();
    
    // Initialize admin actions (after checking for admin users)
    const adminActions = await initSystemAdminActions();
    
    // Summary
    console.log('\n📊 Initialization Summary:');
    console.log(`   🏢 Organizations: ${organizations.length} created`);
    console.log(`   🌿 Herb Species: ${herbSpecies.length} created`);
    console.log(`   🚨 System Alerts: ${alerts.length} created`);
    console.log(`   👤 Admin Actions: ${adminActions.length} created`);
    
    // Get current totals
    const totalOrgs = await prisma.organization.count();
    const totalSpecies = await prisma.herbSpecies.count();
    const totalAlerts = await prisma.systemAlert.count();
    const totalUsers = await prisma.user.count();
    
    console.log('\n🎯 Current Database Totals:');
    console.log(`   🏢 Total Organizations: ${totalOrgs}`);
    console.log(`   🌿 Total Herb Species: ${totalSpecies}`);
    console.log(`   🚨 Total System Alerts: ${totalAlerts}`);
    console.log(`   👤 Total Users: ${totalUsers}`);
    
    console.log('\n🎉 Comprehensive system initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Failed to initialize default data:', error.message);
    console.error('Full error:', error);
    throw error;
  }
};

/**
 * Helper functions for getting seeded data
 */
const getOrganizationByType = async (orgType) => {
  return await prisma.organization.findFirst({
    where: { type: orgType, isActive: true }
  });
};

const getAllOrganizations = async () => {
  return await prisma.organization.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: { users: true }
      }
    }
  });
};

const getActiveAlerts = async () => {
  return await prisma.systemAlert.findMany({
    where: { isResolved: false },
    orderBy: [
      { severity: 'desc' },
      { createdAt: 'desc' }
    ]
  });
};

const getHerbSpeciesByName = async (commonName) => {
  return await prisma.herbSpecies.findFirst({
    where: { commonName: { contains: commonName, mode: 'insensitive' } }
  });
};

module.exports = {
  initAllDefaultData,
  initDefaultOrganizations,
  initSystemAlerts,
  initDefaultHerbSpecies,
  initSystemAdminActions,
  getOrganizationByType,
  getAllOrganizations,
  getActiveAlerts,
  getHerbSpeciesByName,
  defaultOrganizations,
  defaultSystemAlerts,
  defaultHerbSpecies
};