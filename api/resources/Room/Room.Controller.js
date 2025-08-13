import RoomModel  from './Room.Model.js'
import { ROOM_MESSAGES as MSG } from './Room.Constant.js'

const createRoom = async (req, res) => {
  try {
    const room = await RoomModel.createRoom(req.body)
    res.status(201).json({ message: MSG.CREATED, data: room })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getRooms = async (req, res) => {
  try {
    const { query = {}, page, limit } = req.body
    const rooms = await RoomModel.getRooms(query, { page, limit })
    res.json({ message: MSG.ALL, data: rooms })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getRoomById = async (req, res) => {
  try {
    const room = await RoomModel.getRoomById(req.body.roomId)
    if (!room) return res.status(404).json({ message: MSG.NOT_FOUND })
    res.json({ data: room })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const updateRoomById = async (req, res) => {
  try {
    const updated = await RoomModel.updateRoomById(req.body.roomId, req.body.roomData)
    if (!updated) return res.status(404).json({ message: MSG.NOT_FOUND })
    res.json({ message: MSG.UPDATED, data: updated })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const deleteRoomById = async (req, res) => {
  try {
    const deleted = await RoomModel.deleteRoomById(req.body.roomId)
    if (!deleted) return res.status(404).json({ message: MSG.NOT_FOUND })
    res.json({ message: MSG.DELETED })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const assignTenant = async (req, res) => {
  try {
    const room = await RoomModel.assignTenant(req.body)
    res.status(200).json({ message: MSG.CREATED, data: room })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const vacateTenant = async (req, res) => {
  try {
    const room = await RoomModel.vacateTenant(req.body.roomId)
    res.status(200).json({ message: MSG.CREATED, data: room })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export { 
  createRoom,
  getRooms,
  getRoomById,
  updateRoomById,
  deleteRoomById,
  assignTenant, 
  vacateTenant 
}
