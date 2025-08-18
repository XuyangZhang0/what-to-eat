import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Star, Settings, Plus, Save, Search } from 'lucide-react'
import {
  EnhancedButton,
  PrimaryButton,
  SecondaryButton,
  OutlineButton,
  GhostButton,
  DangerButton,
  EnhancedInput,
  LoadingSkeleton,
  MealCardSkeleton,
  TagCardSkeleton,
  FormSkeleton,
  DragDropContainer,
} from './index'

// Demo component to showcase all enhanced UI components
export default function UIShowcase() {
  const [inputValue, setInputValue] = useState('')
  const [items, setItems] = useState([
    { id: '1', name: 'Item 1' },
    { id: '2', name: 'Item 2' },
    { id: '3', name: 'Item 3' },
  ])

  return (
    <div className="p-8 space-y-12 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold mb-4">Enhanced UI Components Showcase</h1>
        <p className="text-gray-600 dark:text-gray-400">
          State-of-the-art components with animations, accessibility, and modern design
        </p>
      </motion.div>

      {/* Enhanced Buttons */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Enhanced Buttons</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <PrimaryButton icon={<Heart className="w-4 h-4" />}>
            Primary Button
          </PrimaryButton>
          <SecondaryButton icon={<Star className="w-4 h-4" />}>
            Secondary Button
          </SecondaryButton>
          <OutlineButton icon={<Settings className="w-4 h-4" />}>
            Outline Button
          </OutlineButton>
          <GhostButton icon={<Search className="w-4 h-4" />}>
            Ghost Button
          </GhostButton>
          <DangerButton icon={<Plus className="w-4 h-4" />}>
            Danger Button
          </DangerButton>
          <EnhancedButton
            variant="primary"
            isLoading={true}
            loadingText="Saving..."
            icon={<Save className="w-4 h-4" />}
          >
            Loading Button
          </EnhancedButton>
        </div>
      </section>

      {/* Enhanced Inputs */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Enhanced Inputs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EnhancedInput
            label="Standard Input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter some text..."
            leftIcon={<Search className="w-5 h-5" />}
          />
          <EnhancedInput
            label="Input with Success"
            value="Valid input"
            onChange={() => {}}
            success="This looks great!"
            leftIcon={<Heart className="w-5 h-5" />}
          />
          <EnhancedInput
            label="Input with Error"
            value="Invalid"
            onChange={() => {}}
            error="This field is required"
            leftIcon={<Star className="w-5 h-5" />}
          />
          <EnhancedInput
            label="Password Input"
            type="password"
            value="password123"
            onChange={() => {}}
            showPasswordToggle={true}
            hint="Use a strong password"
          />
        </div>
      </section>

      {/* Loading Skeletons */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Loading Skeletons</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Skeletons</h3>
            <LoadingSkeleton variant="text" />
            <LoadingSkeleton variant="text" width="75%" />
            <LoadingSkeleton variant="circular" width={64} height={64} />
            <LoadingSkeleton variant="rectangular" width="100%" height={100} />
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Complex Skeletons</h3>
            <MealCardSkeleton />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Tag List Skeleton</h3>
          <TagCardSkeleton />
          <TagCardSkeleton />
          <TagCardSkeleton />
        </div>
      </section>

      {/* Drag and Drop */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Drag & Drop</h2>
        <div className="max-w-md">
          <DragDropContainer
            items={items}
            onReorder={setItems}
            renderItem={(item, index, isDragging) => (
              <div className={`p-4 bg-white dark:bg-gray-800 rounded-lg border ${
                isDragging ? 'border-primary-500' : 'border-gray-200 dark:border-gray-700'
              }`}>
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-gray-500">Drag me around!</div>
              </div>
            )}
          />
        </div>
      </section>

      {/* Form Skeleton */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Form Skeleton</h2>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <FormSkeleton />
        </div>
      </section>

      {/* Animation Examples */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Animation Examples</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            className="p-6 bg-gradient-primary rounded-xl text-white text-center"
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="font-semibold">Hover & Tap</div>
            <div className="text-sm opacity-90">Interactive card</div>
          </motion.div>
          
          <motion.div
            className="p-6 bg-gradient-secondary rounded-xl text-white text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="font-semibold">Slide Up</div>
            <div className="text-sm opacity-90">On page load</div>
          </motion.div>
          
          <motion.div
            className="p-6 bg-purple-500 rounded-xl text-white text-center"
            animate={{ 
              background: [
                "rgb(168 85 247)",
                "rgb(236 72 153)", 
                "rgb(168 85 247)"
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div className="font-semibold">Color Shift</div>
            <div className="text-sm opacity-90">Continuous animation</div>
          </motion.div>
          
          <motion.div
            className="p-6 bg-blue-500 rounded-xl text-white text-center cursor-pointer"
            whileHover={{ 
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              y: -5
            }}
          >
            <div className="font-semibold">Shadow Lift</div>
            <div className="text-sm opacity-90">Hover effect</div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}