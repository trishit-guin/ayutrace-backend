const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new raw material batch
const createRawMaterialBatch = async (data) => {
  const { collectionEventIds, ...batchData } = data;
  
  return await prisma.rawMaterialBatch.create({
    data: {
      ...batchData,
      // Let Prisma generate UUID automatically
      status: 'CREATED',
      collectionEvents: {
        connect: collectionEventIds.map(id => ({ eventId: id }))
      }
    },
    include: {
      collectionEvents: {
        include: {
          collector: true,
          herbSpecies: true,
          farmer: true,
        }
      },
      processingEvents: true,
      supplyChainEvents: true,
    }
  });
};

// Get all raw material batches with pagination and filters
const getRawMaterialBatches = async ({ page, limit, herbName, status }) => {
  const skip = (page - 1) * limit;
  
  const where = {};
  if (herbName) {
    where.herbName = { contains: herbName, mode: 'insensitive' };
  }
  if (status) {
    where.status = status;
  }
  
  const [batches, total] = await Promise.all([
    prisma.rawMaterialBatch.findMany({
      where,
      skip,
      take: limit,
      include: {
        collectionEvents: {
          include: {
            collector: true,
            herbSpecies: true,
            farmer: true,
          }
        },
        processingEvents: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
        supplyChainEvents: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.rawMaterialBatch.count({ where }),
  ]);
  
  return {
    batches,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

// Get a raw material batch by ID
const getRawMaterialBatchById = async (batchId) => {
  return await prisma.rawMaterialBatch.findUnique({
    where: { batchId },
    include: {
      collectionEvents: {
        include: {
          collector: true,
          herbSpecies: true,
          farmer: true,
          documents: true,
        }
      },
      processingEvents: {
        include: {
          processor: true,
          documents: true,
        },
        orderBy: { timestamp: 'asc' },
      },
      supplyChainEvents: {
        include: {
          fromLocation: true,
          toLocation: true,
          handler: true,
          documents: true,
        },
        orderBy: { timestamp: 'asc' },
      },
      finishedGoods: true,
    }
  });
};

// Update a raw material batch
const updateRawMaterialBatch = async (batchId, data) => {
  try {
    return await prisma.rawMaterialBatch.update({
      where: { batchId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        collectionEvents: true,
        processingEvents: true,
        supplyChainEvents: true,
      }
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return null; // Record not found
    }
    throw error;
  }
};

// Delete a raw material batch
const deleteRawMaterialBatch = async (batchId) => {
  try {
    return await prisma.rawMaterialBatch.delete({
      where: { batchId },
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return null; // Record not found
    }
    throw error;
  }
};

// Get batch composition and traceability
const getBatchTraceability = async (batchId) => {
  const batch = await prisma.rawMaterialBatch.findUnique({
    where: { batchId },
    include: {
      collectionEvents: {
        include: {
          collector: true,
          farmer: true,
          herbSpecies: true,
          location: true,
        }
      },
      processingEvents: {
        include: {
          processor: true,
          qualityTests: true,
        }
      },
      supplyChainEvents: {
        include: {
          fromLocation: true,
          toLocation: true,
          handler: true,
        }
      }
    }
  });

  if (!batch) return null;

  // Calculate total collected quantity from source events
  const totalCollectedQuantity = batch.collectionEvents.reduce(
    (sum, event) => sum + parseFloat(event.quantity || 0), 0
  );

  // Get unique farmers and collectors
  const farmers = [...new Map(
    batch.collectionEvents.map(event => [event.farmer?.farmerId, event.farmer])
  ).values()].filter(Boolean);

  const collectors = [...new Map(
    batch.collectionEvents.map(event => [event.collector?.userId, event.collector])
  ).values()].filter(Boolean);

  return {
    batch,
    traceability: {
      totalCollectedQuantity,
      farmers,
      collectors,
      collectionLocations: batch.collectionEvents.map(event => event.location).filter(Boolean),
      processingHistory: batch.processingEvents,
      supplyChainHistory: batch.supplyChainEvents,
    }
  };
};

module.exports = {
  createRawMaterialBatch,
  getRawMaterialBatches,
  getRawMaterialBatchById,
  updateRawMaterialBatch,
  deleteRawMaterialBatch,
  getBatchTraceability,
};
