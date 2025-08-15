/**
 * Custom application error class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: any): AppError {
    return new AppError(message, 400, true, details);
  }

  static unauthorized(message: string = 'Unauthorized'): AppError {
    return new AppError(message, 401, true);
  }

  static forbidden(message: string = 'Forbidden'): AppError {
    return new AppError(message, 403, true);
  }

  static notFound(resource: string): AppError {
    return new AppError(`${resource} not found`, 404, true);
  }

  static conflict(message: string, details?: any): AppError {
    return new AppError(message, 409, true, details);
  }

  static validationError(message: string, details?: any): AppError {
    return new AppError(message, 422, true, details);
  }

  static internal(message: string = 'Internal server error'): AppError {
    return new AppError(message, 500, false);
  }

  static tooManyRequests(message: string = 'Too many requests'): AppError {
    return new AppError(message, 429, true);
  }
}
