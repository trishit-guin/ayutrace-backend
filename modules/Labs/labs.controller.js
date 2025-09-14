const { 
  getLabMetrics, 
  getLabTests, 
  createLabTest, 
  updateLabTest, 
  deleteLabTest,
  getLabTestById,
  getLabCertificates,
  createCertificate,
  getLabsByType
} = require('./labs.service');

async function getLabDashboardHandler(req, res) {
  try {
    const { organizationId } = req.user;
    const metrics = await getLabMetrics(organizationId);
    
    return res.status(200).json({
      success: true,
      message: 'Lab dashboard metrics retrieved successfully',
      data: metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Lab dashboard error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
}

async function getLabTestsHandler(req, res) {
  try {
    const { organizationId, userId } = req.user;
    const { page = 1, limit = 10, status, testType, priority } = req.query;
    
    const filters = {
      ...(status && { status }),
      ...(testType && { testType }),
      ...(priority && { priority })
    };
    
    const result = await getLabTests(organizationId, {
      page: parseInt(page),
      limit: parseInt(limit),
      filters
    });
    
    return res.status(200).json({
      success: true,
      message: 'Lab tests retrieved successfully',
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Get lab tests error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
}

async function getLabTestByIdHandler(req, res) {
  try {
    const { testId } = req.params;
    const { organizationId } = req.user;
    
    const labTest = await getLabTestById(testId, organizationId);
    
    if (!labTest) {
      return res.status(404).json({
        message: 'Lab test not found',
        timestamp: new Date().toISOString(),
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Lab test retrieved successfully',
      data: labTest,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Get lab test error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
}

async function createLabTestHandler(req, res) {
  try {
    const { organizationId, userId } = req.user;
    const testData = {
      ...req.body,
      organizationId,
      requesterId: userId
    };
    
    const labTest = await createLabTest(testData);
    
    return res.status(201).json({
      success: true,
      message: 'Lab test created successfully',
      data: labTest,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Create lab test error:', error);
    
    if (error.code === 'P2003') {
      return res.status(400).json({ 
        message: 'Invalid batch ID or finished good ID provided',
        timestamp: new Date().toISOString(),
      });
    }
    
    return res.status(500).json({ 
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
}

async function updateLabTestHandler(req, res) {
  try {
    const { testId } = req.params;
    const { organizationId, userId } = req.user;
    
    const updatedTest = await updateLabTest(testId, req.body, organizationId);
    
    if (!updatedTest) {
      return res.status(404).json({
        message: 'Lab test not found',
        timestamp: new Date().toISOString(),
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Lab test updated successfully',
      data: updatedTest,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Update lab test error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
}

async function deleteLabTestHandler(req, res) {
  try {
    const { testId } = req.params;
    const { organizationId } = req.user;
    
    const deleted = await deleteLabTest(testId, organizationId);
    
    if (!deleted) {
      return res.status(404).json({
        message: 'Lab test not found',
        timestamp: new Date().toISOString(),
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Lab test deleted successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Delete lab test error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
}

async function getLabCertificatesHandler(req, res) {
  try {
    const { organizationId } = req.user;
    const { page = 1, limit = 10, certificateType, isValid } = req.query;
    
    const filters = {
      ...(certificateType && { certificateType }),
      ...(isValid !== undefined && { isValid: isValid === 'true' })
    };
    
    const result = await getLabCertificates(organizationId, {
      page: parseInt(page),
      limit: parseInt(limit),
      filters
    });
    
    return res.status(200).json({
      success: true,
      message: 'Lab certificates retrieved successfully',
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Get lab certificates error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
}

async function createCertificateHandler(req, res) {
  try {
    const { organizationId, userId } = req.user;
    const certificateData = {
      ...req.body,
      organizationId,
      issuerId: userId
    };
    
    const certificate = await createCertificate(certificateData);
    
    return res.status(201).json({
      success: true,
      message: 'Certificate created successfully',
      data: certificate,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Create certificate error:', error);
    
    if (error.code === 'P2002') {
      return res.status(409).json({ 
        message: 'Certificate number already exists',
        timestamp: new Date().toISOString(),
      });
    }
    
    return res.status(500).json({ 
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
}

async function getLabsHandler(req, res) {
  try {
    const { type } = req.query;
    const labs = await getLabsByType(type);
    
    return res.status(200).json({
      success: true,
      message: 'Labs retrieved successfully',
      data: labs,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Get labs error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
}

async function downloadCertificateHandler(req, res) {
  try {
    const { testId } = req.params;
    const { organizationId } = req.user;
    const path = require('path');
    const fs = require('fs');
    
    // Check if test exists and belongs to the organization
    const test = await getLabTestById(testId, organizationId);
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found or access denied',
        timestamp: new Date().toISOString(),
      });
    }
    
    if (test.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Certificate is only available for completed tests',
        timestamp: new Date().toISOString(),
      });
    }
    
    // Find certificate files in the certificates directory
    const certificatesDir = path.join(__dirname, '../../uploads/certificates');
    
    if (!fs.existsSync(certificatesDir)) {
      return res.status(404).json({
        success: false,
        message: 'Certificates directory not found',
        timestamp: new Date().toISOString(),
      });
    }
    
    const files = fs.readdirSync(certificatesDir);
    console.log('Available certificate files:', files);
    
    // Look for certificate file that matches this test
    let certificateFile = null;
    
    // First, try to find certificate from database
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    try {
      const certificate = await prisma.certificate.findFirst({
        where: { testId: testId },
        orderBy: { issueDate: 'desc' }
      });
      
      if (certificate && certificate.digitalSignature) {
        // Check if the file with this name exists
        const dbFileName = certificate.digitalSignature;
        if (files.includes(dbFileName)) {
          certificateFile = dbFileName;
          console.log('Found certificate file from database:', dbFileName);
        } else {
          // Look for any file that contains the certificate ID
          certificateFile = files.find(file => file.includes(certificate.certificateId));
          console.log('Found certificate file by ID match:', certificateFile);
        }
      }
      
      if (!certificateFile) {
        // Fallback: try to find a file with test ID in name
        certificateFile = files.find(file => file.includes(testId));
        console.log('Found certificate file by test ID match:', certificateFile);
      }
      
    } catch (dbError) {
      console.error('Error finding certificate in database:', dbError);
      // Fallback to file system search
      certificateFile = files.find(file => file.includes(testId));
    } finally {
      await prisma.$disconnect();
    }
    
    if (certificateFile) {
      const certificatePath = path.join(certificatesDir, certificateFile);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="certificate_${testId}.pdf"`);
      res.sendFile(certificatePath);
    } else {
      // Certificate file doesn't exist, return error
      return res.status(404).json({
        success: false,
        message: 'Certificate file not found. It may not have been generated yet.',
        timestamp: new Date().toISOString(),
      });
    }
    
  } catch (error) {
    console.error('Download certificate error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = {
  getLabDashboardHandler,
  getLabTestsHandler,
  getLabTestByIdHandler,
  createLabTestHandler,
  updateLabTestHandler,
  deleteLabTestHandler,
  getLabCertificatesHandler,
  createCertificateHandler,
  getLabsHandler,
  downloadCertificateHandler
};