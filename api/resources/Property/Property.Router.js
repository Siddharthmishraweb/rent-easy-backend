import { express, configureRouter } from '../../helper/index.js'
import PropertyController from './Property.Controller.js'
import PropertyValidator from './Property.Validator.js'
import { auth } from '../../middleware/rolebasedMiddleware.js'

const {
  createProperty,
  getProperties,
  getPropertyById,
  getPropertyByCode,
  updatePropertyById,
  softDeletePropertyById,
  restorePropertyById,
  archiveProperty,
  deletePropertyById,
  getAllPropertiesOfOwner,
  recomputeRating,
  nearby,
  addImage,
  removeImage,
  bulkUpdate,
  validateCode,
  getStats,
  getSimilarById,
  getSimilarByCode,
  searchProperty,
  autoCompleteSearch
} = PropertyController

const config = {
  preMiddlewares: [],
  postMiddlewares: [],
  routesConfig: {
    createProperty: {
      method: 'post',
      path: '/',
      enabled: true,
      prePipeline: [auth.ownerAndAdmin, PropertyValidator.validateCreateProperty],
      pipeline: [createProperty]
    },
    getProperties: {
      method: 'get',
      path: '/list',
      enabled: true,
      prePipeline: [auth.all, PropertyValidator.validateList],
      pipeline: [getProperties]
    },
    getPropertyById: {
      method: 'get',
      path: '/:id',
      enabled: true,
      prePipeline: [auth.all, PropertyValidator.validateGetPropertyById],
      pipeline: [getPropertyById]
    },
    getPropertyByCode: {
      method: 'get',
      path: '/byCode/:code',
      enabled: true,
      prePipeline: [auth.all, PropertyValidator.validateCode],
      pipeline: [getPropertyByCode]
    },
    validateCodePost: {
      method: 'post',
      path: '/validate-code',
      enabled: true,
      prePipeline: [auth.ownerAndAdmin, PropertyValidator.validateCode],
      pipeline: [validateCode]
    },
    validateCodeGet: {
      method: 'get',
      path: '/validate-code/:code',
      enabled: true,
      prePipeline: [auth.ownerAndAdmin, PropertyValidator.validateCode],
      pipeline: [validateCode]
    },
    updatePropertyById: {
      method: 'put',
      path: '/:id',
      enabled: true,
      prePipeline: [auth.ownerAndAdmin, PropertyValidator.validateUpdateProperty],
      pipeline: [updatePropertyById]
    },
    softDeletePropertyById: {
      method: 'delete',
      path: '/:id/soft',
      enabled: true,
      prePipeline: [auth.ownerAndAdmin, PropertyValidator.validateGetPropertyById],
      pipeline: [softDeletePropertyById]
    },
    restorePropertyById: {
      method: 'post',
      path: '/:id/restore',
      enabled: true,
      prePipeline: [auth.ownerAndAdmin, PropertyValidator.validateGetPropertyById],
      pipeline: [restorePropertyById]
    },
    archiveProperty: {
      method: 'post',
      path: '/:id/archive',
      enabled: true,
      prePipeline: [auth.ownerAndAdmin, PropertyValidator.validateGetPropertyById],
      pipeline: [archiveProperty]
    },
    deletePropertyById: {
      method: 'delete',
      path: '/:id',
      enabled: true,
      prePipeline: [auth.adminOnly, PropertyValidator.validateGetPropertyById],
      pipeline: [deletePropertyById]
    },
    getAllPropertiesOfOwner: {
      method: 'get',
      path: '/owner/:ownerId',
      enabled: true,
      prePipeline: [auth.ownerAndAdmin],
      pipeline: [getAllPropertiesOfOwner]
    },
    recomputeRating: {
      method: 'post',
      path: '/:id/recompute-rating',
      enabled: true,
      prePipeline: [auth.ownerAndAdmin, PropertyValidator.validateGetPropertyById],
      pipeline: [recomputeRating]
    },
    nearby: {
      method: 'get',
      path: '/nearby',
      enabled: true,
      prePipeline: [auth.all, PropertyValidator.validateGeoNearby],
      pipeline: [nearby]
    },
    addImage: {
      method: 'post',
      path: '/:id/images',
      enabled: true,
      prePipeline: [auth.ownerAndAdmin, PropertyValidator.validateGetPropertyById],
      pipeline: [addImage]
    },
    removeImage: {
      method: 'delete',
      path: '/:id/images',
      enabled: true,
      prePipeline: [auth.ownerAndAdmin, PropertyValidator.validateGetPropertyById],
      pipeline: [removeImage]
    },
    bulkUpdate: {
      method: 'put',
      path: '/bulk',
      enabled: true,
      prePipeline: [auth.adminOnly],
      pipeline: [bulkUpdate]
    },
    getStats: {
      method: 'get',
      path: '/stats',
      enabled: true,
      prePipeline: [auth.adminOnly],
      pipeline: [getStats]
    },
    getSimilarById: {
      method: 'get',
      path: '/:id/similar',
      enabled: true,
      prePipeline: [auth.all],
      pipeline: [getSimilarById]
    },
    getSimilarByCode: {
      method: 'get',
      path: '/byCode/:code/similar',
      enabled: true,
      prePipeline: [auth.all],
      pipeline: [getSimilarByCode]
    },
    searchProperty: {
      method: 'get',
      path: '/search',
      enabled: true,
      prePipeline: [auth.all],
      pipeline: [searchProperty]
    },
    autoCompleteSearch: {
      method: 'get',
      path: '/autocomplete',
      enabled: true,
      prePipeline: [auth.all],
      pipeline: [autoCompleteSearch]
    }
  }
}

const PropertyRouter = configureRouter(express.Router(), config)

export default PropertyRouter
