import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'
import type { SlotItem } from './types'

interface SlotMachineReelProps {
  items: SlotItem[]
  isSpinning: boolean
  selectedItem: SlotItem | null
  delay?: number
  className?: string
}

export function SlotMachineReel({
  items,
  isSpinning,
  selectedItem,
  delay = 0,
  className
}: SlotMachineReelProps) {
  const reelRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    if (!isSpinning || !reelRef.current) return

    let startTime: number
    let scrollPosition = 0
    const itemHeight = window.innerWidth < 640 ? 50 : 60 // Responsive height
    const totalHeight = items.length * itemHeight

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp

      // Gradually increase speed then slow down
      const elapsed = timestamp - startTime
      const duration = 3000 - delay // Account for delay
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function for realistic slot machine motion
      const easing = progress < 0.7 
        ? progress * progress * progress // Accelerate
        : 1 - Math.pow(1 - progress, 3) // Decelerate

      // Calculate scroll speed
      const baseSpeed = 5 + (15 * easing) // Speed varies from 5 to 20
      scrollPosition += baseSpeed

      // Wrap around when reaching the end
      if (scrollPosition >= totalHeight) {
        scrollPosition = 0
      }

      if (reelRef.current) {
        reelRef.current.scrollTop = scrollPosition
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate)
      }
    }

    // Start animation after delay
    const timeoutId = setTimeout(() => {
      animationFrameRef.current = requestAnimationFrame(animate)
    }, delay)

    return () => {
      clearTimeout(timeoutId)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isSpinning, delay, items.length])

  if (!items.length) return null

  return (
    <div className={cn("relative", className)}>
      {/* Reel container */}
      <div
        ref={reelRef}
        className="h-[150px] sm:h-[180px] overflow-hidden bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-inner"
        style={{ 
          scrollBehavior: isSpinning ? 'auto' : 'smooth',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div className="relative">
          {items.map((item, index) => (
            <motion.div
              key={`${item.id}-${index}`}
              className={cn(
                "h-[50px] sm:h-[60px] flex items-center justify-center px-2 sm:px-3 border-b border-gray-200 dark:border-gray-700 text-center",
                selectedItem && selectedItem.id === item.id && !isSpinning && 
                "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-400 font-bold text-yellow-700 dark:text-yellow-300"
              )}
              animate={
                selectedItem && selectedItem.id === item.id && !isSpinning
                  ? { 
                      backgroundColor: ['#fef3c7', '#fbbf24', '#fef3c7'],
                      scale: [1, 1.05, 1],
                      boxShadow: ['0 0 0 0px rgba(251, 191, 36, 0)', '0 0 0 4px rgba(251, 191, 36, 0.3)', '0 0 0 0px rgba(251, 191, 36, 0)']
                    }
                  : {}
              }
              transition={{ 
                duration: 0.5, 
                repeat: selectedItem && selectedItem.id === item.id && !isSpinning ? 3 : 0 
              }}
            >
              <div className="w-full">
                <div className="text-xs sm:text-sm font-medium text-gray-800 dark:text-white line-clamp-2">
                  {item.emoji && (
                    <span className="text-sm sm:text-lg mr-1">{item.emoji}</span>
                  )}
                  <span className="text-xs sm:text-sm">{item.name}</span>
                </div>
                {item.category && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 hidden sm:block">
                    {item.category}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Reel selection indicator */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top fade */}
        <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-black/50 to-transparent rounded-t-lg" />
        
        {/* Middle selection area */}
        <div className="absolute top-1/2 left-0 right-0 h-[50px] sm:h-[60px] transform -translate-y-1/2 border-2 border-yellow-400 bg-yellow-400/10 rounded" />
        
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/50 to-transparent rounded-b-lg" />
      </div>

      {/* Spinning effect overlay */}
      {isSpinning && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-400/20 to-transparent"
          animate={{
            y: ['-100%', '100%'],
          }}
          transition={{
            duration: 0.3,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}
    </div>
  )
}