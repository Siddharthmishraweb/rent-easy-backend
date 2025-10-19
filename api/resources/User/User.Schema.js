import { mongoose } from '../../helper/index.js' 
import { addressSchema } from '../Address/Address.Schema.js'

const mongooseObject = {
  name: String,
  isProfileVerified: { type: Boolean, default: false },
  profileUrl: { type: String },
  email: { type: String, unique: true },
  phone: { type: String, unique: true },
  passwordHash: String,
  // role: { type: String, enum: ['user', 'owner', 'admin', 'tenant'], default: 'user' },
    role: {
    type: String,
    enum: ['ADMIN', 'OWNER', 'TENANT', 'GUEST'],
    default: 'GUEST'
  },
  aadhaarNumber: String,
  kycVerified: { type: Boolean, default: false },
  address: addressSchema,
}

const mongooseOptions = { timestamps: true }

const userSchema = new mongoose.Schema(mongooseObject, mongooseOptions)

userSchema.index({ "address.geoLocation": "2dsphere" })

userSchema.set('toJSON', { virtuals: true })
userSchema.set('toObject', { virtuals: true })

const userModel = mongoose.model("User", userSchema)

export { userSchema, userModel }