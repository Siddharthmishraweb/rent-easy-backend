const ENABLE_VALIDATION = process.env.ENABLE_VALIDATION === 'true'

export const validateCreateProperty = (req, res, next) => {
  if (!ENABLE_VALIDATION) return next()
  const { ownerId, propertyName, propertyType, rentAmount, uniquePropertyCode } = req.body.propertyData || {}
  if (!ownerId) return res.status(400).json({ message: 'ownerId is required' })
  if (!propertyName) return res.status(400).json({ message: 'propertyName is required' })
  if (!propertyType) return res.status(400).json({ message: 'propertyType is required' })
  if (!rentAmount && rentAmount !== 0) return res.status(400).json({ message: 'rentAmount is required' })
  if (!uniquePropertyCode) return res.status(400).json({ message: 'uniquePropertyCode is required' })
  next()
}

export const validateUpdateProperty = (req, res, next) => {
  if (!ENABLE_VALIDATION) return next()
  if (!req.body.propertyId) return res.status(400).json({ message: 'propertyId is required' })
  if (!req.body.propertyData) return res.status(400).json({ message: 'propertyData is required' })
  next()
}

export const validateGetPropertyById = (req, res, next) => {
  if (!ENABLE_VALIDATION) return next()
  if (!req.body.propertyId) return res.status(400).json({ message: 'propertyId is required' })
  next()
}
