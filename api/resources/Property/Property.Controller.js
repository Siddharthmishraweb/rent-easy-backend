/**
 * @swagger
 * tags:
 *   name: Properties
 *   description: Property management endpoints
 */

import PropertyModel from './Property.Model.js'
import { PROPERTY_MESSAGES as MSG } from './Property.Constant.js'
import { PROPERTY_SIMILAR_WEIGHTS as SIM_W } from './Property.Constant.js'
import { logger } from '../../helper/index.js'
import { auth } from '../../middleware/rolebasedMiddleware.js'
import AppError from '../../helper/AppError.js'
import asyncHandler from '../../helper/asyncHandler.js'

/**
 * @swagger
 * /api/properties:
 *   post:
 *     summary: Create a new property
 *     tags: [Properties]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *               - type
 *               - rent
 *               - securityDeposit
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: object
 *               type:
 *                 type: string
 *               rent:
 *                 type: number
 *               securityDeposit:
 *                 type: number
 *     responses:
 *       201:
 *         description: Property created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
const createProperty = [
  auth.ownerAndAdmin,
  asyncHandler(async (req, res) => {
    try {
      // Validate required fields
      const { name, address, type, rent, securityDeposit } = req.body;
      if (!name || !address || !type || !rent || !securityDeposit) {
        throw new AppError('Missing required fields', 400);
      }

      const property = await PropertyModel.createProperty({
        ...req.body,
        owner: req.user._id
      });
      return res.success(201, MSG.CREATED, property);
    } catch (err) {
      throw new AppError(err.message, err.statusCode || 500);
    }
  })
];

/**
 * @swagger
 * /api/properties:
 *   get:
 *     summary: Get all properties
 *     tags: [Properties]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by property type
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city
 *       - in: query
 *         name: minRent
 *         schema:
 *           type: number
 *         description: Minimum rent amount
 *       - in: query
 *         name: maxRent
 *         schema:
 *           type: number
 *         description: Maximum rent amount
 *     responses:
 *       200:
 *         description: List of properties
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server Error
 */
const getProperties = [
  auth.all,
  asyncHandler(async (req, res) => {
    try {
      const props = await PropertyModel.getProperties(req);
      return res.success(200, MSG.ALL, props);
    } catch (err) {
      logger.error(err, err.errorResponse?.errmsg || "No proper error found");
      throw new AppError(err.message, 500);
    }
  })
];

/**
 * @swagger
 * /api/properties/{propertyId}:
 *   get:
 *     summary: Get a property by ID
 *     tags: [Properties]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *       - in: query
 *         name: withRooms
 *         schema:
 *           type: boolean
 *         description: Include room details
 *     responses:
 *       200:
 *         description: Property details
 *       404:
 *         description: Property not found
 *       500:
 *         description: Server Error
 */
const getPropertyById = [
  auth.all,
  asyncHandler(async (req, res) => {
    const { propertyId } = req.params;
    const { withRooms = false } = req.query;
    
    const property = await PropertyModel.getPropertyById(propertyId, { withRooms });
    if (!property) {
      throw new AppError(MSG.NOT_FOUND, 404);
    }
    
    return res.success(200, MSG.GET_PROPERTY_BY_ID_SUCCESSFULLY, property);
  })
];

/**
 * @swagger
 * /api/properties/code/{code}:
 *   get:
 *     summary: Get a property by unique code
 *     tags: [Properties]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Property unique code
 *       - in: query
 *         name: withRooms
 *         schema:
 *           type: boolean
 *         description: Include room details
 *     responses:
 *       200:
 *         description: Property details
 *       404:
 *         description: Property not found
 *       500:
 *         description: Server Error
 */
const getPropertyByCode = [
  auth.all,
  asyncHandler(async (req, res) => {
    const { code } = req.params;
    const { withRooms = false } = req.query;
    
    const property = await PropertyModel.getPropertyByCode(code, { withRooms: withRooms === 'true' });
    if (!property) {
      throw new AppError(MSG.NOT_FOUND, 404);
    }
    
    return res.success(200, MSG.GET_PROPERTY_BY_CODE, property);
  })
];

/**
 * @swagger
 * /api/properties/{propertyId}:
 *   put:
 *     summary: Update a property
 *     tags: [Properties]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: object
 *               type:
 *                 type: string
 *               rent:
 *                 type: number
 *               securityDeposit:
 *                 type: number
 *     responses:
 *       200:
 *         description: Property updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Property not found
 *       500:
 *         description: Server Error
 */
const updatePropertyById = [
  auth.ownerAndAdmin,
  asyncHandler(async (req, res) => {
    const { propertyId } = req.params;
    const propertyData = req.body;
    
    const updated = await PropertyModel.updatePropertyById(propertyId, propertyData);
    if (!updated) {
      throw new AppError(MSG.NOT_FOUND, 404);
    }
    
    return res.success(200, MSG.UPDATED, updated);
  })
];

/**
 * @swagger
 * /api/properties/{propertyId}/soft-delete:
 *   post:
 *     summary: Soft delete a property
 *     tags: [Properties]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Property soft deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Property not found
 *       500:
 *         description: Server Error
 */
const softDeletePropertyById = [
  auth.ownerAndAdmin,
  asyncHandler(async (req, res) => {
    const { propertyId } = req.params;
    
    const deleted = await PropertyModel.softDeletePropertyById(propertyId);
    if (!deleted) {
      throw new AppError(MSG.NOT_FOUND, 404);
    }
    
    return res.success(200, MSG.DELETED, deleted);
  })
];

/**
 * @swagger
 * /api/properties/{propertyId}/restore:
 *   post:
 *     summary: Restore a soft-deleted property
 *     tags: [Properties]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Property restored successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Property not found
 *       500:
 *         description: Server Error
 */
const restorePropertyById = [
  auth.ownerAndAdmin,
  asyncHandler(async (req, res) => {
    const { propertyId } = req.params;
    
    const restored = await PropertyModel.restorePropertyById(propertyId);
    if (!restored) {
      throw new AppError(MSG.NOT_FOUND, 404);
    }
    
    return res.success(200, MSG.RESTORED, restored);
  })
];

/**
 * @swagger
 * /api/properties/{propertyId}/archive:
 *   post:
 *     summary: Archive or unarchive a property
 *     tags: [Properties]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               archive:
 *                 type: boolean
 *                 description: true to archive, false to unarchive
 *                 default: true
 *     responses:
 *       200:
 *         description: Property archived/unarchived successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Property not found
 *       500:
 *         description: Server Error
 */
const archiveProperty = [
  auth.ownerAndAdmin,
  asyncHandler(async (req, res) => {
    const { propertyId } = req.params;
    const { archive = true } = req.body;
    
    const data = await PropertyModel.archivePropertyById(propertyId, archive);
    if (!data) {
      throw new AppError(MSG.NOT_FOUND, 404);
    }
    
    return res.success(200, MSG.ARCHIVED, data);
  })
];

/**
 * @swagger
 * /api/properties/{propertyId}:
 *   delete:
 *     summary: Permanently delete a property
 *     tags: [Properties]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Property deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only admins can permanently delete
 *       404:
 *         description: Property not found
 *       500:
 *         description: Server Error
 */
const deletePropertyById = [
  auth.adminOnly,
  asyncHandler(async (req, res) => {
    const { propertyId } = req.params;
    
    const deleted = await PropertyModel.deletePropertyById(propertyId);
    if (!deleted) {
      throw new AppError(MSG.NOT_FOUND, 404);
    }
    
    return res.success(200, MSG.DELETED, deleted);
  })
];

/**
 * @swagger
 * /api/properties/owner/{ownerId}:
 *   get:
 *     summary: Get all properties of an owner
 *     tags: [Properties]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ownerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Owner ID
 *       - in: query
 *         name: includeArchived
 *         schema:
 *           type: boolean
 *         description: Include archived properties
 *       - in: query
 *         name: includeDeleted
 *         schema:
 *           type: boolean
 *         description: Include soft-deleted properties
 *     responses:
 *       200:
 *         description: List of owner's properties
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Owner not found
 *       500:
 *         description: Server Error
 */
const getAllPropertiesOfOwner = [
  auth.ownerAndAdmin,
  asyncHandler(async (req, res) => {
    const { ownerId } = req.params;
    const { includeArchived = false, includeDeleted = false } = req.query;
    
    // Only allow owners to view their own properties unless admin
    if (!auth.isAdmin(req.user) && req.user._id.toString() !== ownerId) {
      throw new AppError('Not authorized to view other owner\'s properties', 403);
    }

    const properties = await PropertyModel.getAllPropertiesOfOwner({
      ownerId,
      includeArchived,
      includeDeleted
    });
    
    if (!properties) {
      throw new AppError(MSG.NOT_FOUND, 404);
    }

    return res.success(200, MSG.ALL_OWNER_PROPERTIES, properties);
  })
];

/**
 * @swagger
 * /api/properties/{propertyId}/rating/recompute:
 *   post:
 *     summary: Recompute average rating of a property
 *     tags: [Properties]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Rating recomputed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     average:
 *                       type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Property not found
 *       500:
 *         description: Server Error
 */
const recomputeRating = [
  auth.ownerAndAdmin,
  asyncHandler(async (req, res) => {
    const { propertyId } = req.params;
    
    const avg = await PropertyModel.recomputePropertyRating(propertyId);
    if (avg === null) {
      throw new AppError(MSG.NOT_FOUND, 404);
    }
    
    return res.success(200, MSG.RATING_RECOMPUTED, { average: avg });
  })
];

/**
 * @swagger
 * /api/properties/nearby:
 *   get:
 *     summary: Get properties near a location
 *     tags: [Properties]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitude of the location
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitude of the location
 *       - in: query
 *         name: maxDistanceMeters
 *         schema:
 *           type: number
 *           default: 5000
 *         description: Maximum distance in meters
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field to sort by
 *       - in: query
 *         name: sortDir
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort direction
 *     responses:
 *       200:
 *         description: List of nearby properties
 *       400:
 *         description: Invalid coordinates
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server Error
 */
const nearby = [
  auth.all,
  asyncHandler(async (req, res) => {
    const { lng, lat, maxDistanceMeters = 5000, page, limit, sortBy, sortDir, ...rest } = req.query;
    
    if (!lng || !lat || isNaN(lng) || isNaN(lat)) {
      throw new AppError('Invalid coordinates', 400);
    }

    const result = await PropertyModel.getProperties(
      { ...rest, near: { lng: Number(lng), lat: Number(lat), maxDistanceMeters: Number(maxDistanceMeters) } },
      { page: Number(page), limit: Number(limit), sortBy, sortDir }
    );

    return res.success(200, MSG.ALL, result);
  })
];

/**
 * @swagger
 * /api/properties/{propertyId}/images:
 *   post:
 *     summary: Add an image to a property
 *     tags: [Properties]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 description: URL of the image
 *     responses:
 *       200:
 *         description: Image added successfully
 *       400:
 *         description: Invalid URL
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Property not found
 *       500:
 *         description: Server Error
 */
const addImage = [
  auth.ownerAndAdmin,
  asyncHandler(async (req, res) => {
    const { propertyId } = req.params;
    const { url } = req.body;

    if (!url) {
      throw new AppError('Image URL is required', 400);
    }

    const updated = await PropertyModel.addImage(propertyId, url);
    if (!updated) {
      throw new AppError(MSG.NOT_FOUND, 404);
    }

    return res.success(200, MSG.IMAGE_ADDED, updated);
  })
];

/**
 * @swagger
 * /api/properties/{propertyId}/images:
 *   delete:
 *     summary: Remove an image from a property
 *     tags: [Properties]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 description: URL of the image to remove
 *     responses:
 *       200:
 *         description: Image removed successfully
 *       400:
 *         description: Invalid URL
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Property not found
 *       500:
 *         description: Server Error
 */
const removeImage = [
  auth.ownerAndAdmin,
  asyncHandler(async (req, res) => {
    const { propertyId } = req.params;
    const { url } = req.body;

    if (!url) {
      throw new AppError('Image URL is required', 400);
    }

    const updated = await PropertyModel.removeImage(propertyId, url);
    if (!updated) {
      throw new AppError(MSG.NOT_FOUND, 404);
    }

    return res.success(200, MSG.IMAGE_REMOVED, updated);
  })
];

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

/**
 * @swagger
 * /api/properties/search:
 *   get:
 *     summary: Search properties or rooms by location with geospatial sorting
 *     tags: [Properties]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: place
 *         required: true
 *         schema:
 *           type: string
 *         description: Location to search (e.g., "Noida")
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [room, property]
 *         description: Type of listing to search
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 5000
 *         description: Search radius in meters
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Results per page
 *       - in: query
 *         name: minRent
 *         schema:
 *           type: number
 *         description: Minimum rent amount
 *       - in: query
 *         name: maxRent
 *         schema:
 *           type: number
 *         description: Maximum rent amount
 *     responses:
 *       200:
 *         description: List of properties or rooms sorted by distance
 *       400:
 *         description: Invalid input parameters
 *       500:
 *         description: Server Error
 */
const searchProperty = async (req, res) => {
  try {
    const { place, type, radius = 5000, page = 1, limit = 10, minRent, maxRent } = req.query;

    if (!place || !type || !['room', 'property'].includes(type)) {
      throw new AppError('Invalid search parameters', 400);
    }

    // Get coordinates for the place using geocoding service
    const coordinates = await geocodePlace(place);
    if (!coordinates) {
      throw new AppError('Location not found', 400);
    }

    // Prepare search query
    const query = {
      'address.location': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [coordinates.lng, coordinates.lat]
          },
          $maxDistance: radius
        }
      },
      isArchived: false,
      isDeleted: false
    };

    // Add type filter
    if (type === 'room') {
      query.type = 'room';
    } else {
      query.type = { $ne: 'room' };
    }

    // Add rent range filter
    if (minRent || maxRent) {
      query.rent = {};
      if (minRent) query.rent.$gte = Number(minRent);
      if (maxRent) query.rent.$lte = Number(maxRent);
    }

    // Execute search with pagination
    const properties = await PropertyModel.searchProperty(query, {
      page: Number(page),
      limit: Number(limit),
      sort: { distance: 1 }
    });

    return res.success(200, MSG.SEARCH_PROPERTY, properties);
  } catch (err) {
    if (err.name === 'AppError') {
      return res.status(err.statusCode).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
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
