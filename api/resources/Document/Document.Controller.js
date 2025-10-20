import DocumentModel from './Document.Model.js'
import { DOCUMENT_MESSAGES as MSG } from './Document.Constant.js'

/**
 * @swagger
 * tags:
 *   name: Documents
 *   description: Document management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Document:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         docType:
 *           type: string
 *           enum: [aadhar, pan, passport, rent_agreement, lease_agreement]
 *         docNumber:
 *           type: string
 *         docUrl:
 *           type: string
 *         isVerified:
 *           type: boolean
 *         verifiedAt:
 *           type: string
 *           format: date-time
 *         verifiedBy:
 *           type: string
 *
 * /api/documents:
 *   post:
 *     summary: Create a new document
 *     tags: [Documents]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - documentData
 *             properties:
 *               documentData:
 *                 type: object
 *                 required:
 *                   - userId
 *                   - docType
 *                   - docNumber
 *                   - docUrl
 *                 properties:
 *                   userId:
 *                     type: string
 *                   docType:
 *                     type: string
 *                     enum: [aadhar, pan, passport, rent_agreement, lease_agreement]
 *                   docNumber:
 *                     type: string
 *                   docUrl:
 *                     type: string
 *                   isVerified:
 *                     type: boolean
 *                     default: false
 *     responses:
 *       201:
 *         description: Document created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server Error
 */
const createDocument = async (req, res, next) => {
  try {
    const { documentData } = req.body
    const document = await DocumentModel.createDocument(documentData)
    return res.success(201, MSG.DOCUMENT_CREATED, document)
  } catch (err) {
    next(err)
  }
}

const updateDocumentById = async (req, res, next) => {
  try {
    const { documentId, documentData } = req.body
    const updatedDocument = await DocumentModel.updateDocumentById(documentId, documentData)
    if (!updatedDocument) return res.status(404).json({ message: MSG.NOT_FOUND })
    return res.success(200, MSG.DOCUMENT_UPDATED, updatedDocument)
  } catch (err) {
    next(err)
  }
}

/**
 * @swagger
 * /api/documents:
 *   get:
 *     summary: Get all documents with filters
 *     tags: [Documents]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: docType
 *         schema:
 *           type: string
 *           enum: [aadhar, pan, passport, rent_agreement, lease_agreement]
 *         description: Filter by document type
 *       - in: query
 *         name: isVerified
 *         schema:
 *           type: boolean
 *         description: Filter by verification status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date of verification
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date of verification
 *     responses:
 *       200:
 *         description: List of documents
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Document'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server Error
 */
const getDocuments = async (req, res, next) => {
  try {
    const filter = req.query || {};
    const documents = await DocumentModel.getDocuments(filter);
    return res.success(200, MSG.ALL_DOCUMENTS, documents);
  } catch (err) {
    next(err);
  }
}

const getDocumentById = async (req, res, next) => {
  try {
    const { documentId } = req.body
    const document = await DocumentModel.getDocumentById(documentId)
    if (!document) return res.status(404).json({ message: MSG.NOT_FOUND })
    return res.success(200, MSG.GET_DOCUMENT, document)
  } catch (err) {
    next(err)
  }
}

const deleteDocument = async (req, res, next) => {
  try {
    const { documentId } = req.body
    const deleted = await DocumentModel.deleteDocumentById(documentId)
    if (!deleted) return res.status(404).json({ message: MSG.NOT_FOUND })
    return res.success(200, MSG.DOCUMENT_DELETED, deleted)
  } catch (err) {
    next(err)
  }
}

/**
 * @swagger
 * /api/documents/user/{userId}:
 *   get:
 *     summary: Get all documents for a specific user
 *     tags: [Documents]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: docType
 *         schema:
 *           type: string
 *           enum: [aadhar, pan, passport, rent_agreement, lease_agreement]
 *         description: Filter by document type
 *     responses:
 *       200:
 *         description: List of user's documents
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Document'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Can only view own documents unless admin
 *       404:
 *         description: No documents found
 *       500:
 *         description: Server Error
 */
const getAllDocumentsByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { docType } = req.query;
    const documents = await DocumentModel.getAllDocumentsByUserId(userId, docType);

    if (!documents.length) {
      return res.status(404).json({ message: MSG.NOT_FOUND });
    }

    return res.success(200, MSG.ALL_DOCUMENTS, documents);
  } catch (err) {
    next(err);
  }
}


const updateDocumentsByUserId = async (req, res, next) => {
  try {
    const { userId, documentData } = req.body
    const updated = await DocumentModel.updateDocumentsByUserId(userId, documentData)
    return res.success(200, MSG.DOCUMENT_UPDATED, updated)
  } catch (err) {
    next(err)
  }
}

const deleteDocumentsByUserId = async (req, res, next) => {
  try {
    const { userId } = req.body
    const deleted = await DocumentModel.deleteDocumentsByUserId(userId)

    return res.success(200, MSG.DOCUMENT_DELETED, deleted)
  } catch (err) {
    next(err)
  }
}

const getDocumentByType = async (req, res, next) => {
  try {
    const { docType, uniqueNumber } = req.body
    const document = await DocumentModel.getDocumentByType(docType, uniqueNumber)

    return res.success(200, MSG.GET_DOCUMENT, document)
  } catch (error) {
    next(err)
  }
}

const DocumentController = {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocumentById,
  deleteDocument,
  getAllDocumentsByUserId,
  updateDocumentsByUserId,
  deleteDocumentsByUserId,
  getDocumentByType
}

export default DocumentController
