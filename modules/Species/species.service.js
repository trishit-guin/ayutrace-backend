const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new herb species
const createSpecies = async (data) => {
  try {
    return await prisma.herbSpecies.create({
      data: {
        ...data,
        // Let Prisma generate UUID automatically
      },
    });
  } catch (error) {
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      const field = error.meta?.target;
      if (field?.includes('scientific_name')) {
        throw new Error(`A species with scientific name "${data.scientificName}" already exists`);
      }
      if (field?.includes('species_name_unique')) {
        throw new Error(`A species with common name "${data.commonName}" and scientific name "${data.scientificName}" already exists`);
      }
      throw new Error('A species with this information already exists');
    }
    throw error;
  }
};

// Get all herb species with pagination and filters
const getSpecies = async ({ page, limit, commonName, scientificName, family, conservationStatus }) => {
  const skip = (page - 1) * limit;
  
  const where = {};
  if (commonName) {
    where.commonName = { contains: commonName, mode: 'insensitive' };
  }
  if (scientificName) {
    where.scientificName = { contains: scientificName, mode: 'insensitive' };
  }
  if (family) {
    where.family = { contains: family, mode: 'insensitive' };
  }
  if (conservationStatus) {
    where.conservationStatus = conservationStatus;
  }
  
  const [species, total] = await Promise.all([
    prisma.herbSpecies.findMany({
      where,
      skip,
      take: limit,
      include: {
        collectionEvents: {
          select: {
            eventId: true,
            collectionDate: true,
            quantity: true,
          },
          orderBy: { collectionDate: 'desc' },
          take: 5, // Recent collection events
        },
        _count: {
          select: {
            collectionEvents: true,
          }
        }
      },
      orderBy: { commonName: 'asc' },
    }),
    prisma.herbSpecies.count({ where }),
  ]);
  
  return {
    species,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

// Get a herb species by ID
const getSpeciesById = async (speciesId) => {
  return await prisma.herbSpecies.findUnique({
    where: { speciesId },
    include: {
      collectionEvents: {
        include: {
          farmer: {
            select: {
              farmerId: true,
              name: true,
              location: true,
            }
          },
          collector: {
            select: {
              userId: true,
              firstName: true,
              lastName: true,
            }
          },
          location: true,
        },
        orderBy: { collectionDate: 'desc' },
      },
      _count: {
        select: {
          collectionEvents: true,
        }
      }
    }
  });
};

// Get herb species by native region
const getSpeciesByRegion = async (region) => {
  const species = await prisma.herbSpecies.findMany({
    where: {
      nativeRegions: {
        has: region, // PostgreSQL array contains operation
      }
    },
    include: {
      _count: {
        select: {
          collectionEvents: true,
        }
      }
    },
    orderBy: { commonName: 'asc' },
  });

  // Get regional statistics
  const regionStats = {
    totalSpecies: species.length,
    conservationStatusBreakdown: species.reduce((acc, sp) => {
      const status = sp.conservationStatus || 'UNKNOWN';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {}),
    regulatedSpecies: species.filter(sp => sp.regulatoryInfo?.isRegulated).length,
    speciesWithCollections: species.filter(sp => sp._count.collectionEvents > 0).length,
  };

  return {
    region,
    species,
    statistics: regionStats,
  };
};

// Update a herb species
const updateSpecies = async (speciesId, data) => {
  try {
    return await prisma.herbSpecies.update({
      where: { speciesId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return null; // Record not found
    }
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      const field = error.meta?.target;
      if (field?.includes('scientific_name')) {
        throw new Error(`A species with scientific name "${data.scientificName}" already exists`);
      }
      if (field?.includes('species_name_unique')) {
        throw new Error(`A species with common name "${data.commonName}" and scientific name "${data.scientificName}" already exists`);
      }
      throw new Error('A species with this information already exists');
    }
    throw error;
  }
};

// Delete a herb species
const deleteSpecies = async (speciesId) => {
  try {
    // Check if species has collection events
    const collectionCount = await prisma.collectionEvent.count({
      where: { herbSpeciesId: speciesId }
    });

    if (collectionCount > 0) {
      throw new Error('Cannot delete species with existing collection events. Please archive instead.');
    }

    return await prisma.herbSpecies.delete({
      where: { speciesId },
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return null; // Record not found
    }
    throw error;
  }
};

// Get species analytics
const getSpeciesAnalytics = async (filters = {}) => {
  const { startDate, endDate, region, conservationStatus } = filters;
  
  const where = {};
  if (region) {
    where.nativeRegions = { has: region };
  }
  if (conservationStatus) {
    where.conservationStatus = conservationStatus;
  }

  const species = await prisma.herbSpecies.findMany({
    where,
    include: {
      collectionEvents: {
        where: startDate && endDate ? {
          collectionDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          }
        } : undefined,
        select: {
          quantity: true,
          collectionDate: true,
        }
      }
    }
  });

  // Analytics calculations
  const conservationBreakdown = species.reduce((acc, sp) => {
    const status = sp.conservationStatus || 'UNKNOWN';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const familyBreakdown = species.reduce((acc, sp) => {
    const family = sp.family || 'UNKNOWN';
    acc[family] = (acc[family] || 0) + 1;
    return acc;
  }, {});

  const collectionStats = species.reduce((acc, sp) => {
    const totalCollected = sp.collectionEvents.reduce((sum, event) => 
      sum + parseFloat(event.quantity || 0), 0
    );
    acc.totalQuantityCollected += totalCollected;
    acc.speciesWithCollections += sp.collectionEvents.length > 0 ? 1 : 0;
    return acc;
  }, { totalQuantityCollected: 0, speciesWithCollections: 0 });

  const regulatoryStats = {
    regulatedSpecies: species.filter(sp => sp.regulatoryInfo?.isRegulated).length,
    permitRequiredSpecies: species.filter(sp => sp.regulatoryInfo?.permitRequired).length,
  };

  return {
    totalSpecies: species.length,
    conservationBreakdown,
    familyBreakdown,
    collectionStatistics: collectionStats,
    regulatoryStatistics: regulatoryStats,
    timeRange: { startDate, endDate },
    regionFilter: region,
  };
};

// Search species by medicinal uses
const searchSpeciesByMedicinalUse = async (searchTerm) => {
  return await prisma.herbSpecies.findMany({
    where: {
      medicinalUses: {
        has: searchTerm, // Search in array
      }
    },
    include: {
      _count: {
        select: {
          collectionEvents: true,
        }
      }
    },
    orderBy: { commonName: 'asc' },
  });
};

// Get endangered species
const getEndangeredSpecies = async () => {
  return await prisma.herbSpecies.findMany({
    where: {
      conservationStatus: {
        in: ['VULNERABLE', 'ENDANGERED', 'CRITICALLY_ENDANGERED']
      }
    },
    include: {
      collectionEvents: {
        select: {
          eventId: true,
          collectionDate: true,
          quantity: true,
        },
        orderBy: { collectionDate: 'desc' },
        take: 3,
      },
      _count: {
        select: {
          collectionEvents: true,
        }
      }
    },
    orderBy: [
      { conservationStatus: 'desc' }, // Most endangered first
      { commonName: 'asc' }
    ],
  });
};

module.exports = {
  createSpecies,
  getSpecies,
  getSpeciesById,
  getSpeciesByRegion,
  updateSpecies,
  deleteSpecies,
  getSpeciesAnalytics,
  searchSpeciesByMedicinalUse,
  getEndangeredSpecies,
};
