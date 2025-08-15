import * as RentPaymentModel from './RentPayment.Model.js'
import { RENTPAYMENT_MESSAGES as MSG } from './RentPayment.Constant.js'

const createPayment = async (req, res, next) => {
  try {
    const payment = await RentPaymentModel.createRentPayment(req.body)
    res.status(201).json({ message: MSG.CREATED, data: payment })
  } catch (err) {
    const status = err.statusCode || (err.code === 11000 ? 409 : 500)
    const message = err.message || 'Server Error'
    res.status(status).json({ error: message })
  }
}

const getPaymentsByUser = async (req, res, next) => {
  try {
    const { userId } = req.params
    const payments = await RentPaymentModel.getPaymentsByUser(userId, req.body.options || {})
    res.json({ message: MSG.FETCHED, data: payments })
  } catch (err) {
    next(err)
  }
}

const getPaymentById = async (req, res, next) => {
  try {
    const payment = await RentPaymentModel.getPaymentById(req.params.id)
    if (!payment) return res.status(404).json({ message: MSG.NOT_FOUND })
    res.json({ data: payment })
  } catch (err) {
    next(err)
  }
}

const updatePayment = async (req, res, next) => {
  try {
    const updated = await RentPaymentModel.updatePayment(req.params.id, req.body)
    if (!updated) return res.status(404).json({ message: MSG.NOT_FOUND })
    res.json({ message: MSG.FETCHED, data: updated })
  } catch (err) {
    next(err)
  }
}

const deletePayment = async (req, res, next) => {
  try {
    const deleted = await RentPaymentModel.deletePayment(req.params.id)
    if (!deleted) return res.status(404).json({ message: MSG.NOT_FOUND })
    res.json({ message: MSG.DELETED })
  } catch (err) {
    next(err)
  }
}

const getPaymentBreakup = async (req, res, next) => {
  try {
    const paymentBreakup = await RentPaymentModel.getDueSummary(req)
    return res.success(200, MSG.FETCH_PAYMENT_BREAKUP, paymentBreakup)
  } catch (error) {
    next(error)
  }
}

export { 
  createPayment,
  getPaymentsByUser,
  getPaymentById,
  updatePayment,
  deletePayment,
  getPaymentBreakup
}
