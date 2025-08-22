export const PROPERTY_MESSAGES = {
  CREATED: 'Property created',
  UPDATED: 'Property updated',
  DELETED: 'Property deleted',
  RESTORED: 'Property restored',
  ARCHIVED: 'Property archived',
  TOGGLED: 'Property status toggled',
  ALL: 'Properties fetched',
  NOT_FOUND: 'Property not found',
  OWNER_NOT_FOUND: 'Owner not found. Cannot create property without a valid owner',
  CREATE_FAILED: 'Failed to create property',
  OWNER_UPDATE_FAILED: 'Property created but failed to link with owner',
  CODE_EXISTS: 'uniquePropertyCode already exists',
  CODE_AVAILABLE: 'uniquePropertyCode is available',
  STATS: 'Property stats fetched',
  RATING_RECOMPUTED: 'Property rating recomputed',
  IMAGE_ADDED: 'Image added',
  IMAGE_REMOVED: 'Image removed',
  BULK_UPDATED: 'Bulk update done',
  VALIDATION_ERROR: 'Validation error',
  SIMILAR_FETCHED: 'Similar properties fetched',
  SIMILAR_FALLBACK_USED: 'Similar properties fetched (fallback applied)',
  AUTO_COMPLETE: 'Auto complete property search results.',
  SEARCH_PROPERTY: 'Property searched successfully!',
  ALL_OWNER_PROPERTIES: 'Fetched owner properties successfully!',
  GET_PROPERTY_BY_CODE: 'Get property by code successfully!',
  GET_PROPERTY_BY_ID_SUCCESSFULLY: 'Get property by id successfully!'
}

export const PROPERTY_ENUMS = {
  PROPERTY_TYPES: ["flat", "villa", "independent_house", "other"],
  FURNISHING: ['unfurnished', 'semi-furnished', 'fully-furnished'],
  SORTABLE_FIELDS: [
    'createdAt','updatedAt','rating','minAmount','maxAmount','size','floor','totalFloors'
  ],
}

export const PROPERTY_SIMILAR_WEIGHTS = {
  type: 0.25,        // exact propertyType match
  price: 0.25,       // mid-rent proximity
  bhk: 0.15,         // bhkType match
  furnishing: 0.10,  // furnishing affinity
  features: 0.15,    // Jaccard overlap
  distance: 0.05,    // geo/city/locality proximity
  rating: 0.05       // rating closeness
}
