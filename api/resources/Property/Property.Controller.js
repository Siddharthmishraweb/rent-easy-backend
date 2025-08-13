import { PropertyModel } from './Property.Model.js'
import { PROPERTY_MESSAGES as MSG } from './Property.Constant.js'

const createProperty = async (req, res) => {
  try {
    const property = await PropertyModel.createProperty(req.body)
    res.status(201).json({ message: MSG.CREATED, data: property })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getProperties = async (req, res) => {
  try {
    const { query = {}, page, limit } = req.body
    const props = await PropertyModel.getProperties(query, { page, limit })
    res.json({ message: MSG.ALL, data: props })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getPropertyById = async (req, res) => {
  try {
    const property = await PropertyModel.getPropertyById(req.body.propertyId)
    if (!property) return res.status(404).json({ message: MSG.NOT_FOUND })
    res.json({ data: property })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const updatePropertyById = async (req, res) => {
  try {
    const updated = await PropertyModel.updatePropertyById(req.body.propertyId, req.body.propertyData)
    if (!updated) return res.status(404).json({ message: MSG.NOT_FOUND })
    res.json({ message: MSG.UPDATED, data: updated })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const deletePropertyById = async (req, res) => {
  try {
    const deleted = await PropertyModel.deletePropertyById(req.body.propertyId)
    if (!deleted) return res.status(404).json({ message: MSG.NOT_FOUND })
    res.json({ message: MSG.DELETED })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getAllPropertiesOfOwner =  async (req, res) => {
  try {
    const properties = await PropertyModel.getAllPropertiesOfOwner(req.body)
    if (!properties) return res.status(404).json({ message: MSG.NOT_FOUND })
    res.status(200).json({ data: properties })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export {
  createProperty,
  getProperties,
  getPropertyById,
  updatePropertyById,
  deletePropertyById,
  getAllPropertiesOfOwner
}
