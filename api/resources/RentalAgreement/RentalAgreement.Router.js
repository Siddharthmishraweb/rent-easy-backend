import { express, configureRouter } from '../../helper/index.js'
import RentalAgreementController from './RentalAgreement.Controller.js'
import RentalAgreementValidator from './RentalAgreement.Validator.js'

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
      prePipeline: [RentalAgreementValidator.validateCreateAgreement],
      pipeline: [createAgreement]
    },
    listAgreements: {
      method: 'post',
      path: '/list',
      enabled: true,
      prePipeline: [],
      pipeline: [listAgreements]
    },
    getAgreementById: {
      method: 'post',
      path: '/getById',
      enabled: true,
      prePipeline: [RentalAgreementValidator.validateIdInBody],
      pipeline: [getAgreementById]
    },
    updateAgreementById: {
      method: 'put',
      path: '/updateById',
      enabled: true,
      prePipeline: [RentalAgreementValidator.validateIdInBody],
      pipeline: [updateAgreementById]
    },
    terminateAgreement: {
      method: 'put',
      path: '/terminate',
      enabled: true,
      prePipeline: [RentalAgreementValidator.validateIdInBody],
      pipeline: [terminateAgreement]
    },
    deleteAgreement: {
      method: 'delete',
      path: '/deleteById',
      enabled: true,
      prePipeline: [RentalAgreementValidator.validateIdInBody],
      pipeline: [deleteAgreement]
    },
    generatePdfAndSend: {
      method: 'post',
      path: '/generatePdf',
      enabled: true,
      prePipeline: [RentalAgreementValidator.validateIdInBody],
      pipeline: [generatePdfAndSend]
    }
  }
}

const RentalAgreementRouter = configureRouter(express.Router(), config)

export default RentalAgreementRouter
