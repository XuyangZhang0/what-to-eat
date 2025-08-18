import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '../../../test/utils/test-utils'
import TagManager from '../index'
import { tagsApi } from '@/services/api'
import { Tag } from '@/types/api'

// Mock the API
vi.mock('@/services/api', () => ({
  tagsApi: {
    getTags: vi.fn(),
    createTag: vi.fn(),
    updateTag: vi.fn(),
    deleteTag: vi.fn(),
    getUnusedTags: vi.fn(),
    getMostUsedTags: vi.fn(),
    getTagUsage: vi.fn(),
    deleteUnusedTags: vi.fn(),
  },
}))

const mockTags: Tag[] = [
  { id: '1', name: 'Vegetarian', color: '#22C55E' },
  { id: '2', name: 'Quick', color: '#3B82F6' },
  { id: '3', name: 'Spicy', color: '#EF4444' },
]

const mockTagsWithUsage = [
  { ...mockTags[0], mealCount: 5, restaurantCount: 2, totalCount: 7 },
  { ...mockTags[1], mealCount: 3, restaurantCount: 1, totalCount: 4 },
  { ...mockTags[2], mealCount: 0, restaurantCount: 0, totalCount: 0 },
]

describe('TagManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Setup default mocks
    vi.mocked(tagsApi.getTags).mockResolvedValue(mockTags)
    vi.mocked(tagsApi.getUnusedTags).mockResolvedValue([mockTags[2]])
    vi.mocked(tagsApi.getMostUsedTags).mockResolvedValue([mockTags[0], mockTags[1]])
    vi.mocked(tagsApi.getTagUsage).mockImplementation(async (id) => {
      const tag = mockTagsWithUsage.find(t => t.id === id)
      return {
        mealCount: tag?.mealCount || 0,
        restaurantCount: tag?.restaurantCount || 0,
        totalCount: tag?.totalCount || 0,
      }
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Rendering and Initial State', () => {
    it('should render tag manager with loading state initially', () => {
      render(<TagManager />)
      
      expect(screen.getByText('Tag Manager')).toBeInTheDocument()
      expect(screen.getByRole('status')).toBeInTheDocument() // Loading spinner
    })

    it('should render tags after loading', async () => {
      render(<TagManager />)
      
      await waitFor(() => {
        expect(screen.getByText('Vegetarian')).toBeInTheDocument()
        expect(screen.getByText('Quick')).toBeInTheDocument()
        expect(screen.getByText('Spicy')).toBeInTheDocument()
      })
      
      expect(screen.getByText('3 tags total')).toBeInTheDocument()
    })

    it('should show unused tags count', async () => {
      render(<TagManager />)
      
      await waitFor(() => {
        expect(screen.getByText('3 tags total • 1 unused')).toBeInTheDocument()
      })
    })

    it('should render with compact prop', async () => {
      render(<TagManager compact />)
      
      await waitFor(() => {
        expect(screen.getByText('Tag Manager')).toBeInTheDocument()
      })
      
      // Should not show stats in compact mode
      expect(screen.queryByText('Most Used')).not.toBeInTheDocument()
    })

    it('should render close button when onClose prop provided', async () => {
      const onClose = vi.fn()
      render(<TagManager onClose={onClose} />)
      
      await waitFor(() => {
        const closeButton = screen.getByRole('button', { name: /close/i })
        expect(closeButton).toBeInTheDocument()
        
        fireEvent.click(closeButton)
        expect(onClose).toHaveBeenCalled()
      })
    })
  })

  describe('Tag Display and Statistics', () => {
    it('should display most used tags section', async () => {
      render(<TagManager />)
      
      await waitFor(() => {
        expect(screen.getByText('Most Used')).toBeInTheDocument()
        expect(screen.getByText('Vegetarian')).toBeInTheDocument()
        expect(screen.getByText('Quick')).toBeInTheDocument()
      })
    })

    it('should display unused tags section with delete all option', async () => {
      render(<TagManager />)
      
      await waitFor(() => {
        expect(screen.getByText('Unused Tags')).toBeInTheDocument()
        expect(screen.getByText('Spicy')).toBeInTheDocument()
        expect(screen.getByText('Delete All')).toBeInTheDocument()
      })
    })

    it('should show tag usage statistics', async () => {
      render(<TagManager />)
      
      await waitFor(() => {
        expect(screen.getByText('7 uses')).toBeInTheDocument()
        expect(screen.getByText('(5 meals, 2 restaurants)')).toBeInTheDocument()
      })
    })
  })

  describe('Search Functionality', () => {
    it('should filter tags based on search query', async () => {
      render(<TagManager />)
      
      await waitFor(() => {
        expect(screen.getByText('Vegetarian')).toBeInTheDocument()
      })
      
      const searchInput = screen.getByPlaceholderText('Search tags...')
      fireEvent.change(searchInput, { target: { value: 'Veg' } })
      
      expect(screen.getByText('Vegetarian')).toBeInTheDocument()
      expect(screen.queryByText('Quick')).not.toBeInTheDocument()
      expect(screen.queryByText('Spicy')).not.toBeInTheDocument()
    })

    it('should show no results message when search yields no matches', async () => {
      render(<TagManager />)
      
      await waitFor(() => {
        expect(screen.getByText('Vegetarian')).toBeInTheDocument()
      })
      
      const searchInput = screen.getByPlaceholderText('Search tags...')
      fireEvent.change(searchInput, { target: { value: 'NonExistent' } })
      
      expect(screen.getByText('No tags found')).toBeInTheDocument()
      expect(screen.getByText('Try a different search term')).toBeInTheDocument()
    })

    it('should clear search when input is emptied', async () => {
      render(<TagManager />)
      
      await waitFor(() => {
        expect(screen.getByText('Vegetarian')).toBeInTheDocument()
      })
      
      const searchInput = screen.getByPlaceholderText('Search tags...')
      fireEvent.change(searchInput, { target: { value: 'Veg' } })
      
      expect(screen.queryByText('Quick')).not.toBeInTheDocument()
      
      fireEvent.change(searchInput, { target: { value: '' } })
      
      expect(screen.getByText('Quick')).toBeInTheDocument()
    })
  })

  describe('Tag Creation', () => {
    it('should open add tag form when Add Tag button is clicked', async () => {
      render(<TagManager />)
      
      await waitFor(() => {
        const addButton = screen.getByText('Add Tag')
        fireEvent.click(addButton)
      })
      
      expect(screen.getByLabelText('Tag Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Color')).toBeInTheDocument()
      expect(screen.getByText('Add Tag', { selector: 'button' })).toBeInTheDocument()
    })

    it('should create new tag with valid data', async () => {
      const newTag = { id: '4', name: 'Healthy', color: '#10B981' }
      vi.mocked(tagsApi.createTag).mockResolvedValue(newTag)
      
      render(<TagManager />)
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Add Tag'))
      })
      
      const nameInput = screen.getByLabelText('Tag Name')
      const colorInput = screen.getByDisplayValue('#EF4444') // Default color
      const submitButton = screen.getByText('Add Tag', { selector: 'button' })
      
      fireEvent.change(nameInput, { target: { value: 'Healthy' } })
      fireEvent.change(colorInput, { target: { value: '#10B981' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(tagsApi.createTag).toHaveBeenCalledWith({
          name: 'Healthy',
          color: '#10B981',
        })
      })
    })

    it('should validate tag name is required', async () => {
      render(<TagManager />)
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Add Tag'))
      })
      
      const submitButton = screen.getByText('Add Tag', { selector: 'button' })
      expect(submitButton).toBeDisabled()
    })

    it('should trim whitespace from tag name', async () => {
      const newTag = { id: '4', name: 'Healthy', color: '#10B981' }
      vi.mocked(tagsApi.createTag).mockResolvedValue(newTag)
      
      render(<TagManager />)
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Add Tag'))
      })
      
      const nameInput = screen.getByLabelText('Tag Name')
      const submitButton = screen.getByText('Add Tag', { selector: 'button' })
      
      fireEvent.change(nameInput, { target: { value: '  Healthy  ' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(tagsApi.createTag).toHaveBeenCalledWith({
          name: 'Healthy',
          color: '#EF4444', // Default color
        })
      })
    })

    it('should use preset color when clicked', async () => {
      render(<TagManager />)
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Add Tag'))
      })
      
      // Click on the second preset color (orange)
      const presetColors = screen.getAllByRole('button').filter(btn => 
        btn.style.backgroundColor && btn !== screen.getByText('Add Tag')
      )
      fireEvent.click(presetColors[1])
      
      const colorInput = screen.getByDisplayValue('#F97316')
      expect(colorInput).toBeInTheDocument()
    })

    it('should cancel tag creation', async () => {
      render(<TagManager />)
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Add Tag'))
      })
      
      expect(screen.getByLabelText('Tag Name')).toBeInTheDocument()
      
      fireEvent.click(screen.getByText('Cancel'))
      
      expect(screen.queryByLabelText('Tag Name')).not.toBeInTheDocument()
    })

    it('should show loading state during tag creation', async () => {
      let resolveCreate: (value: any) => void
      const createPromise = new Promise(resolve => {
        resolveCreate = resolve
      })
      vi.mocked(tagsApi.createTag).mockReturnValue(createPromise as any)
      
      render(<TagManager />)
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Add Tag'))
      })
      
      const nameInput = screen.getByLabelText('Tag Name')
      fireEvent.change(nameInput, { target: { value: 'Test' } })
      fireEvent.click(screen.getByText('Add Tag', { selector: 'button' }))
      
      expect(screen.getByText('Adding...')).toBeInTheDocument()
      
      resolveCreate!({ id: '4', name: 'Test', color: '#EF4444' })
      
      await waitFor(() => {
        expect(screen.queryByText('Adding...')).not.toBeInTheDocument()
      })
    })
  })

  describe('Tag Editing', () => {
    it('should open edit form when edit button is clicked', async () => {
      render(<TagManager />)
      
      await waitFor(() => {
        const editButtons = screen.getAllByRole('button', { name: /edit/i })
        fireEvent.click(editButtons[0])
      })
      
      expect(screen.getByDisplayValue('Vegetarian')).toBeInTheDocument()
      expect(screen.getByDisplayValue('#22C55E')).toBeInTheDocument()
      expect(screen.getByText('Update Tag')).toBeInTheDocument()
    })

    it('should update tag with new data', async () => {
      const updatedTag = { id: '1', name: 'Vegan', color: '#16A34A' }
      vi.mocked(tagsApi.updateTag).mockResolvedValue(updatedTag)
      
      render(<TagManager />)
      
      await waitFor(() => {
        const editButtons = screen.getAllByRole('button', { name: /edit/i })
        fireEvent.click(editButtons[0])
      })
      
      const nameInput = screen.getByDisplayValue('Vegetarian')
      fireEvent.change(nameInput, { target: { value: 'Vegan' } })
      fireEvent.click(screen.getByText('Update Tag'))
      
      await waitFor(() => {
        expect(tagsApi.updateTag).toHaveBeenCalledWith('1', {
          name: 'Vegan',
          color: '#22C55E',
        })
      })
    })

    it('should cancel tag editing', async () => {
      render(<TagManager />)
      
      await waitFor(() => {
        const editButtons = screen.getAllByRole('button', { name: /edit/i })
        fireEvent.click(editButtons[0])
      })
      
      expect(screen.getByDisplayValue('Vegetarian')).toBeInTheDocument()
      
      fireEvent.click(screen.getByText('Cancel'))
      
      expect(screen.queryByDisplayValue('Vegetarian')).not.toBeInTheDocument()
    })
  })

  describe('Tag Deletion', () => {
    it('should show confirmation dialog when delete button is clicked', async () => {
      render(<TagManager />)
      
      await waitFor(() => {
        const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
        fireEvent.click(deleteButtons[0])
      })
      
      expect(screen.getByText('Delete Tag')).toBeInTheDocument()
      expect(screen.getByText(/Are you sure you want to delete "Vegetarian"/)).toBeInTheDocument()
    })

    it('should delete tag when confirmed', async () => {
      vi.mocked(tagsApi.deleteTag).mockResolvedValue({ success: true })
      
      render(<TagManager />)
      
      await waitFor(() => {
        const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
        fireEvent.click(deleteButtons[0])
      })
      
      fireEvent.click(screen.getByText('Delete', { selector: 'button' }))
      
      await waitFor(() => {
        expect(tagsApi.deleteTag).toHaveBeenCalledWith('1')
      })
    })

    it('should cancel tag deletion', async () => {
      render(<TagManager />)
      
      await waitFor(() => {
        const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
        fireEvent.click(deleteButtons[0])
      })
      
      fireEvent.click(screen.getByText('Cancel', { selector: 'button' }))
      
      expect(screen.queryByText('Delete Tag')).not.toBeInTheDocument()
    })
  })

  describe('Bulk Operations', () => {
    it('should show bulk delete confirmation when Delete All is clicked', async () => {
      render(<TagManager />)
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Delete All'))
      })
      
      expect(screen.getByText('Delete Unused Tags')).toBeInTheDocument()
      expect(screen.getByText(/Are you sure you want to delete all 1 unused tags/)).toBeInTheDocument()
    })

    it('should perform bulk delete when confirmed', async () => {
      vi.mocked(tagsApi.deleteUnusedTags).mockResolvedValue({ success: true, deletedCount: 1 })
      
      render(<TagManager />)
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Delete All'))
      })
      
      fireEvent.click(screen.getByText('Delete All', { selector: 'button' }))
      
      await waitFor(() => {
        expect(tagsApi.deleteUnusedTags).toHaveBeenCalled()
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors during tag loading', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(tagsApi.getTags).mockRejectedValue(new Error('API Error'))
      
      render(<TagManager />)
      
      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith('Error loading tags:', expect.any(Error))
      })
      
      consoleError.mockRestore()
    })

    it('should handle API errors during tag creation', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(tagsApi.createTag).mockRejectedValue(new Error('Creation failed'))
      
      render(<TagManager />)
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Add Tag'))
      })
      
      const nameInput = screen.getByLabelText('Tag Name')
      fireEvent.change(nameInput, { target: { value: 'Test' } })
      fireEvent.click(screen.getByText('Add Tag', { selector: 'button' }))
      
      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith('Error adding tag:', expect.any(Error))
      })
      
      consoleError.mockRestore()
    })
  })

  describe('Empty States', () => {
    it('should show empty state when no tags exist', async () => {
      vi.mocked(tagsApi.getTags).mockResolvedValue([])
      vi.mocked(tagsApi.getUnusedTags).mockResolvedValue([])
      vi.mocked(tagsApi.getMostUsedTags).mockResolvedValue([])
      
      render(<TagManager />)
      
      await waitFor(() => {
        expect(screen.getByText('No tags yet')).toBeInTheDocument()
        expect(screen.getByText('Create your first tag to get started')).toBeInTheDocument()
      })
    })

    it('should show proper count when no unused tags exist', async () => {
      vi.mocked(tagsApi.getUnusedTags).mockResolvedValue([])
      
      render(<TagManager />)
      
      await waitFor(() => {
        expect(screen.getByText('3 tags total')).toBeInTheDocument()
        expect(screen.queryByText('unused')).not.toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels for color picker', async () => {
      render(<TagManager />)
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Add Tag'))
      })
      
      const colorInput = screen.getByDisplayValue('#EF4444')
      expect(colorInput).toHaveAttribute('type', 'color')
    })

    it('should have proper button roles for actions', async () => {
      render(<TagManager />)
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Add Tag/i })).toBeInTheDocument()
      })
    })
  })
})