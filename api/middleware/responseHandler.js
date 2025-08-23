export const responseHandler = (req, res, next) => {
  res.success = (statusCode = 200, message = 'Success', data = {}) => {
    return res.status(statusCode).json({
      statusCode,
      status: 'OK',
      message,
      data,
    })
  }

  res.error = (statusCode = 500, errorMessage = '', error = '') => {
    let errorDetails = error
    if (error instanceof Error) {
      errorDetails = {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    }

    return res.status(statusCode).json({
      statusCode,
      message: errorMessage,
      error: {
        errorMessage,
        error: errorDetails,
      },
    })
  }

  next()
}
