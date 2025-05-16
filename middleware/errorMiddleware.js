export const errorMiddleware = (err, req, res, next) => {
  let error = { ...err }
  console.log(err.statusCode)
  error.message = err.message

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",

  })
};