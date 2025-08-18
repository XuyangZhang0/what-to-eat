import React from 'react'
import { AuthContext, useAuthImplementation } from '@/hooks/useAuth'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuthImplementation()
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}