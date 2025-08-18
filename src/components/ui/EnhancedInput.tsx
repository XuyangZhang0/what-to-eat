import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, AlertCircle, CheckCircle, Info } from 'lucide-react'
import { cn } from '@/utils/cn'

interface EnhancedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  success?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'filled' | 'outlined'
  showPasswordToggle?: boolean
  loading?: boolean
  debounceMs?: number
  onDebouncedChange?: (value: string) => void
  focusRing?: boolean
  animateLabel?: boolean
}

export function EnhancedInput({
  label,
  error,
  success,
  hint,
  leftIcon,
  rightIcon,
  size = 'md',
  variant = 'default',
  showPasswordToggle = false,
  loading = false,
  debounceMs = 0,
  onDebouncedChange,
  focusRing = true,
  animateLabel = true,
  className,
  type: propType,
  value,
  onChange,
  onFocus,
  onBlur,
  disabled,
  ...props
}: EnhancedInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [internalValue, setInternalValue] = useState(value || '')
  const debounceRef = useRef<NodeJS.Timeout>()
  const inputRef = useRef<HTMLInputElement>(null)

  const inputType = propType === 'password' && showPassword ? 'text' : propType

  // Handle debounced changes
  useEffect(() => {
    if (debounceMs > 0 && onDebouncedChange) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      
      debounceRef.current = setTimeout(() => {
        onDebouncedChange(String(internalValue))
      }, debounceMs)

      return () => {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current)
        }
      }
    }
  }, [internalValue, debounceMs, onDebouncedChange])

  // Sync internal value with external value
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value)
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInternalValue(newValue)
    onChange?.(e)
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    onFocus?.(e)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)
    onBlur?.(e)
  }

  const hasValue = Boolean(internalValue)
  const hasError = Boolean(error)
  const hasSuccess = Boolean(success)

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg',
  }

  const variantClasses = {
    default: cn(
      'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700',
      'focus:border-primary-500 dark:focus:border-primary-400'
    ),
    filled: cn(
      'border-0 bg-gray-100 dark:bg-gray-700',
      'focus:bg-white dark:focus:bg-gray-600'
    ),
    outlined: cn(
      'border-2 border-gray-300 dark:border-gray-600 bg-transparent',
      'focus:border-primary-500 dark:focus:border-primary-400'
    ),
  }

  const inputClasses = cn(
    'w-full rounded-lg transition-all duration-200',
    'text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    sizeClasses[size],
    variantClasses[variant],
    {
      'border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400': hasError,
      'border-green-500 dark:border-green-400 focus:border-green-500 dark:focus:border-green-400': hasSuccess,
      'ring-2 ring-primary-500/20 dark:ring-primary-400/20': focusRing && isFocused && !hasError && !hasSuccess,
      'ring-2 ring-red-500/20 dark:ring-red-400/20': focusRing && isFocused && hasError,
      'ring-2 ring-green-500/20 dark:ring-green-400/20': focusRing && isFocused && hasSuccess,
      'pl-10': leftIcon,
      'pr-10': rightIcon || showPasswordToggle || loading,
    },
    className
  )

  const getLabelClasses = () => {
    if (!animateLabel) {
      return 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
    }

    return cn(
      'absolute left-4 transition-all duration-200 pointer-events-none',
      'text-gray-500 dark:text-gray-400',
      {
        'top-1/2 -translate-y-1/2 text-base': !isFocused && !hasValue,
        'top-2 text-xs font-medium text-primary-500 dark:text-primary-400': isFocused || hasValue,
      }
    )
  }

  const getStatusIcon = () => {
    if (loading) {
      return <div className="w-4 h-4 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin" />
    }
    if (hasError) {
      return <AlertCircle className="w-4 h-4 text-red-500" />
    }
    if (hasSuccess) {
      return <CheckCircle className="w-4 h-4 text-green-500" />
    }
    return null
  }

  return (
    <div className="relative">
      {/* Label */}
      {label && (
        <motion.label
          className={getLabelClasses()}
          initial={false}
          animate={{
            y: animateLabel && (isFocused || hasValue) ? 0 : 0,
            scale: animateLabel && (isFocused || hasValue) ? 1 : 1,
          }}
          transition={{ duration: 0.2 }}
        >
          {label}
        </motion.label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}

        {/* Input */}
        <motion.input
          ref={inputRef}
          type={inputType}
          value={internalValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          className={inputClasses}
          whileFocus={{
            scale: 1.01,
            transition: { duration: 0.2 }
          }}
          {...props}
        />

        {/* Right Icons */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {getStatusIcon()}
          
          {propType === 'password' && showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
          
          {rightIcon && <div className="text-gray-400">{rightIcon}</div>}
        </div>
      </div>

      {/* Messages */}
      <AnimatePresence>
        {(error || success || hint) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mt-2 flex items-start gap-2"
          >
            {error && (
              <>
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </>
            )}
            {success && !error && (
              <>
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
              </>
            )}
            {hint && !error && !success && (
              <>
                <Info className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-600 dark:text-gray-400">{hint}</p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}