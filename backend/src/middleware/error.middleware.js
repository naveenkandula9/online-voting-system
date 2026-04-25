export const notFoundHandler = (req, _res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (error, _req, res, _next) => {
  if (error.code === 11000) {
    const fields = Object.keys(error.keyPattern || {}).join(', ');

    res.status(409).json({
      success: false,
      message: fields ? `Duplicate value for: ${fields}` : 'Duplicate value already exists',
    });
    return;
  }

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal server error',
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
  });
};
