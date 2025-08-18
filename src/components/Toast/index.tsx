import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'
import { cn } from '@/utils/cn'

export type ToastType = 'success' | 'error' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastProps {
  toast: Toast
  onClose: (id: string) => void
}

const ToastComponent = ({ toast, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id)
    }, toast.duration || 5000)

    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onClose])

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
    }
  }

  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        x: 0, 
        scale: 1,
        transition: { 
          type: "spring", 
          stiffness: 400, 
          damping: 25,
          duration: 0.4
        }
      }}
      exit={{ 
        opacity: 0, 
        x: 300, 
        scale: 0.95,
        transition: { duration: 0.2 }
      }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        'flex items-center gap-3 p-4 border rounded-lg shadow-lg backdrop-blur-sm',
        'cursor-pointer transition-shadow hover:shadow-xl',
        getStyles()
      )}
      onClick={() => onClose(toast.id)}
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
      >
        {getIcon()}
      </motion.div>
      <span className="flex-1 text-sm font-medium">{toast.message}</span>
      <motion.button
        onClick={(e) => {
          e.stopPropagation()
          onClose(toast.id)
        }}
        className="p-1 hover:bg-black/5 rounded transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <X className="w-4 h-4" />
      </motion.button>
    </motion.div>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onClose: (id: string) => void
}

export const ToastContainer = ({ toasts, onClose }: ToastContainerProps) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm sm:max-w-md">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastComponent key={toast.id} toast={toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  )
}

let toastCounter = 0

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (message: string, type: ToastType = 'success', duration?: number) => {
    const id = `toast-${++toastCounter}`
    const toast = { id, message, type, duration }
    
    setToasts(prev => [...prev, toast])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const toast = {
    success: (message: string, duration?: number) => addToast(message, 'success', duration),
    error: (message: string, duration?: number) => addToast(message, 'error', duration),
    warning: (message: string, duration?: number) => addToast(message, 'warning', duration),
  }

  return {
    toasts,
    toast,
    removeToast,
  }
}