import AddressModel from './Address.Model.js'
import AppError from '../../helper/AppError.js'
import { ADDRESS_MESSAGES as MSG } from './Address.Constant.js'

/**
 * @swagger
 * tags:
 *   name: Addresses
 *   description: Address management endpoints
 */

/**
 * @swagger
 * /api/addresses:
 *   post:
 *     summary: Create a new address
 *     tags: [Addresses]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - addressData
 *             properties:
 *               addressData:
 *                 type: object
 *                 required:
 *                   - street
 *                   - city
 *                   - state
 *                   - pincode
 *                 properties:
 *                   street:
 *                     type: string
 *                   locality:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   pincode:
 *                     type: string
 *                   landmark:
 *                     type: string
 *                   coordinates:
 *                     type: object
 *                     properties:
 *                       lat:
 *                         type: number
 *                       lng:
 *                         type: number
 *     responses:
 *       201:
 *         description: Address created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server Error
 */
const createAddress = async (req, res, next) => {
  try {
    const { addressData } = req.body
    const address = await AddressModel.createAddress(addressData)
    return res.success(201, MSG.ADDRESS_CREATED, address)
  } catch (err) {
    next(err)
  }
}

/**
 * @swagger
 * /api/addresses/{id}:
 *   put:
 *     summary: Update an address
 *     tags: [Addresses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Address ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - addressData
 *             properties:
 *               addressData:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   locality:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   pincode:
 *                     type: string
 *                   landmark:
 *                     type: string
 *                   coordinates:
 *                     type: object
 *                     properties:
 *                       lat:
 *                         type: number
 *                       lng:
 *                         type: number
 *     responses:
 *       200:
 *         description: Address updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Address not found
 *       500:
 *         description: Server Error
 */
const updateAddressByAddressId = async (req, res, next) => {
  try {
    const { id: addressId } = req.params;
    const { addressData } = req.body;
    const address = await AddressModel.updateAddressByAddressId(addressId, addressData);
    return res.success(200, MSG.ADDRESS_UPDATED, address);
  } catch (err) {
     next(err);
  }
}

/**
 * @swagger
 * /api/addresses/user/{userId}:
 *   get:
 *     summary: Get all addresses for a user
 *     tags: [Addresses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of addresses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   street:
 *                     type: string
 *                   locality:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   pincode:
 *                     type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Can only view own addresses unless admin
 *       500:
 *         description: Server Error
 */
const getAddressByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const addresses = await AddressModel.getAddressByUserId(userId);
    return res.success(200, MSG.ALL_ADDRESSES, addresses);
  } catch (err) {
     next(err);
  }
}

const getAddressById = async (req, res, next) => {
  try {
    const { addressId } = req.body
    const address = await AddressModel.getAddressById(addressId)
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
    const address = await AddressModel.deleteAddress(addressId)
    if (!address)  throw new AppError(MSG.NOT_FOUND, 404)
      return res.success(200, MSG.ADDRESS_DELETED)
  } catch (err) {
     next(err)
  }
}

const AddressController = {
  createAddress,
  getAddressByUserId,
  getAddressById,
  deleteAddress,
  updateAddressByAddressId
}

export default AddressController