import { useCallback, useRef, useEffect } from 'react'
import type { SoundEffectsOptions } from '../types'

/**
 * Sound effects hook for slot machine
 * Provides audio feedback for spinning and winning
 */
export function useSoundEffects(options: SoundEffectsOptions = {}) {
  const { enabled = true, volume = 0.5 } = options
  
  const spinAudioRef = useRef<HTMLAudioElement | null>(null)
  const winAudioRef = useRef<HTMLAudioElement | null>(null)
  const isSpinningRef = useRef(false)

  // Initialize audio context and create audio elements
  useEffect(() => {
    if (!enabled) return

    // Create spin sound using Web Audio API for looping
    const createSpinSound = () => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime)
        gainNode.gain.setValueAtTime(0, audioContext.currentTime)
        
        return { audioContext, oscillator, gainNode }
      } catch (error) {
        console.warn('Web Audio API not available, falling back to HTML Audio')
        return null
      }
    }

    // Create win sound using data URL for a pleasant chime
    const createWinSound = () => {
      const audio = new Audio()
      // Simple beep sound encoded as data URL
      audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+Dzu2gcETOSzfTQfSwHJIzOdt/lQQsT'
      audio.volume = volume
      return audio
    }

    if (enabled) {
      winAudioRef.current = createWinSound()
    }

    return () => {
      if (spinAudioRef.current) {
        spinAudioRef.current.pause()
        spinAudioRef.current = null
      }
      if (winAudioRef.current) {
        winAudioRef.current.pause()
        winAudioRef.current = null
      }
    }
  }, [enabled, volume])

  const playSpinSound = useCallback(() => {
    if (!enabled || isSpinningRef.current) return

    try {
      // Create a continuous spinning sound using oscillator
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      // Create a mechanical spinning sound with frequency modulation
      oscillator.frequency.setValueAtTime(100, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.1)
      oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.2)
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume * 0.3, audioContext.currentTime + 0.1)
      
      oscillator.start()
      isSpinningRef.current = true
      
      // Store reference for stopping
      spinAudioRef.current = {
        pause: () => {
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1)
          setTimeout(() => {
            oscillator.stop()
            isSpinningRef.current = false
          }, 100)
        }
      } as HTMLAudioElement
      
    } catch (error) {
      console.warn('Could not play spin sound:', error)
    }
  }, [enabled, volume])

  const stopSpinSound = useCallback(() => {
    if (spinAudioRef.current && isSpinningRef.current) {
      spinAudioRef.current.pause()
      isSpinningRef.current = false
    }
  }, [])

  const playWinSound = useCallback(() => {
    if (!enabled || !winAudioRef.current) return

    try {
      // Reset and play win sound
      winAudioRef.current.currentTime = 0
      winAudioRef.current.volume = volume
      
      const playPromise = winAudioRef.current.play()
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn('Could not play win sound:', error)
        })
      }
    } catch (error) {
      console.warn('Could not play win sound:', error)
    }
  }, [enabled, volume])

  const playSuccessChime = useCallback(() => {
    if (!enabled) return

    try {
      // Create a success chime using multiple tones
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const frequencies = [523.25, 659.25, 783.99] // C5, E5, G5 - major chord
      
      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime)
        oscillator.type = 'sine'
        
        const startTime = audioContext.currentTime + (index * 0.1)
        const duration = 0.4
        
        gainNode.gain.setValueAtTime(0, startTime)
        gainNode.gain.linearRampToValueAtTime(volume * 0.2, startTime + 0.05)
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration)
        
        oscillator.start(startTime)
        oscillator.stop(startTime + duration)
      })
    } catch (error) {
      console.warn('Could not play success chime:', error)
    }
  }, [enabled, volume])

  return {
    playSpinSound,
    stopSpinSound,
    playWinSound,
    playSuccessChime,
    isEnabled: enabled,
  }
}