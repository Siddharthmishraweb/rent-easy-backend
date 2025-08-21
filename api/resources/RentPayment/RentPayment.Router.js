import { express, configureRouter } from '../../helper/index.js'
import RentPaymentController from './RentPayment.Controller.js'
import RentPaymentValidator from './RentPayment.Validator.js'

const {
  createPayment,
  getPaymentsByUser,
  getPaymentById,
  updatePayment,
  deletePayment,
  getPaymentBreakup
} = RentPaymentController

const config = {
  preMiddlewares: [],
  postMiddlewares: [],
  routesConfig: {
    createPayment: {
      method: 'post',
      path: '/',
      enabled: true,
      prePipeline: [RentPaymentValidator.validateCreatePayment],
      pipeline: [createPayment]
    },
    getPaymentsByUser: {
      method: 'get',
      path: '/user/:userId',
      enabled: true,
      prePipeline: [],
      pipeline: [getPaymentsByUser]
    },
    getPaymentById: {
      method: 'get',
      path: '/:id',
      enabled: true,
      prePipeline: [],
      pipeline: [getPaymentById]
    },
    updatePayment: {
      method: 'put',
      path: '/:id',
      enabled: true,
      prePipeline: [],
      pipeline: [updatePayment]
    },
    deletePayment: {
      method: 'delete',
      path: '/:id',
      enabled: true,
      prePipeline: [],
      pipeline: [deletePayment]
    },
    getPaymentBreakup: {
      method: 'post',
      path: '/payment-breakup',
      enabled: true,
      prePipeline: [],
      pipeline: [getPaymentBreakup]
    }
  }
}

const RentPaymentRouter = configureRouter(express.Router(), config)

export default RentPaymentRouter
