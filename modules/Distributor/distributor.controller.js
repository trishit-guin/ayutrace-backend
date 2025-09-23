const { 
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
  generateAnalytics
} = require('./distributor.service');

// Import QR code service for scanning functionality
const { getQRCodeInfo } = require('../QRCode/qrCode.service');

async function getDistributorDashboardHandler(req, res) {
  try {
    const { userId } = req.user;
    const metrics = await getDistributorMetrics(userId);
    
    return res.status(200).json({
      success: true,
      message: 'Distributor dashboard metrics retrieved successfully',
      data: metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Distributor dashboard error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
}

async function getInventoryHandler(req, res) {
  try {
    const { userId } = req.user;
    const { page = 1, limit = 10, status, productType, location } = req.query;
    
    const filters = {
      ...(status && { status }),
      ...(productType && { productType }),
      ...(location && { location })
    };
    
    const result = await getInventory(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      filters
    });
    
    return res.status(200).json({
      success: true,
      message: 'Inventory retrieved successfully',
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
}

async function addInventoryItemHandler(req, res) {
  try {
    const { userId } = req.user;
    const itemData = req.body;
    
    const inventoryItem = await addInventoryItem(userId, itemData);
    
    return res.status(201).json({
      success: true,
      message: 'Inventory item added successfully',
      data: inventoryItem,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Add inventory item error:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ 
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
    
    return res.status(500).json({ 
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
}

async function updateInventoryItemHandler(req, res) {
  try {
    const { inventoryId } = req.params;
    const { userId } = req.user;
    const updateData = req.body;
    
    const updatedItem = await updateInventoryItem(inventoryId, userId, updateData);
    
    return res.status(200).json({
      success: true,
      message: 'Inventory item updated successfully',
      data: updatedItem,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Update inventory item error:', error);
    
    if (error.message.includes('not found') || error.message.includes('unauthorized')) {
      return res.status(404).json({ 
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
    
    return res.status(500).json({ 
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
}

async function getShipmentsHandler(req, res) {
  try {
    const { userId } = req.user;
    const { page = 1, limit = 10, status, recipientType, trackingNumber } = req.query;
    
    const filters = {
      ...(status && { status }),
      ...(recipientType && { recipientType }),
      ...(trackingNumber && { trackingNumber })
    };
    
    const result = await getShipments(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      filters
    });
    
    return res.status(200).json({
      success: true,
      message: 'Shipments retrieved successfully',
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Get shipments error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
}

async function createShipmentHandler(req, res) {
  try {
    const { userId } = req.user;
    const shipmentData = req.body;
    
    const shipment = await createShipment(userId, shipmentData);
    
    return res.status(201).json({
      success: true,
      message: 'Shipment created successfully',
      data: shipment,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Create shipment error:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ 
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
    
    return res.status(500).json({ 
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
}

async function updateShipmentStatusHandler(req, res) {
  try {
    const { shipmentId } = req.params;
    const { userId } = req.user;
    const statusData = req.body;
    
    const updatedShipment = await updateShipmentStatus(shipmentId, userId, statusData);
    
    return res.status(200).json({
      success: true,
      message: 'Shipment status updated successfully',
      data: updatedShipment,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Update shipment status error:', error);
    
    if (error.message.includes('not found') || error.message.includes('unauthorized')) {
      return res.status(404).json({ 
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
    
    return res.status(500).json({ 
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
}

async function getVerificationsHandler(req, res) {
  try {
    const { userId } = req.user;
    const { page = 1, limit = 10, status, verificationType, entityType } = req.query;
    
    const filters = {
      ...(status && { status }),
      ...(verificationType && { verificationType }),
      ...(entityType && { entityType })
    };
    
    const result = await getVerifications(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      filters
    });
    
    return res.status(200).json({
      success: true,
      message: 'Verifications retrieved successfully',
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Get verifications error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
}

async function createVerificationHandler(req, res) {
  try {
    const { userId } = req.user;
    const verificationData = req.body;
    
    const verification = await createVerification(userId, verificationData);
    
    return res.status(201).json({
      success: true,
      message: 'Verification created successfully',
      data: verification,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Create verification error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
}

async function updateVerificationHandler(req, res) {
  try {
    const { verificationId } = req.params;
    const { userId } = req.user;
    const updateData = req.body;
    
    const updatedVerification = await updateVerification(verificationId, userId, updateData);
    
    return res.status(200).json({
      success: true,
      message: 'Verification updated successfully',
      data: updatedVerification,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Update verification error:', error);
    
    if (error.message.includes('not found') || error.message.includes('unauthorized')) {
      return res.status(404).json({ 
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
    
    return res.status(500).json({ 
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
}

async function generateAnalyticsHandler(req, res) {
  try {
    const { userId } = req.user;
    const { reportType = 'INVENTORY_SUMMARY' } = req.query;
    
    const analytics = await generateAnalytics(userId, reportType);
    
    return res.status(200).json({
      success: true,
      message: 'Analytics generated successfully',
      data: analytics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Generate analytics error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
}

async function scanQRCodeHandler(req, res) {
  try {
    const { qrCode } = req.body;
    
    if (!qrCode) {
      return res.status(400).json({
        success: false,
        message: 'QR code data is required',
        timestamp: new Date().toISOString(),
      });
    }

    const qrInfo = await getQRCodeInfo(qrCode);
    
    return res.status(200).json({
      success: true,
      message: 'QR code scanned successfully',
      data: qrInfo,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('QR code scan error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to scan QR code: ' + (error.message || 'Unknown error'),
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = {
  getDistributorDashboardHandler,
  getInventoryHandler,
  addInventoryItemHandler,
  updateInventoryItemHandler,
  getShipmentsHandler,
  createShipmentHandler,
  updateShipmentStatusHandler,
  getVerificationsHandler,
  createVerificationHandler,
  updateVerificationHandler,
  generateAnalyticsHandler,
  scanQRCodeHandler
};