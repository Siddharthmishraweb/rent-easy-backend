import dotenv from "dotenv"
dotenv.config()

const ENABLE_VALIDATION = process.env.ENABLE_VALIDATION === "true"

export const validateCreateDocument = (req, res, next) => {
  if (!ENABLE_VALIDATION) return next()

  const { documentData } = req.body
  if (!documentData) {
    return res.status(400).json({ message: "documentData is required" })
  }

  const { userId, docType, uniqueNumber, documentUrl } = documentData

  if (!userId) return res.status(400).json({ message: "userId is required" })
  if (!docType) return res.status(400).json({ message: "docType is required" })
  if (!uniqueNumber) return res.status(400).json({ message: "uniqueNumber is required" })
  if (!documentUrl) return res.status(400).json({ message: "documentUrl is required" })

  next()
}

export const validateUpdateDocumentById = (req, res, next) => {
  if (!ENABLE_VALIDATION) return next()

  const { documentId, documentData } = req.body
  if (!documentId) return res.status(400).json({ message: "documentId is required" })
  if (!documentData) return res.status(400).json({ message: "documentData is required" })

  next()
}

export const validateGetDocumentById = (req, res, next) => {
  if (!ENABLE_VALIDATION) return next()

  const { documentId } = req.body
  if (!documentId) return res.status(400).json({ message: "documentId is required" })

  next()
}

export const validateGetAllDocumentsByUserId = (req, res, next) => {
  if (!ENABLE_VALIDATION) return next()

  const { userId } = req.body
  if (!userId) return res.status(400).json({ message: "userId is required" })

  next()
}

export const validateUpdateDocumentsByUserId = (req, res, next) => {
  if (!ENABLE_VALIDATION) return next()

  const { userId, documentData } = req.body
  if (!userId) return res.status(400).json({ message: "userId is required" })
  if (!documentData) return res.status(400).json({ message: "documentData is required" })

  next()
}

export const validateDeleteDocument = (req, res, next) => {
  if (!ENABLE_VALIDATION) return next()

  const { documentId } = req.body
  if (!documentId) return res.status(400).json({ message: "documentId is required" })

  next()
}

export const validateDeleteDocumentsByUserId = (req, res, next) => {
  if (!ENABLE_VALIDATION) return next()

  const { userId } = req.body
  if (!userId) return res.status(400).json({ message: "userId is required" })

  next()
}

export const validateGetDocumentByType = (req, res, next) => {
  if (!ENABLE_VALIDATION) return next()

  const {  documentType, uniqueNumber } = req.body

  if (!documentType) return res.status(400).json({ message: "documentType is required" })
  if (!uniqueNumber) return res.status(400).json({ message: "uniqueNumber is required" })

  next()
}
