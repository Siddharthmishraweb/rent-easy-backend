import { mongoose } from '../../helper/index.js'
import { PAYMENT_MODE, PAYMENT_STATUS } from './RentPayment.Constant.js'

const rentPaymentSchema = new mongoose.Schema({
  agreementId: { type: mongoose.Schema.Types.ObjectId, ref: 'RentalAgreement', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, // tenant
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true, index: true },
  transactionNumber: { type: String, required: true, unique: true, index: true },
  paymentDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  amountPaid: { type: Number, required: true },
  paymentMode: { type: String, enum: Object.values(PAYMENT_MODE), required: true },
  receiptUrl: { type: String },
  penaltyAmount: { type: Number, default: 0 },
  totalAmountCollected: { type: Number, default: 0 }, // amountPaid + penalty
  status: { type: String, enum: Object.values(PAYMENT_STATUS), default: PAYMENT_STATUS.PENDING },
  metadata: { type: Object, default: {} }, // store gateway response, etc.
  createdAt: { type: Date, default: Date.now },
  history: [
    {
      updatedAt: { type: Date, default: Date.now },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional
      changes: { type: Object } // snapshot of changed fields
    }
  ]
})

export const rentPaymentModel = mongoose.model('RentPayment', rentPaymentSchema)
