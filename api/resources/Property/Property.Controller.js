import PropertyModel from './Property.Model.js'
import { PROPERTY_MESSAGES as MSG } from './Property.Constant.js'
import { PROPERTY_SIMILAR_WEIGHTS as SIM_W } from './Property.Constant.js'
import { logger } from '../../helper/index.js'

const createProperty = async (req, res) => {
  try {
    const property = await PropertyModel.createProperty(req.body)
    return res.success(201, MSG.CREATED, property)
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message })
  }
}

const getProperties = async (req, res) => {
  try {
    const props = await PropertyModel.getProperties(req)
    return res.success(200, MSG.ALL, props)
  } catch (err) {
    logger.error(err, err.errorResponse.errmsg || "No proper error found")
    res.status(500).json({ error: err.message })
  }
}

const getPropertyById = async (req, res) => {
  try {
    const { propertyId, withRooms = false, withAddress = false, withOwner = false } = req.body
    const property = await PropertyModel.getPropertyById(propertyId, { withRooms, withAddress, withOwner })
    if (!property) return res.status(404).json({ message: MSG.NOT_FOUND })
    return res.success(200, MSG.GET_PROPERTY_BY_ID_SUCCESSFULLY, property)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getPropertyByCode = async (req, res) => {
  try {
    const { code } = req.params
    const { withRooms = false } = req.query
    const property = await PropertyModel.getPropertyByCode(code, { withRooms: withRooms === 'true' })
    if (!property) return res.status(404).json({ message: MSG.NOT_FOUND })
    return res.success(200, MSG.GET_PROPERTY_BY_CODE, property)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const updatePropertyById = async (req, res) => {
  try {
    const updated = await PropertyModel.updatePropertyById(req.body.propertyId, req.body.propertyData)
    if (!updated) return res.status(404).json({ message: MSG.NOT_FOUND })
    return res.success(200, MSG.UPDATED, updated)
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message })
  }
}

const softDeletePropertyById = async (req, res) => {
  try {
    const deleted = await PropertyModel.softDeletePropertyById(req.body.propertyId)
    if (!deleted) return res.status(404).json({ message: MSG.NOT_FOUND })
    return res.success(200, MSG.DELETED, deleted)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const restorePropertyById = async (req, res) => {
  try {
    const restored = await PropertyModel.restorePropertyById(req.body.propertyId)
    if (!restored) return res.status(404).json({ message: MSG.NOT_FOUND })
    return res.success(200, MSG.RESTORED, restored)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const archiveProperty = async (req, res) => {
  try {
    const { propertyId, archive = true } = req.body
    const data = await PropertyModel.archivePropertyById(propertyId, archive)
    if (!data) return res.status(404).json({ message: MSG.NOT_FOUND })
    return res.success(200, MSG.ARCHIVED, data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const deletePropertyById = async (req, res) => {
  try {
    const deleted = await PropertyModel.deletePropertyById(req.body.propertyId)
    if (!deleted) return res.status(404).json({ message: MSG.NOT_FOUND })
    return res.success(200, MSG.DELETED, deleted)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getAllPropertiesOfOwner =  async (req, res) => {
  try {
    const properties = await PropertyModel.getAllPropertiesOfOwner(req.body)
    if (!properties) return res.status(404).json({ message: MSG.NOT_FOUND })

    return res.success(200, MSG.ALL_OWNER_PROPERTIES, properties)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const recomputeRating = async (req, res) => {
  try {
    const { propertyId } = req.body
    const avg = await PropertyModel.recomputePropertyRating(propertyId)
    res.json({ message: MSG.RATING_RECOMPUTED, data: { average: avg } })

    return res.success(200, MSG.RATING_RECOMPUTED, avg)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const nearby = async (req, res) => {
  try {
    const { lng, lat, maxDistanceMeters, ...rest } = req.body
    const result = await PropertyModel.getProperties(
      { ...rest, near: { lng, lat, maxDistanceMeters } },
      { page: req.body.page, limit: req.body.limit, sortBy: req.body.sortBy, sortDir: req.body.sortDir }
    )

    return res.success(200, MSG.ALL, ...result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const addImage = async (req, res) => {
  try {
    const { propertyId, url } = req.body
    const updated = await PropertyModel.addImage(propertyId, url)
    return res.success(200, MSG.IMAGE_ADDED, updated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const removeImage = async (req, res) => {
  try {
    const { propertyId, url } = req.body
    const updated = await PropertyModel.removeImage(propertyId, url)
    return res.success(200, MSG.IMAGE_REMOVED, updated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const bulkUpdate = async (req, res) => {
  try {
    const result = await PropertyModel.bulkUpdate(req.body)
    return res.success(200, MSG.BULK_UPDATED, result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const validateCode = async (req, res) => {
  try {
    const code = req.body.uniquePropertyCode || req.params.code
    const result = await PropertyModel.validateCodeAvailability(code)
    return res.success(200, result.available ? MSG.CODE_AVAILABLE : MSG.CODE_EXISTS, result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getStats = async (req, res) => {
  try {
    const stats = await PropertyModel.getStats(req.body?.query || {})
    return res.success(200, MSG.STATS, stats)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}


const getSimilarById = async (req, res) => {
  try {
    const {
      propertyId,
      limit = 10,
      minResults = 6,
      maxDistanceMeters = 10000,
      includeArchived = false,
      includeDeleted = false,
      excludeOwner = false,
    } = req.body || {}

    const { items, usedFallback, target } = await PropertyModel.findSimilarById(propertyId, {
      limit, minResults, maxDistanceMeters, includeArchived, includeDeleted, excludeOwner,
    })

    if (!target) return res.status(404).json({ message: MSG.NOT_FOUND })

      const data = {
        items,
        targetId: String(target._id),
        usedFallback,
        weights: SIM_W,
        limit, minResults, maxDistanceMeters,
    }

    return res.success(200, usedFallback ? MSG.SIMILAR_FALLBACK_USED : MSG.SIMILAR_FETCHED, data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getSimilarByCode = async (req, res) => {
  try {
    const {
      limit = 10,
      minResults = 6,
      maxDistanceMeters = 10000,
      includeArchived = false,
      includeDeleted = false,
      excludeOwner = false,
    } = req.query || {}

    const { items, usedFallback, target } = await PropertyModel.findSimilarByCode(req.params.code, {
      limit: Number(limit),
      minResults: Number(minResults),
      maxDistanceMeters: Number(maxDistanceMeters),
      includeArchived: includeArchived === 'true',
      includeDeleted: includeDeleted === 'true',
      excludeOwner: excludeOwner === 'true',
    })

    if (!target) return res.status(404).json({ message: MSG.NOT_FOUND })

    const data = {
        items,
        targetCode: target.uniquePropertyCode,
        usedFallback,
        weights: SIM_W,
        limit: Number(limit),
        minResults: Number(minResults),
        maxDistanceMeters: Number(maxDistanceMeters),
    }


    return res.success(200, usedFallback ? MSG.SIMILAR_FALLBACK_USED : MSG.SIMILAR_FETCHED, data)      
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const searchProperty = async (req, res) => {
  try {
    const properties = await PropertyModel.searchProperty(req.body || {})
    return res.success(200, MSG.SEARCH_PROPERTY, properties)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const autoCompleteSearch = async (req, res) => {
  try {
    const query = { q: req.query.q, limit: req.query.limit ? Number(req.query.limit) : undefined }
    const { q, limit } = query

    const properties = await PropertyModel.autoCompleteSearch(q, limit)
    return res.success(200, MSG.AUTO_COMPLETE, properties)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const PropertyController = {
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
}

export default PropertyController
