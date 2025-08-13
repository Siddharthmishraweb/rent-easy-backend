import { express } from '../../helper/index.js'
import {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocumentById,
  deleteDocument,
  getAllDocumentsByUserId,
  updateDocumentsByUserId,
  deleteDocumentsByUserId,
  getDocumentByType
} from './Document.Controller.js'

import {
  validateCreateDocument,
  validateGetDocumentById,
  validateUpdateDocumentById,
  validateDeleteDocument,
  validateGetAllDocumentsByUserId,
  validateUpdateDocumentsByUserId,
  validateDeleteDocumentsByUserId,
  validateGetDocumentByType
} from './Document.Validator.js'

const router = express.Router()

router.post('/', validateCreateDocument, createDocument)
router.get('/', getDocuments)
router.post('/getById', validateGetDocumentById, getDocumentById)
router.put('/updateById', validateUpdateDocumentById, updateDocumentById)
router.delete('/deleteById', validateDeleteDocument, deleteDocument)
router.post('/getAllByUserId', validateGetAllDocumentsByUserId, getAllDocumentsByUserId)
router.put('/updateByUserId', validateUpdateDocumentsByUserId, updateDocumentsByUserId)
router.delete('/deleteByUserId', validateDeleteDocumentsByUserId, deleteDocumentsByUserId)
router.post('/getByType', validateGetDocumentByType, getDocumentByType)

export default router
