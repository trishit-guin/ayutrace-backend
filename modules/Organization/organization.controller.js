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

module.exports = { createOrganizationHandler };
