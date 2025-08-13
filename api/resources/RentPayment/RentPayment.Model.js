import { rentPaymentModel } from './RentPayment.Schema.js'
import { ownerModel } from '../Owner/Owner.Schema.js'
import { convertToObjectId, dayjs, fs, path, Handlebars, puppeteer, nodemailer } from '../../helper/index.js'
import { PAYMENT_STATUS } from './RentPayment.Constant.js'
import paymentQueue from '../../workers/payment.queue.js'

/* compile template once */
const TEMPLATE_PATH = path.resolve(new URL(import.meta.url).pathname, './templates/receipt.html.hbs')
let compiledTemplate = null
const getCompiledTemplate = async () => {
  if (compiledTemplate) return compiledTemplate
  const tpl = await fs.readFile(TEMPLATE_PATH, 'utf8')
  compiledTemplate = Handlebars.compile(tpl)
  Handlebars.registerHelper('formatDate', (d) => {
    if (!d) return ''
    const dt = new Date(d)
    return dt.toLocaleDateString()
  })
  return compiledTemplate
}

/* render HTML -> PDF buffer */
const renderHtmlToPdfBuffer = async (html) => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
  const page = await browser.newPage()
  await page.setContent(html, { waitUntil: 'networkidle0' })
  const buffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20mm', bottom: '20mm' } })
  await browser.close()
  return buffer
}

/* mail helper */
const sendMailWithAttachment = async ({ to = [], subject = '', text = '', attachments = [] }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
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

/* helper: compute days late (integer >=0) */
const daysLate = (dueDate, paidDate) => {
  const dDue = new Date(dueDate)
  const dPaid = new Date(paidDate)
  const diff = Math.ceil((dPaid - dDue) / (1000 * 60 * 60 * 24))
  return diff > 0 ? diff : 0
}

/* Main create flow:
   - fetch agreement
   - fetch owner penalty percent (owner.penaltyPercentPerDay) else agreement.penaltyPercentPerDay else 1
   - compute penalty = daysLate * (penaltyPercentPerDay/100) * amountPaid (or maybe rent amount)
   - create payment doc with penalty and total
   - generate receipt PDF and email to owner & tenant (best-effort)
*/
// export const createRentPayment = async (payload) => {
//   // validate agreement exists
//   const agreement = await rentalAgreementModel.findById(convertToObjectId(payload.agreementId)).lean()
//   if (!agreement) throw Object.assign(new Error('Agreement not found'), { statusCode: 404 })

//   // owner doc (owner may be stored in Owner collection — if ownerId refers to User, adapt)
//   const owner = await ownerModel.findOne({ userId: convertToObjectId(payload.ownerId) }).lean()
//   const penaltyPercent = (owner && owner.penaltyPercentPerDay) ? owner.penaltyPercentPerDay : (agreement.penaltyPercentPerDay || 1)

//   const paidDate = new Date(payload.paymentDate)
//   const dueDate = new Date(payload.dueDate)

//   const lateDays = daysLate(dueDate, paidDate)

//   // penalty base: commonly penalty applies on rent amount (agreement.rentAmount) rather than paid amount.
//   const baseAmount = agreement.rentAmount || payload.amountPaid
//   const penaltyAmount = lateDays > 0 ? Number(((baseAmount * (penaltyPercent / 100)) * lateDays).toFixed(2)) : 0

//   const totalAmountCollected = Number((payload.amountPaid + penaltyAmount).toFixed(2))

//   // determine status
//   const status = lateDays > 0 ? PAYMENT_STATUS.LATE : PAYMENT_STATUS.PAID

//   // create payment - ensure transactionNumber uniqueness handled by schema; catch unique error upstream
//   const created = await rentPaymentModel.create({
//     agreementId: convertToObjectId(payload.agreementId),
//     userId: convertToObjectId(payload.userId),
//     ownerId: convertToObjectId(payload.ownerId),
//     transactionNumber: payload.transactionNumber,
//     paymentDate: paidDate,
//     dueDate: dueDate,
//     amountPaid: payload.amountPaid,
//     paymentMode: payload.paymentMode,
//     receiptUrl: payload.receiptUrl || '',
//     penaltyAmount,
//     totalAmountCollected,
//     status,
//     metadata: payload.metadata || {}
//   })

//   // attempt to generate PDF receipt and email (best-effort)
//   (async () => {
//     try {
//       // prepare data for receipt
//       const tenant = await (async () => {
//         try {
//           const { userModel } = await import('../User/User.Schema.js')
//           return await userModel.findById(convertToObjectId(payload.userId)).select('name email').lean()
//         } catch (e) { return {} }
//       })()

//       const ownerUser = await (async () => {
//         try {
//           const { userModel } = await import('../User/User.Schema.js')
//           // ownerModel.userId may point to user id; adapt
//           const ownerUserDoc = await userModel.findOne({ _id: (owner && owner.userId) ? owner.userId : payload.ownerId }).select('name email').lean()
//           return ownerUserDoc || {}
//         } catch (e) { return {} }
//       })()

//       const room = await roomModel.findById(agreement.roomId).lean().catch(()=>({}))
//       const property = room && room.propertyId ? await propertyModel.findById(room.propertyId).lean().catch(()=>({})) : {}

//       const paymentObj = {
//         _id: created._id,
//         agreementId: created.agreementId,
//         transactionNumber: created.transactionNumber,
//         paymentDate: created.paymentDate,
//         dueDate: created.dueDate,
//         amountPaid: created.amountPaid,
//         penaltyAmount: created.penaltyAmount,
//         totalAmountCollected: created.totalAmountCollected,
//         paymentMode: created.paymentMode,
//         createdAt: created.createdAt
//       }

//       const tpl = await getCompiledTemplate()
//       const html = tpl({
//         payment: paymentObj,
//         tenant: tenant || {},
//         owner: ownerUser || {},
//         room: room || {},
//         property: property || {},
//         company: { logo: process.env.COMPANY_LOGO_URL || '' }
//       })

//       const pdfBuffer = await renderHtmlToPdfBuffer(html)
//       const filename = `rent-receipt-${created.transactionNumber}.pdf`

//       // optional: upload to storage and set receiptUrl
//       // if you upload, update created.receiptUrl and save.

//       // email
//       const recipients = []
//       if (tenant && tenant.email) recipients.push(tenant.email)
//       if (ownerUser && ownerUser.email) recipients.push(ownerUser.email)

//       if (recipients.length) {
//         await sendMailWithAttachment({
//           to: recipients,
//           subject: `Rent Receipt - ${created.transactionNumber}`,
//           text: `Attached is the rent receipt for transaction ${created.transactionNumber}`,
//           attachments: [{ filename, content: pdfBuffer }]
//         })
//       }
//     } catch (err) {
//       console.error('Rent receipt generation/email failed (non-blocking):', err)
//     }
//   })()

//   return created
// }

// export const getPaymentsByUser = async (userId, options = {}) => {
//   const q = { userId: convertToObjectId(userId) }
//   if (options.status) q.status = options.status
//   const page = options.page > 0 ? parseInt(options.page) : 0
//   const limit = options.limit > 0 ? parseInt(options.limit) : 0
//   const cursor = rentPaymentModel.find(q).sort({ paymentDate: -1 }).lean()
//   if (limit) cursor.skip(page * limit).limit(limit)
//   return cursor
// }

export const getPaymentsByUser = async (userId, options = {}) => {
  const q = { userId: convertToObjectId(userId) }
  if (options.status) q.status = options.status

  const page = options.page > 0 ? parseInt(options.page) : 0
  const limit = options.limit > 0 ? parseInt(options.limit) : 0

  const cursor = rentPaymentModel.find(q).sort({ paymentDate: -1 }).lean()
  if (limit) cursor.skip(page * limit).limit(limit)

  let payments = await cursor

  // ✅ Calculate penalty for each record before returning
  payments = payments.map(p => {
    const ownerPenaltyRate = p.metadata?.penaltyPercentPerDay || 1
    if (dayjs(p.paymentDate).isAfter(dayjs(p.dueDate))) {
      const lateDays = dayjs(p.paymentDate).diff(dayjs(p.dueDate), 'day')
      const penalty = ((ownerPenaltyRate / 100) * p.amountPaid) * lateDays
      p.penaltyAmount = Number(penalty.toFixed(2))
      p.totalAmountCollected = Number((p.amountPaid + p.penaltyAmount).toFixed(2))
      p.status = PAYMENT_STATUS.LATE
    } else {
      p.totalAmountCollected = p.amountPaid
      p.status = PAYMENT_STATUS.PAID
    }
    return p
  })

  return payments
}

export const getPaymentById = async (id) => {
  return rentPaymentModel.findById(convertToObjectId(id)).lean()
}

// export const updatePayment = async (id, data) => {
//   // if paymentDate or amountPaid change, recompute penalty
//   const existing = await rentPaymentModel.findById(convertToObjectId(id)).lean()
//   if (!existing) return null

//   let updatedFields = { ...data }
//   if (data.paymentDate || data.amountPaid) {
//     const paidDate = data.paymentDate ? new Date(data.paymentDate) : new Date(existing.paymentDate)
//     const dueDate = existing.dueDate
//     // fetch owner for penalty %
//     const owner = await ownerModel.findById(existing.ownerId).lean()
//     const penaltyPercent = (owner && owner.penaltyPercentPerDay) ? owner.penaltyPercentPerDay : (existing.metadata?.penaltyPercentPerDay || 1)
//     const lateDays = daysLate(dueDate, paidDate)
//     const baseAmount = existing.amountPaid
//     const penaltyAmount = lateDays > 0 ? Number(((baseAmount * (penaltyPercent / 100)) * lateDays) || 0 ?.toFixed(2)) : 0
//     updatedFields.penaltyAmount = penaltyAmount
//     updatedFields.totalAmountCollected = Number(((data.amountPaid || existing.amountPaid) + penaltyAmount) || 0 ?.toFixed(2))
//     updatedFields.status = lateDays > 0 ? PAYMENT_STATUS.LATE : PAYMENT_STATUS.PAID
//   }

//   return rentPaymentModel.findByIdAndUpdate(convertToObjectId(id), { $set: updatedFields }, { new: true })
// }


export const updatePayment = async (id, data, updatedBy) => {
  const existing = await rentPaymentModel.findById(convertToObjectId(id))
  if (!existing) return null

  // Store old state in history
  existing.history.push({
    updatedBy: updatedBy || null,
    changes: existing.toObject(),
    updatedAt: new Date()
  })

  // Recalculate penalty if payment date or amount changes
  if (data.paymentDate || data.amountPaid) {
    const paidDate = data.paymentDate ? new Date(data.paymentDate) : new Date(existing.paymentDate)
    const dueDate = existing.dueDate
    const owner = await ownerModel.findById(existing.ownerId).lean()
    const penaltyPercent = owner?.penaltyPercentPerDay || existing.metadata?.penaltyPercentPerDay || 1
    const lateDays = daysLate(dueDate, paidDate)
    const baseAmount = data.amountPaid || existing.amountPaid
    const penaltyAmount = lateDays > 0 ? Number(((baseAmount * (penaltyPercent / 100)) * lateDays).toFixed(2)) : 0
    data.penaltyAmount = penaltyAmount
    data.totalAmountCollected = Number((baseAmount + penaltyAmount).toFixed(2))
    data.status = lateDays > 0 ? PAYMENT_STATUS.LATE : PAYMENT_STATUS.PAID
  }

  Object.assign(existing, data)
  return existing.save()
}

export const deletePayment = async (id) => {
  return rentPaymentModel.findByIdAndDelete(convertToObjectId(id))
}

export const createRentPayment = async (data) => {
  const { agreementId, userId, ownerId, paymentDate, dueDate, amountPaid, paymentMode } = data

  const owner = await ownerModel.findById(ownerId).lean()
  const penaltyRate = owner?.penaltyRatePerDay || 0 // e.g. 1 for 1%

  // Calculate penalty
  let penaltyAmount = 0
  if (dayjs(paymentDate).isAfter(dayjs(dueDate))) {
    const daysLate = dayjs(paymentDate).diff(dayjs(dueDate), 'day')
    penaltyAmount = ((penaltyRate / 100) * amountPaid) * daysLate
  }

  const transactionNumber = `TXN-${Date.now()}`

  const payment = await rentPaymentModel.create({
    agreementId,
    userId,
    ownerId,
    transactionNumber,
    paymentDate,
    dueDate,
    amountPaid,
    penaltyAmount,
    paymentMode,
    status: penaltyAmount > 0 ? 'late' : 'paid'
  })

  // Push to background worker if enabled
  if (process.env.ENABLE_RECEIPT_PDF === 'true' || process.env.ENABLE_EMAIL === 'true') {
    await paymentQueue.add('generate-receipt', {
      paymentId: payment._id,
      ownerId,
      userId
    })
  }

  return payment
}
