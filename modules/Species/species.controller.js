const {
  createSpecies,
  getSpecies,
  getSpeciesById,
  updateSpecies,
  deleteSpecies,
  getSpeciesByRegion,
} = require('./species.service');

/**
 * @swagger
 * /api/species:
 *   post:
 *     summary: Create a new herb species
 *     tags: [Species]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - commonName
 *               - scientificName
 *             properties:
 *               commonName:
 *                 type: string
 *               scientificName:
 *                 type: string
 *               family:
 *                 type: string
 *               description:
 *                 type: string
 *               medicinalUses:
 *                 type: array
 *                 items:
 *                   type: string
 *               nativeRegions:
 *                 type: array
 *                 items:
 *                   type: string
 *               harvestingSeason:
 *                 type: string
 *               partsUsed:
 *                 type: array
 *                 items:
 *                   type: string
 *               conservationStatus:
 *                 type: string
 *                 enum: [LEAST_CONCERN, NEAR_THREATENED, VULNERABLE, ENDANGERED, CRITICALLY_ENDANGERED]
 *               regulatoryInfo:
 *                 type: object
 *                 properties:
 *                   isRegulated:
 *                     type: boolean
 *                   permitRequired:
 *                     type: boolean
 *                   restrictions:
 *                     type: array
 *                     items:
 *                       type: string
 *     responses:
 *       201:
 *         description: Species created successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Internal server error
 */
const createSpeciesHandler = async (req, res) => {
  try {
    const result = await createSpecies(req.body);
    res.status(201).json({
      success: true,
      data: result,
      message: 'Species created successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/species:
 *   get:
 *     summary: Get all herb species with pagination and filters
 *     tags: [Species]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: commonName
 *         schema:
 *           type: string
 *       - in: query
 *         name: scientificName
 *         schema:
 *           type: string
 *       - in: query
 *         name: family
 *         schema:
 *           type: string
 *       - in: query
 *         name: conservationStatus
 *         schema:
 *           type: string
 *           enum: [LEAST_CONCERN, NEAR_THREATENED, VULNERABLE, ENDANGERED, CRITICALLY_ENDANGERED]
 *     responses:
 *       200:
 *         description: List of herb species
 *       500:
 *         description: Internal server error
 */
const getSpeciesHandler = async (req, res) => {
  try {
    const { page = 1, limit = 10, commonName, scientificName, family, conservationStatus } = req.query;
    const result = await getSpecies({
      page: parseInt(page),
      limit: parseInt(limit),
      commonName,
      scientificName,
      family,
      conservationStatus,
    });
    res.status(200).json({
      success: true,
      data: result,
      message: 'Species retrieved successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/species/{id}:
 *   get:
 *     summary: Get a herb species by ID
 *     tags: [Species]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Species details
 *       404:
 *         description: Species not found
 *       500:
 *         description: Internal server error
 */
const getSpeciesByIdHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getSpeciesById(id);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Species not found',
      });
    }

    res.status(200).json({
      success: true,
      data: result,
      message: 'Species retrieved successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/species/region/{region}:
 *   get:
 *     summary: Get herb species by native region
 *     tags: [Species]
 *     parameters:
 *       - in: path
 *         name: region
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Species in the region
 *       500:
 *         description: Internal server error
 */
const getSpeciesByRegionHandler = async (req, res) => {
  try {
    const { region } = req.params;
    const result = await getSpeciesByRegion(region);
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'Species for region retrieved successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/species/{id}:
 *   put:
 *     summary: Update a herb species
 *     tags: [Species]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               commonName:
 *                 type: string
 *               scientificName:
 *                 type: string
 *               family:
 *                 type: string
 *               description:
 *                 type: string
 *               medicinalUses:
 *                 type: array
 *                 items:
 *                   type: string
 *               nativeRegions:
 *                 type: array
 *                 items:
 *                   type: string
 *               harvestingSeason:
 *                 type: string
 *               partsUsed:
 *                 type: array
 *                 items:
 *                   type: string
 *               conservationStatus:
 *                 type: string
 *                 enum: [LEAST_CONCERN, NEAR_THREATENED, VULNERABLE, ENDANGERED, CRITICALLY_ENDANGERED]
 *               regulatoryInfo:
 *                 type: object
 *     responses:
 *       200:
 *         description: Species updated successfully
 *       404:
 *         description: Species not found
 *       500:
 *         description: Internal server error
 */
const updateSpeciesHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updateSpecies(id, req.body);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Species not found',
      });
    }

    res.status(200).json({
      success: true,
      data: result,
      message: 'Species updated successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/species/{id}:
 *   delete:
 *     summary: Delete a herb species
 *     tags: [Species]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Species deleted successfully
 *       404:
 *         description: Species not found
 *       500:
 *         description: Internal server error
 */
const deleteSpeciesHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteSpecies(id);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Species not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Species deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  createSpeciesHandler,
  getSpeciesHandler,
  getSpeciesByIdHandler,
  getSpeciesByRegionHandler,
  updateSpeciesHandler,
  deleteSpeciesHandler,
};
