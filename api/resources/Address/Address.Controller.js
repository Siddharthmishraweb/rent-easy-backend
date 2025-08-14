import {
  createAddress as createAddressModel,
  getAddressByUserId as getAddressUserId,
  getAddressById as getAddressByAddressId,
  deleteAddress as deleteAddressByAddressId,
  updateAddressByAddressId as updateAddressModel
} from "./Address.Model.js"
import AppError from "../../helper/AppError.js"
import { ADDRESS_MESSAGES as MSG } from "./Address.Constant.js"

const createAddress = async (req, res, next) => {
  try {
    const { addressData } = req.body
    const address = await createAddressModel(addressData)
    return res.success(201, MSG.ADDRESS_CREATED, address)
  } catch (err) {
    next(err)
  }
}

const updateAddressByAddressId = async (req, res, next) => {
  try {
    const { addressId, addressData } = req.body
    const address = await updateAddressModel(addressId, addressData)
    return res.success(200, MSG.ADDRESS_UPDATED, address)
  } catch (err) {
     next(err)
  }
}

const getAddressByUserId = async (req, res, next) => {
  try {
    const { userId } = req.body
    const addresses = await getAddressUserId(userId)
    return res.success(200, MSG.ALL_ADDRESSES, addresses)
  } catch (err) {
     next(err)
  }
}

const getAddressById = async (req, res, next) => {
  try {
    const { addressId } = req.body
    const address = await getAddressByAddressId(addressId)
    if (!address){
      throw new AppError(MSG.NOT_FOUND, 404)
    }
    return res.success(200, MSG.ADDRESS_FOUND, address)
  } catch (err) {
    next(err)
  }
}

const deleteAddress = async (req, res, next) => {
  try {
    const { addressId } = req.body
    const address = await deleteAddressByAddressId(addressId)
    if (!address)  throw new AppError(MSG.NOT_FOUND, 404)
      return res.success(200, MSG.ADDRESS_DELETED)
  } catch (err) {
     next(err)
  }
}

export {
    createAddress,
    getAddressByUserId,
    getAddressById,
    deleteAddress,
    updateAddressByAddressId
}