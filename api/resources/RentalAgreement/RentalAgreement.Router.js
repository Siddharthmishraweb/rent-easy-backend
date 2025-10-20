import { express, configureRouter } from '../../helper/index.js'
import RentalAgreementController from './RentalAgreement.Controller.js'
import RentalAgreementValidator from './RentalAgreement.Validator.js'
import { auth } from '../../middleware/rolebasedMiddleware.js'

const {
  createAgreement,
  listAgreements,
  getAgreementById,
  updateAgreementById,
  terminateAgreement,
  deleteAgreement,
  generatePdfAndSend
} = RentalAgreementController

const config = {
  preMiddlewares: [],
  postMiddlewares: [],
  routesConfig: {
    createAgreement: {
      method: 'post',
      path: '/',
      enabled: true,
      prePipeline: [auth.ownerAndAdmin, RentalAgreementValidator.validateCreateAgreement],
      pipeline: [createAgreement]
    },
    listAgreements: {
      method: 'get',
      path: '/',
      enabled: true,
      prePipeline: [auth.all],
      pipeline: [listAgreements]
    },
    getAgreementById: {
      method: 'get',
      path: '/:id',
      enabled: true,
      prePipeline: [auth.all, RentalAgreementValidator.validateIdInBody],
      pipeline: [getAgreementById]
    },
    updateAgreementById: {
      method: 'put',
      path: '/:id',
      enabled: true,
      prePipeline: [auth.ownerAndAdmin, RentalAgreementValidator.validateIdInBody],
      pipeline: [updateAgreementById]
    },
    terminateAgreement: {
      method: 'post',
      path: '/:id/terminate',
      enabled: true,
      prePipeline: [auth.ownerAndAdmin, RentalAgreementValidator.validateIdInBody],
      pipeline: [terminateAgreement]
    },
    deleteAgreement: {
      method: 'delete',
      path: '/:id',
      enabled: true,
      prePipeline: [auth.adminOnly, RentalAgreementValidator.validateIdInBody],
      pipeline: [deleteAgreement]
    },
    generatePdfAndSend: {
      method: 'post',
      path: '/:id/pdf',
      enabled: true,
      prePipeline: [auth.all, RentalAgreementValidator.validateIdInBody],
      pipeline: [generatePdfAndSend]
    }
  }
}

const RentalAgreementRouter = configureRouter(express.Router(), config)

export default RentalAgreementRouter
