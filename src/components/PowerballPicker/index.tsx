import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shuffle, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import confetti from 'canvas-confetti'
import type { SlotItem } from '@/components/SlotMachine/types'
import { useSoundEffects } from './hooks/useSoundEffects'

interface PowerballPickerProps {
  items: SlotItem[]
  onSelection?: (item: SlotItem) => void
  isShakeTriggered?: boolean
  onShakeReset?: () => void
  disabled?: boolean
  autoplay?: boolean
  drawDuration?: number
  soundEnabled?: boolean
  className?: string
  ballCount?: number
}

type PickerState = 'idle' | 'drawing' | 'celebrating'

interface Ball {
  id: string
  item: SlotItem
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
}

export default function PowerballPicker({
  items = [],
  onSelection,
  isShakeTriggered = false,
  onShakeReset,
  disabled = false,
  autoplay = false,
  drawDuration = 4000,
  soundEnabled = true,
  className = '',
  ballCount = 12,
}: PowerballPickerProps) {
  const [state, setState] = useState<PickerState>('idle')
  const [selectedItem, setSelectedItem] = useState<SlotItem | null>(null)
  const [balls, setBalls] = useState<Ball[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()
  const timeoutRef = useRef<NodeJS.Timeout>()
  
  const { playDrawSound, stopDrawSound, playWinSound, isEnabled } = useSoundEffects(soundEnabled)

  // Initialize balls
  useEffect(() => {
    if (items.length === 0) return

    const initializeBalls = () => {
      const newBalls: Ball[] = []
      const totalBalls = Math.min(ballCount, items.length)
      
      for (let i = 0; i < totalBalls; i++) {
        const item = items[i % items.length]
        newBalls.push({
          id: `ball-${i}`,
          item,
          x: Math.random() * 300 + 50, // Random position in chamber
          y: Math.random() * 300 + 50,
          vx: (Math.random() - 0.5) * 4, // Random velocity
          vy: (Math.random() - 0.5) * 4,
          size: 50,
          color: getItemColor(item),
        })
      }
      
      setBalls(newBalls)
    }

    initializeBalls()
  }, [items, ballCount])

  // Physics animation loop
  const animateBalls = useCallback(() => {
    if (!containerRef.current) return

    setBalls(prevBalls => {
      return prevBalls.map(ball => {
        let { x, y, vx, vy } = ball
        const containerWidth = 400
        const containerHeight = 400
        const ballSize = ball.size

        // Update position
        x += vx
        y += vy

        // Bounce off walls with energy loss
        if (x <= ballSize / 2 || x >= containerWidth - ballSize / 2) {
          vx *= -0.8
          x = Math.max(ballSize / 2, Math.min(containerWidth - ballSize / 2, x))
        }
        
        if (y <= ballSize / 2 || y >= containerHeight - ballSize / 2) {
          vy *= -0.8
          y = Math.max(ballSize / 2, Math.min(containerHeight - ballSize / 2, y))
        }

        // Add gravity effect during drawing
        if (state === 'drawing') {
          vy += 0.1
          
          // Add swirling motion
          const centerX = containerWidth / 2
          const centerY = containerHeight / 2
          const dx = x - centerX
          const dy = y - centerY
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance > 0) {
            // Circular motion towards center
            const force = 0.02
            vx += (-dx / distance) * force
            vy += (-dy / distance) * force
            
            // Add rotational force
            vx += (-dy / distance) * 0.5
            vy += (dx / distance) * 0.5
          }
        }

        // Apply friction
        vx *= 0.99
        vy *= 0.99

        return { ...ball, x, y, vx, vy }
      })
    })

    if (isAnimating) {
      animationRef.current = requestAnimationFrame(animateBalls)
    }
  }, [state, isAnimating])

  // Start animation loop
  useEffect(() => {
    if (isAnimating) {
      animationRef.current = requestAnimationFrame(animateBalls)
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isAnimating, animateBalls])

  // Get color for item type
  const getItemColor = (item: SlotItem): string => {
    if (item.type === 'meal') {
      return '#FF6B6B' // Red for meals
    } else {
      return '#4ECDC4' // Teal for restaurants
    }
  }

  // Handle shake trigger
  useEffect(() => {
    if (isShakeTriggered && state === 'idle' && !disabled) {
      startDraw()
      onShakeReset?.()
    }
  }, [isShakeTriggered, state, disabled, onShakeReset])

  // Auto-play
  useEffect(() => {
    if (autoplay && state === 'idle' && items.length > 0 && !disabled) {
      const timer = setTimeout(() => startDraw(), 1000)
      return () => clearTimeout(timer)
    }
  }, [autoplay, state, items.length, disabled])

  const startDraw = useCallback(() => {
    if (disabled || items.length === 0 || state !== 'idle') return

    setState('drawing')
    setSelectedItem(null)
    setIsAnimating(true)
    
    if (isEnabled) {
      playDrawSound()
    }

    // Stop drawing after duration and select winner
    timeoutRef.current = setTimeout(() => {
      setIsAnimating(false)
      
      if (isEnabled) {
        stopDrawSound()
      }

      // Select random item from available items
      const randomItem = items[Math.floor(Math.random() * items.length)]
      setSelectedItem(randomItem)
      setState('celebrating')
      
      if (isEnabled) {
        playWinSound()
      }

      onSelection?.(randomItem)

      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
      })

      // Reset after celebration
      setTimeout(() => {
        setState('idle')
        setSelectedItem(null)
      }, 3000)
    }, drawDuration)
  }, [disabled, items, state, drawDuration, isEnabled, playDrawSound, stopDrawSound, playWinSound, onSelection])

  const stopDraw = useCallback(() => {
    if (state !== 'drawing') return

    setIsAnimating(false)
    
    if (isEnabled) {
      stopDrawSound()
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Select random item immediately
    const randomItem = items[Math.floor(Math.random() * items.length)]
    setSelectedItem(randomItem)
    setState('celebrating')
    
    if (isEnabled) {
      playWinSound()
    }

    onSelection?.(randomItem)

    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })

    // Reset after celebration
    setTimeout(() => {
      setState('idle')
      setSelectedItem(null)
    }, 3000)
  }, [state, items, isEnabled, stopDrawSound, playWinSound, onSelection])

  const reset = useCallback(() => {
    setState('idle')
    setSelectedItem(null)
    setIsAnimating(false)
    
    if (isEnabled) {
      stopDrawSound()
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [isEnabled, stopDrawSound])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  const getStateMessage = () => {
    switch (state) {
      case 'drawing':
        return 'Drawing...'
      case 'celebrating':
        return '🎉 Winner! 🎉'
      default:
        return 'Ready to draw!'
    }
  }

  const getActionButton = () => {
    switch (state) {
      case 'drawing':
        return (
          <motion.button
            onClick={stopDraw}
            className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-full font-semibold text-lg shadow-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Shuffle className="w-6 h-6 mr-2 inline" />
            Stop
          </motion.button>
        )
      case 'celebrating':
        return (
          <motion.button
            onClick={reset}
            className="px-8 py-4 bg-gray-500 hover:bg-gray-600 text-white rounded-full font-semibold text-lg shadow-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Reset"
          >
            <RotateCcw className="w-6 h-6 mr-2 inline" />
            Reset
          </motion.button>
        )
      default:
        return (
          <motion.button
            onClick={startDraw}
            disabled={disabled || items.length === 0}
            className="px-8 py-4 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-full font-semibold text-lg shadow-lg transition-colors"
            whileHover={!disabled ? { scale: 1.05 } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
          >
            <Shuffle className="w-6 h-6 mr-2 inline" />
            Draw
          </motion.button>
        )
    }
  }

  if (items.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 bg-gray-100 dark:bg-gray-800 rounded-2xl ${className}`}>
        <div className="text-6xl mb-4">🎱</div>
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          No Items Available
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center">
          Add some items to get started with the powerball picker!
        </p>
      </div>
    )
  }

  return (
    <div className={`flex flex-col items-center space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <motion.h2 
          className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
          animate={{ scale: state === 'drawing' ? [1, 1.05, 1] : 1 }}
          transition={{ duration: 0.5, repeat: state === 'drawing' ? Infinity : 0 }}
        >
          🎱 Powerball Picker
        </motion.h2>
        <motion.p 
          className="text-lg text-gray-600 dark:text-gray-400"
          key={state}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {getStateMessage()}
        </motion.p>
      </div>

      {/* Powerball Chamber */}
      <div className="relative">
        <motion.div
          ref={containerRef}
          className="w-96 h-96 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full border-8 border-gray-300 dark:border-gray-600 shadow-2xl overflow-hidden relative"
          animate={{ 
            rotate: state === 'drawing' ? 360 : 0,
            scale: state === 'celebrating' ? [1, 1.1, 1] : 1
          }}
          transition={{ 
            rotate: { duration: 8, repeat: state === 'drawing' ? Infinity : 0, ease: "linear" },
            scale: { duration: 0.6, repeat: state === 'celebrating' ? 2 : 0 }
          }}
        >
          {/* Balls */}
          <AnimatePresence>
            {balls.map((ball) => (
              <motion.div
                key={ball.id}
                className="absolute rounded-full flex items-center justify-center text-white font-bold shadow-lg cursor-pointer"
                style={{
                  width: ball.size,
                  height: ball.size,
                  backgroundColor: ball.color,
                  left: ball.x - ball.size / 2,
                  top: ball.y - ball.size / 2,
                }}
                animate={{
                  x: state === 'drawing' ? [0, 10, -10, 0] : 0,
                  y: state === 'drawing' ? [0, -5, 5, 0] : 0,
                }}
                transition={{
                  duration: 0.5,
                  repeat: state === 'drawing' ? Infinity : 0,
                  ease: "easeInOut"
                }}
                whileHover={{ scale: 1.1 }}
                title={ball.item.name}
              >
                <span className="text-xs font-bold text-center px-1">
                  {ball.item.emoji || ball.item.name.slice(0, 2).toUpperCase()}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Center highlight */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 border-4 border-yellow-400 rounded-full bg-yellow-100 dark:bg-yellow-900 opacity-30"></div>
          </div>
        </motion.div>

        {/* Sound toggle */}
        <motion.button
          onClick={() => {}} // This would toggle sound in a full implementation
          className="absolute top-4 right-4 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title={soundEnabled ? 'Disable sound' : 'Enable sound'}
        >
          {soundEnabled ? (
            <Volume2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <VolumeX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
        </motion.button>
      </div>

      {/* Action Button */}
      <div className="flex justify-center">
        {getActionButton()}
      </div>

      {/* Selected Item Display */}
      <AnimatePresence>
        {selectedItem && state === 'celebrating' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border-2 border-yellow-400 max-w-sm w-full text-center"
          >
            <div className="text-4xl mb-3">{selectedItem.emoji || '🎯'}</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {selectedItem.name}
            </h3>
            {selectedItem.description && (
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {selectedItem.description}
              </p>
            )}
            
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {selectedItem.category && (
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs">
                  {selectedItem.category}
                </span>
              )}
              {selectedItem.cuisine && (
                <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs">
                  {selectedItem.cuisine}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}