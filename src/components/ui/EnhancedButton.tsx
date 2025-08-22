import React from 'react'
import { motion, Variants } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

interface EnhancedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  loadingText?: string
  children: React.ReactNode
  className?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  ripple?: boolean
  hapticFeedback?: boolean
}

const buttonVariants: Variants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.02,
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  tap: { 
    scale: 0.98,
    transition: { duration: 0.1, ease: 'easeInOut' }
  },
}

const rippleVariants: Variants = {
  initial: { scale: 0, opacity: 0.5 },
  animate: { 
    scale: 2,
    opacity: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  },
}

export const EnhancedButton = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  children,
  className,
  icon,
  iconPosition = 'left',
  ripple = true,
  hapticFeedback = true,
  disabled,
  onClick,
  ...props
}: EnhancedButtonProps) => {
  const [rippleCoords, setRippleCoords] = React.useState<{ x: number; y: number } | null>(null)

  const baseClasses = cn(
    'relative inline-flex items-center justify-center gap-2 font-medium transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    'overflow-hidden', // For ripple effect
  )

  const variantClasses = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 shadow-lg hover:shadow-xl',
    secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 shadow-lg hover:shadow-xl',
    outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20',
    ghost: 'text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-xl',
  }

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm rounded-lg',
    md: 'px-4 py-3 text-base rounded-lg',
    lg: 'px-6 py-4 text-lg rounded-xl',
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isLoading || disabled) return

    // Haptic feedback
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10)
    }

    // Ripple effect
    if (ripple) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      setRippleCoords({ x, y })
      
      // Clear ripple after animation
      setTimeout(() => setRippleCoords(null), 600)
    }

    onClick?.(e)
  }

  const LoadingIcon = () => (
    <Loader2 className="w-4 h-4 animate-spin" />
  )

  return (
    <motion.button
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      variants={buttonVariants}
      initial="initial"
      whileHover={!disabled && !isLoading ? "hover" : undefined}
      whileTap={!disabled && !isLoading ? "tap" : undefined}
      disabled={disabled || isLoading}
      onClick={handleClick}
      {...props}
    >
      {/* Ripple Effect */}
      {ripple && rippleCoords && (
        <motion.span
          className="absolute bg-white/30 rounded-full pointer-events-none"
          style={{
            left: rippleCoords.x - 10,
            top: rippleCoords.y - 10,
            width: 20,
            height: 20,
          }}
          variants={rippleVariants}
          initial="initial"
          animate="animate"
        />
      )}

      {/* Content */}
      {isLoading ? (
        <>
          <LoadingIcon />
          {loadingText || 'Loading...'}
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <motion.span
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              {icon}
            </motion.span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <motion.span
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              {icon}
            </motion.span>
          )}
        </>
      )}
    </motion.button>
  )
}

// Convenience exports for common button types
export const PrimaryButton = (props: Omit<EnhancedButtonProps, 'variant'>) => (
  <EnhancedButton variant="primary" {...props} />
)

export const SecondaryButton = (props: Omit<EnhancedButtonProps, 'variant'>) => (
  <EnhancedButton variant="secondary" {...props} />
)

export const OutlineButton = (props: Omit<EnhancedButtonProps, 'variant'>) => (
  <EnhancedButton variant="outline" {...props} />
)

export const GhostButton = (props: Omit<EnhancedButtonProps, 'variant'>) => (
  <EnhancedButton variant="ghost" {...props} />
)

export const DangerButton = (props: Omit<EnhancedButtonProps, 'variant'>) => (
  <EnhancedButton variant="danger" {...props} />
)
