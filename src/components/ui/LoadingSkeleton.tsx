import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

interface LoadingSkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

export function LoadingSkeleton({
  className,
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}: LoadingSkeletonProps) {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700'
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg',
  }

  const animationVariants = {
    pulse: {
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    wave: {
      backgroundPosition: ['-200px 0', '200px 0'],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    none: {},
  }

  const style = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'circular' ? width : undefined),
    ...(animation === 'wave' && {
      background: `linear-gradient(90deg, 
        rgb(229 231 235) 25%, 
        rgb(243 244 246) 50%, 
        rgb(229 231 235) 75%)`,
      backgroundSize: '400px 100%',
    }),
  }

  return (
    <motion.div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={style}
      animate={animation !== 'none' ? animationVariants[animation] : undefined}
    />
  )
}

// Skeleton components for specific use cases
export function MealCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <LoadingSkeleton variant="circular" width={64} height={64} />
        <div className="flex-1 space-y-2">
          <LoadingSkeleton variant="text" width="75%" />
          <LoadingSkeleton variant="text" width="50%" />
        </div>
      </div>
      <div className="space-y-2">
        <LoadingSkeleton variant="text" width="100%" />
        <LoadingSkeleton variant="text" width="80%" />
      </div>
      <div className="flex space-x-2">
        <LoadingSkeleton variant="rounded" width={60} height={24} />
        <LoadingSkeleton variant="rounded" width={80} height={24} />
        <LoadingSkeleton variant="rounded" width={70} height={24} />
      </div>
    </div>
  )
}

export function TagCardSkeleton() {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
      <div className="flex items-center gap-3 flex-1">
        <LoadingSkeleton variant="circular" width={16} height={16} />
        <div className="flex-1 space-y-1">
          <LoadingSkeleton variant="text" width="60%" />
          <LoadingSkeleton variant="text" width="40%" className="h-3" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <LoadingSkeleton variant="circular" width={32} height={32} />
        <LoadingSkeleton variant="circular" width={32} height={32} />
      </div>
    </div>
  )
}

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <LoadingSkeleton variant="text" width="20%" className="h-5" />
        <LoadingSkeleton variant="rounded" width="100%" height={48} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <LoadingSkeleton variant="text" width="25%" className="h-5" />
          <LoadingSkeleton variant="rounded" width="100%" height={48} />
        </div>
        <div className="space-y-2">
          <LoadingSkeleton variant="text" width="30%" className="h-5" />
          <LoadingSkeleton variant="rounded" width="100%" height={48} />
        </div>
      </div>
      <div className="space-y-2">
        <LoadingSkeleton variant="text" width="15%" className="h-5" />
        <LoadingSkeleton variant="rounded" width="100%" height={96} />
      </div>
      <div className="flex gap-4">
        <LoadingSkeleton variant="rounded" width="50%" height={48} />
        <LoadingSkeleton variant="rounded" width="50%" height={48} />
      </div>
    </div>
  )
}