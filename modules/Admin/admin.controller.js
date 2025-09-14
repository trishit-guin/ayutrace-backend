const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Dashboard Overview
const getDashboardStats = async (req, res) => {
  try {
    // Get various statistics for dashboard
    const [
      totalUsers,
      totalOrganizations,
      totalRawMaterialBatches,
      totalFinishedGoods,
      totalLabTests,
      totalCertificates,
      totalQRCodes,
      recentUsers,
      recentLabTests,
      activeUsers,
      systemAlerts
    ] = await Promise.all([
      prisma.user.count(),
      prisma.organization.count(),
      prisma.rawMaterialBatch.count(),
      prisma.finishedGood.count(),
      prisma.labTest.count(),
      prisma.certificate.count(),
      prisma.qRCode.count(),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { organization: true }
      }),
      prisma.labTest.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { organization: true, requester: true }
      }),
      prisma.user.count({ where: { isActive: true } }),
      prisma.systemAlert.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        where: { isResolved: false }
      })
    ]);

    // Get organization breakdown
    const orgBreakdown = await prisma.organization.groupBy({
      by: ['type'],
      _count: { type: true },
      where: { isActive: true }
    });

    // Get monthly user registrations for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyStats = await prisma.user.groupBy({
      by: ['createdAt'],
      _count: { userId: true },
      where: {
        createdAt: {
          gte: sixMonthsAgo
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    const stats = {
      overview: {
        totalUsers,
        totalOrganizations,
        totalRawMaterialBatches,
        totalFinishedGoods,
        totalLabTests,
        totalCertificates,
        totalQRCodes,
        activeUsers
      },
      orgBreakdown,
      recentActivity: {
        recentUsers,
        recentLabTests
      },
      alerts: systemAlerts,
      monthlyStats
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard statistics' });
  }
};

// User Management
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', orgType = '', isActive } = req.query;
    const skip = (page - 1) * limit;
    
    const whereClause = {
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(orgType && { orgType }),
      ...(isActive !== undefined && { isActive: isActive === 'true' })
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        include: { organization: true },
        orderBy: { createdAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit)
      }),
      prisma.user.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive, isVerified } = req.body;
    const adminUserId = req.user.userId;

    const updateData = {};
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isVerified !== undefined) updateData.isVerified = isVerified;

    const updatedUser = await prisma.user.update({
      where: { userId },
      data: updateData,
      include: { organization: true }
    });

    // Log admin action
    await prisma.adminAction.create({
      data: {
        actionType: isActive !== undefined ? 
          (isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED') : 'USER_VERIFIED',
        description: `User ${updatedUser.firstName} ${updatedUser.lastName} was ${
          isActive !== undefined ? (isActive ? 'activated' : 'deactivated') : 'verified'
        }`,
        adminUserId,
        targetUserId: userId,
        metadata: { previousState: { isActive: !isActive, isVerified: !isVerified } }
      }
    });

    res.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ success: false, message: 'Failed to update user status' });
  }
};

// Create Admin User (Super Admin only)
const createAdminUser = async (req, res) => {
  try {
    const { email, firstName, lastName, password } = req.body;
    const adminUserId = req.user.userId;

    // Check if user is super admin
    if (req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only super admins can create admin users' 
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ 
      where: { email } 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    // Get admin organization
    const adminOrg = await prisma.organization.findFirst({
      where: { type: 'ADMIN' }
    });

    if (!adminOrg) {
      return res.status(500).json({ 
        success: false, 
        message: 'Admin organization not found' 
      });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin user
    const newAdminUser = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        orgType: 'ADMIN',
        role: 'ADMIN',
        isActive: true,
        isVerified: true,
        organizationId: adminOrg.organizationId
      },
      include: { organization: true }
    });

    // Log admin action
    await prisma.adminAction.create({
      data: {
        actionType: 'USER_CREATED',
        description: `Admin user ${firstName} ${lastName} created`,
        adminUserId,
        targetUserId: newAdminUser.userId,
        metadata: { 
          userType: 'ADMIN',
          createdBy: 'SUPER_ADMIN'
        }
      }
    });

    // Remove password from response
    const { passwordHash: _, ...userResponse } = newAdminUser;
    res.status(201).json({ success: true, data: userResponse });

  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({ success: false, message: 'Failed to create admin user' });
  }
};

// Update User Role (Super Admin only)
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const adminUserId = req.user.userId;

    // Check if user is super admin
    if (req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only super admins can change user roles' 
      });
    }

    // Validate role
    const validRoles = ['USER', 'ADMIN', 'SUPER_ADMIN'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid role specified' 
      });
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { userId }
    });

    if (!currentUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Prevent changing own role
    if (userId === adminUserId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot change your own role' 
      });
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { userId },
      data: { role },
      include: { organization: true }
    });

    // Log admin action
    await prisma.adminAction.create({
      data: {
        actionType: 'USER_UPDATED',
        description: `User ${updatedUser.firstName} ${updatedUser.lastName} role changed from ${currentUser.role} to ${role}`,
        adminUserId,
        targetUserId: userId,
        metadata: { 
          previousRole: currentUser.role,
          newRole: role
        }
      }
    });

    res.json({ success: true, data: updatedUser });

  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ success: false, message: 'Failed to update user role' });
  }
};

// Organization Management
const getAllOrganizations = async (req, res) => {
  try {
    const { type = '', isActive } = req.query;
    
    const whereClause = {
      ...(type && { type }),
      ...(isActive !== undefined && { isActive: isActive === 'true' })
    };

    const organizations = await prisma.organization.findMany({
      where: whereClause,
      include: {
        users: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            email: true,
            isActive: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            users: true,
            labTests: true,
            certificates: true
          }
        }
      },
      orderBy: { type: 'asc' }
    });

    res.json({ success: true, data: organizations });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch organizations' });
  }
};

const createOrganization = async (req, res) => {
  try {
    const { type } = req.body;
    const adminUserId = req.user.userId;

    const organization = await prisma.organization.create({
      data: { type }
    });

    // Log admin action
    await prisma.adminAction.create({
      data: {
        actionType: 'ORGANIZATION_CREATED',
        description: `New ${type} organization created`,
        adminUserId,
        targetOrganizationId: organization.organizationId,
        metadata: { organizationType: type }
      }
    });

    res.status(201).json({ success: true, data: organization });
  } catch (error) {
    console.error('Error creating organization:', error);
    res.status(500).json({ success: false, message: 'Failed to create organization' });
  }
};

const updateOrganization = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { isActive } = req.body;
    const adminUserId = req.user.userId;

    const organization = await prisma.organization.update({
      where: { organizationId },
      data: { isActive },
      include: { _count: { select: { users: true } } }
    });

    // Log admin action
    await prisma.adminAction.create({
      data: {
        actionType: 'ORGANIZATION_UPDATED',
        description: `Organization ${organization.type} was ${isActive ? 'activated' : 'deactivated'}`,
        adminUserId,
        targetOrganizationId: organizationId,
        metadata: { previousState: { isActive: !isActive } }
      }
    });

    res.json({ success: true, data: organization });
  } catch (error) {
    console.error('Error updating organization:', error);
    res.status(500).json({ success: false, message: 'Failed to update organization' });
  }
};

const deleteOrganization = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const adminUserId = req.user.userId;

    // Check if organization has users
    const userCount = await prisma.user.count({
      where: { organizationId }
    });

    if (userCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete organization with existing users'
      });
    }

    const organization = await prisma.organization.delete({
      where: { organizationId }
    });

    // Log admin action
    await prisma.adminAction.create({
      data: {
        actionType: 'ORGANIZATION_DELETED',
        description: `Organization ${organization.type} was deleted`,
        adminUserId,
        metadata: { deletedOrganization: organization }
      }
    });

    res.json({ success: true, message: 'Organization deleted successfully' });
  } catch (error) {
    console.error('Error deleting organization:', error);
    res.status(500).json({ success: false, message: 'Failed to delete organization' });
  }
};

// Supply Chain Monitoring
const getSupplyChainEvents = async (req, res) => {
  try {
    const { page = 1, limit = 20, eventType = '' } = req.query;
    const skip = (page - 1) * limit;
    
    const whereClause = {
      ...(eventType && { eventType })
    };

    const [events, total] = await Promise.all([
      prisma.supplyChainEvent.findMany({
        where: whereClause,
        include: {
          handler: { select: { firstName: true, lastName: true, email: true } },
          fromLocation: { select: { type: true } },
          toLocation: { select: { type: true } },
          rawMaterialBatch: { select: { herbName: true, status: true } },
          finishedGood: { select: { productName: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit)
      }),
      prisma.supplyChainEvent.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: {
        events,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching supply chain events:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch supply chain events' });
  }
};

// System Alerts
const getSystemAlerts = async (req, res) => {
  try {
    const { page = 1, limit = 20, severity = '', isResolved } = req.query;
    const skip = (page - 1) * limit;
    
    const whereClause = {
      ...(severity && { severity }),
      ...(isResolved !== undefined && { isResolved: isResolved === 'true' })
    };

    const [alerts, total] = await Promise.all([
      prisma.systemAlert.findMany({
        where: whereClause,
        orderBy: [
          { severity: 'desc' },
          { createdAt: 'desc' }
        ],
        skip: parseInt(skip),
        take: parseInt(limit)
      }),
      prisma.systemAlert.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: {
        alerts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching system alerts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch system alerts' });
  }
};

const resolveAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const adminUserId = req.user.userId;

    const alert = await prisma.systemAlert.update({
      where: { alertId },
      data: {
        isResolved: true,
        resolvedAt: new Date()
      }
    });

    // Log admin action
    await prisma.adminAction.create({
      data: {
        actionType: 'ALERT_RESOLVED',
        description: `System alert resolved: ${alert.title}`,
        adminUserId,
        metadata: { alertId, alertType: alert.alertType }
      }
    });

    res.json({ success: true, data: alert });
  } catch (error) {
    console.error('Error resolving alert:', error);
    res.status(500).json({ success: false, message: 'Failed to resolve alert' });
  }
};

// Admin Actions Log
const getAdminActions = async (req, res) => {
  try {
    const { page = 1, limit = 20, actionType = '', adminUserId = '' } = req.query;
    const skip = (page - 1) * limit;
    
    const whereClause = {
      ...(actionType && { actionType }),
      ...(adminUserId && { adminUserId })
    };

    const [actions, total] = await Promise.all([
      prisma.adminAction.findMany({
        where: whereClause,
        include: {
          adminUser: { select: { firstName: true, lastName: true, email: true } },
          targetUser: { select: { firstName: true, lastName: true, email: true } },
          targetOrganization: { select: { type: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit)
      }),
      prisma.adminAction.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: {
        actions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching admin actions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch admin actions' });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  getAllOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getSupplyChainEvents,
  getSystemAlerts,
  resolveAlert,
  getAdminActions,
  createAdminUser,
  updateUserRole
};