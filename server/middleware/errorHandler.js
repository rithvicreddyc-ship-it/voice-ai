export function errorHandler(err, req, res, next) {
  const isDev = process.env.NODE_ENV === 'development';
  console.error('[InGPT Error Handler]:', err.message || err);

  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    error: true,
    message: err.userMessage || err.message || 'An unexpected error occurred. Please try again.',
    ...(isDev && { code: err.code, details: err.message })
  });
}
