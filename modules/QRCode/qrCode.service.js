const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Generate a new QR code
const generateQRCode = async (data) => {
  // Generate unique QR hash
  const qrHash = crypto.randomBytes(16).toString('hex');
  
  const { purpose, ...prismaData } = data;
  return await prisma.qRCode.create({
    data: {
      ...prismaData,
      // Let Prisma generate UUID automatically
      qrHash,
    },
    include: {
      generatedByUser: {
        select: {
          userId: true,
          firstName: true,
          lastName: true,
          orgType: true,
        }
      }
    }
  });
};

// Get all QR codes with pagination and filters
const getQRCodes = async ({ page, limit, entityType, entityId }) => {
  const skip = (page - 1) * limit;
  
  const where = {};
  if (entityType) {
    where.entityType = entityType;
  }
  if (entityId) {
    where.entityId = entityId;
  }
  
  const [qrCodes, total] = await Promise.all([
    prisma.qRCode.findMany({
      where,
      skip,
      take: limit,
      include: {
        generatedByUser: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            orgType: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.qRCode.count({ where }),
  ]);
  
  return {
    qrCodes,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

// Get a QR code by ID
const getQRCodeById = async (qrCodeId) => {
  return await prisma.qRCode.findUnique({
    where: { qrCodeId },
    include: {
      generatedByUser: {
        select: {
          userId: true,
          firstName: true,
          lastName: true,
          orgType: true,
          email: true,
        }
      }
    }
  });
};

// Scan a QR code and get traceability information
const scanQRCode = async (qrHash) => {
  const qrCode = await prisma.qRCode.findUnique({
    where: { qrHash },
    include: {
      generatedByUser: {
        select: {
          userId: true,
          firstName: true,
          lastName: true,
          orgType: true,
        }
      }
    }
  });

  if (!qrCode || !qrCode.isActive) {
    return null;
  }

  // Update scan count
  await prisma.qRCode.update({
    where: { qrCodeId: qrCode.qrCodeId },
    data: {
      scanCount: { increment: 1 },
      lastScannedAt: new Date(),
    }
  });

  let entityData = null;
  let traceabilityData = null;

  // Get entity data based on type
  switch (qrCode.entityType) {
    case 'RAW_MATERIAL_BATCH':
      entityData = await prisma.rawMaterialBatch.findUnique({
        where: { batchId: qrCode.entityId },
        include: {
          collectionEvents: {
            include: {
              farmer: {
                select: {
                  userId: true,
                  firstName: true,
                  lastName: true,
                  phone: true,
                  location: true,
                  latitude: true,
                  longitude: true,
                }
              },
              collector: {
                select: {
                  userId: true,
                  firstName: true,
                  lastName: true,
                }
              },
              herbSpecies: true,
            }
          },
          supplyChainEvents: {
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
            },
            orderBy: { timestamp: 'asc' }
          }
        }
      });
      break;

    case 'FINISHED_GOOD':
      entityData = await prisma.finishedGood.findUnique({
        where: { productId: qrCode.entityId },
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
                include: {
                  collectionEvents: {
                    include: {
                      farmer: {
                        select: {
                          userId: true,
                          firstName: true,
                          lastName: true,
                          phone: true,
                          location: true,
                          latitude: true,
                          longitude: true,
                        }
                      },
                      herbSpecies: true,
                    }
                  }
                }
              }
            }
          },
          supplyChainEvents: {
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
            },
            orderBy: { timestamp: 'asc' }
          }
        }
      });

      // For finished goods, we also want to trace back to all source farmers
      if (entityData) {
        const allFarmers = new Set();
        const allHerbs = new Set();
        
        entityData.composition.forEach(comp => {
          comp.rawMaterialBatch.collectionEvents.forEach(event => {
            if (event.farmer) {
              allFarmers.add(JSON.stringify(event.farmer));
            }
            if (event.herbSpecies) {
              allHerbs.add(JSON.stringify(event.herbSpecies));
            }
          });
        });

        traceabilityData = {
          sourceFarmers: Array.from(allFarmers).map(f => JSON.parse(f)),
          sourceHerbs: Array.from(allHerbs).map(h => JSON.parse(h)),
          rawMaterialBatches: entityData.composition.map(comp => ({
            batchId: comp.rawMaterialBatch.batchId,
            herbName: comp.rawMaterialBatch.herbName,
            percentage: comp.percentage,
            quantityUsed: comp.quantityUsed,
          }))
        };
      }
      break;

    case 'SUPPLY_CHAIN_EVENT':
      entityData = await prisma.supplyChainEvent.findUnique({
        where: { eventId: qrCode.entityId },
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
            include: {
              collectionEvents: {
                include: {
                  farmer: true,
                  herbSpecies: true,
                }
              }
            }
          },
          finishedGood: {
            include: {
              manufacturer: true,
              composition: {
                include: {
                  rawMaterialBatch: true,
                }
              }
            }
          }
        }
      });
      break;
  }

  return {
    qrCode: {
      qrCodeId: qrCode.qrCodeId,
      qrHash: qrCode.qrHash,
      entityType: qrCode.entityType,
      entityId: qrCode.entityId,
      scanCount: qrCode.scanCount + 1, // Include the current scan
      customData: qrCode.customData,
      generatedBy: qrCode.generatedByUser,
      createdAt: qrCode.createdAt,
    },
    entityData,
    traceabilityData,
    scanInfo: {
      scannedAt: new Date(),
      totalScans: qrCode.scanCount + 1,
    }
  };
};

// Update QR code metadata
const updateQRCode = async (qrCodeId, data) => {
  try {
    return await prisma.qRCode.update({
      where: { qrCodeId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        generatedByUser: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            orgType: true,
          }
        }
      }
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return null; // Record not found
    }
    throw error;
  }
};

// Delete a QR code
const deleteQRCode = async (qrCodeId) => {
  try {
    return await prisma.qRCode.delete({
      where: { qrCodeId },
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return null; // Record not found
    }
    throw error;
  }
};

// Get QR code analytics
const getQRCodeAnalytics = async (filters = {}) => {
  const { startDate, endDate, entityType } = filters;
  
  const where = {};
  if (startDate && endDate) {
    where.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }
  if (entityType) {
    where.entityType = entityType;
  }

  const qrCodes = await prisma.qRCode.findMany({
    where,
    include: {
      generatedByUser: {
        select: { orgType: true }
      }
    }
  });

  // Analytics calculations
  const qrCodesByEntityType = qrCodes.reduce((acc, qr) => {
    acc[qr.entityType] = (acc[qr.entityType] || 0) + 1;
    return acc;
  }, {});

  const qrCodesByGenerator = qrCodes.reduce((acc, qr) => {
    const orgType = qr.generatedByUser?.orgType || 'UNKNOWN';
    acc[orgType] = (acc[orgType] || 0) + 1;
    return acc;
  }, {});

  const totalScans = qrCodes.reduce((sum, qr) => sum + (qr.scanCount || 0), 0);
  const activeQRCodes = qrCodes.filter(qr => qr.isActive).length;

  return {
    totalQRCodes: qrCodes.length,
    activeQRCodes,
    inactiveQRCodes: qrCodes.length - activeQRCodes,
    totalScans,
    averageScansPerQR: qrCodes.length > 0 ? (totalScans / qrCodes.length).toFixed(2) : 0,
    qrCodesByEntityType,
    qrCodesByGenerator,
    timeRange: { startDate, endDate },
  };
};

module.exports = {
  generateQRCode,
  getQRCodes,
  getQRCodeById,
  scanQRCode,
  updateQRCode,
  deleteQRCode,
  getQRCodeAnalytics,
};
