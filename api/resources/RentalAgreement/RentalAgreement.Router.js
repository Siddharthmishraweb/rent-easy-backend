import { express } from '../../helper/index.js'
import {
  createAgreement,
  listAgreements,
  getAgreementById,
  updateAgreementById,
  terminateAgreement,
  deleteAgreement,
  generatePdfAndSend
} from './RentalAgreement.Controller.js'

import {
  validateCreateAgreement,
  validateIdInBody,
  validateSendPdf
} from './RentalAgreement.Validator.js'

const router = express.Router()

router.post('/', validateCreateAgreement, createAgreement)              // create & optionally email PDF
router.post('/list', listAgreements)                                   // { query, page, limit }
router.post('/getById', validateIdInBody, getAgreementById)
router.put('/updateById', validateIdInBody, updateAgreementById)
router.put('/terminate', validateIdInBody, terminateAgreement)
router.delete('/deleteById', validateIdInBody, deleteAgreement)
router.post('/generatePdf', validateSendPdf, generatePdfAndSend)        // returns base64 pdf (or you can email)

export default router
