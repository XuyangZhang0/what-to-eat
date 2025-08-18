import { useState, useEffect, createContext, useContext } from 'react'

interface User {
  id: string
  username: string
  email: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function useAuthImplementation() {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored token on app initialization
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('auth_user')
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setToken(storedToken)
        setUser(parsedUser)
      } catch (error) {
        console.error('Error parsing stored user data:', error)
        // Clear invalid data
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      }
    }
    
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      const response = await fetch('http://10.0.6.165:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const result = await response.json()
        
        if (result.success && result.data) {
          const { token, user } = result.data
          
          setToken(token)
          setUser(user)
          
          localStorage.setItem('auth_token', token)
          localStorage.setItem('auth_user', JSON.stringify(user))
          
          return true
        } else {
          console.error('Login failed:', result.error || 'Unknown error')
          return false
        }
      } else {
        const errorResult = await response.json()
        console.error('Login failed:', response.status, errorResult.error)
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }

  const isAuthenticated = !!user && !!token

  return {
    user,
    token,
    login,
    logout,
    isAuthenticated,
    isLoading,
  }
}

export { AuthContext }