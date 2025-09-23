const dbConnection = require('../../utils/database');
const prisma = dbConnection.getClient();

// Import supply chain service for creating distribution events
const { createSupplyChainEvent } = require('../SupplyChain/supplyChain.service');

// Import QR code service for automatic QR code generation
const { generateQRCode } = require('../QRCode/qrCode.service');

async function getDistributorMetrics(distributorId) {
  try {
    console.log('Fetching distributor metrics for distributorId:', distributorId);
    
    // Check if the distributor exists
    const distributor = await prisma.user.findUnique({
      where: { userId: distributorId },
      include: { organization: true }
    });
    
    if (!distributor || distributor.orgType !== 'DISTRIBUTOR') {
      throw new Error('Distributor not found');
    }
    
    // Get distributor metrics for dashboard
    let totalInventoryItems = 0;
    let totalInventoryValue = 0;
    let lowStockItems = 0;
    let expiringSoonItems = 0;
    let totalShipments = 0;
    let pendingShipments = 0;
    let completedShipments = 0;
    let shipmentsThisMonth = 0;
    let verificationsPerformed = 0;
    let recentShipments = [];
    let inventorySummary = {};

    try {
      // Total inventory items
      totalInventoryItems = await prisma.distributorInventory.count({
        where: { distributorId }
      });
    } catch (err) {
      console.log('Error counting inventory items:', err.message);
    }

    try {
      // Total inventory value
      const inventoryValue = await prisma.distributorInventory.aggregate({
        where: { distributorId },
        _sum: { quantity: true }
      });
      totalInventoryValue = inventoryValue._sum.quantity || 0;
    } catch (err) {
      console.log('Error calculating inventory value:', err.message);
    }

    try {
      // Low stock items (quantity < 10)
      lowStockItems = await prisma.distributorInventory.count({
        where: { 
          distributorId,
          quantity: { lt: 10 },
          status: 'IN_STOCK'
        }
      });
    } catch (err) {
      console.log('Error counting low stock items:', err.message);
    }

    try {
      // Expiring soon items (next 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      expiringSoonItems = await prisma.distributorInventory.count({
        where: { 
          distributorId,
          expiryDate: { 
            lte: thirtyDaysFromNow,
            gt: new Date()
          },
          status: 'IN_STOCK'
        }
      });
    } catch (err) {
      console.log('Error counting expiring items:', err.message);
    }

    try {
      // Total shipments
      totalShipments = await prisma.distributorShipment.count({
        where: { distributorId }
      });
    } catch (err) {
      console.log('Error counting total shipments:', err.message);
    }

    try {
      // Pending shipments
      pendingShipments = await prisma.distributorShipment.count({
        where: { 
          distributorId,
          status: { in: ['PREPARING', 'DISPATCHED', 'IN_TRANSIT'] }
        }
      });
    } catch (err) {
      console.log('Error counting pending shipments:', err.message);
    }

    try {
      // Completed shipments
      completedShipments = await prisma.distributorShipment.count({
        where: { 
          distributorId,
          status: 'DELIVERED'
        }
      });
    } catch (err) {
      console.log('Error counting completed shipments:', err.message);
    }

    try {
      // Shipments this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      shipmentsThisMonth = await prisma.distributorShipment.count({
        where: {
          distributorId,
          createdAt: { gte: startOfMonth }
        }
      });
    } catch (err) {
      console.log('Error counting monthly shipments:', err.message);
    }

    try {
      // Verifications performed
      verificationsPerformed = await prisma.distributorVerification.count({
        where: { distributorId }
      });
    } catch (err) {
      console.log('Error counting verifications:', err.message);
    }

    try {
      // Recent shipments
      recentShipments = await prisma.distributorShipment.findMany({
        where: { distributorId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          recipient: { select: { firstName: true, lastName: true } },
          items: { select: { productName: true, quantity: true, unit: true } }
        }
      });
    } catch (err) {
      console.log('Error fetching recent shipments:', err.message);
    }

    try {
      // Inventory summary by type
      const inventoryByType = await prisma.distributorInventory.groupBy({
        by: ['productType', 'status'],
        where: { distributorId },
        _count: { _all: true },
        _sum: { quantity: true }
      });
      
      inventorySummary = inventoryByType.reduce((acc, item) => {
        const key = `${item.productType}_${item.status}`;
        acc[key] = {
          count: item._count._all,
          totalQuantity: item._sum.quantity || 0
        };
        return acc;
      }, {});
    } catch (err) {
      console.log('Error generating inventory summary:', err.message);
    }

    return {
      totalInventoryItems,
      totalInventoryValue,
      lowStockItems,
      expiringSoonItems,
      totalShipments,
      pendingShipments,
      completedShipments,
      shipmentsThisMonth,
      verificationsPerformed,
      recentShipments,
      inventorySummary
    };
  } catch (error) {
    console.error('Error fetching distributor metrics:', error);
    throw error;
  }
}

async function getInventory(distributorId, options = {}) {
  try {
    const { page = 1, limit = 10, filters = {} } = options;
    
    const whereClause = {
      distributorId,
      ...(filters.status && { status: filters.status }),
      ...(filters.productType && { productType: filters.productType }),
      ...(filters.location && { location: { contains: filters.location, mode: 'insensitive' } })
    };

    const [inventory, totalCount] = await Promise.all([
      prisma.distributorInventory.findMany({
        where: whereClause,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          distributor: { select: { firstName: true, lastName: true } }
        }
      }),
      prisma.distributorInventory.count({ where: whereClause })
    ]);

    return {
      inventory,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    };
  } catch (error) {
    console.error('Error fetching inventory:', error);
    throw error;
  }
}

async function addInventoryItem(distributorId, itemData) {
  try {
    // Get distributor information including organization ID
    const distributor = await prisma.user.findUnique({
      where: { userId: distributorId },
      select: { 
        organizationId: true,
        firstName: true,
        lastName: true,
        orgType: true
      }
    });
    
    if (!distributor) {
      throw new Error('Distributor not found');
    }

    // Validate the entity exists
    if (itemData.productType === 'RAW_MATERIAL_BATCH') {
      const batch = await prisma.rawMaterialBatch.findUnique({
        where: { batchId: itemData.entityId }
      });
      if (!batch) throw new Error('Raw material batch not found');
    } else if (itemData.productType === 'FINISHED_GOOD') {
      const product = await prisma.finishedGood.findUnique({
        where: { productId: itemData.entityId }
      });
      if (!product) throw new Error('Finished good not found');
    }

    const inventoryItem = await prisma.distributorInventory.create({
      data: {
        distributorId,
        productType: itemData.productType,
        entityId: itemData.entityId,
        quantity: itemData.quantity,
        unit: itemData.unit,
        location: itemData.location,
        warehouseSection: itemData.warehouseSection,
        status: itemData.status || 'IN_STOCK',
        receivedDate: itemData.receivedDate || new Date(),
        expiryDate: itemData.expiryDate,
        supplierInfo: itemData.supplierInfo,
        qualityNotes: itemData.qualityNotes,
        storageConditions: itemData.storageConditions
      },
      include: {
        distributor: { select: { firstName: true, lastName: true } }
      }
    });

    // Create a supply chain event for receiving inventory
    const supplyChainEvent = await createSupplyChainEvent({
      eventType: 'DISTRIBUTION',
      handlerId: distributorId,
      fromLocationId: itemData.supplierOrganizationId || distributor.organizationId, // Use supplier org ID if available, otherwise same org
      toLocationId: distributor.organizationId, // Use distributor's organization ID
      rawMaterialBatchId: itemData.productType === 'RAW_MATERIAL_BATCH' ? itemData.entityId : null,
      finishedGoodId: itemData.productType === 'FINISHED_GOOD' ? itemData.entityId : null,
      notes: `Inventory received - ${itemData.quantity} ${itemData.unit}`,
      metadata: {
        action: 'INVENTORY_RECEIVED',
        quantity: itemData.quantity,
        unit: itemData.unit,
        location: itemData.location
      }
    });

    // Create QR code for the inventory item if supply chain event was created
    if (supplyChainEvent) {
      try {
        const qrCodeData = {
          entityType: 'SUPPLY_CHAIN_EVENT',
          entityId: supplyChainEvent.eventId,
          customData: {
            distributorInventoryId: inventoryItem.inventoryId,
            productName: itemData.productName,
            productType: itemData.productType,
            quantity: itemData.quantity,
            unit: itemData.unit,
            location: itemData.location,
            status: inventoryItem.status,
            timestamp: new Date().toISOString()
          },
          generatedBy: distributorId,
          supplyChainEventId: supplyChainEvent.eventId
        };

        await generateQRCode(qrCodeData);
      } catch (qrError) {
        console.error('Warning: Failed to create QR code for inventory item:', qrError);
      }
    }

    return inventoryItem;
  } catch (error) {
    console.error('Error adding inventory item:', error);
    throw error;
  }
}

async function updateInventoryItem(inventoryId, distributorId, updateData) {
  try {
    // Verify ownership
    const existingItem = await prisma.distributorInventory.findFirst({
      where: { inventoryId, distributorId }
    });
    
    if (!existingItem) {
      throw new Error('Inventory item not found or unauthorized');
    }

    const updatedItem = await prisma.distributorInventory.update({
      where: { inventoryId },
      data: updateData,
      include: {
        distributor: { select: { firstName: true, lastName: true } }
      }
    });

    return updatedItem;
  } catch (error) {
    console.error('Error updating inventory item:', error);
    throw error;
  }
}

async function getShipments(userId, options = {}) {
  try {
    const { page = 1, limit = 10, filters = {} } = options;
    
    const whereClause = {
      distributorId: userId,
      ...(filters.status && { status: filters.status }),
      ...(filters.recipientType && { recipientType: filters.recipientType }),
      ...(filters.trackingNumber && { 
        trackingNumber: { contains: filters.trackingNumber, mode: 'insensitive' } 
      })
    };

    const [shipments, totalCount] = await Promise.all([
      prisma.distributorShipment.findMany({
        where: whereClause,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          distributor: { select: { firstName: true, lastName: true } },
          recipient: { select: { firstName: true, lastName: true } },
          items: { select: { productName: true, quantity: true, unit: true, totalPrice: true } }
        }
      }),
      prisma.distributorShipment.count({ where: whereClause })
    ]);

    return {
      shipments,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    };
  } catch (error) {
    console.error('Error fetching shipments:', error);
    throw error;
  }
}

async function createShipment(userId, shipmentData) {
  try {
    // Generate unique shipment number
    const timestamp = Date.now();
    const shipmentNumber = `DIST-${timestamp}`;

    // Verify recipient exists
    const recipient = await prisma.user.findUnique({
      where: { userId: shipmentData.recipientId }
    });
    if (!recipient) throw new Error('Recipient not found');

    const shipment = await prisma.distributorShipment.create({
      data: {
        distributorId: userId,
        shipmentNumber,
        recipientType: shipmentData.recipientType,
        recipientId: shipmentData.recipientId,
        recipientName: shipmentData.recipientName || `${recipient.firstName} ${recipient.lastName}`,
        recipientAddress: shipmentData.recipientAddress,
        recipientPhone: shipmentData.recipientPhone,
        shipmentDate: shipmentData.shipmentDate || new Date(),
        expectedDelivery: shipmentData.expectedDelivery,
        status: 'PREPARING',
        trackingNumber: shipmentData.trackingNumber,
        carrierInfo: shipmentData.carrierInfo,
        shippingCost: shipmentData.shippingCost,
        totalValue: shipmentData.totalValue,
        notes: shipmentData.notes,
        specialInstructions: shipmentData.specialInstructions
      },
      include: {
        distributor: { select: { firstName: true, lastName: true } },
        recipient: { select: { firstName: true, lastName: true } }
      }
    });

    // Add shipment items if provided
    if (shipmentData.items && shipmentData.items.length > 0) {
      await Promise.all(
        shipmentData.items.map(item => 
          prisma.shipmentItem.create({
            data: {
              shipmentId: shipment.shipmentId,
              productType: item.productType,
              entityId: item.entityId,
              productName: item.productName,
              quantity: item.quantity,
              unit: item.unit,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
              batchNumber: item.batchNumber,
              expiryDate: item.expiryDate,
              qualityGrade: item.qualityGrade
            }
          })
        )
      );

      // Update inventory quantities
      await Promise.all(
        shipmentData.items.map(async (item) => {
          const inventoryItem = await prisma.distributorInventory.findFirst({
            where: {
              distributorId,
              entityId: item.entityId,
              productType: item.productType
            }
          });
          
          if (inventoryItem && inventoryItem.quantity >= item.quantity) {
            await prisma.distributorInventory.update({
              where: { inventoryId: inventoryItem.inventoryId },
              data: { 
                quantity: inventoryItem.quantity - item.quantity,
                status: inventoryItem.quantity - item.quantity <= 10 ? 'LOW_STOCK' :
                        inventoryItem.quantity - item.quantity === 0 ? 'OUT_OF_STOCK' : 'IN_STOCK'
              }
            });
          }
        })
      );
    }

    // Create supply chain event for shipment
    const supplyChainEvent = await createSupplyChainEvent({
      eventType: 'DISTRIBUTION',
      handlerId: distributorId,
      fromLocationId: distributorId,
      toLocationId: shipmentData.recipientId,
      notes: `Shipment created: ${shipmentNumber}`,
      metadata: {
        action: 'SHIPMENT_CREATED',
        shipmentNumber: shipmentNumber,
        recipientType: shipmentData.recipientType,
        totalValue: shipmentData.totalValue
      }
    });

    // Create QR code for the shipment if supply chain event was created
    if (supplyChainEvent) {
      try {
        await createQRCodeForDistributorEvent(shipment, supplyChainEvent, shipmentData.items);
      } catch (qrError) {
        console.error('Warning: Failed to create QR code for distributor shipment:', qrError);
      }
    }

    return shipment;
  } catch (error) {
    console.error('Error creating shipment:', error);
    throw error;
  }
}

async function updateShipmentStatus(shipmentId, userId, statusData) {
  try {
    // Verify ownership
    const existingShipment = await prisma.distributorShipment.findFirst({
      where: { shipmentId, distributorId: userId }
    });
    
    if (!existingShipment) {
      throw new Error('Shipment not found or unauthorized');
    }

    const updatedShipment = await prisma.distributorShipment.update({
      where: { shipmentId },
      data: {
        status: statusData.status,
        trackingNumber: statusData.trackingNumber,
        actualDelivery: statusData.status === 'DELIVERED' ? new Date() : undefined,
        carrierInfo: statusData.carrierInfo,
        notes: statusData.notes
      },
      include: {
        distributor: { select: { firstName: true, lastName: true } },
        recipient: { select: { firstName: true, lastName: true } },
        items: true
      }
    });

    // Create supply chain event for status update
    await createSupplyChainEvent({
      eventType: 'DISTRIBUTION',
      handlerId: distributorId,
      fromLocationId: distributorId,
      toLocationId: existingShipment.recipientId,
      notes: `Shipment status updated to: ${statusData.status}`,
      metadata: {
        action: 'SHIPMENT_STATUS_UPDATE',
        shipmentNumber: existingShipment.shipmentNumber,
        previousStatus: existingShipment.status,
        newStatus: statusData.status,
        trackingNumber: statusData.trackingNumber
      }
    });

    return updatedShipment;
  } catch (error) {
    console.error('Error updating shipment status:', error);
    throw error;
  }
}

async function getVerifications(distributorId, options = {}) {
  try {
    const { page = 1, limit = 10, filters = {} } = options;
    
    const whereClause = {
      distributorId,
      ...(filters.status && { status: filters.status }),
      ...(filters.verificationType && { verificationType: filters.verificationType }),
      ...(filters.entityType && { entityType: filters.entityType })
    };

    const [verifications, totalCount] = await Promise.all([
      prisma.distributorVerification.findMany({
        where: whereClause,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          distributor: { select: { firstName: true, lastName: true } },
          verifier: { select: { firstName: true, lastName: true } }
        }
      }),
      prisma.distributorVerification.count({ where: whereClause })
    ]);

    return {
      verifications,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    };
  } catch (error) {
    console.error('Error fetching verifications:', error);
    throw error;
  }
}

async function createVerification(distributorId, verificationData) {
  try {
    // Generate request number
    const requestNumber = `DVR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const verification = await prisma.distributorVerification.create({
      data: {
        distributorId,
        requestNumber,
        type: verificationData.type,
        entityType: verificationData.entityType,
        entityId: verificationData.entityId,
        description: verificationData.description,
        urgency: verificationData.urgency || 'MEDIUM',
        status: 'PENDING',
        expectedCompletion: verificationData.expectedCompletion ? new Date(verificationData.expectedCompletion) : null,
        labRequirements: verificationData.labRequirements || [],
        specialInstructions: verificationData.specialInstructions
      },
      include: {
        distributor: { select: { firstName: true, lastName: true } }
      }
    });

    // Create supply chain event for verification request
    const supplyChainEvent = await createSupplyChainEvent({
      eventType: 'QUALITY_CHECK',
      handlerId: distributorId,
      notes: `Verification request created: ${requestNumber}`,
      metadata: {
        action: 'VERIFICATION_REQUESTED',
        requestNumber: requestNumber,
        verificationType: verificationData.type,
        entityType: verificationData.entityType,
        entityId: verificationData.entityId,
        urgency: verificationData.urgency
      }
    });

    // Create QR code for the verification if supply chain event was created
    if (supplyChainEvent) {
      try {
        await createQRCodeForDistributorVerification(verification, supplyChainEvent);
      } catch (qrError) {
        console.error('Warning: Failed to create QR code for distributor verification:', qrError);
      }
    }

    return verification;
  } catch (error) {
    console.error('Error creating verification:', error);
    throw error;
  }
}

async function updateVerification(verificationId, distributorId, updateData) {
  try {
    // Verify ownership
    const existingVerification = await prisma.distributorVerification.findFirst({
      where: { verificationId, distributorId }
    });
    
    if (!existingVerification) {
      throw new Error('Verification not found or unauthorized');
    }

    const updatedVerification = await prisma.distributorVerification.update({
      where: { verificationId },
      data: {
        status: updateData.status,
        notes: updateData.notes,
        completionDate: updateData.status === 'COMPLETED' ? new Date() : undefined
      },
      include: {
        distributor: { select: { firstName: true, lastName: true } }
      }
    });

    // Create supply chain event for verification status update
    if (updateData.status && updateData.status !== existingVerification.status) {
      try {
        await createSupplyChainEvent({
          eventType: 'QUALITY_CHECK',
          handlerId: distributorId,
          notes: `Verification status updated to: ${updateData.status}`,
          metadata: {
            action: 'VERIFICATION_STATUS_UPDATE',
            requestNumber: existingVerification.requestNumber,
            previousStatus: existingVerification.status,
            newStatus: updateData.status,
            verificationId: verificationId
          }
        });
      } catch (scError) {
        console.error('Warning: Failed to create supply chain event for verification update:', scError);
      }
    }

    return updatedVerification;
  } catch (error) {
    console.error('Error updating verification:', error);
    throw error;
  }
}

async function generateAnalytics(distributorId, reportType = 'INVENTORY_SUMMARY') {
  try {
    const currentDate = new Date();
    
    // Get or create analytics record
    const analytics = await prisma.distributorAnalytics.create({
      data: {
        distributorId,
        reportDate: currentDate,
        reportType,
        period: 'MONTHLY',
        
        // Calculate metrics
        ...(await calculateAnalyticsMetrics(distributorId, reportType))
      }
    });

    return analytics;
  } catch (error) {
    console.error('Error generating analytics:', error);
    throw error;
  }
}

async function calculateAnalyticsMetrics(distributorId, reportType) {
  const metrics = {};
  
  try {
    // Inventory metrics
    const inventoryValue = await prisma.distributorInventory.aggregate({
      where: { distributorId, status: 'IN_STOCK' },
      _sum: { quantity: true },
      _count: { _all: true }
    });
    
    metrics.totalInventoryValue = inventoryValue._sum.quantity || 0;
    metrics.totalUnits = inventoryValue._count._all || 0;
    
    metrics.lowStockItems = await prisma.distributorInventory.count({
      where: { distributorId, quantity: { lt: 10 }, status: 'IN_STOCK' }
    });
    
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    metrics.expiringSoonItems = await prisma.distributorInventory.count({
      where: { 
        distributorId,
        expiryDate: { lte: thirtyDaysFromNow, gt: new Date() },
        status: 'IN_STOCK'
      }
    });
    
    // Shipment metrics
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    metrics.totalShipments = await prisma.distributorShipment.count({
      where: { distributorId, createdAt: { gte: startOfMonth } }
    });
    
    metrics.completedShipments = await prisma.distributorShipment.count({
      where: { distributorId, status: 'DELIVERED', createdAt: { gte: startOfMonth } }
    });
    
    metrics.pendingShipments = await prisma.distributorShipment.count({
      where: { 
        distributorId, 
        status: { in: ['PREPARING', 'DISPATCHED', 'IN_TRANSIT'] },
        createdAt: { gte: startOfMonth }
      }
    });
    
    const shipmentValue = await prisma.distributorShipment.aggregate({
      where: { distributorId, createdAt: { gte: startOfMonth } },
      _sum: { totalValue: true }
    });
    
    metrics.totalShipmentValue = shipmentValue._sum.totalValue || 0;
    
    // Quality metrics
    metrics.verificationsPerformed = await prisma.distributorVerification.count({
      where: { distributorId, createdAt: { gte: startOfMonth } }
    });
    
    metrics.qualityIssuesFound = await prisma.distributorVerification.count({
      where: { 
        distributorId, 
        status: 'REJECTED',
        createdAt: { gte: startOfMonth }
      }
    });
    
  } catch (error) {
    console.error('Error calculating analytics metrics:', error);
  }
  
  return metrics;
}

// Helper function to create QR codes for distributor supply chain events
async function createQRCodeForDistributorEvent(shipment, supplyChainEvent, inventoryItems) {
  try {
    console.log('Creating QR code for distributor shipment:', shipment.shipmentId);
    
    // Create QR code data structure for distributor events
    const qrData = {
      entityType: 'SUPPLY_CHAIN_EVENT',
      entityId: supplyChainEvent.eventId,
      customData: {
        distributorShipmentId: shipment.shipmentId,
        shipmentNumber: shipment.shipmentNumber,
        recipientType: shipment.recipientType,
        recipientId: shipment.recipientId,
        status: shipment.status,
        timestamp: new Date().toISOString(),
        items: inventoryItems.map(item => ({
          productName: item.productName,
          quantity: item.quantity,
          unit: item.unit,
          batchNumber: item.batchNumber,
          entityId: item.entityId
        })),
        trackingNumber: shipment.trackingNumber,
        totalValue: shipment.totalValue
      },
      qrHash: `dist_${shipment.shipmentId}_${supplyChainEvent.eventId}_${Date.now()}`
    };

    // Use the QR code service to create the QR code
    const qrCodeData = {
      entityType: 'SUPPLY_CHAIN_EVENT',
      entityId: supplyChainEvent.eventId,
      customData: qrData,
      generatedBy: shipment.distributorId,
      supplyChainEventId: supplyChainEvent.eventId
    };

    const qrCode = await generateQRCode(qrCodeData);
    console.log('QR code created successfully for distributor shipment:', qrCode.qrCodeId);
    
    return qrCode;
  } catch (error) {
    console.error('Error creating QR code for distributor shipment:', error);
    throw error;
  }
}

// Helper function to create QR codes for distributor verification events
async function createQRCodeForDistributorVerification(verification, supplyChainEvent) {
  try {
    console.log('Creating QR code for distributor verification:', verification.verificationId);
    
    // Create QR code data structure for verification events
    const qrData = {
      entityType: 'SUPPLY_CHAIN_EVENT',
      entityId: supplyChainEvent.eventId,
      customData: {
        distributorVerificationId: verification.verificationId,
        requestNumber: verification.requestNumber,
        verificationType: verification.type,
        entityType: verification.entityType,
        entityId: verification.entityId,
        status: verification.status,
        urgency: verification.urgency,
        timestamp: new Date().toISOString(),
        description: verification.description,
        labRequirements: verification.labRequirements
      },
      qrHash: `dist_verify_${verification.verificationId}_${supplyChainEvent.eventId}_${Date.now()}`
    };

    // Use the QR code service to create the QR code
    const qrCodeData = {
      entityType: 'SUPPLY_CHAIN_EVENT',
      entityId: supplyChainEvent.eventId,
      customData: qrData,
      generatedBy: verification.distributorId,
      supplyChainEventId: supplyChainEvent.eventId
    };

    const qrCode = await generateQRCode(qrCodeData);
    console.log('QR code created successfully for distributor verification:', qrCode.qrCodeId);
    
    return qrCode;
  } catch (error) {
    console.error('Error creating QR code for distributor verification:', error);
    throw error;
  }
}

module.exports = {
  getDistributorMetrics,
  getInventory,
  addInventoryItem,
  updateInventoryItem,
  getShipments,
  createShipment,
  updateShipmentStatus,
  getVerifications,
  createVerification,
  updateVerification,
  generateAnalytics,
  createQRCodeForDistributorEvent,
  createQRCodeForDistributorVerification
};