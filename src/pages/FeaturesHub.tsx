import { motion } from 'framer-motion'
import { ArrowLeft, Heart, ShoppingCart, Sparkles, Zap, Brain, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Feature {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  color: string
  route: string
  badge?: string
}

const features: Feature[] = [
  {
    id: 'mood-suggestions',
    title: 'Mood-Based Suggestions',
    description: 'AI-powered food recommendations based on your current emotional state',
    icon: Heart,
    color: 'from-pink-500 to-rose-500',
    route: '/mood-suggestions',
    badge: 'NEW'
  },
  {
    id: 'smart-shopping',
    title: 'Smart Shopping Lists',
    description: 'Automatically generate organized shopping lists from your selected meals',
    icon: ShoppingCart,
    color: 'from-green-500 to-emerald-500',
    route: '/shopping-list',
    badge: 'NEW'
  },
  {
    id: 'animation-styles',
    title: 'Animation Styles',
    description: 'Choose between slot machine and powerball picker for random selections',
    icon: Sparkles,
    color: 'from-purple-500 to-violet-500',
    route: '/animation-demo'
  },
  {
    id: 'smart-favorites',
    title: 'Smart Favorites System',
    description: 'Discover and favorite items from other users with cross-user recommendations',
    icon: Star,
    color: 'from-yellow-500 to-orange-500',
    route: '/favorites'
  },
  {
    id: 'shake-detection',
    title: 'Shake Detection',
    description: 'Shake your device to instantly get random food suggestions',
    icon: Zap,
    color: 'from-blue-500 to-cyan-500',
    route: '/settings'
  },
  {
    id: 'ai-powered',
    title: 'AI-Powered Intelligence',
    description: 'Machine learning algorithms that learn your preferences over time',
    icon: Brain,
    color: 'from-indigo-500 to-purple-500',
    route: '/',
    badge: 'AI'
  }
]

export default function FeaturesHub() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
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
            ✨ Innovative Features
          </h1>
          
          <div className="w-16"></div> {/* Spacer for center alignment */}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Next-Generation Food Discovery
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Experience cutting-edge features that revolutionize how you discover, plan, and enjoy food. 
            Powered by AI, psychology, and innovative user experience design.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => navigate(feature.route)}
              >
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                  {/* Badge */}
                  {feature.badge && (
                    <div className="absolute top-4 right-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                        feature.badge === 'NEW' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-purple-500 text-white'
                      }`}>
                        {feature.badge}
                      </span>
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} p-4 mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-full h-full text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Arrow indicator */}
                  <div className="mt-4 flex items-center text-purple-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="mr-2">Explore</span>
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Innovation Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-8 border border-purple-200 dark:border-purple-800"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            🚀 Innovation Highlights
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">🧠</div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">AI-Powered</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Machine learning algorithms that understand your preferences
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">🎭</div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Psychology-Based</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Food recommendations based on emotional and psychological states
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">📱</div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Mobile-First</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Designed for smartphones with gesture controls and haptic feedback
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">🌟</div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">User-Centric</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Every feature designed to solve real problems and enhance user experience
              </p>
            </div>
          </div>
        </motion.div>

        {/* Coming Soon Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mt-12 text-center"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            🔮 Coming Soon
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              '🍳 Recipe Difficulty Progression',
              '🥘 Leftover Management',
              '🗣️ Voice Commands',
              '📸 Photo Recognition',
              '👥 Social Challenges',
              '⏰ Cooking Timers'
            ].map((feature, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm border border-gray-200 dark:border-gray-700"
              >
                {feature}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}