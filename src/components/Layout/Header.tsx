import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Search, Settings, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'What to Eat'
      case '/search':
        return 'Search'
      case '/favorites':
        return 'Favorites'
      case '/settings':
        return 'Settings'
      default:
        if (location.pathname.startsWith('/meal/')) return 'Meal Details'
        if (location.pathname.startsWith('/restaurant/')) return 'Restaurant Details'
        return 'What to Eat'
    }
  }

  const showBackButton = location.pathname !== '/'
  const showSearchButton = location.pathname === '/'
  const showSettingsButton = location.pathname === '/'

  const handleMenuClose = () => setIsMenuOpen(false)

  return (
    <>
      <motion.header
        className="sticky top-0 z-50 glass dark:glass-dark border-b border-border safe-top"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3, type: "spring", stiffness: 400 }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left side */}
          <div className="flex items-center">
            {showBackButton ? (
              <motion.button
                onClick={() => navigate(-1)}
                className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors focus-ring"
                aria-label="Go back"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
            ) : (
              <div className="w-9" /> // Placeholder for spacing
            )}
          </div>

          {/* Center - Title */}
          <motion.h1
            className="text-lg font-semibold text-center text-balance"
            key={location.pathname}
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 400 }}
          >
            {getPageTitle()}
          </motion.h1>

          {/* Right side - Desktop */}
          <div className="hidden sm:flex items-center space-x-1">
            {showSearchButton && (
              <motion.button
                onClick={() => navigate('/search')}
                className="p-2 rounded-full hover:bg-muted transition-colors focus-ring"
                aria-label="Search"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Search className="w-5 h-5" />
              </motion.button>
            )}
            {showSettingsButton && (
              <motion.button
                onClick={() => navigate('/settings')}
                className="p-2 rounded-full hover:bg-muted transition-colors focus-ring"
                aria-label="Settings"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Settings className="w-5 h-5" />
              </motion.button>
            )}
            <motion.button
              onClick={logout}
              className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors focus-ring"
              aria-label="Logout"
              title={`Logout (${user?.email || 'User'})`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Right side - Mobile Menu Toggle */}
          <div className="sm:hidden">
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-full hover:bg-muted transition-colors focus-ring"
              aria-label="Toggle menu"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm sm:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleMenuClose}
            />

            {/* Menu */}
            <motion.div
              className="fixed top-[72px] right-4 z-50 w-56 glass dark:glass-dark rounded-2xl shadow-strong p-2 sm:hidden"
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: 0,
                transition: { type: "spring", stiffness: 400, damping: 25 }
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.95, 
                y: -10,
                transition: { duration: 0.2 }
              }}
            >
              <div className="space-y-1">
                {showSearchButton && (
                  <motion.button
                    onClick={() => {
                      navigate('/search')
                      handleMenuClose()
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl hover:bg-muted transition-colors focus-ring"
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Search className="w-5 h-5" />
                    <span className="font-medium">Search</span>
                  </motion.button>
                )}
                {showSettingsButton && (
                  <motion.button
                    onClick={() => {
                      navigate('/settings')
                      handleMenuClose()
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl hover:bg-muted transition-colors focus-ring"
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Settings className="w-5 h-5" />
                    <span className="font-medium">Settings</span>
                  </motion.button>
                )}
                <div className="h-px bg-border mx-2 my-2" />
                <motion.button
                  onClick={() => {
                    logout()
                    handleMenuClose()
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors focus-ring"
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <LogOut className="w-5 h-5" />
                  <div>
                    <div className="font-medium">Logout</div>
                    <div className="text-xs opacity-60">{user?.email}</div>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}