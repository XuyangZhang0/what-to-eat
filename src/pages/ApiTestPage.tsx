import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { favoritesApi } from '@/services/api'

export default function ApiTestPage() {
  const { isAuthenticated, user, token } = useAuth()
  const [testResults, setTestResults] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testFavoritesApis = async () => {
    setIsLoading(true)
    setTestResults([])
    
    addResult('Starting API tests...')
    addResult(`Auth status: ${isAuthenticated ? 'Authenticated' : 'Not authenticated'}`)
    addResult(`User: ${user?.username || 'None'}`)
    addResult(`Token: ${token ? 'Present' : 'Missing'}`)
    
    try {
      addResult('Testing favorite meals API...')
      const meals = await favoritesApi.getFavoriteMeals()
      addResult(`Favorite meals: ${meals.length} items`)
      console.log('Favorite meals:', meals)
    } catch (error: any) {
      addResult(`Favorite meals error: ${error.message}`)
      console.error('Favorite meals error:', error)
    }
    
    try {
      addResult('Testing favorite restaurants API...')
      const restaurants = await favoritesApi.getFavoriteRestaurants()
      addResult(`Favorite restaurants: ${restaurants.length} items`)
      console.log('Favorite restaurants:', restaurants)
    } catch (error: any) {
      addResult(`Favorite restaurants error: ${error.message}`)
      console.error('Favorite restaurants error:', error)
    }
    
    addResult('API tests completed.')
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          API Test Page
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Authentication Status</h2>
          <div className="space-y-2 text-sm">
            <div>Authenticated: {isAuthenticated ? '✅ Yes' : '❌ No'}</div>
            <div>User: {user?.username || 'None'}</div>
            <div>Token: {token ? '✅ Present' : '❌ Missing'}</div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">API Tests</h2>
            <button
              onClick={testFavoritesApis}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? 'Testing...' : 'Test Favorites APIs'}
            </button>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <div className="text-gray-500">Click "Test Favorites APIs" to run tests</div>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="mb-1">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}