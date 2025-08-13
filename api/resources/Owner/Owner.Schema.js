import { mongoose } from '../../helper/index.js'

const mongooseObject = {
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ownedProperties: [{ type: mongoose.Schema.Types.ObjectId, ref: "Property" }],
  bankDetails: {
    accountHolderName: String,
    accountNumber: String,
    ifsc: String
  },
  penaltyPercentPerDay: { type: Number, default: 1 } // percent per day late
}

const mongooseOptions = { timestamps: true }

const ownerSchema = new mongoose.Schema(mongooseObject, mongooseOptions)
ownerSchema.index({ "address.geoLocation": "2dsphere" })

const ownerModel = mongoose.model("Owner", ownerSchema)

export { ownerSchema, ownerModel }
