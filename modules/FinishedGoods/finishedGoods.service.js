const { PrismaClient } = require('@prisma/client');
const blockchainService = require('../../utils/blockchainService');
const prisma = new PrismaClient();

/**
 * Helper function to get collection event IDs from raw material batches
 */
const getCollectionEventIds = async (rawMaterialBatchIds) => {
  try {
    console.log(`🔍 [FinishedGoods] Getting collection events for raw material batches:`, rawMaterialBatchIds);
    
    const collectionEvents = await prisma.collectionEvent.findMany({
      where: {
        batchId: {
          in: rawMaterialBatchIds
        }
      },
      select: {
        eventId: true,
        batchId: true,
        herbSpeciesId: true,
        collectionDate: true
      }
    });

    const eventIds = collectionEvents.map(event => event.eventId);
    
    console.log(`✅ [FinishedGoods] Found ${eventIds.length} collection events:`, eventIds);
    return eventIds;
  } catch (error) {
    console.error(`❌ [FinishedGoods] Failed to get collection event IDs:`, error.message);
    throw error;
  }
};

// Create a new finished good
const createFinishedGood = async (data) => {
  const { composition, ...productData } = data;
  
  return await prisma.$transaction(async (tx) => {
    // Create the finished good
    const finishedGood = await tx.finishedGood.create({
      data: {
        ...productData,
        // Let Prisma generate UUID automatically
      },
    });

    // Create composition entries
    if (composition && composition.length > 0) {
      await tx.finishedGoodComposition.createMany({
        data: composition.map(comp => ({
          finishedGoodId: finishedGood.productId,
          rawMaterialBatchId: comp.rawMaterialBatchId,
          percentage: comp.percentage,
          quantityUsed: comp.quantityUsed,
        })),
      });
    }

    // Return the finished good with composition
    const createdFinishedGood = await tx.finishedGood.findUnique({
      where: { productId: finishedGood.productId },
      include: {
        manufacturer: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            orgType: true,
          }
        },
        composition: {
          include: {
            rawMaterialBatch: {
              select: {
                batchId: true,
                herbName: true,
                scientificName: true,
                quantity: true,
                unit: true,
              }
            }
          }
        },
        supplyChainEvents: {
          orderBy: { timestamp: 'desc' },
          take: 5,
        },
        documents: true,
      }
    });

    // Get collection event IDs from raw material batches used in composition
    if (composition && composition.length > 0) {
      try {
        console.log(`🔗 [FinishedGoods] Integrating finished good with blockchain for product: ${finishedGood.productId}`);
        
        const rawMaterialBatchIds = composition.map(comp => comp.rawMaterialBatchId);
        const sourceCollectionEventIds = await getCollectionEventIds(rawMaterialBatchIds);
        
        // Prepare and send data to blockchain
        const blockchainData = await blockchainService.prepareFinishedGoodData(createdFinishedGood, sourceCollectionEventIds);
        const blockchainResult = await blockchainService.sendFinishedGoodToBlockchain(blockchainData);
        
        if (blockchainResult.success) {
          console.log(`✅ [FinishedGoods] Finished good successfully added to blockchain: ${finishedGood.productId}`);
        } else {
          console.error(`⚠️ [FinishedGoods] Failed to add finished good to blockchain: ${finishedGood.productId}`, blockchainResult.error);
        }
      } catch (error) {
        console.error(`❌ [FinishedGoods] Blockchain integration failed for finished good: ${finishedGood.productId}`, error.message);
        // Don't throw the error - allow the finished good creation to succeed even if blockchain fails
      }
    }

    return createdFinishedGood;
  });
};

// Get all finished goods with pagination and filters
const getFinishedGoods = async ({ page, limit, productName, productType, manufacturerId }) => {
  const skip = (page - 1) * limit;
  
  const where = {};
  if (productName) {
    where.productName = { contains: productName, mode: 'insensitive' };
  }
  if (productType) {
    where.productType = productType;
  }
  if (manufacturerId) {
    where.manufacturerId = manufacturerId;
  }
  
  const [products, total] = await Promise.all([
    prisma.finishedGood.findMany({
      where,
      skip,
      take: limit,
      include: {
        manufacturer: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            orgType: true,
          }
        },
        composition: {
          include: {
            rawMaterialBatch: {
              select: {
                batchId: true,
                herbName: true,
                scientificName: true,
              }
            }
          }
        },
        supplyChainEvents: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            documents: true,
            supplyChainEvents: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.finishedGood.count({ where }),
  ]);
  
  return {
    products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

// Get a finished good by ID
const getFinishedGoodById = async (productId) => {
  return await prisma.finishedGood.findUnique({
    where: { productId },
    include: {
      manufacturer: {
        select: {
          userId: true,
          firstName: true,
          lastName: true,
          orgType: true,
          email: true,
        }
      },
      composition: {
        include: {
          rawMaterialBatch: {
            include: {
              collectionEvents: {
                include: {
                  farmer: true,
                  collector: true,
                  herbSpecies: true,
                }
              }
            }
          }
        }
      },
      supplyChainEvents: {
        include: {
          handler: true,
          fromLocation: true,
          toLocation: true,
        },
        orderBy: { timestamp: 'asc' },
      },
      documents: true,
      qrCodes: true,
    }
  });
};

// Get detailed composition and traceability of a finished good
const getFinishedGoodComposition = async (productId) => {
  const finishedGood = await getFinishedGoodById(productId);
  
  if (!finishedGood) return null;

  // Get detailed traceability for each raw material batch
  const traceabilityDetails = await Promise.all(
    finishedGood.composition.map(async (comp) => {
      const batch = comp.rawMaterialBatch;
      
      // Get collection events for this batch
      const collectionDetails = batch.collectionEvents.map(event => ({
        eventId: event.eventId,
        farmer: event.farmer,
        collector: event.collector,
        herbSpecies: event.herbSpecies,
        quantity: event.quantity,
        collectionDate: event.collectionDate,
        location: event.location,
      }));

      // Get processing history for this batch
      const processingHistory = await prisma.supplyChainEvent.findMany({
        where: { 
          rawMaterialBatchId: batch.batchId,
          eventType: 'PROCESSING'
        },
        include: {
          handler: true,
          fromLocation: true,
          toLocation: true,
        },
        orderBy: { timestamp: 'asc' }
      });

      return {
        rawMaterialBatch: {
          batchId: batch.batchId,
          herbName: batch.herbName,
          scientificName: batch.scientificName,
          quantity: batch.quantity,
          unit: batch.unit,
        },
        compositionDetails: {
          percentage: comp.percentage,
          quantityUsed: comp.quantityUsed,
        },
        traceability: {
          collectionEvents: collectionDetails,
          processingHistory: processingHistory,
        }
      };
    })
  );

  // Calculate total traceability coverage
  const totalFarmers = new Set();
  const totalCollectors = new Set();
  const totalHerbs = new Set();
  
  traceabilityDetails.forEach(detail => {
    detail.traceability.collectionEvents.forEach(event => {
      if (event.farmer) totalFarmers.add(event.farmer.userId);
      if (event.collector) totalCollectors.add(event.collector.userId);
      if (event.herbSpecies) totalHerbs.add(event.herbSpecies.speciesId);
    });
  });

  return {
    finishedGood: {
      productId: finishedGood.productId,
      productName: finishedGood.productName,
      productType: finishedGood.productType,
      quantity: finishedGood.quantity,
      unit: finishedGood.unit,
      manufacturer: finishedGood.manufacturer,
      batchNumber: finishedGood.batchNumber,
      expiryDate: finishedGood.expiryDate,
    },
    composition: traceabilityDetails,
    traceabilitySummary: {
      totalRawMaterialBatches: finishedGood.composition.length,
      totalFarmers: totalFarmers.size,
      totalCollectors: totalCollectors.size,
      totalHerbTypes: totalHerbs.size,
    },
    supplyChainEvents: finishedGood.supplyChainEvents,
    documents: finishedGood.documents,
    qrCodes: finishedGood.qrCodes,
  };
};

// Update a finished good
const updateFinishedGood = async (productId, data) => {
  try {
    return await prisma.finishedGood.update({
      where: { productId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        manufacturer: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            orgType: true,
          }
        },
        composition: {
          include: {
            rawMaterialBatch: true,
          }
        },
        supplyChainEvents: {
          orderBy: { timestamp: 'desc' },
          take: 5,
        },
      }
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return null; // Record not found
    }
    throw error;
  }
};

// Delete a finished good
const deleteFinishedGood = async (productId) => {
  try {
    // Use transaction to handle related records
    return await prisma.$transaction(async (tx) => {
      // Delete composition entries first
      await tx.finishedGoodComposition.deleteMany({
        where: { finishedGoodId: productId }
      });
      
      // Delete the finished good
      return await tx.finishedGood.delete({
        where: { productId },
      });
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return null; // Record not found
    }
    throw error;
  }
};

// Get finished goods analytics
const getFinishedGoodsAnalytics = async (filters = {}) => {
  const { startDate, endDate, manufacturerId, productType } = filters;
  
  const where = {};
  if (startDate && endDate) {
    where.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }
  if (manufacturerId) {
    where.manufacturerId = manufacturerId;
  }
  if (productType) {
    where.productType = productType;
  }

  const products = await prisma.finishedGood.findMany({
    where,
    include: {
      manufacturer: {
        select: { orgType: true }
      },
      composition: {
        include: {
          rawMaterialBatch: {
            select: { herbName: true }
          }
        }
      }
    }
  });

  // Analytics calculations
  const productsByType = products.reduce((acc, product) => {
    acc[product.productType] = (acc[product.productType] || 0) + 1;
    return acc;
  }, {});

  const productsByManufacturer = products.reduce((acc, product) => {
    const orgType = product.manufacturer?.orgType || 'UNKNOWN';
    acc[orgType] = (acc[orgType] || 0) + 1;
    return acc;
  }, {});

  const herbUsage = {};
  products.forEach(product => {
    product.composition.forEach(comp => {
      const herbName = comp.rawMaterialBatch.herbName;
      herbUsage[herbName] = (herbUsage[herbName] || 0) + (comp.quantityUsed || 0);
    });
  });

  return {
    totalProducts: products.length,
    productsByType,
    productsByManufacturer,
    herbUsageStatistics: herbUsage,
    timeRange: { startDate, endDate },
  };
};

module.exports = {
  createFinishedGood,
  getFinishedGoods,
  getFinishedGoodById,
  getFinishedGoodComposition,
  updateFinishedGood,
  deleteFinishedGood,
  getFinishedGoodsAnalytics,
};
