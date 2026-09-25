class EternalError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = 'EternalError';
    this.statusCode = statusCode || 500;
  }
}
module.exports = { EternalError };
