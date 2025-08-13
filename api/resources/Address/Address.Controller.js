import {
  createAddress as createAddressModel,
  getAddressByUserId as getAddressUserId,
  getAddressById as getAddressByAddressId,
  deleteAddress as deleteAddressByAddressId,
  updateAddressByAddressId as updateAddressModel
} from "./Address.Model.js"
import { ADDRESS_MESSAGES as MSG } from "./Address.Constant.js"

const createAddress = async (req, res) => {
  try {
    const { addressData } = req.body
    const address = await createAddressModel(addressData)
    res.status(201).json({ message: MSG.ADDRESS_CREATED, data: address })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const updateAddressByAddressId = async (req, res) => {
  try {
    const { addressId, addressData } = req.body
    const address = await updateAddressModel(addressId, addressData)
    res.status(201).json({ message: MSG.ADDRESS_CREATED, data: address })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getAddressByUserId = async (req, res) => {
  try {
    const { userId } = req.body
    const addresses = await getAddressUserId(userId)
    res.json({ message: MSG.ALL_ADDRESSES, data: addresses })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getAddressById = async (req, res) => {
  try {
    const { addressId } = req.body
    const address = await getAddressByAddressId(addressId)
    if (!address) return res.status(404).json({ message: MSG.NOT_FOUND })
    res.json(address)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.body
    const address = await deleteAddressByAddressId(addressId)
    if (!address) return res.status(404).json({ message: MSG.NOT_FOUND })
    res.json({ message: MSG.ADDRESS_DELETED })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export {
    createAddress,
    getAddressByUserId,
    getAddressById,
    deleteAddress,
    updateAddressByAddressId
}