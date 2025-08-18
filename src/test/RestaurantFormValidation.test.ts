/**
 * Restaurant Form Validation Test
 * 
 * This test file helps debug and verify the restaurant form validation logic.
 * Run this test to identify why the Save Restaurant button might be disabled.
 */

import { describe, it, expect, beforeEach } from 'vitest'

// Mock validation schema from RestaurantForm
const validationSchema = {
  name: { required: true, minLength: 1, maxLength: 100 },
  description: { maxLength: 500 },
  cuisine: { required: true, maxLength: 50 },
  address: { maxLength: 200 },
  phone: {
    pattern: /^[\d\s\-\+\(\)\.]+$/,
    maxLength: 20,
    custom: (value: string) => {
      if (value && !/^[\d\s\-\+\(\)\.]+$/.test(value)) {
        return 'Phone number format is invalid'
      }
      return null
    }
  },
  website: {
    custom: (value: string) => {
      if (value && !value.match(/^https?:\/\/.+/)) {
        return 'Website must start with http:// or https://'
      }
      return null
    }
  },
  rating: {
    custom: (value: number) => {
      if (value && (value < 0 || value > 5)) {
        return 'Rating must be between 0 and 5'
      }
      return null
    }
  },
}

// Mock field validation function
function validateField(field: string, value: any): string | null {
  const rule = validationSchema[field as keyof typeof validationSchema]
  if (!rule) return null

  // Required validation
  if ('required' in rule && rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
    return `${field} is required`
  }

  // Skip other validations if field is empty and not required
  if (!value || (typeof value === 'string' && !value.trim())) {
    return null
  }

  // String-specific validations
  if (typeof value === 'string') {
    if ('minLength' in rule && rule.minLength && value.length < rule.minLength) {
      return `${field} must be at least ${rule.minLength} characters`
    }
    if ('maxLength' in rule && rule.maxLength && value.length > rule.maxLength) {
      return `${field} must not exceed ${rule.maxLength} characters`
    }
    if ('pattern' in rule && rule.pattern && !rule.pattern.test(value)) {
      return `${field} format is invalid`
    }
  }

  // Custom validation
  if ('custom' in rule && rule.custom) {
    const customError = rule.custom(value)
    if (customError) return customError
  }

  return null
}

// Mock isValid calculation
function calculateIsValid(data: Record<string, any>, errors: Record<string, string | undefined>): boolean {
  // Check if there are any current errors
  if (Object.keys(errors).some(key => errors[key])) {
    return false
  }
  
  // Check if all required fields have valid values
  for (const field of Object.keys(validationSchema)) {
    const rule = validationSchema[field as keyof typeof validationSchema]
    const value = data[field]
    
    if ('required' in rule && rule.required) {
      if (!value || (typeof value === 'string' && !value.trim())) {
        return false
      }
    }
  }
  
  return true
}

describe('Restaurant Form Validation', () => {
  let mockData: Record<string, any>
  let mockErrors: Record<string, string | undefined>

  beforeEach(() => {
    mockData = {
      name: '',
      description: '',
      cuisine: '',
      address: '',
      phone: '',
      website: '',
      rating: undefined,
      priceRange: undefined,
      isFavorite: false,
    }
    mockErrors = {}
  })

  describe('Required Field Validation', () => {
    it('should identify name as required', () => {
      const error = validateField('name', '')
      expect(error).toBe('name is required')
    })

    it('should identify cuisine as required', () => {
      const error = validateField('cuisine', '')
      expect(error).toBe('cuisine is required')
    })

    it('should not show error for non-required empty fields', () => {
      const error = validateField('description', '')
      expect(error).toBeNull()
    })
  })

  describe('Form Validity Calculation', () => {
    it('should be invalid when required fields are empty', () => {
      const isValid = calculateIsValid(mockData, mockErrors)
      expect(isValid).toBe(false)
    })

    it('should be valid when required fields are filled', () => {
      mockData.name = 'Test Restaurant'
      mockData.cuisine = 'Italian'
      
      const isValid = calculateIsValid(mockData, mockErrors)
      expect(isValid).toBe(true)
    })

    it('should be invalid when there are validation errors', () => {
      mockData.name = 'Test Restaurant'
      mockData.cuisine = 'Italian'
      mockErrors.phone = 'Phone number format is invalid'
      
      const isValid = calculateIsValid(mockData, mockErrors)
      expect(isValid).toBe(false)
    })
  })

  describe('Specific Field Validations', () => {
    it('should validate phone number format', () => {
      const validPhone = validateField('phone', '(555) 123-4567')
      expect(validPhone).toBeNull()

      const invalidPhone = validateField('phone', 'invalid-phone')
      expect(invalidPhone).toBe('phone format is invalid')
    })

    it('should validate website format', () => {
      const validWebsite = validateField('website', 'https://example.com')
      expect(validWebsite).toBeNull()

      const invalidWebsite = validateField('website', 'invalid-website')
      expect(invalidWebsite).toBe('Website must start with http:// or https://')
    })

    it('should validate rating range', () => {
      const validRating = validateField('rating', 4.5)
      expect(validRating).toBeNull()

      const invalidRating = validateField('rating', 6)
      expect(invalidRating).toBe('Rating must be between 0 and 5')
    })
  })

  describe('Common Debug Scenarios', () => {
    it('should debug: minimal valid form', () => {
      // This represents the minimal data needed for a valid form
      const minimalData = {
        name: 'Pizza Place',
        cuisine: 'Italian',
        description: '',
        address: '',
        phone: '',
        website: '',
        rating: undefined,
        priceRange: undefined,
        isFavorite: false,
      }

      // Validate all fields
      const errors: Record<string, string | undefined> = {}
      Object.keys(validationSchema).forEach(field => {
        const error = validateField(field, minimalData[field])
        if (error) {
          errors[field] = error
        }
      })

      const isValid = calculateIsValid(minimalData, errors)

      console.log('Debug - Minimal Valid Form:', {
        data: minimalData,
        errors,
        isValid,
        requiredFields: ['name', 'cuisine'],
        requiredFieldValues: {
          name: minimalData.name,
          cuisine: minimalData.cuisine
        }
      })

      expect(isValid).toBe(true)
      expect(Object.keys(errors)).toHaveLength(0)
    })

    it('should debug: form with validation errors', () => {
      const dataWithErrors = {
        name: 'Pizza Place',
        cuisine: 'Italian',
        description: '',
        address: '',
        phone: 'invalid-phone',
        website: 'invalid-website',
        rating: 6,
        priceRange: undefined,
        isFavorite: false,
      }

      // Validate all fields
      const errors: Record<string, string | undefined> = {}
      Object.keys(validationSchema).forEach(field => {
        const error = validateField(field, dataWithErrors[field])
        if (error) {
          errors[field] = error
        }
      })

      const isValid = calculateIsValid(dataWithErrors, errors)

      console.log('Debug - Form With Errors:', {
        data: dataWithErrors,
        errors,
        isValid,
        errorCount: Object.keys(errors).length
      })

      expect(isValid).toBe(false)
      expect(errors.phone).toBe('phone format is invalid')
      expect(errors.website).toBe('Website must start with http:// or https://')
      expect(errors.rating).toBe('Rating must be between 0 and 5')
    })
  })
})

// Helper function to run validation debugging
export function debugFormValidation(formData: Record<string, any>) {
  console.log('=== Restaurant Form Validation Debug ===')
  
  // Check required fields
  const requiredFields = Object.entries(validationSchema)
    .filter(([key, rule]) => 'required' in rule && rule.required)
    .map(([key]) => key)
  
  console.log('Required fields:', requiredFields)
  console.log('Required field values:', 
    requiredFields.reduce((acc, field) => ({
      ...acc,
      [field]: formData[field]
    }), {})
  )
  
  // Validate all fields
  const errors: Record<string, string | undefined> = {}
  Object.keys(validationSchema).forEach(field => {
    const error = validateField(field, formData[field])
    if (error) {
      errors[field] = error
    }
  })
  
  const isValid = calculateIsValid(formData, errors)
  
  console.log('Validation results:', {
    data: formData,
    errors,
    isValid,
    hasErrors: Object.keys(errors).length > 0,
    missingRequiredFields: requiredFields.filter(field => 
      !formData[field] || (typeof formData[field] === 'string' && !formData[field].trim())
    )
  })
  
  return { isValid, errors }
}