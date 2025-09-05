const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

// Upload a new document
const uploadDocument = async (data) => {
  return await prisma.document.create({
    data: {
      ...data,
      // Let Prisma generate UUID automatically
    },
    include: {
      uploadedByUser: {
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

// Get all documents with pagination and filters
const getDocuments = async ({ page, limit, documentType, entityType, entityId }) => {
  const skip = (page - 1) * limit;
  
  const where = {};
  if (documentType) {
    where.documentType = documentType;
  }
  if (entityType) {
    where.entityType = entityType;
  }
  if (entityId) {
    where.entityId = entityId;
  }
  
  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where,
      skip,
      take: limit,
      include: {
        uploadedByUser: {
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
    prisma.document.count({ where }),
  ]);
  
  return {
    documents,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

// Get a document by ID
const getDocumentById = async (documentId) => {
  return await prisma.document.findUnique({
    where: { documentId },
    include: {
      uploadedByUser: {
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

// Get documents for a specific entity
const getDocumentsByEntity = async (entityType, entityId) => {
  const documents = await prisma.document.findMany({
    where: {
      entityType,
      entityId,
    },
    include: {
      uploadedByUser: {
        select: {
          userId: true,
          firstName: true,
          lastName: true,
          orgType: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' },
  });

  // Group documents by type for better organization
  const documentsByType = documents.reduce((acc, doc) => {
    const type = doc.documentType;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(doc);
    return acc;
  }, {});

  return {
    documents,
    documentsByType,
    summary: {
      totalDocuments: documents.length,
      documentTypes: Object.keys(documentsByType),
      publicDocuments: documents.filter(doc => doc.isPublic).length,
      privateDocuments: documents.filter(doc => !doc.isPublic).length,
    }
  };
};

// Update document metadata
const updateDocument = async (documentId, data) => {
  try {
    return await prisma.document.update({
      where: { documentId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        uploadedByUser: {
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

// Delete a document
const deleteDocument = async (documentId) => {
  try {
    // Get document info first to delete the file
    const document = await prisma.document.findUnique({
      where: { documentId }
    });

    if (!document) {
      return null;
    }

    // Delete the physical file
    try {
      await fs.unlink(document.filePath);
    } catch (fileError) {
      console.warn(`Could not delete file ${document.filePath}:`, fileError.message);
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    return await prisma.document.delete({
      where: { documentId },
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return null; // Record not found
    }
    throw error;
  }
};

// Get document statistics
const getDocumentStatistics = async (filters = {}) => {
  const { startDate, endDate, entityType, documentType } = filters;
  
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
  if (documentType) {
    where.documentType = documentType;
  }

  const documents = await prisma.document.findMany({
    where,
    include: {
      uploadedByUser: {
        select: { orgType: true }
      }
    }
  });

  // Calculate statistics
  const documentsByType = documents.reduce((acc, doc) => {
    acc[doc.documentType] = (acc[doc.documentType] || 0) + 1;
    return acc;
  }, {});

  const documentsByEntityType = documents.reduce((acc, doc) => {
    acc[doc.entityType] = (acc[doc.entityType] || 0) + 1;
    return acc;
  }, {});

  const documentsByUploader = documents.reduce((acc, doc) => {
    const orgType = doc.uploadedByUser?.orgType || 'UNKNOWN';
    acc[orgType] = (acc[orgType] || 0) + 1;
    return acc;
  }, {});

  const totalFileSize = documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0);

  return {
    totalDocuments: documents.length,
    documentsByType,
    documentsByEntityType,
    documentsByUploader,
    totalFileSize,
    publicDocuments: documents.filter(doc => doc.isPublic).length,
    privateDocuments: documents.filter(doc => !doc.isPublic).length,
    timeRange: { startDate, endDate },
  };
};

// Search documents
const searchDocuments = async (searchTerm, filters = {}) => {
  const { documentType, entityType, isPublic } = filters;
  
  const where = {
    OR: [
      { fileName: { contains: searchTerm, mode: 'insensitive' } },
      { description: { contains: searchTerm, mode: 'insensitive' } },
    ],
  };

  if (documentType) {
    where.documentType = documentType;
  }
  if (entityType) {
    where.entityType = entityType;
  }
  if (typeof isPublic === 'boolean') {
    where.isPublic = isPublic;
  }

  return await prisma.document.findMany({
    where,
    include: {
      uploadedByUser: {
        select: {
          userId: true,
          firstName: true,
          lastName: true,
          orgType: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' },
  });
};

module.exports = {
  uploadDocument,
  getDocuments,
  getDocumentById,
  getDocumentsByEntity,
  updateDocument,
  deleteDocument,
  getDocumentStatistics,
  searchDocuments,
};
