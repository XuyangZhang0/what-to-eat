import { useEffect, useRef, useCallback, useState } from 'react'
import { AutoSaveState } from '@/types/api'

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  delay?: number; // milliseconds to wait before saving
  isDirty: boolean;
  isValid: boolean;
  enabled?: boolean;
}

export function useAutoSave<T>({
  data,
  onSave,
  delay = 2000,
  isDirty,
  isValid,
  enabled = true,
}: UseAutoSaveOptions<T>) {
  const [state, setState] = useState<AutoSaveState>({
    isDirty: false,
    isAutoSaving: false,
    hasErrors: false,
  })

  const saveTimeoutRef = useRef<NodeJS.Timeout>()
  const lastDataRef = useRef<string>()

  const triggerAutoSave = useCallback(async () => {
    if (!enabled || !isValid || !isDirty) return

    setState(prev => ({ ...prev, isAutoSaving: true, hasErrors: false }))

    try {
      await onSave(data)
      setState(prev => ({
        ...prev,
        isAutoSaving: false,
        isDirty: false,
        lastSaved: new Date(),
        hasErrors: false,
      }))
      lastDataRef.current = JSON.stringify(data)
    } catch (error) {
      console.error('Auto-save failed:', error)
      setState(prev => ({
        ...prev,
        isAutoSaving: false,
        hasErrors: true,
      }))
    }
  }, [data, onSave, enabled, isValid, isDirty])

  useEffect(() => {
    if (!enabled) return

    const dataString = JSON.stringify(data)
    const hasChanged = dataString !== lastDataRef.current

    setState(prev => ({ ...prev, isDirty: hasChanged && isDirty }))

    if (hasChanged && isDirty && isValid) {
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }

      // Set new timeout for auto-save
      saveTimeoutRef.current = setTimeout(triggerAutoSave, delay)
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [data, isDirty, isValid, enabled, delay, triggerAutoSave])

  const saveImmediately = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    await triggerAutoSave()
  }, [triggerAutoSave])

  const cancelAutoSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    setState(prev => ({ ...prev, isAutoSaving: false }))
  }, [])

  return {
    autoSaveState: state,
    saveImmediately,
    cancelAutoSave,
  }
}