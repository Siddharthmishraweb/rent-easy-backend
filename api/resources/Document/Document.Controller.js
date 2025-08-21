import DocumentModel from './Document.Model.js'

import { DOCUMENT_MESSAGES as MSG } from './Document.Constant.js'

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

const getDocuments = async (req, res, next) => {
  try {
    const filter = req.body.query || {}
    const documents = await DocumentModel.getDocuments(filter)
    return res.success(200, MSG.ALL_DOCUMENTS, documents)
  } catch (err) {
    next(err)
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

const getAllDocumentsByUserId = async (req, res, next) => {
  try {
    const { userId, docType } = req.body
    const documents = await DocumentModel.getAllDocumentsByUserId(userId, docType)

    if (!documents.length) {
      return res.status(404).json({ message: MSG.NOT_FOUND })
    }

    return res.success(200, MSG.ALL_DOCUMENTS, documents)
  } catch (err) {
    next(err)
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
