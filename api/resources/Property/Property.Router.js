import { express } from '../../helper/index.js'
import {
  createProperty,
  getProperties,
  getPropertyById,
  updatePropertyById,
  deletePropertyById,
  getAllPropertiesOfOwner
} from './Property.Controller.js'
import {
  validateCreateProperty,
  validateUpdateProperty,
  validateGetPropertyById
} from './Property.Validator.js'

const router = express.Router()

router.post('/', validateCreateProperty, createProperty)
router.post('/list', getProperties) // body: { query, page, limit }
router.post('/getById', validateGetPropertyById, getPropertyById)
router.put('/updateById', validateUpdateProperty, updatePropertyById)
router.delete('/deleteById', validateGetPropertyById, deletePropertyById)
router.post('/getOwnersProperty', getAllPropertiesOfOwner)

export default router
