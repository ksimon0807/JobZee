class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorMiddleware = (err, req, res, next) => {
  console.error('Error:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    code: err.code,
    statusCode: err.statusCode,
    path: err.path,
    type: err.type,
    field: err.field,
    ...(err.errors && { validationErrors: err.errors })
  });

  err.message = err.message || "Internal server error";
  err.statusCode = err.statusCode || 500;

  if (err.name === "CastError") {
    const message = `Resource not found. Invalid ${err.path}`;
    err = new ErrorHandler(message, 400);
  }
  if (err.code === 11000) {
    const message = `duplicate ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHandler(message, 400);
  }
  if (err.name === "JsonWebTokenError") {
    const message = `Json web token is Invalid, Try Again`;
    err = new ErrorHandler(message, 400);
  }
  if (err.name === "TokenExpiredError") {
    const message = `Json web token is expired. Try again`;
    err = new ErrorHandler(message, 400);
  }
  
  // Log the final error state
  console.error('Sending error response:', {
    statusCode: err.statusCode,
    message: err.message
  });

  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
    error: process.env.NODE_ENV === 'development' ? err : undefined
  });
};

export default ErrorHandler;
