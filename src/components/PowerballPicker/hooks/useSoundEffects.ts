import { useEffect, useRef, useCallback } from 'react'

interface SoundEffectsHook {
  playDrawSound: () => void
  stopDrawSound: () => void
  playWinSound: () => void
  isEnabled: boolean
}

export function useSoundEffects(enabled: boolean = true): SoundEffectsHook {
  const audioContextRef = useRef<AudioContext | null>(null)
  const drawOscillatorRef = useRef<OscillatorNode | null>(null)
  const drawGainRef = useRef<GainNode | null>(null)

  // Initialize audio context on first use
  const initializeAudioContext = useCallback(() => {
    if (!audioContextRef.current && enabled) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      } catch (error) {
        console.warn('Web Audio API not supported:', error)
      }
    }
  }, [enabled])

  // Play draw sound - a swirling, mechanical sound
  const playDrawSound = useCallback(() => {
    if (!enabled) return
    
    initializeAudioContext()
    if (!audioContextRef.current) return

    try {
      // Stop any existing draw sound
      stopDrawSound()

      const context = audioContextRef.current
      
      // Create oscillator for the swirling effect
      const oscillator = context.createOscillator()
      const gainNode = context.createGain()
      const filter = context.createBiquadFilter()
      
      drawOscillatorRef.current = oscillator
      drawGainRef.current = gainNode

      // Configure oscillator for a swirling effect
      oscillator.type = 'sawtooth'
      oscillator.frequency.setValueAtTime(100, context.currentTime)
      
      // Modulate frequency for swirling effect
      const lfo = context.createOscillator()
      const lfoGain = context.createGain()
      lfo.type = 'sine'
      lfo.frequency.setValueAtTime(2, context.currentTime) // 2 Hz modulation
      lfoGain.gain.setValueAtTime(30, context.currentTime) // Modulation depth
      
      lfo.connect(lfoGain)
      lfoGain.connect(oscillator.frequency)
      lfo.start()

      // Configure filter for a more mechanical sound
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(800, context.currentTime)
      filter.Q.setValueAtTime(5, context.currentTime)

      // Configure volume envelope
      gainNode.gain.setValueAtTime(0, context.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.1, context.currentTime + 0.1)

      // Connect audio graph
      oscillator.connect(filter)
      filter.connect(gainNode)
      gainNode.connect(context.destination)

      // Start the sound
      oscillator.start()
      lfo.start()
    } catch (error) {
      console.warn('Error playing draw sound:', error)
    }
  }, [enabled, initializeAudioContext])

  // Stop draw sound
  const stopDrawSound = useCallback(() => {
    if (drawOscillatorRef.current) {
      try {
        drawGainRef.current?.gain.linearRampToValueAtTime(0, audioContextRef.current!.currentTime + 0.1)
        drawOscillatorRef.current.stop(audioContextRef.current!.currentTime + 0.1)
      } catch (error) {
        // Oscillator might already be stopped
      }
      drawOscillatorRef.current = null
      drawGainRef.current = null
    }
  }, [])

  // Play win sound - a triumphant chord progression
  const playWinSound = useCallback(() => {
    if (!enabled) return
    
    initializeAudioContext()
    if (!audioContextRef.current) return

    try {
      const context = audioContextRef.current
      
      // Play a major chord (C-E-G-C)
      const frequencies = [523.25, 659.25, 783.99, 1046.50] // C5-E5-G5-C6
      const startTime = context.currentTime
      
      frequencies.forEach((freq, index) => {
        const oscillator = context.createOscillator()
        const gainNode = context.createGain()
        
        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(freq, startTime)
        
        // Stagger the notes slightly for a more musical effect
        const noteStartTime = startTime + (index * 0.1)
        const noteEndTime = noteStartTime + 1.5
        
        gainNode.gain.setValueAtTime(0, noteStartTime)
        gainNode.gain.linearRampToValueAtTime(0.15, noteStartTime + 0.1)
        gainNode.gain.exponentialRampToValueAtTime(0.01, noteEndTime)
        
        oscillator.connect(gainNode)
        gainNode.connect(context.destination)
        
        oscillator.start(noteStartTime)
        oscillator.stop(noteEndTime)
      })

      // Add some sparkle with higher frequencies
      setTimeout(() => {
        if (!enabled || !audioContextRef.current) return
        
        const sparkleFreqs = [1567.98, 1975.53, 2349.32] // G6, B6, D7
        sparkleFreqs.forEach((freq, index) => {
          const oscillator = context.createOscillator()
          const gainNode = context.createGain()
          
          oscillator.type = 'sine'
          oscillator.frequency.setValueAtTime(freq, context.currentTime)
          
          const startTime = context.currentTime + (index * 0.05)
          const endTime = startTime + 0.3
          
          gainNode.gain.setValueAtTime(0, startTime)
          gainNode.gain.linearRampToValueAtTime(0.08, startTime + 0.02)
          gainNode.gain.exponentialRampToValueAtTime(0.01, endTime)
          
          oscillator.connect(gainNode)
          gainNode.connect(context.destination)
          
          oscillator.start(startTime)
          oscillator.stop(endTime)
        })
      }, 200)
    } catch (error) {
      console.warn('Error playing win sound:', error)
    }
  }, [enabled, initializeAudioContext])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDrawSound()
    }
  }, [stopDrawSound])

  return {
    playDrawSound,
    stopDrawSound,
    playWinSound,
    isEnabled: enabled
  }
}