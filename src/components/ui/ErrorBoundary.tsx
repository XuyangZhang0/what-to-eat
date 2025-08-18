import React, { Component, ErrorInfo, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { EnhancedButton } from './EnhancedButton'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  private handleRefresh = () => {
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <motion.div
            className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
            >
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Oops! Something went wrong
              </h1>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We encountered an unexpected error. Don't worry, this happens sometimes. 
                You can try refreshing the page or going back to the home page.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <motion.details
                  className="text-left mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Error Details (Development)
                  </summary>
                  <pre className="text-xs text-red-600 dark:text-red-400 overflow-auto">
                    {this.state.error.message}
                    {'\n\n'}
                    {this.state.error.stack}
                  </pre>
                </motion.details>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <EnhancedButton
                  onClick={this.handleReset}
                  variant="primary"
                  icon={<RefreshCw className="w-4 h-4" />}
                  className="flex-1"
                >
                  Try Again
                </EnhancedButton>
                
                <EnhancedButton
                  onClick={this.handleGoHome}
                  variant="outline"
                  icon={<Home className="w-4 h-4" />}
                  className="flex-1"
                >
                  Go Home
                </EnhancedButton>
              </div>

              <motion.div
                className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  If this problem persists, please contact support.
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook for functional components
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = () => setError(null)

  const handleError = React.useCallback((error: Error) => {
    console.error('Error caught by hook:', error)
    setError(error)
  }, [])

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { handleError, resetError }
}