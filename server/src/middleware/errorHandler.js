const errorHandler = (err, req, res, _next) => {
  console.error('[Error]', err.message);

  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'A record with that value already exists' });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Record not found' });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }

  // Default
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return res.status(status).json({ error: message });
};

const notFound = (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
};

module.exports = { errorHandler, notFound };
