import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Shuffle, Heart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import MoodSelector from '@/components/MoodSelector'
import SlotMachine from '@/components/SlotMachine'
import PowerballPicker from '@/components/PowerballPicker'
import type { SlotItem } from '@/components/SlotMachine/types'

export default function MoodBasedSuggestions() {
  const navigate = useNavigate()
  const [suggestions, setSuggestions] = useState<SlotItem[]>([])
  const [selectedItem, setSelectedItem] = useState<SlotItem | null>(null)
  const [animationStyle, setAnimationStyle] = useState(() => {
    const saved = localStorage.getItem('animation_style')
    return saved === 'powerball' ? 'powerball' : 'slot-machine'
  })

  const handleMoodSelection = useCallback((moodSuggestions: SlotItem[]) => {
    setSuggestions(moodSuggestions)
    setSelectedItem(null)
  }, [])

  const handleItemSelection = useCallback((item: SlotItem) => {
    setSelectedItem(item)
  }, [])

  const handleViewDetails = () => {
    if (selectedItem) {
      if (selectedItem.type === 'meal') {
        navigate(`/meal/${selectedItem.id}`)
      } else {
        navigate(`/restaurant/${selectedItem.id}`)
      }
    }
  }

  const resetSuggestions = () => {
    setSuggestions([])
    setSelectedItem(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800">
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
            🧠 Mood-Based Suggestions
          </h1>
          
          <div className="w-16"></div> {/* Spacer for center alignment */}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <AnimatePresence mode="wait">
          {suggestions.length === 0 ? (
            <motion.div
              key="mood-selector"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <MoodSelector onMoodSelect={handleMoodSelection} />
            </motion.div>
          ) : (
            <motion.div
              key="suggestions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Header with results */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Perfect Matches for Your Mood
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Found {suggestions.length} items that match your emotional state
                </p>
                <button
                  onClick={resetSuggestions}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Try Different Mood
                </button>
              </div>

              {/* Random Selection Animation */}
              <div className="flex justify-center">
                {animationStyle === 'slot-machine' ? (
                  <SlotMachine
                    items={suggestions}
                    onSelection={handleItemSelection}
                    soundEnabled={true}
                    spinDuration={2500}
                    celebrationDuration={2000}
                    reelCount={3}
                  />
                ) : (
                  <PowerballPicker
                    items={suggestions}
                    onSelection={handleItemSelection}
                    soundEnabled={true}
                    drawDuration={3000}
                    ballCount={Math.min(10, suggestions.length)}
                  />
                )}
              </div>

              {/* Suggestion Grid */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    All Mood Matches
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {suggestions.length} items
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {suggestions.map((item, index) => (
                    <motion.div
                      key={`${item.type}-${item.id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200 cursor-pointer group"
                      whileHover={{ scale: 1.02 }}
                      onClick={() => {
                        if (item.type === 'meal') {
                          navigate(`/meal/${item.id}`)
                        } else {
                          navigate(`/restaurant/${item.id}`)
                        }
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-3xl">{item.emoji || (item.type === 'meal' ? '🍽️' : '🏪')}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                              {item.name}
                            </h4>
                            {item.isFavorite && <Heart className="w-4 h-4 text-red-500 fill-current" />}
                          </div>
                          
                          {item.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                          
                          <div className="flex flex-wrap gap-1">
                            {item.cuisine && (
                              <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs">
                                {item.cuisine}
                              </span>
                            )}
                            {item.category && (
                              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                                {item.category}
                              </span>
                            )}
                            {item.type === 'meal' && item.difficulty && (
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs">
                                {item.difficulty}
                              </span>
                            )}
                            {item.type === 'restaurant' && item.rating && (
                              <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-xs">
                                ⭐ {item.rating}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Selected Item Detail */}
              <AnimatePresence>
                {selectedItem && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border-2 border-purple-400 dark:border-purple-500"
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3">{selectedItem.emoji || '🎯'}</div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Perfect Match! 
                      </h3>
                      <h4 className="text-xl font-semibold text-purple-600 dark:text-purple-400 mb-2">
                        {selectedItem.name}
                      </h4>
                      
                      {selectedItem.description && (
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {selectedItem.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap justify-center gap-2 mb-6">
                        {selectedItem.category && (
                          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                            {selectedItem.category}
                          </span>
                        )}
                        {selectedItem.cuisine && (
                          <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-sm">
                            {selectedItem.cuisine}
                          </span>
                        )}
                        {selectedItem.type === 'meal' && selectedItem.difficulty && (
                          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm">
                            {selectedItem.difficulty}
                          </span>
                        )}
                        {selectedItem.type === 'meal' && selectedItem.cookingTime && (
                          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                            {selectedItem.cookingTime}m
                          </span>
                        )}
                      </div>

                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={handleViewDetails}
                          className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
                        >
                          View Full Details
                        </button>
                        <button
                          onClick={() => setSelectedItem(null)}
                          className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200 dark:border-purple-800"
        >
          <h3 className="text-xl font-semibold text-purple-900 dark:text-purple-200 mb-4 text-center">
            🧠 How Mood-Based Suggestions Work
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl mb-2">🎭</div>
              <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-1">Mood Analysis</h4>
              <p className="text-purple-700 dark:text-purple-400">
                Select your current emotional state from our scientifically-backed mood categories
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl mb-2">🧪</div>
              <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-1">Smart Matching</h4>
              <p className="text-purple-700 dark:text-purple-400">
                AI algorithms match your mood with foods proven to enhance that emotional state
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl mb-2">✨</div>
              <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-1">Personalized Results</h4>
              <p className="text-purple-700 dark:text-purple-400">
                Get curated suggestions from your favorites that perfectly match your mood
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}