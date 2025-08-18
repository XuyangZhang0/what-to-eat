import { useState, useCallback, useMemo, useEffect } from 'react'
import { FormErrors, ValidationError } from '@/types/api'

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

interface ValidationSchema {
  [key: string]: ValidationRule;
}

export function useFormValidation<T extends Record<string, any>>(
  initialData: T,
  schema: ValidationSchema
) {
  const [data, setData] = useState<T>(initialData)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validateField = useCallback((field: string, value: any): string | null => {
    const rule = schema[field]
    if (!rule) return null

    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return `${field} is required`
    }

    // Skip other validations if field is empty and not required
    if (!value || (typeof value === 'string' && !value.trim())) {
      return null
    }

    // String-specific validations
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        return `${field} must be at least ${rule.minLength} characters`
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        return `${field} must not exceed ${rule.maxLength} characters`
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        return `${field} format is invalid`
      }
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value)
      if (customError) return customError
    }

    return null
  }, [schema])

  const validateAllFields = useCallback((): FormErrors => {
    const newErrors: FormErrors = {}
    
    Object.keys(schema).forEach(field => {
      const error = validateField(field, data[field])
      if (error) {
        newErrors[field] = error
      }
    })

    return newErrors
  }, [data, schema, validateField])

  const updateField = useCallback((field: string, value: any) => {
    setData(prev => ({ ...prev, [field]: value }))
    
    // Mark field as touched
    setTouched(prev => ({ ...prev, [field]: true }))
    
    // Validate field immediately if it was already touched
    if (touched[field]) {
      const error = validateField(field, value)
      setErrors(prev => ({ ...prev, [field]: error || undefined }))
    }
  }, [touched, validateField])

  const updateFields = useCallback((updates: Partial<T>) => {
    setData(prev => ({ ...prev, ...updates }))
    
    // Mark updated fields as touched
    const updatedFields = Object.keys(updates)
    setTouched(prev => {
      const newTouched = { ...prev }
      updatedFields.forEach(field => {
        newTouched[field] = true
      })
      return newTouched
    })

    // Validate updated fields if they were already touched
    const newErrors = { ...errors }
    updatedFields.forEach(field => {
      if (touched[field]) {
        const error = validateField(field, (updates as any)[field])
        newErrors[field] = error || undefined
      }
    })
    setErrors(newErrors)
  }, [touched, validateField, errors])

  const validate = useCallback((): boolean => {
    const newErrors = validateAllFields()
    setErrors(newErrors)
    
    // Mark all fields as touched
    const allFieldsTouched = Object.keys(schema).reduce(
      (acc, field) => ({ ...acc, [field]: true }),
      {}
    )
    setTouched(allFieldsTouched)

    return Object.keys(newErrors).length === 0
  }, [validateAllFields, schema])

  const reset = useCallback((newData?: T) => {
    setData(newData || initialData)
    setErrors({})
    setTouched({})
  }, [initialData])

  const isValid = useMemo(() => {
    // Check if there are any current errors
    if (Object.keys(errors).length > 0) {
      return false
    }
    
    // Check if all required fields have valid values
    for (const field of Object.keys(schema)) {
      const rule = schema[field]
      const value = data[field]
      
      if (rule.required) {
        if (!value || (typeof value === 'string' && !value.trim())) {
          return false
        }
      }
    }
    
    return true
  }, [errors, data, schema])

  const isDirty = useMemo(() => {
    return JSON.stringify(data) !== JSON.stringify(initialData)
  }, [data, initialData])

  // Initial validation effect to ensure proper state on mount
  useEffect(() => {
    const initialErrors = validateAllFields()
    setErrors(initialErrors)
  }, [validateAllFields])

  return {
    data,
    errors,
    touched,
    isValid,
    isDirty,
    updateField,
    updateFields,
    validate,
    reset,
    setData,
    setErrors,
  }
}