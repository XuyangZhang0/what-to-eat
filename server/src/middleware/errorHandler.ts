import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

// Custom error class
export class CustomError extends Error implements AppError {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.name = this.constructor.name;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handling middleware
export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // Log error details
  console.error('Error Details:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Default error response
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // SQLite constraint errors
  if (err.message?.includes('UNIQUE constraint failed')) {
    statusCode = 409;
    if (err.message.includes('users.email')) {
      message = 'Email already exists';
    } else if (err.message.includes('users.username')) {
      message = 'Username already exists';
    } else if (err.message.includes('tags.name')) {
      message = 'Tag name already exists';
    } else {
      message = 'Duplicate entry';
    }
  }

  if (err.message?.includes('FOREIGN KEY constraint failed')) {
    statusCode = 400;
    message = 'Invalid reference to related data';
  }

  // Don't expose internal error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const errorResponse: any = {
    success: false,
    error: message
  };

  // Add additional details in development
  if (isDevelopment) {
    errorResponse.details = {
      name: err.name,
      stack: err.stack,
      url: req.url,
      method: req.method
    };
  }

  res.status(statusCode).json(errorResponse);
};

// 404 handler
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new CustomError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};