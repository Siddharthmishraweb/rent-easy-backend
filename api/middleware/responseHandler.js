export const responseHandler = (req, res, next) => {
  res.success = (statusCode = 200, message = 'Success', data = {}) => {
    return res.status(statusCode).json({
      statusCode,
      status: 'OK',
      message,
      data,
    })
  }

  res.error = (statusCode = 500, message = 'Error', errorMessage = '', error = {}) => {
    return res.status(statusCode).json({
      statusCode,
      message,
      error: {
        errorMessage,
        error,
      },
    })
  }

  next()
}
