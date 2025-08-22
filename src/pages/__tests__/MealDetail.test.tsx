import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import MealDetail from '../MealDetail'
import * as useMealModule from '../../hooks/useMeal'
import { Meal } from '../../types'

// Mock the useMeal hook
vi.mock('../../hooks/useMeal')
vi.mock('../../services/api')

// Mock React Router params
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ id: '123' }),
    useNavigate: () => vi.fn(),
  }
})

const mockMeal: Meal = {
  id: '123',
  name: 'Chicken Teriyaki Bowl',
  description: 'Tender chicken glazed with homemade teriyaki sauce',
  cuisine_type: 'Japanese',
  difficulty_level: 'medium',
  prep_time: 25,
  tags: [
    { id: 1, name: 'healthy', color: '#green' },
    { id: 2, name: 'protein-rich', color: '#blue' }
  ],
  ingredients: [
    '2 chicken breasts, sliced',
    '2 cups jasmine rice',
    '1/4 cup soy sauce'
  ],
  instructions: [
    'Cook jasmine rice according to package instructions',
    'Heat a large pan over medium-high heat',
    'Cook chicken until golden brown'
  ],
  is_favorite: false
}

const renderMealDetail = () => {
  return render(
    <BrowserRouter>
      <MealDetail />
    </BrowserRouter>
  )
}

describe('MealDetail Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display loading state initially', () => {
    vi.mocked(useMealModule.useMeal).mockReturnValue({
      meal: null,
      loading: true,
      error: null,
      refetch: vi.fn()
    })

    renderMealDetail()
    
    expect(screen.getByText('Loading meal details...')).toBeInTheDocument()
  })

  it('should display error state when meal fails to load', async () => {
    vi.mocked(useMealModule.useMeal).mockReturnValue({
      meal: null,
      loading: false,
      error: 'Failed to fetch meal',
      refetch: vi.fn()
    })

    renderMealDetail()
    
    await waitFor(() => {
      expect(screen.getByText('Unable to Load Meal')).toBeInTheDocument()
      expect(screen.getByText('Failed to fetch meal')).toBeInTheDocument()
    })
  })

  it('should display meal details when data is loaded', async () => {
    vi.mocked(useMealModule.useMeal).mockReturnValue({
      meal: mockMeal,
      loading: false,
      error: null,
      refetch: vi.fn()
    })

    renderMealDetail()
    
    await waitFor(() => {
      expect(screen.getByText('Chicken Teriyaki Bowl')).toBeInTheDocument()
      expect(screen.getByText('Tender chicken glazed with homemade teriyaki sauce')).toBeInTheDocument()
      expect(screen.getByText('25 min')).toBeInTheDocument()
      expect(screen.getByText('medium')).toBeInTheDocument()
    })
  })

  it('should handle different meal data formats (backend vs frontend)', async () => {
    // Test with legacy frontend format
    const legacyMeal: Meal = {
      id: '123',
      name: 'Legacy Meal',
      description: 'A meal with legacy format',
      cuisine: 'Italian', // old format
      difficulty: 'easy', // old format
      cookingTime: 30, // old format
      isFavorite: true, // old format
      tags: ['healthy', 'quick'], // old format
      ingredients: ['pasta', 'sauce'],
      instructions: ['boil pasta', 'add sauce']
    }

    vi.mocked(useMealModule.useMeal).mockReturnValue({
      meal: legacyMeal,
      loading: false,
      error: null,
      refetch: vi.fn()
    })

    renderMealDetail()
    
    await waitFor(() => {
      expect(screen.getByText('Legacy Meal')).toBeInTheDocument()
      expect(screen.getByText('30 min')).toBeInTheDocument() // cookingTime fallback
      expect(screen.getByText('easy')).toBeInTheDocument() // difficulty fallback
    })
  })

  it('should handle missing meal data gracefully', async () => {
    const incompleteMeal: Meal = {
      id: '123',
      name: 'Incomplete Meal',
      // Missing many optional fields
    }

    vi.mocked(useMealModule.useMeal).mockReturnValue({
      meal: incompleteMeal,
      loading: false,
      error: null,
      refetch: vi.fn()
    })

    renderMealDetail()
    
    await waitFor(() => {
      expect(screen.getByText('Incomplete Meal')).toBeInTheDocument()
      expect(screen.getByText('N/A min')).toBeInTheDocument() // fallback for missing time
      expect(screen.getByText('N/A')).toBeInTheDocument() // fallback for missing difficulty
    })
  })

  it('should display ingredients and instructions tabs', async () => {
    vi.mocked(useMealModule.useMeal).mockReturnValue({
      meal: mockMeal,
      loading: false,
      error: null,
      refetch: vi.fn()
    })

    renderMealDetail()
    
    await waitFor(() => {
      // Check if ingredients are displayed by default
      expect(screen.getByText('2 chicken breasts, sliced')).toBeInTheDocument()
      expect(screen.getByText('2 cups jasmine rice')).toBeInTheDocument()
      
      // Check if tab buttons are present
      expect(screen.getByText('Ingredients')).toBeInTheDocument()
      expect(screen.getByText('Instructions')).toBeInTheDocument()
    })
  })

  it('should use meal ID from URL params', () => {
    const useMealSpy = vi.mocked(useMealModule.useMeal)
    useMealSpy.mockReturnValue({
      meal: null,
      loading: true,
      error: null,
      refetch: vi.fn()
    })

    renderMealDetail()
    
    // Verify that useMeal was called with the correct ID from useParams
    expect(useMealSpy).toHaveBeenCalledWith('123')
  })
})