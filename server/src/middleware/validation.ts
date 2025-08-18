import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// Generic validation middleware factory
export const validate = (
  schema: Joi.ObjectSchema,
  property: 'body' | 'query' | 'params' = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Collect all validation errors
      stripUnknown: true, // Remove unknown properties
      allowUnknown: false // Don't allow unknown properties
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
      return;
    }

    // Replace the original data with validated and sanitized data
    req[property] = value;
    next();
  };
};

// Specific validation middlewares
export const validateBody = (schema: Joi.ObjectSchema) => validate(schema, 'body');
export const validateQuery = (schema: Joi.ObjectSchema) => validate(schema, 'query');
export const validateParams = (schema: Joi.ObjectSchema) => validate(schema, 'params');

// Middleware to convert string IDs to numbers for params
export const parseIdParam = (req: Request, res: Response, next: NextFunction): void => {
  const id = parseInt(req.params.id, 10);
  
  if (isNaN(id) || id <= 0) {
    res.status(400).json({
      success: false,
      error: 'Invalid ID parameter'
    });
    return;
  }
  
  req.params.id = id.toString();
  next();
};

// Middleware to parse comma-separated tag IDs from query
export const parseTagIds = (req: Request, res: Response, next: NextFunction): void => {
  if (req.query.tag_ids && typeof req.query.tag_ids === 'string') {
    try {
      const tagIds = req.query.tag_ids
        .split(',')
        .map(id => parseInt(id.trim(), 10))
        .filter(id => !isNaN(id) && id > 0);
      
      (req.query as any).tag_ids = tagIds.length > 0 ? tagIds : undefined;
    } catch (error) {
      req.query.tag_ids = undefined;
    }
  }
  next();
};

// Middleware to parse pagination parameters
export const parsePagination = (req: Request, res: Response, next: NextFunction): void => {
  // Parse page
  if (req.query.page) {
    const page = parseInt(req.query.page as string, 10);
    (req.query as any).page = isNaN(page) || page < 1 ? 1 : page;
  }
  
  // Parse limit
  if (req.query.limit) {
    const limit = parseInt(req.query.limit as string, 10);
    (req.query as any).limit = isNaN(limit) || limit < 1 ? 20 : Math.min(limit, 100);
  }
  
  next();
};

// Middleware to sanitize search query
export const sanitizeSearch = (req: Request, res: Response, next: NextFunction): void => {
  if (req.query.search && typeof req.query.search === 'string') {
    // Trim whitespace and limit length
    req.query.search = req.query.search.trim().substring(0, 100);
    
    // Remove if empty after trimming
    if (!req.query.search) {
      delete req.query.search;
    }
  }
  
  next();
};