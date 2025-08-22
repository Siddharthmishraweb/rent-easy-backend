import { rentalAgreementModel } from './RentalAgreement.Schema.js'
import { convertToObjectId, PDFDocument, streamBuffers, nodemailer, AppError } from '../../helper/index.js'
import { roomModel } from '../Room/Room.Schema.js'
import { propertyModel } from '../Property/Property.Schema.js'
import { ownerModel } from '../Owner/Owner.Schema.js'
import { documentModel } from '../Document/Document.Schema.js'


/**
 * Helper: generate PDF buffer from agreement data
 * Returns: { buffer, filename }
 */
const generateAgreementPdfBuffer = async (agreement, tenant = {}, owner = {}, room = {}, property = {}) => {
  const doc = new PDFDocument({ size: 'A4', margin: 50 })
  const bufferStream = new streamBuffers.WritableStreamBuffer({
    initialSize: (100 * 1024),   // start at 100kB
    incrementAmount: (10 * 1024) // grow by 10kB
  })

  doc.pipe(bufferStream)

  // Header
  doc.fontSize(18).text('Rental Agreement', { align: 'center' }).moveDown(1)

  // Parties
  doc.fontSize(12).text(`Owner: ${owner.name || owner.email || agreement.ownerId}`, { continued: false })
  doc.text(`Tenant: ${tenant.name || tenant.email || agreement.userId}`)
  doc.moveDown(0.5)

  // Property/Room
  doc.text(`Property: ${property.propertyName || ''}`)
  doc.text(`Room: ${room.roomNumber || ''} - ${room.roomType || ''}`)
  doc.moveDown(0.5)

  // Agreement dates & amounts
  doc.text(`Start Date: ${new Date(agreement.agreementStartDate).toLocaleDateString()}`)
  doc.text(`End Date: ${new Date(agreement.agreementEndDate).toLocaleDateString()}`)
  doc.text(`Rent Amount: ₹${agreement.rentAmount}`)
  doc.text(`Security Deposit: ₹${agreement.securityDeposit}`)
  doc.moveDown(1)

  // Terms (simple placeholder - replace with your own terms or use template engine)
  doc.fontSize(10).text('Terms & Conditions:', { underline: true })
  doc.moveDown(0.2)
  doc.text('1. Rent shall be payable monthly as per schedule.')
  doc.text('2. Tenant shall maintain the property in good condition.')
  doc.text('3. Security deposit will be refunded per agreement at the end of tenancy, subject to deductions for damages.')
  doc.text('4. Either party may terminate the agreement as per mutually agreed conditions.')
  doc.moveDown(2)

  // Signatures placeholders
  doc.text('Owner Signature: ____________________', { continued: true })
  doc.text('        Date: ____________')
  doc.moveDown(1)
  doc.text('Tenant Signature: ____________________', { continued: true })
  doc.text('        Date: ____________')

  doc.end()

  await new Promise((resolve) => bufferStream.on('finish', resolve))

  const buffer = bufferStream.getContents()
  const filename = `rental-agreement-${agreement._id.toString()}.pdf`
  return { buffer, filename }
}

/**
 * Helper: send mail with attachment to array of recipients
 * Expects SMTP config in env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM
 */
const sendMailWithAttachment = async ({ to = [], subject = '', text = '', attachments = [] }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })

  const mailOptions = {
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: Array.isArray(to) ? to.join(',') : to,
    subject,
    text,
    attachments
  }

  return transporter.sendMail(mailOptions)
}

/* Model Methods */

const createRentalAgreement = async (agreementData, opts = { sendPdf: true, sendEmails: true }) => {
    console.log("Aaya toh h yaha par: ")
    const room = await roomModel.findById(agreementData.roomId)
    if (!room) {
      throw new AppError('Room not found')
      // return res.status(404).json({ error: "Room not found" })
    }

    const isAlreadyExist = await rentalAgreementModel.find({ roomId: agreementData.roomId, status: agreementData.status })
    if(isAlreadyExist.length > 0)  throw new AppError('Agreement of this room already exist! ')

    // 2️⃣ Find active rental (where endDate is null)
    // const activeRental = room.rentalHistory.find(r => r.endDate === null)
    // if (!activeRental) {
    //   return res.status(400).json({ error: "No active tenant found for this room" })
    // }

  const property = await propertyModel.findById(room.propertyId)
  const owner = await ownerModel.findById(property.ownerId)
  const ownerUserId = owner.userId

  console.log("OWNER USERID: ", ownerUserId)
  console.log("tenantId passed in flow: ", agreementData.userId)

  const document = await documentModel.findOne({ userId: ownerUserId, docType: 'sign' })
  const agreementDocument = await documentModel.findOne({ userId: ownerUserId, docType: 'agreement' })
  const tentantDocument = await documentModel.findOne({ userId: convertToObjectId(agreementData.userId), docType: 'sign' })
  console.log("tentantDocument: ", tentantDocument)
  

  // agreementData.rentAmount = room.rent // given
  // agreementData.securityDeposit = activeRental.securityDeposit // given
  // agreementData.agreementStartDate = activeRental.startDate // given
  // agreementData.userId = activeRental.tenantId //given
  agreementData.ownerId = property.ownerId
  agreementData.digitalSignatures = {}
  agreementData.digitalSignatures.ownerSignatureURL = document.url
  agreementData.digitalSignatures.userSignatureURL = tentantDocument.url
  agreementData.signedAgreementURL = agreementDocument.url

  const created = await rentalAgreementModel.create(agreementData)

  // If opts.sendPdf true, attempt to generate & send PDF (best-effort, do not block creation failure)
  if (opts.sendPdf) {
    try {
      // Fetch related info (lightweight) for PDF/email recipients - use populate where needed
      const agg = await rentalAgreementModel.findById(created._id)
        .populate('userId', 'name email')
        .populate('ownerId', 'name email')
        .lean()

      // attempt to fetch room and property minimal info if available via helper models (lazy require to avoid circular)
      // let room = {}
      // let property = {}
      try {
        // dynamic import to avoid circular requires if your models import this model
        // adjust paths to your project structure
        // const { roomModel } = await import('../Room/Room.Schema.js')
        // room = await roomModel.findById(agg.roomId).lean().catch(()=>({}))
        // if (room && room.propertyId) {
        //   const { propertyModel } = await import('../Property/Property.Schema.js')
        //   property = await propertyModel.findById(room.propertyId).lean().catch(()=>({}))
        // }
      } catch (e) {
        // ignore missing models PDF will still be created with limited data
      }

      const { buffer, filename } = await generateAgreementPdfBuffer(agg, agg.userId || {}, agg.ownerId || {}, room || {}, property || {})

      // If you have an upload function (S3) prefer to upload and store signedAgreementURL
      // If you want to store in DB as URL, do it here and update created.signedAgreementURL

      // Send mail to both owner and tenant if emails present
      const recipients = []
      if (agg.userId?.email) recipients.push(agg.userId.email)
      if (agg.ownerId?.email) recipients.push(agg.ownerId.email)

      if (recipients.length && opts.sendEmails) {
        await sendMailWithAttachment({
          to: recipients,
          subject: 'Your Rental Agreement',
          text: 'Please find attached the rental agreement.',
          attachments: [{ filename, content: buffer }]
        })
      }
    } catch (err) {
      // Log the email/pdf error and continue — do not fail creation
      console.error('PDF/email send error for rental agreement', err)
    }
  }

  return created
}

const getRentalAgreements = async (filter = {}, options = {}) => {
  const q = { ...filter }
  const page = options.page > 0 ? parseInt(options.page) : 0
  const limit = options.limit > 0 ? parseInt(options.limit) : 0

  const cursor = rentalAgreementModel.find(q).sort({ createdAt: -1 }).lean()
  if (limit) cursor.skip(page * limit).limit(limit)
  return await cursor
}

const getRentalAgreementById = async (id) => {
  return await rentalAgreementModel.findById(convertToObjectId(id)).lean()
}

const updateRentalAgreementById = async (agreementId, updateData) => {
  // if dates or rent change, you can add business checks here
  return await rentalAgreementModel.findByIdAndUpdate(convertToObjectId(agreementId), { $set: updateData }, { new: true })
}

const terminateRentalAgreement = async (agreementId, reason = '') => {
  const updated = await rentalAgreementModel.findByIdAndUpdate(convertToObjectId(agreementId), { $set: { isActive: false, status: 'terminated', 'meta.terminationReason': reason } }, { new: true })
  return updated
}

const deleteRentalAgreementById = async (agreementId) => {
  return await rentalAgreementModel.findByIdAndDelete(convertToObjectId(agreementId))
}

/* Utility: create PDF and return buffer (no emailing) */
const createAgreementPdfOnly = async (agreementId) => {
  const agreement = await rentalAgreementModel.findById(convertToObjectId(agreementId))
    .populate('userId', 'name email')
    .populate('ownerId', 'name email')
    .lean()
  if (!agreement) throw new Error('Agreement not found')
  // get room/property minimal details
  let room = {}, property = {}
  try {
    const { roomModel } = await import('../Room/Room.Schema.js')
    room = await roomModel.findById(agreement.roomId).lean().catch(()=>({}))
    if (room?.propertyId) {
      const { propertyModel } = await import('../Property/Property.Schema.js')
      property = await propertyModel.findById(room.propertyId).lean().catch(()=>({}))
    }
  } catch (e) {}
  return generateAgreementPdfBuffer(agreement, agreement.userId || {}, agreement.ownerId || {}, room || {}, property || {})
}

const RentalAgreementModel = {
  createRentalAgreement,
  getRentalAgreements,
  getRentalAgreementById,
  updateRentalAgreementById,
  terminateRentalAgreement,
  deleteRentalAgreementById,
  createAgreementPdfOnly
}

export default RentalAgreementModel
