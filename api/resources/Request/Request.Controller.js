import RequestModel from './Request.Model.js'
import { REQUEST_MESSAGES } from './Request.Constant.js'
import AppError from '../../helper/AppError.js'

/**
 * @swagger
 * tags:
 *   name: Tenant Requests
 *   description: Tenant request management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     TenantRequest:
 *       type: object
 *       properties:
 *         propertyId:
 *           type: string
 *           description: ID of the property
 *         tenantId:
 *           type: string
 *           description: ID of the tenant
 *         ownerId:
 *           type: string
 *           description: ID of the property owner
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         documentVerification:
 *           type: object
 *           properties:
 *             aadhar:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [pending, verified, rejected]
 *                 verifiedAt:
 *                   type: string
 *                   format: date-time
 *                 comment:
 *                   type: string
 *             pan:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [pending, verified, rejected]
 *                 verifiedAt:
 *                   type: string
 *                   format: date-time
 *                 comment:
 *                   type: string
 */

/**
 * @swagger
 * /api/requests:
 *   post:
 *     summary: Create a new tenant request
 *     tags: [Tenant Requests]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - propertyId
 *             properties:
 *               propertyId:
 *                 type: string
 *                 description: ID of the property
 *               message:
 *                 type: string
 *                 description: Optional message to the owner
 *     responses:
 *       201:
 *         description: Request created successfully
 *       400:
 *         description: Invalid input or duplicate request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server Error
 */
const createRequest = async (req, res) => {
  const tenantId = req?.user?.id || req.body.userId
  const data = await RequestModel.createRequestService(tenantId, req.body)
  return res.success(201, REQUEST_MESSAGES.CREATED, data)
}

const getRequestsForOwner = async (req, res) => {
  const ownerId = req?.user?.id || req.body.ownerId
  const data = await RequestModel.getRequestsForOwnerService(ownerId)
  return res.success(200, REQUEST_MESSAGES.FETCHED, data)
}

const getRequestsForUser = async (req, res) => {
  const tenantId = req?.user?.id || req.body.tenantId
  const data = await RequestModel.getRequestsForUserService(tenantId)
  return res.success(200, REQUEST_MESSAGES.FETCHED, data)
}

/**
 * @swagger
 * /api/requests/{requestId}/accept:
 *   post:
 *     summary: Accept a tenant request after document verification
 *     tags: [Tenant Requests]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Request accepted successfully
 *       400:
 *         description: Documents not verified
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only property owner can accept
 *       404:
 *         description: Request not found
 *       500:
 *         description: Server Error
 */
const acceptRequest = async (req, res) => {
  try {
    const ownerId = req?.user?.id;
    const { requestId } = req.params;

    // Check document verification status
    const request = await RequestModel.findById(requestId);
    if (!request) {
      throw new AppError('Request not found', 404);
    }

    if (request.ownerId.toString() !== ownerId) {
      throw new AppError('Not authorized', 403);
    }

    // Check if documents are verified
    const { aadhar, pan } = request.documentVerification;
    if (aadhar.status !== 'verified' || pan.status !== 'verified') {
      throw new AppError('Documents must be verified before accepting request', 400);
    }

    const data = await RequestModel.acceptRequestService(ownerId, requestId);
    return res.success(200, REQUEST_MESSAGES.ACCEPTED, data);
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /api/requests/{requestId}/verify-document:
 *   post:
 *     summary: Verify tenant's document
 *     tags: [Tenant Requests]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - documentType
 *               - status
 *             properties:
 *               documentType:
 *                 type: string
 *                 enum: [aadhar, pan]
 *               status:
 *                 type: string
 *                 enum: [verified, rejected]
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Document verification status updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only property owner can verify
 *       404:
 *         description: Request not found
 *       500:
 *         description: Server Error
 */
const verifyDocument = async (req, res, next) => {
  try {
    const ownerId = req?.user?.id;
    const { requestId } = req.params;
    const { documentType, status, comment } = req.body;

    const request = await RequestModel.findById(requestId);
    if (!request) {
      throw new AppError('Request not found', 404);
    }

    if (request.ownerId.toString() !== ownerId) {
      throw new AppError('Not authorized', 403);
    }

    const data = await RequestModel.verifyDocument(requestId, documentType, status, comment);
    return res.success(200, REQUEST_MESSAGES.DOCUMENT_VERIFIED, data);
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /api/requests/{requestId}/reject:
 *   post:
 *     summary: Reject a tenant request
 *     tags: [Tenant Requests]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for rejection
 *     responses:
 *       200:
 *         description: Request rejected successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only property owner can reject
 *       404:
 *         description: Request not found
 *       500:
 *         description: Server Error
 */
const rejectRequest = async (req, res) => {
  try {
    const ownerId = req?.user?.id;
    const { requestId } = req.params;
    const { reason } = req.body;

    const request = await RequestModel.findById(requestId);
    if (!request) {
      throw new AppError('Request not found', 404);
    }

    if (request.ownerId.toString() !== ownerId) {
      throw new AppError('Not authorized', 403);
    }

    const data = await RequestModel.rejectRequestService(ownerId, requestId, reason);
    return res.success(200, REQUEST_MESSAGES.REJECTED, data);
  } catch (err) {
    next(err);
  }
};

const deleteRequest = async (req, res) => {
  const ownerId = req?.user?.id || req.body.ownerId
  const data = await RequestModel.deleteRequestService(ownerId, req.params.id)
  return res.success(200, REQUEST_MESSAGES.DELETED, data)
}

const exportRequestsToExcel = async (req, res) => {
  const ownerId = req?.user?.id || req.body.ownerId
  const filePath = await RequestModel.exportRequestsToExcelService(ownerId, req.query)
  return res.download(filePath, 'requests_report.xlsx')
}

const RequestController = {
  createRequest,
  getRequestsForOwner,
  getRequestsForUser,
  acceptRequest,
  rejectRequest,
  deleteRequest,
  exportRequestsToExcel,
  verifyDocument
}

export default RequestController
