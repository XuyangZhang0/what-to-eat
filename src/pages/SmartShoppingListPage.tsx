import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import SmartShoppingList from '@/components/SmartShoppingList'

export default function SmartShoppingListPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-green-900/20 dark:to-blue-900/20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>
          
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Smart Shopping List
          </h1>
          
          <div className="w-16"></div> {/* Spacer for center alignment */}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <SmartShoppingList />
      </div>
    </div>
  )
}