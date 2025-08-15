import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '@/utils/AppError';
import { config } from '@/config/environment';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: any[] = [];

  // Handle custom AppError
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    
    if (error instanceof ValidationError) {
      errors = error.errors;
    }
  }

  // Handle TypeORM errors
  else if (error.name === 'QueryFailedError') {
    statusCode = 400;
    message = 'Database query failed';
    
    // Handle specific database errors
    if ((error as any).code === '23505') { // Unique constraint violation
      message = 'Resource already exists';
      statusCode = 409;
    } else if ((error as any).code === '23503') { // Foreign key constraint violation
      message = 'Referenced resource not found';
      statusCode = 400;
    }
  }

  // Handle JWT errors
  else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Handle Multer errors (file upload)
  else if (error.name === 'MulterError') {
    statusCode = 400;
    message = 'File upload error';
    
    if ((error as any).code === 'LIMIT_FILE_SIZE') {
      message = 'File too large';
    } else if ((error as any).code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Unexpected file field';
    }
  }

  // Log error in development
  if (config.server.nodeEnv === 'development') {
    console.error('Error:', error);
  }

  // Send error response
  const response: any = {
    success: false,
    message,
    statusCode,
  };

  if (errors.length > 0) {
    response.errors = errors;
  }

  // Include stack trace in development
  if (config.server.nodeEnv === 'development' && !(error instanceof AppError)) {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

