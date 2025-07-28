exports.handleError = (res, message, error) => {
  console.error(`${message}:`, error.message);
  res.status(500).json({ error: message, details: error.message });
};
