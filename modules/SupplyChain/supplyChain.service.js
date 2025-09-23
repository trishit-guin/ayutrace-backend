const { PrismaClient } = require('@prisma/client');
const blockchainService = require('../../utils/blockchainService');
const prisma = new PrismaClient();

// Create a new supply chain event
const createSupplyChainEvent = async (data) => {
  try {
    console.log(`📦 [SupplyChainService] Creating supply chain event:`, {
      eventType: data.eventType,
      handlerId: data.handlerId,
      finishedGoodId: data.finishedGoodId
    });

    // Create the supply chain event in database
    const createdSupplyChainEvent = await prisma.supplyChainEvent.create({
      data: {
        ...data,
        // Let Prisma generate UUID automatically
        timestamp: new Date(),
      },
      include: {
        handler: true,
        fromLocation: true,
        toLocation: true,
        rawMaterialBatch: true,
        finishedGood: true,
        documents: true,
      }
    });

    console.log(`✅ [SupplyChainService] Supply chain event created successfully in database:`, {
      eventId: createdSupplyChainEvent.eventId,
      eventType: createdSupplyChainEvent.eventType
    });

    // Send to blockchain in background (don't block the API response)
    setImmediate(async () => {
      try {
        console.log(`🔗 [SupplyChainService] Sending supply chain event to blockchain...`);
        console.log(`📋 [SupplyChainService] Created supply chain event data being sent to blockchain:`, {
          eventId: createdSupplyChainEvent.eventId,
          eventType: createdSupplyChainEvent.eventType,
          finishedGoodId: createdSupplyChainEvent.finishedGoodId,
          handlerId: createdSupplyChainEvent.handlerId,
          fromLocationId: createdSupplyChainEvent.fromLocationId,
          toLocationId: createdSupplyChainEvent.toLocationId,
          notes: createdSupplyChainEvent.notes
        });
        
        // Prepare data for blockchain
        const blockchainData = await blockchainService.prepareSupplyChainEventData(createdSupplyChainEvent);
        
        // Send to blockchain
        const blockchainResult = await blockchainService.sendSupplyChainEventToBlockchain(blockchainData);
        
        if (blockchainResult.success) {
          console.log(`✅ [SupplyChainService] Supply chain event successfully sent to blockchain`);
        } else {
          console.warn(`⚠️ [SupplyChainService] Failed to send supply chain event to blockchain:`, blockchainResult.error);
        }
      } catch (blockchainError) {
        console.error(`❌ [SupplyChainService] Blockchain integration error:`, blockchainError.message);
      }
    });

    return createdSupplyChainEvent;
  } catch (error) {
    console.error(`❌ [SupplyChainService] Failed to create supply chain event:`, error.message);
    throw error;
  }
};

// Get all supply chain events with pagination and filters
const getSupplyChainEvents = async ({ page, limit, eventType, handlerId, batchId }) => {
  const skip = (page - 1) * limit;
  
  const where = {};
  if (eventType) {
    where.eventType = eventType;
  }
  if (handlerId) {
    where.handlerId = handlerId;
  }
  if (batchId) {
    where.OR = [
      { rawMaterialBatchId: batchId },
      { finishedGoodId: batchId }
    ];
  }
  
  const [events, total] = await Promise.all([
    prisma.supplyChainEvent.findMany({
      where,
      skip,
      take: limit,
      include: {
        handler: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            orgType: true,
          }
        },
        fromLocation: true,
        toLocation: true,
        rawMaterialBatch: {
          select: {
            batchId: true,
            herbName: true,
            quantity: true,
            unit: true,
          }
        },
        finishedGood: {
          select: {
            productId: true,
            productName: true,
            quantity: true,
            unit: true,
          }
        },
        documents: true,
      },
      orderBy: { timestamp: 'desc' },
    }),
    prisma.supplyChainEvent.count({ where }),
  ]);
  
  return {
    events,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

// Get a supply chain event by ID
const getSupplyChainEventById = async (eventId) => {
  return await prisma.supplyChainEvent.findUnique({
    where: { eventId },
    include: {
      handler: {
        select: {
          userId: true,
          firstName: true,
          lastName: true,
          orgType: true,
          email: true,
        }
      },
      fromLocation: true,
      toLocation: true,
      rawMaterialBatch: {
        include: {
          collectionEvents: {
            include: {
              farmer: true,
              collector: true,
            }
          }
        }
      },
      finishedGood: {
        include: {
          composition: {
            include: {
              rawMaterialBatch: true,
            }
          }
        }
      },
      documents: true,
    }
  });
};

// Get supply chain events for a specific batch (raw material or finished good)
const getSupplyChainByBatch = async (batchId) => {
  // Try to find as raw material batch first
  let events = await prisma.supplyChainEvent.findMany({
    where: { rawMaterialBatchId: batchId },
    include: {
      handler: {
        select: {
          userId: true,
          firstName: true,
          lastName: true,
          orgType: true,
        }
      },
      fromLocation: true,
      toLocation: true,
      documents: true,
    },
    orderBy: { timestamp: 'asc' },
  });

  // If no events found, try as finished good
  if (events.length === 0) {
    events = await prisma.supplyChainEvent.findMany({
      where: { finishedGoodId: batchId },
      include: {
        handler: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            orgType: true,
          }
        },
        fromLocation: true,
        toLocation: true,
        documents: true,
      },
      orderBy: { timestamp: 'asc' },
    });
  }

  // Get the batch info
  let batchInfo = null;
  
  // Try raw material batch
  batchInfo = await prisma.rawMaterialBatch.findUnique({
    where: { batchId },
    include: {
      collectionEvents: {
        include: {
          farmer: true,
          collector: true,
        }
      }
    }
  });

  // If not found, try finished good
  if (!batchInfo) {
    batchInfo = await prisma.finishedGood.findUnique({
      where: { productId: batchId },
      include: {
        composition: {
          include: {
            rawMaterialBatch: true,
          }
        }
      }
    });
  }

  return {
    batchInfo,
    supplyChainEvents: events,
    traceabilityPath: events.map(event => ({
      eventId: event.eventId,
      eventType: event.eventType,
      timestamp: event.timestamp,
      handler: event.handler,
      fromLocation: event.fromLocation?.locationName,
      toLocation: event.toLocation?.locationName,
      notes: event.notes,
    }))
  };
};

// Update a supply chain event
const updateSupplyChainEvent = async (eventId, data) => {
  try {
    return await prisma.supplyChainEvent.update({
      where: { eventId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        handler: true,
        fromLocation: true,
        toLocation: true,
        rawMaterialBatch: true,
        finishedGood: true,
        documents: true,
      }
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return null; // Record not found
    }
    throw error;
  }
};

// Delete a supply chain event
const deleteSupplyChainEvent = async (eventId) => {
  try {
    return await prisma.supplyChainEvent.delete({
      where: { eventId },
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return null; // Record not found
    }
    throw error;
  }
};

// Get supply chain analytics
const getSupplyChainAnalytics = async (filters = {}) => {
  const { startDate, endDate, eventType, organizationType } = filters;
  
  const where = {};
  if (startDate && endDate) {
    where.timestamp = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }
  if (eventType) {
    where.eventType = eventType;
  }

  const events = await prisma.supplyChainEvent.findMany({
    where,
    include: {
      handler: {
        select: { orgType: true }
      }
    }
  });

  // Analytics calculations
  const eventsByType = events.reduce((acc, event) => {
    acc[event.eventType] = (acc[event.eventType] || 0) + 1;
    return acc;
  }, {});

  const eventsByOrganization = events.reduce((acc, event) => {
    const orgType = event.handler?.orgType || 'UNKNOWN';
    acc[orgType] = (acc[orgType] || 0) + 1;
    return acc;
  }, {});

  const averageProcessingTime = await calculateAverageProcessingTime(where);

  return {
    totalEvents: events.length,
    eventsByType,
    eventsByOrganization,
    averageProcessingTime,
    timeRange: { startDate, endDate },
  };
};

const calculateAverageProcessingTime = async (where) => {
  // This is a simplified calculation - in reality you'd want more complex logic
  const processingEvents = await prisma.supplyChainEvent.findMany({
    where: {
      ...where,
      eventType: 'PROCESSING',
    },
    orderBy: { timestamp: 'asc' }
  });

  if (processingEvents.length < 2) return null;

  const times = [];
  for (let i = 1; i < processingEvents.length; i++) {
    const timeDiff = processingEvents[i].timestamp - processingEvents[i-1].timestamp;
    times.push(timeDiff);
  }

  const averageMs = times.reduce((sum, time) => sum + time, 0) / times.length;
  return Math.round(averageMs / (1000 * 60 * 60)); // Convert to hours
};

module.exports = {
  createSupplyChainEvent,
  getSupplyChainEvents,
  getSupplyChainEventById,
  getSupplyChainByBatch,
  updateSupplyChainEvent,
  deleteSupplyChainEvent,
  getSupplyChainAnalytics,
};
