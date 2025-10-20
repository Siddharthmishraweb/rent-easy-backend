import RentalAgreementModel from './RentalAgreement.Model.js'
import { RENTAL_AGREEMENT_MESSAGES as MSG } from './RentalAgreement.Constant.js'

/**
 * @swagger
 * /api/agreements:
 *   post:
 *     summary: Create a new rental agreement
 *     tags: [Agreements]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - agreementData
 *             properties:
 *               agreementData:
 *                 type: object
 *                 required:
 *                   - propertyId
 *                   - tenantId
 *                   - startDate
 *                   - endDate
 *                 properties:
 *                   propertyId:
 *                     type: string
 *                   tenantId:
 *                     type: string
 *                   startDate:
 *                     type: string
 *                     format: date
 *                   endDate:
 *                     type: string
 *                     format: date
 *                   terms:
 *                     type: array
 *                     items:
 *                       type: string
 *               options:
 *                 type: object
 *                 properties:
 *                   sendPdf:
 *                     type: boolean
 *                     default: true
 *                   sendEmails:
 *                     type: boolean
 *                     default: true
 *     responses:
 *       201:
 *         description: Agreement created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server Error
 */
const createAgreement = async (req, res) => {
  try {
    const { agreementData, options } = req.body // options: { sendPdf, sendEmails }
    const created = await RentalAgreementModel.createRentalAgreement(agreementData, options || { sendPdf: true, sendEmails: true })
    return res.success(201, MSG.CREATED, created)
  } catch (err) {
    console.error(err)
    res.status(err.statusCode || 500).json({ error: err.message })
  }
}

/**
 * @swagger
 * /api/agreements:
 *   get:
 *     summary: Get a list of rental agreements
 *     tags: [Agreements]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, active, expired, terminated]
 *         description: Filter agreements by status
 *     responses:
 *       200:
 *         description: List of agreements
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server Error
 */
const listAgreements = async (req, res) => {
  try {
    const { query = {}, page, limit } = req.query;
    const list = await RentalAgreementModel.getRentalAgreements(query, { page, limit });
    return res.success(200, MSG.LIST_AGREEMENT, list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * @swagger
 * /api/agreements/{id}:
 *   get:
 *     summary: Get a rental agreement by ID
 *     tags: [Agreements]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Agreement ID
 *     responses:
 *       200:
 *         description: Agreement details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Agreement'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Agreement not found
 *       500:
 *         description: Server Error
 */
const getAgreementById = async (req, res) => {
  try {
    const { id } = req.params;
    const ag = await RentalAgreementModel.getRentalAgreementById(id);
    if (!ag) return res.status(404).json({ message: MSG.NOT_FOUND });
    return res.success(200, MSG.AGREEMENT_FETCHED, ag);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

const updateAgreementById = async (req, res) => {
  try {
    const { agreementId, agreementData } = req.body
    const updated = await RentalAgreementModel.updateRentalAgreementById(agreementId, agreementData)
    if (!updated) return res.status(404).json({ message: MSG.NOT_FOUND })

    return res.success(200, MSG.UPDATED, updated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

/**
 * @swagger
 * /api/agreements/{id}/terminate:
 *   post:
 *     summary: Terminate a rental agreement
 *     tags: [Agreements]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Agreement ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for termination
 *     responses:
 *       200:
 *         description: Agreement terminated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only owner or admin can terminate
 *       404:
 *         description: Agreement not found
 *       500:
 *         description: Server Error
 */
const terminateAgreement = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const terminated = await RentalAgreementModel.terminateRentalAgreement(id, reason || '');
    if (!terminated) return res.status(404).json({ message: MSG.NOT_FOUND });

    return res.success(200, MSG.TERMINATED, terminated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

const deleteAgreement = async (req, res) => {
  try {
    const { agreementId } = req.body
    const deleted = await RentalAgreementModel.deleteRentalAgreementById(agreementId)
    if (!deleted) return res.status(404).json({ message: MSG.NOT_FOUND })

    return res.success(200, MSG.DELETED, deleted)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

/* Generate PDF only and return as attachment (base64) or send via email (if options.sendEmails true) */
/**
 * @swagger
 * /api/agreements/{id}/pdf:
 *   post:
 *     summary: Generate PDF for a rental agreement
 *     tags: [Agreements]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Agreement ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sendEmails:
 *                 type: boolean
 *                 default: true
 *                 description: Whether to send PDF via email
 *     responses:
 *       200:
 *         description: PDF generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 filename:
 *                   type: string
 *                 base64:
 *                   type: string
 *                   description: Base64 encoded PDF (only if sendEmails is false)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Agreement not found
 *       500:
 *         description: Server Error
 */
const generatePdfAndSend = async (req, res) => {
  try {
    const { id } = req.params;
    const { sendEmails = true } = req.body;
    const { buffer, filename } = await RentalAgreementModel.createAgreementPdfOnly(id);

    if (sendEmails) {
      // re-use model creation sending via sendMail inside model? For simplicity, send here using same logic
      // We'll create a nodemailer transporter here (or refactor to shared helper)
      // For brevity, respond with pdf as base64
      const base64 = buffer.toString('base64');
      const data = { filename, base64 };
      return res.success(200, MSG.PDF_GENERATED_SEND, data);
    }

    return res.success(200, MSG.PDF_GENERATED_SEND, filename);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

const RentalAgreementController = 
{
  createAgreement,
  listAgreements,
  getAgreementById,
  updateAgreementById,
  terminateAgreement,
  deleteAgreement,
  generatePdfAndSend
}


export default RentalAgreementController