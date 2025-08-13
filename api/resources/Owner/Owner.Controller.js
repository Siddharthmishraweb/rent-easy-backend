import * as OwnerModel from "./Owner.Model.js"

export const createOwnerController = async (req, res) => {
  try {
    const owner = await OwnerModel.createOwner(req.body)
    res.status(201).json({ success: true, data: owner })
  } catch (err) {
    res.status(400).json({ success: false, error: err.message })
  }
}

export const getOwnersController = async (req, res) => {
  try {
    const owners = await OwnerModel.getOwners()
    res.json({ success: true, data: owners })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export const getOwnerByIdController = async (req, res) => {
  try {
    const owner = await OwnerModel.getOwnerById(req.params.id)
    if (!owner) return res.status(404).json({ success: false, error: "Owner not found" })
    res.json({ success: true, data: owner })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export const updateOwnerController = async (req, res) => {
  try {
    const updatedOwner = await OwnerModel.updateOwner(req.params.id, req.body)
    res.json({ success: true, data: updatedOwner })
  } catch (err) {
    res.status(400).json({ success: false, error: err.message })
  }
}

export const deleteOwnerController = async (req, res) => {
  try {
    await OwnerModel.deleteOwner(req.params.id)
    res.json({ success: true, message: "Owner deleted" })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}


export const getOwnerDashboard = async (req, res) => {
  try {
    const dashboard = await OwnerModel.getOwnerDashboard(req.params.ownerId)
    if (!dashboard) return res.status(404).json({ success: false, error: "Owner not found" })
    res.json({ success: true, data: dashboard })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}