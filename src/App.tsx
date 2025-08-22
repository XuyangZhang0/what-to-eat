import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from './hooks/useTheme'
import { useShakeDetection } from './hooks/useShakeDetection'
import { useAuth } from './hooks/useAuth'
import { AuthProvider } from './components/AuthProvider'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import Home from './pages/Home'
import Search from './pages/Search'
import Favorites from './pages/Favorites'
import Settings from './pages/Settings'
import MealDetail from './pages/MealDetail'
import RestaurantDetail from './pages/RestaurantDetail'
import Management from './pages/Management'
import SlotMachineDemo from './pages/SlotMachineDemo'
import AnimationDemo from './pages/AnimationDemo'
import MoodBasedSuggestions from './pages/MoodBasedSuggestions'
import SmartShoppingListPage from './pages/SmartShoppingListPage'
import FeaturesHub from './pages/FeaturesHub'
import Login from './pages/Login'

function AppContent() {
  const { theme } = useTheme()
  const { isShaking } = useShakeDetection()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    // Apply theme class to document
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <motion.div 
      className={`min-h-screen bg-background text-foreground ${isShaking ? 'animate-shake' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/search" element={
            <Layout>
              <Search />
            </Layout>
          } />
          {isAuthenticated ? (
            <>
              <Route path="/" element={
                <Layout>
                  <Home />
                </Layout>
              } />
              <Route path="/favorites" element={
                <Layout>
                  <Favorites />
                </Layout>
              } />
              <Route path="/management" element={
                <Layout>
                  <ErrorBoundary>
                    <Management />
                  </ErrorBoundary>
                </Layout>
              } />
              <Route path="/settings" element={
                <Layout>
                  <Settings />
                </Layout>
              } />
              <Route path="/meal/:id" element={
                <Layout>
                  <MealDetail />
                </Layout>
              } />
              <Route path="/restaurant/:id" element={
                <Layout>
                  <RestaurantDetail />
                </Layout>
              } />
              <Route path="/slot-machine" element={
                <Layout>
                  <ErrorBoundary>
                    <SlotMachineDemo />
                  </ErrorBoundary>
                </Layout>
              } />
              <Route path="/animation-demo" element={
                <Layout>
                  <AnimationDemo />
                </Layout>
              } />
              <Route path="/mood-suggestions" element={
                <Layout>
                  <MoodBasedSuggestions />
                </Layout>
              } />
              <Route path="/shopping-list" element={
                <Layout>
                  <SmartShoppingListPage />
                </Layout>
              } />
              <Route path="/features" element={
                <Layout>
                  <FeaturesHub />
                </Layout>
              } />
            </>
          ) : (
            <Route path="*" element={<Navigate to="/login" replace />} />
          )}
        </Routes>
      </AnimatePresence>
    </motion.div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App