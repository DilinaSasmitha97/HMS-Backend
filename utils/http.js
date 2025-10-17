class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    if (details) {
      this.details = details;
    }
    Error.captureStackTrace?.(this, this.constructor);
  }
}

class ApiResponse {
  static success(res, data, status = 200) {
    return res.status(status).json(data);
  }

  static created(res, data) {
    return this.success(res, data, 201);
  }
}

module.exports = { ApiError, ApiResponse };
