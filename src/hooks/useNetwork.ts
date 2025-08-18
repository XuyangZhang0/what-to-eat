import { useState, useEffect } from 'react'

interface NetworkState {
  isOnline: boolean
  isSlowConnection: boolean
  connectionType: string | null
}

export function useNetwork() {
  const [networkState, setNetworkState] = useState<NetworkState>(() => ({
    isOnline: navigator.onLine,
    isSlowConnection: false,
    connectionType: null
  }))

  useEffect(() => {
    const updateOnlineStatus = () => {
      setNetworkState(prev => ({
        ...prev,
        isOnline: navigator.onLine
      }))
    }

    const updateConnectionType = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        const isSlowConnection = 
          connection?.effectiveType === 'slow-2g' || 
          connection?.effectiveType === '2g' ||
          connection?.downlink < 1

        setNetworkState(prev => ({
          ...prev,
          connectionType: connection?.effectiveType || null,
          isSlowConnection: Boolean(isSlowConnection)
        }))
      }
    }

    // Initial connection check
    updateConnectionType()

    // Event listeners
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      connection?.addEventListener('change', updateConnectionType)
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
      
      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        connection?.removeEventListener('change', updateConnectionType)
      }
    }
  }, [])

  return networkState
}

// Network retry utility
export function withNetworkRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  return new Promise((resolve, reject) => {
    let attempts = 0

    const attempt = async () => {
      try {
        const result = await operation()
        resolve(result)
      } catch (error) {
        attempts++
        
        // Check if it's a network error
        const isNetworkError = 
          error instanceof TypeError ||
          (error as any)?.message?.includes('Failed to fetch') ||
          (error as any)?.message?.includes('Network Error') ||
          !navigator.onLine

        if (isNetworkError && attempts < maxRetries) {
          console.log(`Network request failed, retrying... (${attempts}/${maxRetries})`)
          setTimeout(attempt, delay * attempts) // Exponential backoff
        } else {
          reject(error)
        }
      }
    }

    attempt()
  })
}

export default useNetwork