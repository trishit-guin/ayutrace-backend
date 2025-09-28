const axios = require('axios');

/**
 * Service for interacting with the blockchain server
 */
class BlockchainService {
  constructor() {
    this.baseURL = process.env.BLOCKCHAIN_SERVER_URL;
    if (!this.baseURL) {
      console.error('BLOCKCHAIN_SERVER_URL not configured in environment variables');
    }
  }

  /**
   * Reverse geocode coordinates to get location string
   * Using OpenStreetMap Nominatim API (free, no API key required)
   */
  async reverseGeocode(latitude, longitude) {
    try {
      console.log(`🌍 [BlockchainService] Reverse geocoding coordinates: ${latitude}, ${longitude}`);
      
      const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
        params: {
          lat: latitude,
          lon: longitude,
          format: 'json',
          zoom: 10,
          addressdetails: 1
        },
        headers: {
          'User-Agent': 'AyuTrace-Backend/1.0.0'
        },
        timeout: 5000 // 5 second timeout
      });

      if (response.data && response.data.address) {
        const address = response.data.address;
        const location = [
          address.city || address.town || address.village,
          address.state,
          address.country
        ].filter(Boolean).join(', ');
        
        console.log(`✅ [BlockchainService] Reverse geocoding successful: ${location}`);
        return location || `${latitude}, ${longitude}`;
      }
      
      console.log(`⚠️ [BlockchainService] No address found, using coordinates: ${latitude}, ${longitude}`);
      return `${latitude}, ${longitude}`;
    } catch (error) {
      console.error(`❌ [BlockchainService] Reverse geocoding failed:`, error.message);
      return `${latitude}, ${longitude}`;
    }
  }

  /**
   * Send collection event to blockchain
   */
  async sendCollectionEvent(collectionData) {
    try {
      if (!this.baseURL) {
        throw new Error('Blockchain server URL not configured');
      }

      console.log(`🔗 [BlockchainService] Sending collection event to blockchain: ${this.baseURL}/collectionEvent`);
      console.log(`📤 [BlockchainService] Collection data:`, JSON.stringify(collectionData, null, 2));
      console.log(`📤 [BlockchainService] Full Request Body:`, collectionData);

      const response = await axios.post(`${this.baseURL}/collectionEvent`, collectionData, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'AyuTrace-Backend/1.0.0'
        },
        timeout: 10000 // 10 second timeout
      });

      console.log(`✅ [BlockchainService] Collection event sent successfully to blockchain`);
      console.log(`📥 [BlockchainService] Blockchain response:`, response.data);
      
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      console.error(`❌ [BlockchainService] Failed to send collection event to blockchain:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: `${this.baseURL}/collectionEvent`
      });
      
      return {
        success: false,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      };
    }
  }

  /**
   * Send finished good data to blockchain
   */
  async sendFinishedGoodToBlockchain(finishedGoodData) {
    try {
      console.log(`🚀 [BlockchainService] Sending finished good to blockchain:`, {
        productId: finishedGoodData.productId,
        productName: finishedGoodData.productName,
        manufacturerId: finishedGoodData.manufacturerId,
        sourceCollectionEventIds: finishedGoodData.sourceCollectionEventIds
      });
      console.log(`📤 [BlockchainService] Full Request Body to ${this.baseURL}/finishedGood:`);
      console.log(JSON.stringify(finishedGoodData, null, 2));

      const response = await axios.post(`${this.baseURL}/finishedGood`, finishedGoodData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });

      console.log(`✅ [BlockchainService] Finished good sent to blockchain successfully:`, {
        status: response.status,
        productId: finishedGoodData.productId
      });

      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      console.error(`❌ [BlockchainService] Failed to send finished good to blockchain:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: `${this.baseURL}/finishedGood`
      });
      
      return {
        success: false,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      };
    }
  }

  /**
   * Prepare finished good data for blockchain
   */
  async prepareFinishedGoodData(finishedGood, sourceCollectionEventIds) {
    try {
      console.log(`🔧 [BlockchainService] Preparing finished good data for blockchain`);
      
      // Validate required fields
      if (!finishedGood.batchNumber) {
        throw new Error('batchNumber is required for blockchain integration');
      }
      
      // Format the data according to blockchain API requirements
      // Ensure all fields are strings or proper types (not null) to prevent toString() errors
      const blockchainData = {
        productId: finishedGood.productId || '',
        manufacturerId: finishedGood.manufacturerId || '',
        productName: finishedGood.productName || '',
        productType: finishedGood.productType || '',
        quantity: parseFloat(finishedGood.quantity) || 0,
        unit: finishedGood.unit || '',
        description: finishedGood.description || '',
        batchNumber: finishedGood.batchNumber || '', // Required field - no fallback
        expiryDate: finishedGood.expiryDate ? finishedGood.expiryDate.toISOString() : '',
        sourceCollectionEventIds: sourceCollectionEventIds || []
      };

      console.log(`✅ [BlockchainService] Finished good data prepared successfully`);
      return blockchainData;
    } catch (error) {
      console.error(`❌ [BlockchainService] Failed to prepare finished good data:`, error.message);
      throw error;
    }
  }

  /**
   * Prepare collection event data for blockchain
   */
  async prepareCollectionEventData(collectionEvent, collector) {
    try {
      console.log(`🔧 [BlockchainService] Preparing collection event data for blockchain`);
      
      // Get location from coordinates
      const location = await this.reverseGeocode(collectionEvent.latitude, collectionEvent.longitude);
      
      // Format the data according to blockchain API requirements
      // Ensure all fields are strings or proper types (not null) to prevent toString() errors
      const blockchainData = {
        eventId: collectionEvent.eventId || '',
        collectorId: collector.userId || '',
        farmerId: collector.userId || '', // Same as collector for farmer collections
        herbSpeciesId: collectionEvent.herbSpeciesId || '',
        collectionDate: collectionEvent.collectionDate ? collectionEvent.collectionDate.toISOString() : '',
        location: location || '',
        geoTag: `geo:${collectionEvent.latitude || 0},${collectionEvent.longitude || 0}`,
        networkId: 'ayutrace-chain-32343',
        gasLimit: 180000,
        quantity: parseFloat(collectionEvent.quantity) || 0,
        unit: (collectionEvent.unit || '').toUpperCase(),
        qualityNotes: collectionEvent.qualityNotes || 'No quality notes provided',
        notes: collectionEvent.notes || 'Collection event created via API'
      };

      console.log(`✅ [BlockchainService] Collection event data prepared successfully`);
      return blockchainData;
    } catch (error) {
      console.error(`❌ [BlockchainService] Failed to prepare collection event data:`, error.message);
      throw error;
    }
  }

  /**
   * Send supply chain event data to blockchain
   */
  async sendSupplyChainEventToBlockchain(supplyChainEventData) {
    try {
      console.log(`🚀 [BlockchainService] Sending supply chain event to blockchain:`, {
        eventId: supplyChainEventData.eventId,
        eventType: supplyChainEventData.eventType,
        handlerId: supplyChainEventData.handlerId,
        finishedGoodId: supplyChainEventData.finishedGoodId
      });
      console.log(`📤 [BlockchainService] Full Request Body to ${this.baseURL}/supplyChainEvent:`);
      console.log(JSON.stringify(supplyChainEventData, null, 2));

      const response = await axios.post(`${this.baseURL}/supplyChainEvent`, supplyChainEventData, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'AyuTrace-Backend/1.0.0'
        },
        timeout: 10000 // 10 second timeout
      });

      console.log(`✅ [BlockchainService] Supply chain event sent successfully to blockchain`);
      console.log(`📥 [BlockchainService] Blockchain response:`, response.data);
      
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      console.error(`❌ [BlockchainService] Failed to send supply chain event to blockchain:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: `${this.baseURL}/supplyChainEvent`
      });
      
      return {
        success: false,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      };
    }
  }

  /**
   * Prepare supply chain event data for blockchain
   */
  async prepareSupplyChainEventData(supplyChainEvent) {
    try {
      console.log(`🔧 [BlockchainService] Preparing supply chain event data for blockchain`);
      console.log(`📝 [BlockchainService] Input supplyChainEvent data:`, JSON.stringify(supplyChainEvent, null, 2));
      
      // Log specific finishedGoodId extraction
      console.log(`🔍 [BlockchainService] Checking finishedGoodId:`, {
        'supplyChainEvent.finishedGoodId': supplyChainEvent.finishedGoodId,
        'typeof finishedGoodId': typeof supplyChainEvent.finishedGoodId,
        'finishedGoodId is null': supplyChainEvent.finishedGoodId === null,
        'finishedGoodId is undefined': supplyChainEvent.finishedGoodId === undefined,
        'finishedGoodId truthy': !!supplyChainEvent.finishedGoodId
      });
      
      // Format the data according to blockchain API requirements
      // Ensure all fields are properly mapped and not null to prevent toString() errors
      const blockchainData = {
        eventId: supplyChainEvent.eventId || '',
        eventType: supplyChainEvent.eventType || '',
        handlerId: supplyChainEvent.handlerId || '',
        fromLocationId: supplyChainEvent.fromLocationId || '',
        toLocationId: supplyChainEvent.toLocationId || '',
        finishedGoodId: supplyChainEvent.finishedGoodId || '',
        rawMaterialBatchId: supplyChainEvent.rawMaterialBatchId || '',
        notes: supplyChainEvent.notes || '',
        custody: supplyChainEvent.custody || null
      };

      console.log(`📤 [BlockchainService] Prepared blockchain data:`, JSON.stringify(blockchainData, null, 2));
      console.log(`🔍 [BlockchainService] Final finishedGoodId check:`, {
        'blockchainData.finishedGoodId': blockchainData.finishedGoodId,
        'typeof': typeof blockchainData.finishedGoodId,
        'length': blockchainData.finishedGoodId?.length,
        'is empty string': blockchainData.finishedGoodId === ''
      });
      console.log(`✅ [BlockchainService] Supply chain event data prepared successfully`);
      return blockchainData;
    } catch (error) {
      console.error(`❌ [BlockchainService] Failed to prepare supply chain event data:`, error.message);
      throw error;
    }
  }
}

module.exports = new BlockchainService();