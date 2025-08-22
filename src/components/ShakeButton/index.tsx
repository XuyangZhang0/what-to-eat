import { motion } from 'framer-motion'
import { Smartphone, Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

interface ShakeButtonProps {
  onShake: () => void
  isShaking?: boolean
  isLoading?: boolean
  disabled?: boolean
  intensity?: number
  className?: string
}

export default function ShakeButton({ 
  onShake, 
  isShaking = false, 
  isLoading = false,
  disabled = false,
  intensity = 0,
  className 
}: ShakeButtonProps) {
  return (
    <motion.button
      onClick={onShake}
      disabled={isLoading || disabled}
      className={cn(
        "relative w-32 h-32 bg-primary text-primary-foreground rounded-full shadow-lg transition-all duration-300",
        (isLoading || disabled) && "opacity-50 cursor-not-allowed",
        isShaking && "animate-shake",
        className
      )}
      whileHover={!disabled && !isLoading ? { scale: 1.05 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.95 } : {}}
      animate={isShaking ? { 
        rotate: [0, -5, 5, -5, 5, 0],
        scale: [1, 1.02, 1]
      } : {}}
      transition={{ duration: 0.5 }}
    >
      {/* Ripple effect */}
      <motion.div
        className="absolute inset-0 rounded-full bg-primary/20"
        animate={isShaking ? {
          scale: [1, 1.3 + (intensity / 50), 1],
          opacity: [0.5, 0, 0.5]
        } : {}}
        transition={{ duration: 0.8, repeat: isShaking ? Infinity : 0 }}
      />
      
      {/* Intensity indicator */}
      {intensity > 0 && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary/40"
          animate={{
            scale: [1, 1 + (intensity / 100)],
            opacity: [0.3, 0.1]
          }}
          transition={{ duration: 0.3, repeat: Infinity, repeatType: "reverse" }}
        />
      )}
      
      {/* Button content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        {isLoading ? (
          <Loader2 className="w-8 h-8 animate-spin" />
        ) : (
          <>
            <Smartphone className="w-8 h-8 mb-2" />
            <span className="text-xs font-medium">Shake or Tap</span>
          </>
        )}
      </div>
      
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full bg-primary/30 blur-md -z-10"
        animate={isShaking ? {
          scale: [1, 1.2 + (intensity / 80), 1],
          opacity: [0.3, Math.min(0.6 + (intensity / 100), 0.9), 0.3]
        } : {}}
        transition={{ duration: 0.8, repeat: isShaking ? Infinity : 0 }}
      />
    </motion.button>
  )
}