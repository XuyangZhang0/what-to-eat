import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Search, Heart, Settings, Database } from 'lucide-react'

const navigationItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/search', icon: Search, label: 'Search' },
  { path: '/favorites', icon: Heart, label: 'Favorites' },
  { path: '/management', icon: Database, label: 'Manage' },
  { path: '/settings', icon: Settings, label: 'Settings' },
]

export default function BottomNavigation() {
  const location = useLocation()
  const navigate = useNavigate()

  // Hide bottom navigation on detail pages and management page
  if (location.pathname.includes('/meal/') || location.pathname.includes('/restaurant/') || location.pathname.includes('/management')) {
    return null
  }

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border safe-bottom"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-around px-4 py-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors relative ${
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label={item.label}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
              
              {isActive && (
                <motion.div
                  className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                  layoutId="activeTab"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          )
        })}
      </div>
    </motion.nav>
  )
}