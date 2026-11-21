class AppError extends Error {
  /**
   * @param {string} message
   * @param {number} status
   */
  constructor(message, status = 500) {
    super(message);
    this.status = status;
    this.name = 'AppError';
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = AppError;
