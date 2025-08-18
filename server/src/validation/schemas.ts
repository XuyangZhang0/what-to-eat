import Joi from 'joi';

// User validation schemas
export const userRegisterSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': 'Username must only contain alphanumeric characters',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username must not exceed 30 characters',
      'any.required': 'Username is required'
    }),
  
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])'))
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
      'any.required': 'Password is required'
    }),
  
  preferences: Joi.object().optional()
});

export const userLoginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

export const userUpdateSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .optional()
    .messages({
      'string.alphanum': 'Username must only contain alphanumeric characters',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username must not exceed 30 characters'
    }),
  
  email: Joi.string()
    .email()
    .optional()
    .messages({
      'string.email': 'Please provide a valid email address'
    }),
  
  preferences: Joi.object().optional()
});

export const userChangePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Current password is required'
    }),
  
  newPassword: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])'))
    .required()
    .messages({
      'string.min': 'New password must be at least 8 characters long',
      'string.pattern.base': 'New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
      'any.required': 'New password is required'
    })
});

// Meal validation schemas
export const mealCreateSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Meal name cannot be empty',
      'string.min': 'Meal name cannot be empty',
      'string.max': 'Meal name must not exceed 100 characters',
      'any.required': 'Meal name is required'
    }),
  
  description: Joi.string()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description must not exceed 500 characters'
    }),
  
  cuisine_type: Joi.string()
    .max(50)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Cuisine type must not exceed 50 characters'
    }),
  
  difficulty_level: Joi.string()
    .valid('easy', 'medium', 'hard')
    .optional()
    .messages({
      'any.only': 'Difficulty level must be one of: easy, medium, hard'
    }),
  
  prep_time: Joi.number()
    .integer()
    .min(1)
    .max(1440) // max 24 hours
    .optional()
    .messages({
      'number.base': 'Prep time must be a number',
      'number.integer': 'Prep time must be a whole number',
      'number.min': 'Prep time must be at least 1 minute',
      'number.max': 'Prep time must not exceed 1440 minutes (24 hours)'
    }),
  
  is_favorite: Joi.boolean().optional(),
  
  tag_ids: Joi.array()
    .items(Joi.number().integer().positive())
    .optional()
    .messages({
      'array.base': 'Tag IDs must be an array',
      'number.base': 'Each tag ID must be a number',
      'number.integer': 'Each tag ID must be a whole number',
      'number.positive': 'Each tag ID must be positive'
    })
});

export const mealUpdateSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.empty': 'Meal name cannot be empty',
      'string.min': 'Meal name cannot be empty',
      'string.max': 'Meal name must not exceed 100 characters'
    }),
  
  description: Joi.string()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description must not exceed 500 characters'
    }),
  
  cuisine_type: Joi.string()
    .max(50)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Cuisine type must not exceed 50 characters'
    }),
  
  difficulty_level: Joi.string()
    .valid('easy', 'medium', 'hard')
    .optional()
    .messages({
      'any.only': 'Difficulty level must be one of: easy, medium, hard'
    }),
  
  prep_time: Joi.number()
    .integer()
    .min(1)
    .max(1440)
    .optional()
    .messages({
      'number.base': 'Prep time must be a number',
      'number.integer': 'Prep time must be a whole number',
      'number.min': 'Prep time must be at least 1 minute',
      'number.max': 'Prep time must not exceed 1440 minutes (24 hours)'
    }),
  
  is_favorite: Joi.boolean().optional(),
  
  tag_ids: Joi.array()
    .items(Joi.number().integer().positive())
    .optional()
    .messages({
      'array.base': 'Tag IDs must be an array',
      'number.base': 'Each tag ID must be a number',
      'number.integer': 'Each tag ID must be a whole number',
      'number.positive': 'Each tag ID must be positive'
    })
});

// Restaurant validation schemas
export const restaurantCreateSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Restaurant name cannot be empty',
      'string.min': 'Restaurant name cannot be empty',
      'string.max': 'Restaurant name must not exceed 100 characters',
      'any.required': 'Restaurant name is required'
    }),
  
  cuisine_type: Joi.string()
    .max(50)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Cuisine type must not exceed 50 characters'
    }),
  
  address: Joi.string()
    .max(200)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Address must not exceed 200 characters'
    }),
  
  phone: Joi.string()
    .pattern(/^[\d\s\-\+\(\)\.]+$/)
    .max(20)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'Phone number format is invalid',
      'string.max': 'Phone number must not exceed 20 characters'
    }),
  
  price_range: Joi.string()
    .valid('$', '$$', '$$$', '$$$$')
    .optional()
    .messages({
      'any.only': 'Price range must be one of: $, $$, $$$, $$$$'
    }),
  
  is_favorite: Joi.boolean().optional().default(false),
  
  rating: Joi.number()
    .min(0)
    .max(5)
    .precision(1)
    .optional()
    .messages({
      'number.base': 'Rating must be a number',
      'number.min': 'Rating must be at least 0',
      'number.max': 'Rating must not exceed 5',
      'number.precision': 'Rating must have at most 1 decimal place'
    }),
  
  tag_ids: Joi.array()
    .items(Joi.number().integer().positive())
    .optional()
    .messages({
      'array.base': 'Tag IDs must be an array',
      'number.base': 'Each tag ID must be a number',
      'number.integer': 'Each tag ID must be a whole number',
      'number.positive': 'Each tag ID must be positive'
    })
});

export const restaurantUpdateSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.empty': 'Restaurant name cannot be empty',
      'string.min': 'Restaurant name cannot be empty',
      'string.max': 'Restaurant name must not exceed 100 characters'
    }),
  
  cuisine_type: Joi.string()
    .max(50)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Cuisine type must not exceed 50 characters'
    }),
  
  address: Joi.string()
    .max(200)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Address must not exceed 200 characters'
    }),
  
  phone: Joi.string()
    .pattern(/^[\d\s\-\+\(\)\.]+$/)
    .max(20)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'Phone number format is invalid',
      'string.max': 'Phone number must not exceed 20 characters'
    }),
  
  price_range: Joi.string()
    .valid('$', '$$', '$$$', '$$$$')
    .optional()
    .messages({
      'any.only': 'Price range must be one of: $, $$, $$$, $$$$'
    }),
  
  is_favorite: Joi.boolean().optional(),
  
  rating: Joi.number()
    .min(0)
    .max(5)
    .precision(1)
    .optional()
    .messages({
      'number.base': 'Rating must be a number',
      'number.min': 'Rating must be at least 0',
      'number.max': 'Rating must not exceed 5',
      'number.precision': 'Rating must have at most 1 decimal place'
    }),
  
  tag_ids: Joi.array()
    .items(Joi.number().integer().positive())
    .optional()
    .messages({
      'array.base': 'Tag IDs must be an array',
      'number.base': 'Each tag ID must be a number',
      'number.integer': 'Each tag ID must be a whole number',
      'number.positive': 'Each tag ID must be positive'
    })
});

// Tag validation schemas
export const tagCreateSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Tag name cannot be empty',
      'string.min': 'Tag name cannot be empty',
      'string.max': 'Tag name must not exceed 50 characters',
      'any.required': 'Tag name is required'
    }),
  
  color: Joi.string()
    .pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .optional()
    .messages({
      'string.pattern.base': 'Color must be a valid hex color code (e.g., #FF0000 or #F00)'
    })
});

export const tagUpdateSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(50)
    .optional()
    .messages({
      'string.empty': 'Tag name cannot be empty',
      'string.min': 'Tag name cannot be empty',
      'string.max': 'Tag name must not exceed 50 characters'
    }),
  
  color: Joi.string()
    .pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .optional()
    .messages({
      'string.pattern.base': 'Color must be a valid hex color code (e.g., #FF0000 or #F00)'
    })
});

// Search and pagination schemas
export const searchQuerySchema = Joi.object({
  search: Joi.string().max(100).optional(),
  cuisine_type: Joi.string().max(50).optional(),
  difficulty_level: Joi.string().valid('easy', 'medium', 'hard').optional(),
  prep_time_max: Joi.number().integer().min(1).max(1440).optional(),
  price_range: Joi.string().valid('$', '$$', '$$$', '$$$$').optional(),
  rating_min: Joi.number().min(0).max(5).precision(1).optional(),
  is_favorite: Joi.boolean().optional(),
  tag_ids: Joi.string().pattern(/^\d+(,\d+)*$/).optional(), // comma-separated numbers
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  sort_by: Joi.string().valid('name', 'created_at', 'updated_at', 'prep_time', 'rating').optional(),
  sort_order: Joi.string().valid('asc', 'desc').optional()
});

// Random selection schema
export const randomSelectionSchema = Joi.object({
  exclude_recent_days: Joi.number().integer().min(0).max(365).optional(),
  weight_favorites: Joi.boolean().optional(),
  type: Joi.string().valid('meal', 'restaurant').optional(),
  filters: Joi.object({
    cuisine_type: Joi.string().max(50).optional(),
    difficulty_level: Joi.string().valid('easy', 'medium', 'hard').optional(),
    prep_time_max: Joi.number().integer().min(1).max(1440).optional(),
    price_range: Joi.string().valid('$', '$$', '$$$', '$$$$').optional(),
    rating_min: Joi.number().min(0).max(5).precision(1).optional(),
    is_favorite: Joi.boolean().optional(),
    tag_ids: Joi.array().items(Joi.number().integer().positive()).optional()
  }).optional()
});

// ID parameter schema
export const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'ID must be a number',
    'number.integer': 'ID must be a whole number',
    'number.positive': 'ID must be positive',
    'any.required': 'ID is required'
  })
});