import { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from './Header'
import BottomNavigation from './BottomNavigation'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 pb-16 safe-bottom">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          {children}
        </motion.div>
      </main>

      <BottomNavigation />
    </div>
  )
}