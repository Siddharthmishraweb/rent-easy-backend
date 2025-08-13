import { mongoose } from '../../helper/index.js'

const rentalAgreementSchema = new mongoose.Schema(
  {
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, // tenant
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, // owner (use User model)
    agreementStartDate: { type: Date, required: true },
    agreementEndDate: { type: Date, required: true },
    rentAmount: { type: Number, required: true },
    securityDeposit: { type: Number, required: true },
    signedAgreementURL: { type: String, required: false }, // S3 URL or file server
    digitalSignatures: {
      userSignatureURL: { type: String, required: false },
      ownerSignatureURL: { type: String, required: false }
    },
    isActive: { type: Boolean, default: true, index: true },
    status: { type: String, enum: ['pending', 'active', 'terminated'], default: 'pending', index: true },
    paymentSchedule: { // optional helpful field
      frequency: { type: String, enum: ['monthly','quarterly','annually'], default: 'monthly' },
      dueDay: { type: Number, min: 1, max: 31 } // if monthly
    },
    meta: { type: Object, default: {} } // extra info (PDF generation data, etc.)
  },
  { timestamps: true }
)

rentalAgreementSchema.index({ roomId: 1, userId: 1 }, { unique: false }) // allow multiple agreements in history

export const rentalAgreementModel = mongoose.model('RentalAgreement', rentalAgreementSchema)
