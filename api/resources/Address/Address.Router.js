import { express } from '../../helper/index.js'

import {
  createAddress,
  updateAddressByAddressId,
  getAddressByUserId,
  getAddressById,
  deleteAddress
} from './Address.Controller.js'

const router = express.Router()

router.post('/get-by-user', getAddressByUserId)
router.post('/get-by-id', getAddressById)
router.post('/create', createAddress)
router.put('/update', updateAddressByAddressId)
router.post('/delete', deleteAddress)

export default router
