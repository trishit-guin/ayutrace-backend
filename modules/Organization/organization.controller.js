const { createOrganization } = require('./organization.service');


/**
 * @swagger
 * components:
 *   schemas:
 *     Organization:
 *       type: object
 *       required:
 *         - organizationId
 *         - name
 *         - type
 *       properties:
 *         organizationId:
 *           type: string
 *           format: uuid
 *           description: Unique organization ID
 *         name:
 *           type: string
 *           description: Organization name
 *         type:
 *           $ref: '#/components/schemas/OrgType'
 *         users:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/User'
 *           description: List of users in this organization
 * /api/organizations:
 *   post:
 *     summary: Create a new organization
 *     description: Adds a new organization to the system. Requires authentication.
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *                 description: Organization name
 *                 example: "Pune Organic Farmers Cooperative"
 *               type:
 *                 $ref: '#/components/schemas/OrgType'
 *           example:
 *             name: "Pune Organic Farmers Cooperative"
 *             type: "FARMER"
 *     responses:
 *       201:
 *         description: Organization created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organization'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
async function createOrganizationHandler(req, res) {
  try {
    const orgData = req.body;
    const organization = await createOrganization(orgData);
    return res.status(201).json({ message: 'Organization created successfully', organization });
  } catch (error) {
    console.error('Error creating organization:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = { createOrganizationHandler };
