import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Palette,
  Tag as TagIcon,
  TrendingUp,
  AlertCircle,
  GripVertical
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { Tag, CreateTagData, UpdateTagData } from '@/types/api'
import { tagsApi } from '@/services/api'
import SearchInput from '@/components/SearchInput'
import ConfirmDialog from '@/components/ConfirmDialog'
import { useToast, ToastContainer } from '@/components/Toast'
import { TagDragDrop } from '@/components/ui/DragDropContainer'
import { LoadingSkeleton, TagCardSkeleton } from '@/components/ui/LoadingSkeleton'
import { EnhancedButton, DangerButton } from '@/components/ui/EnhancedButton'

interface TagManagerProps {
  onClose?: () => void;
  compact?: boolean;
}

interface TagWithUsage extends Tag {
  mealCount?: number;
  restaurantCount?: number;
  totalCount?: number;
}

const DEFAULT_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308',
  '#84CC16', '#22C55E', '#10B981', '#14B8A6',
  '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
  '#8B5CF6', '#A855F7', '#D946EF', '#EC4899',
  '#F43F5E', '#64748B', '#6B7280', '#374151'
]

export default function TagManager({ onClose, compact = false }: TagManagerProps) {
  const { toasts, toast, removeToast } = useToast()
  
  const [tags, setTags] = useState<TagWithUsage[]>([])
  const [unusedTags, setUnusedTags] = useState<Tag[]>([])
  const [mostUsedTags, setMostUsedTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingTag, setEditingTag] = useState<TagWithUsage | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLORS[0])

  // Form states
  const [tagName, setTagName] = useState('')
  const [tagColor, setTagColor] = useState('')
  const [saving, setSaving] = useState(false)

  // Delete confirmation
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingTag, setDeletingTag] = useState<TagWithUsage | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Bulk delete unused
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)

  useEffect(() => {
    loadTags()
  }, [])

  const loadTags = async () => {
    try {
      setLoading(true)
      const [allTags, unused, mostUsed] = await Promise.all([
        tagsApi.getTags(),
        tagsApi.getUnusedTags(),
        tagsApi.getMostUsedTags(),
      ])

      // Load usage stats for all tags
      const tagsWithUsage = await Promise.all(
        allTags.map(async (tag) => {
          try {
            const usage = await tagsApi.getTagUsage(tag.id)
            return { ...tag, ...usage }
          } catch (error) {
            console.error(`Error loading usage for tag ${tag.id}:`, error)
            return { ...tag, mealCount: 0, restaurantCount: 0, totalCount: 0 }
          }
        })
      )

      setTags(tagsWithUsage)
      setUnusedTags(unused)
      setMostUsedTags(mostUsed)
    } catch (error) {
      console.error('Error loading tags:', error)
      toast.error('Failed to load tags. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddTag = async () => {
    if (!tagName.trim()) {
      toast.warning('Please enter a tag name')
      return
    }

    try {
      setSaving(true)
      const newTag = await tagsApi.createTag({
        name: tagName.trim(),
        color: tagColor || selectedColor,
      })
      setTags(prev => [...prev, { ...newTag, mealCount: 0, restaurantCount: 0, totalCount: 0 }])
      setTagName('')
      setTagColor('')
      setSelectedColor(DEFAULT_COLORS[0])
      setShowAddForm(false)
      toast.success(`Tag "${newTag.name}" created successfully`)
    } catch (error: any) {
      console.error('Error adding tag:', error)
      const errorMessage = error?.message?.includes('409') 
        ? 'A tag with this name already exists'
        : error?.message?.includes('400')
        ? 'Invalid tag data. Please check your input.'
        : 'Failed to create tag. Please try again.'
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateTag = async () => {
    if (!editingTag || !tagName.trim()) {
      toast.warning('Please enter a tag name')
      return
    }

    try {
      setSaving(true)
      const updatedTag = await tagsApi.updateTag(editingTag.id, {
        name: tagName.trim(),
        color: tagColor || editingTag.color,
      })
      setTags(prev => prev.map(tag => 
        tag.id === editingTag.id 
          ? { ...updatedTag, mealCount: tag.mealCount, restaurantCount: tag.restaurantCount, totalCount: tag.totalCount }
          : tag
      ))
      setEditingTag(null)
      setTagName('')
      setTagColor('')
      toast.success(`Tag "${updatedTag.name}" updated successfully`)
    } catch (error: any) {
      console.error('Error updating tag:', error)
      const errorMessage = error?.message?.includes('409') 
        ? 'A tag with this name already exists'
        : error?.message?.includes('400')
        ? 'Invalid tag data. Please check your input.'
        : 'Failed to update tag. Please try again.'
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const startEditTag = (tag: TagWithUsage) => {
    setEditingTag(tag)
    setTagName(tag.name)
    setTagColor(tag.color)
    setSelectedColor(tag.color)
  }

  const cancelEdit = () => {
    setEditingTag(null)
    setTagName('')
    setTagColor('')
    setSelectedColor(DEFAULT_COLORS[0])
    setShowAddForm(false)
  }

  const handleDeleteTag = (tag: TagWithUsage) => {
    setDeletingTag(tag)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!deletingTag) return

    try {
      setIsDeleting(true)
      await tagsApi.deleteTag(deletingTag.id)
      setTags(prev => prev.filter(t => t.id !== deletingTag.id))
      setUnusedTags(prev => prev.filter(t => t.id !== deletingTag.id))
    } catch (error) {
      console.error('Error deleting tag:', error)
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
      setDeletingTag(null)
    }
  }

  const handleBulkDeleteUnused = async () => {
    try {
      setIsBulkDeleting(true)
      await tagsApi.deleteUnusedTags()
      const unusedIds = new Set(unusedTags.map(t => t.id))
      setTags(prev => prev.filter(t => !unusedIds.has(t.id)))
      setUnusedTags([])
    } catch (error) {
      console.error('Error bulk deleting unused tags:', error)
    } finally {
      setIsBulkDeleting(false)
      setShowBulkDeleteDialog(false)
    }
  }

  if (loading) {
    return (
      <motion.div
        className={cn(
          'bg-white dark:bg-gray-800 rounded-2xl shadow-xl',
          compact ? 'p-4' : 'p-6'
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <LoadingSkeleton variant="text" width="150px" className="h-8 mb-2" />
            <LoadingSkeleton variant="text" width="100px" className="h-4" />
          </div>
          {onClose && (
            <LoadingSkeleton variant="circular" width={40} height={40} />
          )}
        </div>

        {/* Search and Add Button Skeleton */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <LoadingSkeleton variant="rounded" className="flex-1 h-12" />
          <LoadingSkeleton variant="rounded" width={120} height={48} />
        </div>

        {/* Tags List Skeleton */}
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <TagCardSkeleton key={index} />
          ))}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-2xl shadow-xl',
        compact ? 'p-4' : 'p-6'
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tag Manager</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {tags.length} tag{tags.length !== 1 ? 's' : ''} total
            {unusedTags.length > 0 && ` • ${unusedTags.length} unused`}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Stats */}
      {!compact && (mostUsedTags.length > 0 || unusedTags.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Most Used Tags */}
          {mostUsedTags.length > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                <h3 className="font-medium text-green-900 dark:text-green-100">Most Used</h3>
              </div>
              <div className="flex flex-wrap gap-1">
                {mostUsedTags.slice(0, 5).map(tag => (
                  <span
                    key={tag.id}
                    className="px-2 py-1 bg-green-100 dark:bg-green-800/30 text-green-700 dark:text-green-300 text-xs rounded-md"
                    style={{ borderLeft: `3px solid ${tag.color}` }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Unused Tags */}
          {unusedTags.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <h3 className="font-medium text-amber-900 dark:text-amber-100">Unused Tags</h3>
                </div>
                <button
                  onClick={() => setShowBulkDeleteDialog(true)}
                  className="text-xs text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 underline"
                >
                  Delete All
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {unusedTags.slice(0, 5).map(tag => (
                  <span
                    key={tag.id}
                    className="px-2 py-1 bg-amber-100 dark:bg-amber-800/30 text-amber-700 dark:text-amber-300 text-xs rounded-md"
                    style={{ borderLeft: `3px solid ${tag.color}` }}
                  >
                    {tag.name}
                  </span>
                ))}
                {unusedTags.length > 5 && (
                  <span className="px-2 py-1 bg-amber-100 dark:bg-amber-800/30 text-amber-700 dark:text-amber-300 text-xs rounded-md">
                    +{unusedTags.length - 5}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search and Add */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search tags..."
          />
        </div>
        <EnhancedButton
          onClick={() => setShowAddForm(true)}
          icon={<Plus className="w-4 h-4" />}
          variant="primary"
        >
          Add Tag
        </EnhancedButton>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {(showAddForm || editingTag) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6"
          >
            <div className="space-y-4">
              {/* Tag Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tag Name
                </label>
                <input
                  type="text"
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter tag name"
                  maxLength={50}
                />
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color
                </label>
                <div className="flex items-center gap-4">
                  {/* Color Picker */}
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={tagColor || selectedColor}
                      onChange={(e) => {
                        setTagColor(e.target.value)
                        setSelectedColor(e.target.value)
                      }}
                      className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Custom</span>
                  </div>
                  
                  {/* Preset Colors */}
                  <div className="flex flex-wrap gap-2">
                    {DEFAULT_COLORS.slice(0, 8).map(color => (
                      <button
                        key={color}
                        onClick={() => {
                          setTagColor(color)
                          setSelectedColor(color)
                        }}
                        className={cn(
                          'w-8 h-8 rounded border-2 transition-all',
                          (tagColor || selectedColor) === color 
                            ? 'border-gray-400 dark:border-gray-300 scale-110' 
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3">
                <EnhancedButton
                  onClick={editingTag ? handleUpdateTag : handleAddTag}
                  disabled={!tagName.trim() || saving}
                  isLoading={saving}
                  loadingText={editingTag ? 'Updating...' : 'Adding...'}
                  icon={<Check className="w-4 h-4" />}
                  variant="primary"
                >
                  {editingTag ? 'Update Tag' : 'Add Tag'}
                </EnhancedButton>
                <EnhancedButton
                  onClick={cancelEdit}
                  variant="outline"
                >
                  Cancel
                </EnhancedButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tags List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredTags.length === 0 ? (
          <motion.div 
            className="text-center py-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
            >
              <TagIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchQuery ? 'No tags found' : 'No tags yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery ? 'Try a different search term' : 'Create your first tag to get started'}
            </p>
          </motion.div>
        ) : (
          <TagDragDrop
            tags={filteredTags}
            onReorder={setTags}
            disabled={Boolean(searchQuery)} // Disable reordering when searching
            renderTag={(tag, index, isDragging) => (
              <motion.div
                layout
                className={cn(
                  "flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-all duration-200",
                  {
                    "shadow-lg scale-105": isDragging,
                    "hover:bg-gray-100 dark:hover:bg-gray-700": !isDragging,
                  }
                )}
                whileHover={!isDragging ? { scale: 1.01 } : undefined}
              >
                <div className="flex items-center gap-3 flex-1">
                  <motion.div
                    className="w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"
                    style={{ backgroundColor: tag.color }}
                    whileHover={{ scale: 1.2 }}
                    transition={{ duration: 0.2 }}
                  />
                  <div className="flex-1">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {tag.name}
                    </span>
                    {!compact && (
                      <motion.div 
                        className="text-xs text-gray-500 dark:text-gray-400 mt-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        {tag.totalCount || 0} uses
                        {tag.mealCount !== undefined && tag.restaurantCount !== undefined && (
                          <span className="ml-2">
                            ({tag.mealCount} meals, {tag.restaurantCount} restaurants)
                          </span>
                        )}
                      </motion.div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={() => startEditTag(tag)}
                    className="p-1 text-gray-400 hover:text-primary-500 rounded transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Edit3 className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    onClick={() => handleDeleteTag(tag)}
                    className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          />
        )}
        
        {/* Drag hint */}
        {filteredTags.length > 1 && !searchQuery && (
          <motion.p 
            className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4 flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <GripVertical className="w-3 h-3" />
            Drag tags to reorder them
          </motion.p>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Tag"
        message={`Are you sure you want to delete "${deletingTag?.name}"? This will remove the tag from all meals and restaurants that use it.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteDialog(false)
          setDeletingTag(null)
        }}
        isLoading={isDeleting}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showBulkDeleteDialog}
        title="Delete Unused Tags"
        message={`Are you sure you want to delete all ${unusedTags.length} unused tags? This action cannot be undone.`}
        confirmText="Delete All"
        cancelText="Cancel"
        variant="warning"
        onConfirm={handleBulkDeleteUnused}
        onCancel={() => setShowBulkDeleteDialog(false)}
        isLoading={isBulkDeleting}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </motion.div>
  )
}