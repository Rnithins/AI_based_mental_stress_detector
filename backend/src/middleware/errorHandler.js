export const notFoundHandler = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

export const errorHandler = (err, _req, res, _next) => {
  const status = err.statusCode || 500;
  const message = err.message || "Internal server error";

  if (status >= 500) {
    console.error("[error]", err);
  }

  res.status(status).json({ message });
};