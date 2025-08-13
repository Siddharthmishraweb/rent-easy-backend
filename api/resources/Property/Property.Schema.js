import { mongoose } from "../../helper/index.js"

const mongooseObject = {
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  addressId: { type: mongoose.Schema.Types.ObjectId, ref: "Address", required: true },
  description: String,
  propertyName: { type: String, required: true },
  propertyType: { type: String, enum: ["flat", "villa", "independent_house", "other"], required: true },
  bhkType: String,
  size: Number,
  floor: Number,
  totalFloors: Number,
  availableFrom: Date,
  preferredTenant: String,
  parking: { type: Boolean, default: false },
  features: [{ type: String }],
  images: [{ type: String }],
  isActive: { type: Boolean, default: true },
  highlights: { type: [String], default: [] },
  uniquePropertyCode: { type: String, unique: true, required: true },
  furnishing: {
    type: String,
    enum: ['unfurnished', 'semi-furnished', 'fully-furnished'],
    default: 'unfurnished',
  },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  minAmount: { type: Number, default: null },
  maxAmount: { type: Number, default: null },
}

const mongooseOptions = { timestamps: true }

const propertySchema = new mongoose.Schema(mongooseObject, mongooseOptions)

// ✅ Virtual relationship with Room
propertySchema.virtual('rooms', {
  ref: 'Room', // model name
  localField: '_id',
  foreignField: 'propertyId',
});

const propertyModel = mongoose.model("Property", propertySchema)

export { propertySchema, propertyModel }
