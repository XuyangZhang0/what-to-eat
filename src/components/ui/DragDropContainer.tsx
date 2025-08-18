import React, { useState, useRef } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { GripVertical } from 'lucide-react'
import { cn } from '@/utils/cn'

interface DragDropItem {
  id: string
  [key: string]: any
}

interface DragDropContainerProps<T extends DragDropItem> {
  items: T[]
  onReorder: (items: T[]) => void
  renderItem: (item: T, index: number, isDragging: boolean) => React.ReactNode
  className?: string
  direction?: 'vertical' | 'horizontal'
  showGripHandle?: boolean
  dragHandleClassName?: string
  itemClassName?: string
  disabled?: boolean
  hapticFeedback?: boolean
}

export function DragDropContainer<T extends DragDropItem>({
  items,
  onReorder,
  renderItem,
  className,
  direction = 'vertical',
  showGripHandle = true,
  dragHandleClassName,
  itemClassName,
  disabled = false,
  hapticFeedback = true,
}: DragDropContainerProps<T>) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const constraintsRef = useRef<HTMLDivElement>(null)

  const handleDragStart = (itemId: string) => {
    if (disabled) return
    
    setDraggedItem(itemId)
    
    // Haptic feedback on drag start
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(50)
    }
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    
    // Haptic feedback on drag end
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(20)
    }
  }

  const containerClasses = cn(
    'space-y-2',
    {
      'flex space-y-0 space-x-2': direction === 'horizontal',
      'opacity-50 pointer-events-none': disabled,
    },
    className
  )

  return (
    <div ref={constraintsRef} className={containerClasses}>
      <Reorder.Group
        axis={direction === 'vertical' ? 'y' : 'x'}
        values={items}
        onReorder={onReorder}
        className={direction === 'vertical' ? 'space-y-2' : 'flex space-x-2'}
      >
        <AnimatePresence>
          {items.map((item, index) => (
            <Reorder.Item
              key={item.id}
              value={item}
              onDragStart={() => handleDragStart(item.id)}
              onDragEnd={handleDragEnd}
              className={cn(
                'relative',
                itemClassName
              )}
              whileDrag={{
                scale: 1.05,
                zIndex: 50,
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                transition: { duration: 0.2 }
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative flex items-center group">
                {/* Drag Handle */}
                {showGripHandle && (
                  <motion.div
                    className={cn(
                      'flex items-center justify-center w-8 h-8 mr-2 cursor-grab active:cursor-grabbing',
                      'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
                      'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
                      {
                        'opacity-100': draggedItem === item.id,
                      },
                      dragHandleClassName
                    )}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <GripVertical className="w-5 h-5" />
                  </motion.div>
                )}

                {/* Item Content */}
                <div className="flex-1">
                  {renderItem(item, index, draggedItem === item.id)}
                </div>
              </div>

              {/* Visual feedback during drag */}
              {draggedItem === item.id && (
                <motion.div
                  className="absolute inset-0 bg-primary-500/10 dark:bg-primary-400/10 rounded-lg border-2 border-primary-500/50 dark:border-primary-400/50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>
    </div>
  )
}

// Specialized drag-drop components for common use cases
interface TagDragDropProps {
  tags: Array<{ id: string; name: string; color: string; [key: string]: any }>
  onReorder: (tags: any[]) => void
  renderTag: (tag: any, index: number, isDragging: boolean) => React.ReactNode
  disabled?: boolean
}

export function TagDragDrop({ tags, onReorder, renderTag, disabled }: TagDragDropProps) {
  return (
    <DragDropContainer
      items={tags}
      onReorder={onReorder}
      renderItem={renderTag}
      disabled={disabled}
      className="space-y-2"
      showGripHandle={true}
    />
  )
}

interface ListDragDropProps<T extends DragDropItem> {
  items: T[]
  onReorder: (items: T[]) => void
  renderItem: (item: T, index: number, isDragging: boolean) => React.ReactNode
  disabled?: boolean
  className?: string
}

export function ListDragDrop<T extends DragDropItem>({
  items,
  onReorder,
  renderItem,
  disabled,
  className,
}: ListDragDropProps<T>) {
  return (
    <DragDropContainer
      items={items}
      onReorder={onReorder}
      renderItem={renderItem}
      disabled={disabled}
      className={className}
      direction="vertical"
      showGripHandle={true}
    />
  )
}