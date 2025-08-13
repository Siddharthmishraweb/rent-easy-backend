import DocumentModel from './Document.Model.js'

import { DOCUMENT_MESSAGES as MSG } from './Document.Constant.js'

const createDocument = async (req, res) => {
  try {
    const { documentData } = req.body
    const document = await DocumentModel.createDocument(documentData)
    res.status(201).json({ message: MSG.DOCUMENT_CREATED, data: document })
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message })
  }
}

const updateDocumentById = async (req, res) => {
  try {
    const { documentId, documentData } = req.body
    const updatedDocument = await DocumentModel.updateDocumentById(documentId, documentData)
    if (!updatedDocument) return res.status(404).json({ message: MSG.NOT_FOUND })
    res.status(200).json({ message: MSG.DOCUMENT_UPDATED, data: updatedDocument })
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message })
  }
}

const getDocuments = async (req, res) => {
  try {
    const filter = req.body.query || {}
    const documents = await DocumentModel.getDocuments(filter)
    res.json({ message: MSG.ALL_DOCUMENTS, data: documents })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getDocumentById = async (req, res) => {
  try {
    const { documentId } = req.body
    const document = await DocumentModel.getDocumentById(documentId)
    if (!document) return res.status(404).json({ message: MSG.NOT_FOUND })
    res.json(document)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.body
    const deleted = await DocumentModel.deleteDocumentById(documentId)
    if (!deleted) return res.status(404).json({ message: MSG.NOT_FOUND })
    res.json({ message: MSG.DOCUMENT_DELETED })
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

    res.json({ message: MSG.ALL_DOCUMENTS, data: documents })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}


const updateDocumentsByUserId = async (req, res) => {
  try {
    const { userId, documentData } = req.body
    const updated = await DocumentModel.updateDocumentsByUserId(userId, documentData)
    res.status(200).json({ message: MSG.DOCUMENT_UPDATED, data: updated })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const deleteDocumentsByUserId = async (req, res) => {
  try {
    const { userId } = req.body
    const deleted = await DocumentModel.deleteDocumentsByUserId(userId)
    res.json({ message: MSG.DOCUMENT_DELETED, deletedCount: deleted.deletedCount })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getDocumentByType = async (req, res) => {
    try {
        const { docType, uniqueNumber } = req.body
        const document = await DocumentModel.getDocumentByType(docType, uniqueNumber)
        res.json({ message: MSG.GET_DOCUMENT, data: document })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export {
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
