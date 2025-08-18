import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Trash2, X } from 'lucide-react'
import { cn } from '@/utils/cn'

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDialogProps) {
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  }

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 },
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <Trash2 className="w-6 h-6 text-red-500" />,
          confirmClass: 'bg-red-500 hover:bg-red-600 text-white',
          iconBg: 'bg-red-100 dark:bg-red-900/30',
        }
      case 'warning':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
          confirmClass: 'bg-amber-500 hover:bg-amber-600 text-white',
          iconBg: 'bg-amber-100 dark:bg-amber-900/30',
        }
      case 'info':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-blue-500" />,
          confirmClass: 'bg-blue-500 hover:bg-blue-600 text-white',
          iconBg: 'bg-blue-100 dark:bg-blue-900/30',
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onCancel}
        >
          <motion.div
            className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 pb-4">
              <div className="flex items-start gap-4">
                <div className={cn('p-2 rounded-full', styles.iconBg)}>
                  {styles.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    {message}
                  </p>
                </div>
                <button
                  onClick={onCancel}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  disabled={isLoading}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={cn(
                  'flex-1 px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2',
                  styles.confirmClass
                )}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}