const { createOrganization } = require('./organization.service');


/**
 * @swagger
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
 *             $ref: '#/components/schemas/Organization'
 *           example:
 *             name: "Pune Organic Farmers Cooperative"
 *             type: "COOPERATIVE"
 *             mspId: "CooperativeMSP"
 *             contactInfo:
 *               phone: "+919876543210"
 *               address: "123 Agri St, Pune, Maharashtra"
 *               email: "contact@puneorganic.coop"
 *             registrationDetails:
 *               licenseNumber: "FSSAI123456"
 *               gstin: "27ABCDE1234F1Z5"
 *             isActive: true
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
 *                   example: Organization created successfully
 *                 organization:
 *                   $ref: '#/components/schemas/Organization'
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
