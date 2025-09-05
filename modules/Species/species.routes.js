const express = require('express');
const {
  createSpeciesHandler,
  getSpeciesHandler,
  getSpeciesByIdHandler,
  getSpeciesByRegionHandler,
  updateSpeciesHandler,
  deleteSpeciesHandler,
} = require('./species.controller');
const { validate } = require('../Auth/middlewares/validate');
const {
  createSpeciesSchema,
  updateSpeciesSchema,
  getSpeciesSchema,
} = require('./species.validation');

const router = express.Router();

/**
 * @swagger
 * /api/species:
 *   post:
 *     summary: Create a new herb species
 *     description: Add a new herb species to the database with regulatory information
 *     tags: [Species]
 *     security:
 *       - bearerAuth: []
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
 *                 description: Common name of the herb
 *                 example: "Ashwagandha"
 *               scientificName:
 *                 type: string
 *                 description: Scientific name of the herb
 *                 example: "Withania somnifera"
 *               family:
 *                 type: string
 *                 description: Botanical family of the herb
 *                 example: "Solanaceae"
 *               description:
 *                 type: string
 *                 description: Description of the herb species
 *                 example: "A medicinal herb known for its adaptogenic properties and stress-relieving benefits"
 *               medicinalUses:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of medicinal uses
 *                 example: ["Stress relief", "Immunity booster", "Sleep aid", "Anti-inflammatory"]
 *               nativeRegions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Native regions where the species grows
 *                 example: ["India", "Middle East", "Africa", "Mediterranean"]
 *               harvestingSeason:
 *                 type: string
 *                 description: Optimal harvesting season
 *                 example: "Winter (November to February)"
 *               partsUsed:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Parts of the plant used medicinally
 *                 example: ["Roots", "Leaves", "Berries"]
 *               conservationStatus:
 *                 $ref: '#/components/schemas/ConservationStatus'
 *               regulatoryInfo:
 *                 type: object
 *                 description: Regulatory information as JSON
 *                 example: {"ayush_approval": true, "fda_status": "GRAS", "export_restrictions": false}
 *     responses:
 *       201:
 *         description: Herb species created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
// Create a new herb species
router.post('/', validate(createSpeciesSchema), createSpeciesHandler);

/**
 * @swagger
 * /api/species:
 *   get:
 *     summary: Get all herb species
 *     description: Retrieve herb species with pagination and filtering
 *     tags: [Species]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: conservationStatus
 *         schema:
 *           $ref: '#/components/schemas/ConservationStatus'
 *         description: Filter by conservation status
 *       - in: query
 *         name: commonName
 *         schema:
 *           type: string
 *         description: Filter by common name
 *       - in: query
 *         name: scientificName
 *         schema:
 *           type: string
 *         description: Filter by scientific name
 *     responses:
 *       200:
 *         description: List of herb species
 *       401:
 *         description: Unauthorized
 */
// Get all herb species with pagination and filters
router.get('/', validate(getSpeciesSchema), getSpeciesHandler);

/**
 * @swagger
 * /api/species/region/{region}:
 *   get:
 *     summary: Get herb species by native region
 *     description: Retrieve herb species that are native to a specific region
 *     tags: [Species]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: region
 *         required: true
 *         schema:
 *           type: string
 *         description: Native region to search for
 *     responses:
 *       200:
 *         description: Herb species native to the region
 *       404:
 *         description: No species found for the region
 *       401:
 *         description: Unauthorized
 */
// Get herb species by native region
router.get('/region/:region', getSpeciesByRegionHandler);

/**
 * @swagger
 * /api/species/{id}:
 *   get:
 *     summary: Get a herb species by ID
 *     description: Retrieve detailed information about a specific herb species
 *     tags: [Species]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Species ID
 *     responses:
 *       200:
 *         description: Herb species details
 *       404:
 *         description: Herb species not found
 *       401:
 *         description: Unauthorized
 */
// Get a herb species by ID
router.get('/:id', getSpeciesByIdHandler);

/**
 * @swagger
 * /api/species/{id}:
 *   put:
 *     summary: Update a herb species
 *     description: Update an existing herb species information
 *     tags: [Species]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Species ID
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
 *               description:
 *                 type: string
 *               conservationStatus:
 *                 $ref: '#/components/schemas/ConservationStatus'
 *               nativeRegion:
 *                 type: string
 *               regulatoryStatus:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Herb species updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Herb species not found
 *       401:
 *         description: Unauthorized
 */
// Update a herb species
router.put('/:id', validate(updateSpeciesSchema), updateSpeciesHandler);

/**
 * @swagger
 * /api/species/{id}:
 *   delete:
 *     summary: Delete a herb species
 *     description: Delete a herb species from the system
 *     tags: [Species]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Species ID
 *     responses:
 *       200:
 *         description: Herb species deleted successfully
 *       404:
 *         description: Herb species not found
 *       401:
 *         description: Unauthorized
 */
// Delete a herb species
router.delete('/:id', deleteSpeciesHandler);

module.exports = router;
