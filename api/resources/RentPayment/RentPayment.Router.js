import { express, configureRouter } from '../../helper/index.js'
import RentPaymentController from './RentPayment.Controller.js'
import RentPaymentValidator from './RentPayment.Validator.js'
import { auth } from '../../middleware/rolebasedMiddleware.js'

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
      prePipeline: [auth.tenantOnly, RentPaymentValidator.validateCreatePayment],
      pipeline: [createPayment]
    },
    getPaymentsByUser: {
      method: 'get',
      path: '/user/:userId',
      enabled: true,
      prePipeline: [auth.all],
      pipeline: [getPaymentsByUser]
    },
    getPaymentById: {
      method: 'get',
      path: '/:id',
      enabled: true,
      prePipeline: [auth.all],
      pipeline: [getPaymentById]
    },
    updatePayment: {
      method: 'put',
      path: '/:id',
      enabled: true,
      prePipeline: [auth.adminOnly],
      pipeline: [updatePayment]
    },
    deletePayment: {
      method: 'delete',
      path: '/:id',
      enabled: true,
      prePipeline: [auth.adminOnly],
      pipeline: [deletePayment]
    },
    getPaymentBreakup: {
      method: 'get',
      path: '/breakup',
      enabled: true,
      prePipeline: [auth.tenantAndAdmin],
      pipeline: [getPaymentBreakup]
    }
  }
}

const RentPaymentRouter = configureRouter(express.Router(), config)

export default RentPaymentRouter
