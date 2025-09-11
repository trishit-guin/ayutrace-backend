const { createOrganization } = require('./organization.service');


/**
 * @swagger
 * /api/organization:
 *   post:
 *     summary: Create a new organization
 *     tags:
 *       - Organization
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: Type of organization
 *             required:
 *               - type
 *     responses:
 *       201:
 *         description: Organization created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 organization:
 *                   type: object
 *                   properties:
 *                     organizationId:
 *                       type: string
 *                       format: uuid
 *                       description: Auto-generated organization ID
 *                     type:
 *                       type: string
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: string
 *                             format: uuid
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
async function createOrganizationHandler(req, res) {
  try {
    // Only accept 'type' field from request body
    const { type } = req.body;
    if (!type) {
      return res.status(400).json({ message: 'Organization type is required' });
    }
    // Check for duplicate organization type
    const existingOrg = await require('./organization.service').findOrganizationByType(type);
    if (existingOrg) {
      return res.status(409).json({ message: 'Organization of this type already exists' });
    }
    // Create organization with only 'type' field
    const organization = await createOrganization({ type });
    // Return users array (empty on creation)
    return res.status(201).json({
      message: 'Organization created successfully',
      organization: { ...organization, users: [] }
    });
  } catch (error) {
    console.error('Error creating organization:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}


/**
 * @swagger
 * /api/organization/by-type/{type}:
 *   get:
 *     summary: Get organization ID by type
 *     description: Returns the organizationId for the given organization type
 *     tags:
 *       - Organization
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *         description: Type of organization (e.g., FARMER, MANUFACTURER, LABS, DISTRIBUTOR)
 *     responses:
 *       200:
 *         description: Organization found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 organizationId:
 *                   type: string
 *                   format: uuid
 *                   example: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *                 type:
 *                   type: string
 *                   example: "FARMER"
 *       404:
 *         description: Organization not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Organization not found
 */
async function getOrganizationIdByTypeHandler(req, res) {
  try {
    const { type } = req.params;
    // Validate org type
    const validTypes = ['FARMER', 'MANUFACTURER', 'LABS', 'DISTRIBUTOR' , 'ADMIN'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid organization type', validTypes });
    }
    const org = await require('./organization.service').findOrganizationByType(type);
    if (!org) {
      return res.status(404).json({ message: 'Organization not found', type });
    }
    return res.status(200).json({ organizationId: org.organizationId, type: org.type });
  } catch (error) {
    console.error('Error fetching organization by type:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

module.exports = { createOrganizationHandler, getOrganizationIdByTypeHandler };
