import { rentPaymentModel } from './RentPayment.Schema.js'
import { ownerModel } from '../Owner/Owner.Schema.js'
import { convertToObjectId, dayjs, fs, path, Handlebars, puppeteer, nodemailer, computePenalty } from '../../helper/index.js'
import { PAYMENT_STATUS } from './RentPayment.Constant.js'
import paymentQueue from '../../workers/payment.queue.js'
import { rentalAgreementModel } from '../RentalAgreement/RentalAgreement.Schema.js'

const daysLate = (dueDate, paidDate) => {
  const dDue = new Date(dueDate)
  const dPaid = new Date(paidDate)
  const diff = Math.ceil((dPaid - dDue) / (1000 * 60 * 60 * 24))
  return diff > 0 ? diff : 0
}

const getPaymentsByUser = async (userId, options = {}) => {
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

const getPaymentById = async (id) => {
  return rentPaymentModel.findById(convertToObjectId(id)).lean()
}

const updatePayment = async (id, data, updatedBy) => {
  const existing = await rentPaymentModel.findById(convertToObjectId(id))
  if (!existing) return null

  existing.history.push({
    updatedBy: updatedBy || null,
    changes: existing.toObject(),
    updatedAt: new Date()
  })

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

const deletePayment = async (id) => {
  return rentPaymentModel.findByIdAndDelete(convertToObjectId(id))
}

const createRentPayment = async (data) => {
  const { agreementId, userId, ownerId, paymentDate, dueDate, amountPaid, paymentMode } = data

  const owner = await ownerModel.findById(ownerId).lean()
  const penaltyRate = owner?.penaltyRatePerDay || 0 // e.g. 1 for 1%

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

  if (process.env.ENABLE_RECEIPT_PDF === 'true' || process.env.ENABLE_EMAIL === 'true') {
    await paymentQueue.add('generate-receipt', {
      paymentId: payment._id,
      ownerId,
      userId
    })
  }

  return payment
}

const getDueSummary = async (req, res) => {
  const { agreementId, month, year } = req.body
  const asOfDate = new Date(Date.now())
  const agreement = await rentalAgreementModel.findById(agreementId).lean()
  if (!agreement) return res.status(404).json({ success: false, message: 'Agreement not found' })

  const owner = await ownerModel.findOne({ userId: agreement.ownerId }).lean()
  const penaltyPercentPerDay = owner?.penaltyPercentPerDay || 1
  const asOf = asOfDate ? dayjs(asOfDate) : dayjs()

  const m = month || (asOf.month() + 1)
  const y = year || asOf.year()
  const dueDay = agreement.paymentSchedule?.dueDay || 1
  const dueDate = dayjs(`${y}-${String(m).padStart(2, '0')}-${String(dueDay).padStart(2, '0')}`)
  let daysLate = 0
  if (asOf.isAfter(dueDate, 'day')) daysLate = asOf.diff(dueDate, 'day')

  const rentAmount = Number(agreement.rentAmount)
  const penaltyAmount = computePenalty(rentAmount, daysLate, penaltyPercentPerDay)
  const total = rentAmount + penaltyAmount

  // check existing payment
  const existing = await rentPaymentModel.findOne({ agreementId, month: m, year: y })

  const alreadyPaid = existing && existing.status === 'paid'

  const responseData = {
    agreementId,
    month: m,
    year: y,
    dueDate: dueDate.toDate(),
    rentAmount,
    penaltyAmount,
    totalAmount: total,
    alreadyPaid,
    existingPayment: existing || null
  }

  return responseData
}

const RentPaymentModel = {
  getPaymentsByUser,
  getPaymentById,
  updatePayment,
  deletePayment,
  createRentPayment,
  getDueSummary
}

export default RentPaymentModel