import { roomModel } from './Room.Schema.js'
import { convertToObjectId } from '../../helper/index.js'
import { PropertyModel } from '../Property/Property.Model.js'
import { userModel } from '../User/User.Schema.js'
import { RentalAgreementModel } from '../RentalAgreement/RentalAgreement.Model.js'
import { rentalAgreementModel } from '../RentalAgreement/RentalAgreement.Schema.js'

const createRoom = async (roomData) => {
  const created = await roomModel.create(roomData);
  return created;
}

const getRooms = async (filter = {}, options = {}) => {
  // supports pagination
  const q = { ...filter }
  const page = options.page > 0 ? parseInt(options.page) : 0
  const limit = options.limit > 0 ? parseInt(options.limit) : 0
  const cursor = roomModel.find(q).sort({ createdAt: -1 }).lean()
  if (limit) cursor.skip(page * limit).limit(limit)
  return await cursor
}

const getRoomById = async (id) => {
  return await roomModel.findById(convertToObjectId(id)).lean()
}

const updateRoomById = async (roomId, updateData) => {
  const updated = await roomModel.findByIdAndUpdate(convertToObjectId(roomId), { $set: updateData }, { new: true })
  if (updated && updateData.rating !== undefined) {
    // recompute property rating if rating changed
    await PropertyModel.recomputePropertyRating(updated.propertyId)
  }
  return updated
}

const deleteRoomById = async (roomId) => {
  const deleted = await roomModel.findByIdAndDelete(convertToObjectId(roomId))
  if (deleted) {
    await PropertyModel.recomputePropertyRating(deleted.propertyId)
  }
  return deleted
}

/**
 * Assign a tenant to a room (Move-in)
 * @param {string} roomId - Room ID
 * @param {string} tenantId - User ID of tenant
 * @param {number} rentAmount - Monthly rent
 * @param {number} securityDeposit - Security deposit
 */
export async function assignTenant(roomData) {
  const { roomId, tenantId, agreementEndDate, paymentSchedule } = roomData
  const room = await roomModel.findById({ _id: convertToObjectId(roomId) })
  if (!room) throw new Error("Room not found")

  const rentAmount = room.rent
  const securityDepositAmount = room.securityDeposit.amount || 0
  const agreementStartDate = new Date()
  // console.log("Security Deposit", securityDeposit)

  const agreementData = {
    rentAmount: rentAmount,
    securityDeposit: Number(securityDepositAmount),
    agreementStartDate: agreementStartDate,
    userId: tenantId,
    roomId,
    agreementEndDate,
    isActive: true,
    status: 'active',
    paymentSchedule
  }

  const agreementResponse = await RentalAgreementModel.createRentalAgreement(agreementData)
  console.log("agreementResponse: ", agreementResponse)

  // ✅ Prevent duplicate active history records
  const hasActiveHistory = room.rentalHistory.some(h => h.endDate === null);
  if (hasActiveHistory) {
    throw new Error("This room has an active rental record. Vacate first.");
  }

  // room.tenantId = convertToObjectId(tenantId)
  const objectTenantId = convertToObjectId(tenantId)
  room.isAvailable = false
  room.rentalHistory.push({
    tenantId: objectTenantId,
    startDate: agreementStartDate,
    rentAmount,
    securityDeposit: securityDepositAmount
  })

  await room.save()

  await userModel.findByIdAndUpdate(
    objectTenantId,
    { role: 'tenant' },
    { new: true }
  )

  return room
}

/**
 * Vacate a tenant from a room (Move-out)
 * @param {string} roomId - Room ID
 */
export async function vacateTenant(roomId) {
  const room = await roomModel.findById({ _id: convertToObjectId(roomId) })
  await rentalAgreementModel.findOneAndUpdate(
    { roomId },
    {
      $set: {
        agreementEndDate: new Date(),
        status: 'inactive',
        isActive: false
      }
    }
  )

  if (!room) throw new Error("Room not found")

  // if (!room.tenantId) throw new Error("Room is already vacant")

  // Update latest rental history record's endDate
  const lastHistory = room.rentalHistory[room.rentalHistory.length - 1]
  if (lastHistory && !lastHistory.endDate) {
    lastHistory.endDate = new Date()
  }

  const objectTenantId = lastHistory?.tenantId

  room.tenantId = null
  room.isAvailable = true

  await room.save()

  await userModel.findByIdAndUpdate(
    objectTenantId,
    { role: 'user' },
    { new: true }
  )

  return room
}

const RoomModel = {
  createRoom,
  getRooms,
  getRoomById,
  updateRoomById,
  deleteRoomById,
  assignTenant,
  vacateTenant,
}

async function recomputePropertyRating(propertyId) {

  const stats = await roomModel.aggregate([
    { $match: { propertyId: new mongoose.Types.ObjectId(propertyId) } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$rating" }
      }
    }
  ])

  await this.findByIdAndUpdate(propertyId, {
    rating: stats.length > 0 ? stats[0].avgRating : 0
  })
}


async function recomputePropertyStats(propertyId) {

  const stats = await roomModel.aggregate([
    { $match: { propertyId: new mongoose.Types.ObjectId(propertyId) } },
    {
      $group: {
        _id: null,
        minRent: { $min: "$rent" },
        maxRent: { $max: "$rent" },
        avgRating: { $avg: "$rating" }
      }
    }
  ])

  if (stats.length > 0) {
    await this.findByIdAndUpdate(propertyId, {
      minAmount: stats[0].minRent,
      maxAmount: stats[0].maxRent,
      rating: stats[0].avgRating || 0
    })
  } else {
    // If no rooms exist, reset stats
    await this.findByIdAndUpdate(propertyId, {
      minAmount: null,
      maxAmount: null,
      rating: 0
    })
  }
}

export default RoomModel
