import { express } from '../../helper/index.js'
import {
  createRoom,
  getRooms,
  getRoomById,
  updateRoomById,
  deleteRoomById,
  assignTenant,
  vacateTenant
} from './Room.Controller.js'
import { validateCreateRoom, validateUpdateRoom, validateGetRoomById } from './Room.Validator.js'

const router = express.Router()

router.post('/', validateCreateRoom, createRoom)
router.post('/list', getRooms) // body: { query, page, limit }
router.post('/getById', validateGetRoomById, getRoomById)
router.put('/updateById', validateUpdateRoom, updateRoomById)
router.delete('/deleteById', validateGetRoomById, deleteRoomById)
router.post('/assign-tenant', assignTenant)
router.post('/vacate-tenant', vacateTenant)

export default router
