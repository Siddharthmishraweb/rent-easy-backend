import DocumentModel from './Document.Model.js'

import { DOCUMENT_MESSAGES as MSG } from './Document.Constant.js'

const createDocument = async (req, res) => {
  try {
    const { documentData } = req.body
    const document = await DocumentModel.createDocument(documentData)
    return res.success(201, MSG.DOCUMENT_CREATED, document)
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message })
  }
}

const updateDocumentById = async (req, res) => {
  try {
    const { documentId, documentData } = req.body
    const updatedDocument = await DocumentModel.updateDocumentById(documentId, documentData)
    if (!updatedDocument) return res.status(404).json({ message: MSG.NOT_FOUND })
    return res.success(200, MSG.DOCUMENT_UPDATED, updatedDocument)
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message })
  }
}

const getDocuments = async (req, res) => {
  try {
    const filter = req.body.query || {}
    const documents = await DocumentModel.getDocuments(filter)
    return res.success(200, MSG.ALL_DOCUMENTS, documents)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getDocumentById = async (req, res) => {
  try {
    const { documentId } = req.body
    const document = await DocumentModel.getDocumentById(documentId)
    if (!document) return res.status(404).json({ message: MSG.NOT_FOUND })
    return res.success(200, MSG.GET_DOCUMENT, document)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.body
    const deleted = await DocumentModel.deleteDocumentById(documentId)
    if (!deleted) return res.status(404).json({ message: MSG.NOT_FOUND })
    return res.success(200, MSG.DOCUMENT_DELETED, deleted)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getAllDocumentsByUserId = async (req, res) => {
  try {
    const { userId, docType } = req.body
    const documents = await DocumentModel.getAllDocumentsByUserId(userId, docType)

    if (!documents.length) {
      return res.status(404).json({ message: MSG.NOT_FOUND })
    }

    return res.success(200, MSG.ALL_DOCUMENTS, documents)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}


const updateDocumentsByUserId = async (req, res) => {
  try {
    const { userId, documentData } = req.body
    const updated = await DocumentModel.updateDocumentsByUserId(userId, documentData)
    return res.success(200, MSG.DOCUMENT_UPDATED, updated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const deleteDocumentsByUserId = async (req, res) => {
  try {
    const { userId } = req.body
    const deleted = await DocumentModel.deleteDocumentsByUserId(userId)

    return res.success(200, MSG.DOCUMENT_DELETED, deleted)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getDocumentByType = async (req, res) => {
    try {
        const { docType, uniqueNumber } = req.body
        const document = await DocumentModel.getDocumentByType(docType, uniqueNumber)

        return res.success(200, MSG.GET_DOCUMENT, document)
    } catch (error) {
        res.status(500).json({ error: error.message })
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
