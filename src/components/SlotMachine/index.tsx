import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Sparkles } from 'lucide-react'
import confetti from 'canvas-confetti'
import { cn } from '@/utils/cn'
import { useShakeDetection } from '@/hooks/useShakeDetection'
import { SlotMachineReel } from './SlotMachineReel'
import { useSoundEffects } from './hooks/useSoundEffects'
import type { SlotMachineProps, SlotMachineState, SlotItem } from './types'

export default function SlotMachine({
  items,
  onSelection,
  isShakeTriggered = false,
  onShakeReset,
  disabled = false,
  autoplay = false,
  spinDuration = 3000,
  reelCount = 3,
  className,
  celebrationDuration = 2000,
  soundEnabled = true,
}: SlotMachineProps) {
  const [state, setState] = useState<SlotMachineState>('idle')
  const [selectedItem, setSelectedItem] = useState<SlotItem | null>(null)
  const [reelItems, setReelItems] = useState<SlotItem[][]>([])
  
  const spinTimeoutRef = useRef<NodeJS.Timeout>()
  const celebrationTimeoutRef = useRef<NodeJS.Timeout>()
  
  const { isShaking } = useShakeDetection({ 
    enabled: !disabled && state === 'idle',
    threshold: 12 
  })
  
  const { playSpinSound, playWinSound, stopSpinSound } = useSoundEffects({ 
    enabled: soundEnabled 
  })

  // Prepare reel items by duplicating and shuffling the input items
  const prepareReelItems = useCallback(() => {
    if (!items.length) return []
    
    const reels: SlotItem[][] = []
    for (let i = 0; i < reelCount; i++) {
      // Create a longer list for smooth scrolling effect
      const reelList: SlotItem[] = []
      for (let j = 0; j < 20; j++) {
        reelList.push(...items.sort(() => Math.random() - 0.5))
      }
      reels.push(reelList)
    }
    return reels
  }, [items, reelCount])

  // Initialize reel items
  useEffect(() => {
    setReelItems(prepareReelItems())
  }, [prepareReelItems])

  // Handle shake detection
  useEffect(() => {
    if (isShaking && state === 'idle') {
      handleSpin()
    }
  }, [isShaking, state])

  // Handle external shake trigger
  useEffect(() => {
    if (isShakeTriggered && state === 'idle') {
      handleSpin()
      onShakeReset?.()
    }
  }, [isShakeTriggered, state, onShakeReset])

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current)
      if (celebrationTimeoutRef.current) clearTimeout(celebrationTimeoutRef.current)
    }
  }, [])

  const triggerConfetti = useCallback(() => {
    // Multi-stage confetti celebration
    const count = 200
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 1000,
      colors: ['#FFD700', '#FFA500', '#FF6347', '#FF69B4', '#00CED1', '#98FB98']
    }

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      })
    }

    // Initial burst
    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    })
    
    fire(0.2, {
      spread: 60,
    })
    
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    })
    
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    })
    
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    })

    // Secondary bursts from sides
    setTimeout(() => {
      fire(0.15, {
        spread: 60,
        origin: { x: 0.1, y: 0.6 },
        angle: 45,
      })
      
      fire(0.15, {
        spread: 60,
        origin: { x: 0.9, y: 0.6 },
        angle: 135,
      })
    }, 300)

    // Final shower
    setTimeout(() => {
      fire(0.3, {
        spread: 200,
        startVelocity: 30,
        scalar: 0.6,
        origin: { y: 0.3 }
      })
    }, 600)
  }, [])

  const handleSpin = useCallback(async () => {
    if (disabled || state !== 'idle' || !items.length) return

    setState('spinning')
    playSpinSound()

    // Prepare fresh reel items for this spin
    setReelItems(prepareReelItems())

    // Stop spinning after duration and select winner
    spinTimeoutRef.current = setTimeout(() => {
      stopSpinSound()
      
      // Select random winner
      const winner = items[Math.floor(Math.random() * items.length)]
      setSelectedItem(winner)
      setState('celebrating')
      
      // Trigger celebration effects
      triggerConfetti()
      playWinSound()
      
      // Call selection callback
      onSelection?.(winner)
      
      // Return to idle after celebration
      celebrationTimeoutRef.current = setTimeout(() => {
        setState('idle')
        setSelectedItem(null)
      }, celebrationDuration)
      
    }, spinDuration)
  }, [
    disabled, 
    state, 
    items, 
    spinDuration, 
    celebrationDuration, 
    onSelection,
    playSpinSound,
    playWinSound,
    stopSpinSound,
    triggerConfetti,
    prepareReelItems
  ])

  const handleStop = useCallback(() => {
    if (state !== 'spinning') return
    
    if (spinTimeoutRef.current) {
      clearTimeout(spinTimeoutRef.current)
    }
    
    stopSpinSound()
    
    // Force select a winner immediately
    const winner = items[Math.floor(Math.random() * items.length)]
    setSelectedItem(winner)
    setState('celebrating')
    
    triggerConfetti()
    playWinSound()
    onSelection?.(winner)
    
    celebrationTimeoutRef.current = setTimeout(() => {
      setState('idle')
      setSelectedItem(null)
    }, celebrationDuration)
  }, [
    state, 
    items, 
    celebrationDuration, 
    onSelection,
    stopSpinSound,
    playWinSound,
    triggerConfetti
  ])

  const handleReset = useCallback(() => {
    if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current)
    if (celebrationTimeoutRef.current) clearTimeout(celebrationTimeoutRef.current)
    
    stopSpinSound()
    setState('idle')
    setSelectedItem(null)
  }, [stopSpinSound])

  return (
    <div className={cn(
      "relative w-full max-w-md mx-auto p-4 sm:p-6 bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl touch-manipulation",
      className
    )}>
      {/* Slot Machine Header */}
      <div className="text-center mb-4 sm:mb-6">
        <motion.h2 
          className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-2"
          animate={state === 'celebrating' ? { 
            scale: [1, 1.1, 1],
            color: ['#1f2937', '#f59e0b', '#1f2937']
          } : {}}
          transition={{ duration: 0.5, repeat: state === 'celebrating' ? 3 : 0 }}
        >
          What to Eat?
        </motion.h2>
        <motion.div 
          className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400"
          animate={state === 'celebrating' ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.6, repeat: state === 'celebrating' ? Infinity : 0 }}
        >
          <motion.div
            animate={state === 'spinning' ? { rotate: 360 } : {}}
            transition={{ duration: 1, repeat: state === 'spinning' ? Infinity : 0, ease: 'linear' }}
          >
            <Sparkles className="w-4 h-4" />
          </motion.div>
          <span className="text-sm font-medium">
            {state === 'idle' && 'Ready to spin!'}
            {state === 'spinning' && 'Deciding...'}
            {state === 'celebrating' && 'Perfect choice!'}
          </span>
          <motion.div
            animate={state === 'spinning' ? { rotate: -360 } : {}}
            transition={{ duration: 1, repeat: state === 'spinning' ? Infinity : 0, ease: 'linear' }}
          >
            <Sparkles className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </div>

      {/* Slot Machine Reels */}
      <div className="relative mb-6">
        <div className="flex gap-2 p-4 bg-black rounded-xl border-4 border-yellow-400 shadow-inner">
          {Array.from({ length: reelCount }).map((_, index) => (
            <SlotMachineReel
              key={index}
              items={reelItems[index] || []}
              isSpinning={state === 'spinning'}
              selectedItem={selectedItem}
              delay={index * 200}
              className="flex-1"
            />
          ))}
        </div>
        
        {/* Winning highlight overlay */}
        <AnimatePresence>
          {state === 'celebrating' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-xl border-4 border-yellow-400 shadow-lg pointer-events-none"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Selected Result Display */}
      <AnimatePresence>
        {selectedItem && state === 'celebrating' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 border-yellow-400"
          >
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
                🎉 Your Choice 🎉
              </h3>
              <p className="text-xl font-semibold text-amber-600 dark:text-amber-400">
                {selectedItem.name}
              </p>
              {selectedItem.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {selectedItem.description}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Buttons */}
      <div className="flex gap-3 justify-center">
        {state === 'idle' && (
          <motion.button
            onClick={handleSpin}
            disabled={disabled || !items.length}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "active:scale-95 touch-manipulation",
              "min-h-[44px] text-base sm:text-lg" // Ensure minimum touch target size
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Play className="w-5 h-5" />
            <span className="hidden sm:inline">Spin</span>
            <span className="sm:hidden">🎰</span>
          </motion.button>
        )}
        
        {state === 'spinning' && (
          <motion.button
            onClick={handleStop}
            className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 active:scale-95 touch-manipulation min-h-[44px] text-base sm:text-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Pause className="w-5 h-5" />
            <span className="hidden sm:inline">Stop</span>
            <span className="sm:hidden">⏸️</span>
          </motion.button>
        )}
        
        {(state === 'celebrating' || state === 'spinning') && (
          <motion.button
            onClick={handleReset}
            className="px-4 py-3 sm:py-4 bg-gray-500 hover:bg-gray-600 text-white rounded-xl shadow-lg transition-all duration-200 active:scale-95 touch-manipulation min-h-[44px] min-w-[44px]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title="Reset"
          >
            <RotateCcw className="w-5 h-5" />
          </motion.button>
        )}
      </div>

      {/* Shake Detection Indicator */}
      {isShaking && state === 'idle' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium"
        >
          Shake detected!
        </motion.div>
      )}
    </div>
  )
}

export { SlotMachine }
export type { SlotMachineProps, SlotItem } from './types'