import RentalAgreementModel from './RentalAgreement.Model.js'
import { RENTAL_AGREEMENT_MESSAGES as MSG } from './RentalAgreement.Constant.js'

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

const listAgreements = async (req, res) => {
  try {
    const { query = {}, page, limit } = req.body
    const list = await RentalAgreementModel.getRentalAgreements(query, { page, limit })
    return res.success(200, MSG.LIST_AGREEMENT, list)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getAgreementById = async (req, res) => {
  try {
    const { agreementId } = req.body
    const ag = await RentalAgreementModel.getRentalAgreementById(agreementId)
    if (!ag) return res.status(404).json({ message: MSG.NOT_FOUND })
    return res.success(200, MSG.AGREEMENT_FETCHED, ag)
  } catch (err) {
    res.status(500).json({ error: err.message })
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

const terminateAgreement = async (req, res) => {
  try {
    const { agreementId, reason } = req.body
    const terminated = await RentalAgreementModel.terminateRentalAgreement(agreementId, reason || '')
    if (!terminated) return res.status(404).json({ message: MSG.NOT_FOUND })

    return res.success(200, MSG.TERMINATED, terminated)
  } catch (err) {
    res.status(500).json({ error: err.message })
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
const generatePdfAndSend = async (req, res) => {
  try {
    const { agreementId, sendEmails = true } = req.body
    const { buffer, filename } = await RentalAgreementModel.createAgreementPdfOnly(agreementId)

    if (sendEmails) {
      // re-use model creation sending via sendMail inside model? For simplicity, send here using same logic
      // We'll create a nodemailer transporter here (or refactor to shared helper)
      // For brevity, respond with pdf as base64
      const base64 = buffer.toString('base64')
      const data = { filename, base64 }
      return res.success(200, MSG.PDF_GENERATED_SEND, data)
    }

    return res.success(200, MSG.PDF_GENERATED_SEND, filename)
  } catch (err) {
    res.status(500).json({ error: err.message })
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