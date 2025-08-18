import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { LoginForm } from '@/components/LoginForm'

export default function Login() {
  const navigate = useNavigate()

  const handleLoginSuccess = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            What to Eat
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Food Decision Assistant
          </p>
        </motion.div>

        <LoginForm onSuccess={handleLoginSuccess} />
      </div>
    </div>
  )
}