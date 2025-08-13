import { mongoose } from "../../helper/index.js"

const mongooseObject = {
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  state: String,
  city: String,
  pincode: String,
  fullAddress: String,
  geoLocation: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], default: [0, 0] },
  },
}

const mongooseOptions = { timestamps: true }

const addressSchema = new mongoose.Schema(mongooseObject, mongooseOptions)

const addressModel = mongoose.model("Address", addressSchema)

export { addressSchema, addressModel }
