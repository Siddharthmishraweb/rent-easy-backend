import { propertyModel } from './Property.Schema.js'
import { convertToObjectId } from '../../helper/index.js'
import { roomModel } from '../Room/Room.Schema.js' // used to compute ratings (direct import ok)
import { PROPERTY_MESSAGES as MSG } from './Property.Constant.js'
import { ownerModel } from '../Owner/Owner.Schema.js'

export const createProperty = async (propertyData) => {
  // 1. Validate owner existence
  const owner = await ownerModel.findById(propertyData.ownerId)
  if (!owner) {
    const err = new Error(MSG.OWNER_NOT_FOUND)
    err.statusCode = 404
    throw err
  }

  // 2. Create property
  let property
  try {
    property = await propertyModel.create(propertyData)
  } catch (err) {
    const error = new Error(MSG.CREATE_FAILED)
    error.statusCode = 500
    throw error
  }

  // 3. Push property to owner's ownedProperties
  try {
    await ownerModel.findByIdAndUpdate(
      propertyData.ownerId,
      { $push: { ownedProperties: property._id } },
      { new: true }
    )
  } catch (err) {
    // Optional: rollback property if linking fails
    await propertyModel.findByIdAndDelete(property._id)
    const error = new Error(MSG.OWNER_UPDATE_FAILED)
    error.statusCode = 500
    throw error
  }

  return property
}

const getProperties = async (filter = {}, options = {}) => {
  // options supports pagination: { page, limit }
  const q = { ...filter }
  const page = options.page > 0 ? parseInt(options.page) : 0
  const limit = options.limit > 0 ? parseInt(options.limit) : 0

  const cursor = propertyModel.find(q).sort({ createdAt: -1 }).lean()
  if (limit) cursor.skip(page * limit).limit(limit)
  return await cursor
}

const getPropertyById = async (id) => {
  return await propertyModel.findById(convertToObjectId(id)).lean()
}

const updatePropertyById = async (propertyId, updateData) => {
  return await propertyModel.findByIdAndUpdate(convertToObjectId(propertyId), { $set: updateData }, { new: true })
}

const deletePropertyById = async (propertyId) => {
  return await propertyModel.findByIdAndDelete(convertToObjectId(propertyId))
}

// Recalculate average rating for property using roomModel
const recomputePropertyRating = async (propertyId) => {
  const pid = convertToObjectId(propertyId)
  const agg = await roomModel.aggregate([
    { $match: { propertyId: pid, rating: { $exists: true } } },
    { $group: { _id: '$propertyId', avgRating: { $avg: '$rating' } } }
  ])
  const avg = agg[0] ? Math.round((agg[0].avgRating + Number.EPSILON) * 100) / 100 : 0
  await propertyModel.findByIdAndUpdate(pid, { $set: { rating: avg } })
  return avg
}

const getAllPropertiesOfOwner = async ({ ownerId, withRoom = false }) => {
  try {
    let query = propertyModel.find({ ownerId });

    if (withRoom) {
      query = query.populate({
        path: 'rooms', // must match virtual name in Property schema
        model: 'Room', // use model name string here
        options: { sort: { createdAt: -1 } }
      });
    }

    // ✅ Lean AFTER populate so virtuals exist
    const properties = await query.lean({ virtuals: true }).exec();
    return properties;
  } catch (err) {
    throw new Error(`Failed to fetch properties: ${err.message}`);
  }
};


export const PropertyModel = {
  createProperty,
  getProperties,
  getPropertyById,
  updatePropertyById,
  deletePropertyById,
  recomputePropertyRating,
  getAllPropertiesOfOwner
}
