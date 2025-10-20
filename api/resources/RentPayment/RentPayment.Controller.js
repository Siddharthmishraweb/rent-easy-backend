import RentPaymentModel from './RentPayment.Model.js'
import { RENTPAYMENT_MESSAGES as MSG } from './RentPayment.Constant.js'

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Rent payment management endpoints
 */

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Create a new rent payment
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - agreementId
 *               - amount
 *               - type
 *             properties:
 *               agreementId:
 *                 type: string
 *                 description: ID of the rental agreement
 *               amount:
 *                 type: number
 *                 minimum: 0
 *                 description: Payment amount
 *               type:
 *                 type: string
 *                 enum: [rent, deposit]
 *                 description: Type of payment
 *               paymentMethod:
 *                 type: string
 *                 enum: [razorpay, bank_transfer, cash]
 *                 description: Method of payment
 *               description:
 *                 type: string
 *                 description: Optional payment description
 *     responses:
 *       201:
 *         description: Payment created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Duplicate payment
 *       500:
 *         description: Server Error
 */
const createPayment = async (req, res, next) => {
  try {
    const payment = await RentPaymentModel.createRentPayment(req.body)

    return res.success(201, MSG.CREATED, payment)
  } catch (err) {
    const status = err.statusCode || (err.code === 11000 ? 409 : 500)
    const message = err.message || 'Server Error'
    res.status(status).json({ error: message })
  }
}

/**
 * @swagger
 * /api/payments/user/{userId}:
 *   get:
 *     summary: Get all payments for a user
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [rent, deposit]
 *         description: Filter by payment type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, paid, failed]
 *         description: Filter by payment status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date
 *     responses:
 *       200:
 *         description: List of payments
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Can only view own payments unless admin
 *       500:
 *         description: Server Error
 */
const getPaymentsByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const payments = await RentPaymentModel.getPaymentsByUser(userId, req.query || {});

    return res.success(200, MSG.FETCHED, payments);
  } catch (err) {
    next(err);
  }
}

const getPaymentById = async (req, res, next) => {
  try {
    const payment = await RentPaymentModel.getPaymentById(req.params.id)
    if (!payment) return res.status(404).json({ message: MSG.NOT_FOUND })
  
    return res.success(200, MSG.FETCHED, payment)
  } catch (err) {
    next(err)
  }
}

const updatePayment = async (req, res, next) => {
  try {
    const updated = await RentPaymentModel.updatePayment(req.params.id, req.body)
    if (!updated) return res.status(404).json({ message: MSG.NOT_FOUND })

    return res.success(200, MSG.FETCHED, updated)
  } catch (err) {
    next(err)
  }
}

const deletePayment = async (req, res, next) => {
  try {
    const deleted = await RentPaymentModel.deletePayment(req.params.id)
    if (!deleted) return res.status(404).json({ message: MSG.NOT_FOUND })

    return res.success(200, MSG.DELETED, deleted)
  } catch (err) {
    next(err)
  }
}

/**
 * @swagger
 * /api/payments/breakup:
 *   get:
 *     summary: Get payment breakup and dues summary
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: agreementId
 *         schema:
 *           type: string
 *         description: Filter by agreement ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for calculation
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for calculation
 *     responses:
 *       200:
 *         description: Payment breakup details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalDue:
 *                   type: number
 *                 rentDue:
 *                   type: number
 *                 depositDue:
 *                   type: number
 *                 lastPaidDate:
 *                   type: string
 *                   format: date
 *                 nextDueDate:
 *                   type: string
 *                   format: date
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server Error
 */
const getPaymentBreakup = async (req, res, next) => {
  try {
    const paymentBreakup = await RentPaymentModel.getDueSummary(req);
    return res.success(200, MSG.FETCH_PAYMENT_BREAKUP, paymentBreakup);
  } catch (error) {
    next(error);
  }
}

const RentPaymentController = {
  createPayment,
  getPaymentsByUser,
  getPaymentById,
  updatePayment,
  deletePayment,
  getPaymentBreakup
}

export default RentPaymentController
