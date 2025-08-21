
import { mongoose } from '../../helper/index.js'

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['rent_reminder', 'agreement_expiry', 'new_property_nearby', 'generic'], required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  triggeredAt: { type: Date, default: Date.now },
  meta: { type: Object, default: {} } // store related ids (roomId/propertyId) etc.
}, { timestamps: true })

notificationSchema.index({ userId: 1, isRead: 1 })

notificationSchema.set('toJSON', { virtuals: true })
notificationSchema.set('toObject', { virtuals: true })

const notificationModel = mongoose.model('Notification', notificationSchema)

export { notificationSchema, notificationModel }
