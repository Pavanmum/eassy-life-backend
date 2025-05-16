export const apiResponse = {
    success: (res, message = "Operation successful", data, statusCode = 200) => {
      return res.status(statusCode).json({
        success: true,
        message,
        data,
      })
    },
  
    error: (res, message = "Operation failed", statusCode = 400, errors = null) => {
      return res.status(statusCode).json({
        success: false,
        message,
        errors,
      })
    },
}