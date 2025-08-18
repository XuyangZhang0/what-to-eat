import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import SlotMachineDemo from '@/pages/SlotMachineDemo'
import { AuthContext } from '@/hooks/useAuth'
import * as api from '@/services/api'

// Mock the API module
vi.mock('@/services/api', () => ({
  mealsApi: {
    getMeals: vi.fn(),
  },
  restaurantsApi: {
    getRestaurants: vi.fn(),
  }
}))

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
  },
  AnimatePresence: ({ children }: any) => children,
}))

// Mock useShakeDetection hook
vi.mock('@/hooks/useShakeDetection', () => ({
  useShakeDetection: () => ({
    isShaking: false,
  }),
}))

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const renderWithProviders = (
  component: React.ReactElement,
  { queryClient = createQueryClient(), authValue }: { 
    queryClient?: QueryClient
    authValue: any 
  } = { authValue: null }
) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthContext.Provider value={authValue}>
          {component}
        </AuthContext.Provider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('SlotMachine Authentication Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Authenticated User', () => {
    const mockAuthenticatedUser = {
      user: { id: '1', username: 'testuser', email: 'test@example.com' },
      token: 'mock-jwt-token',
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    }

    it('should render slot machine when authenticated', async () => {
      // Mock successful API response
      vi.mocked(api.mealsApi.getMeals).mockResolvedValue([
        {
          id: '1',
          name: 'Test Meal',
          description: 'A test meal',
          category: 'dinner',
          cuisine: 'italian',
          difficulty: 'easy',
          cookingTime: 30,
          ingredients: ['test'],
          instructions: ['test'],
          image: '',
          isFavorite: false,
        }
      ])

      renderWithProviders(
        <SlotMachineDemo />, 
        { authValue: mockAuthenticatedUser }
      )

      // Should show the slot machine interface
      expect(screen.getByText('Slot Machine Demo')).toBeInTheDocument()
      expect(screen.getByText('Choose Content Type')).toBeInTheDocument()
      
      // Should show mode selection buttons
      expect(screen.getByText('Sample Data')).toBeInTheDocument()
      expect(screen.getByText('Meals')).toBeInTheDocument()
      expect(screen.getByText('Restaurants')).toBeInTheDocument()
      expect(screen.getByText('Mixed')).toBeInTheDocument()
    })

    it('should load meals when Meals mode is selected', async () => {
      const mockMeals = [
        {
          id: '1',
          name: 'Pizza Margherita',
          description: 'Classic Italian pizza',
          category: 'dinner',
          cuisine: 'italian',
          difficulty: 'easy',
          cookingTime: 30,
          ingredients: ['flour', 'tomato', 'mozzarella'],
          instructions: ['make dough', 'add toppings', 'bake'],
          image: '',
          isFavorite: false,
        },
        {
          id: '2',
          name: 'Chicken Curry',
          description: 'Spicy chicken curry',
          category: 'dinner', 
          cuisine: 'indian',
          difficulty: 'medium',
          cookingTime: 45,
          ingredients: ['chicken', 'curry', 'rice'],
          instructions: ['cook chicken', 'add curry', 'serve with rice'],
          image: '',
          isFavorite: false,
        }
      ]

      vi.mocked(api.mealsApi.getMeals).mockResolvedValue(mockMeals)

      renderWithProviders(
        <SlotMachineDemo />, 
        { authValue: mockAuthenticatedUser }
      )

      // Click on Meals mode
      const mealsButton = screen.getByText('Meals')
      mealsButton.click()

      // Wait for API call and data loading
      await waitFor(() => {
        expect(api.mealsApi.getMeals).toHaveBeenCalled()
      })

      // Should show slot machine with loaded meals
      await waitFor(() => {
        expect(screen.getByText('What to Eat?')).toBeInTheDocument()
        expect(screen.getByText('Ready to spin!')).toBeInTheDocument()
      })
    })

    it('should show empty state when meals API returns empty array', async () => {
      vi.mocked(api.mealsApi.getMeals).mockResolvedValue([])

      renderWithProviders(
        <SlotMachineDemo />, 
        { authValue: mockAuthenticatedUser }
      )

      // Click on Meals mode
      const mealsButton = screen.getByText('Meals')
      mealsButton.click()

      // Wait for API call
      await waitFor(() => {
        expect(api.mealsApi.getMeals).toHaveBeenCalled()
      })

      // Should show empty state
      await waitFor(() => {
        expect(screen.getByText('No items available')).toBeInTheDocument()
        expect(screen.getByText('Try switching to a different content type or check your connection.')).toBeInTheDocument()
        expect(screen.getByText('Use Sample Data')).toBeInTheDocument()
      })
    })

    it('should show loading state while fetching meals', async () => {
      // Create a promise that we can control
      let resolvePromise: (value: any) => void
      const mealsPromise = new Promise((resolve) => {
        resolvePromise = resolve
      })
      
      vi.mocked(api.mealsApi.getMeals).mockReturnValue(mealsPromise)

      renderWithProviders(
        <SlotMachineDemo />, 
        { authValue: mockAuthenticatedUser }
      )

      // Click on Meals mode
      const mealsButton = screen.getByText('Meals')
      mealsButton.click()

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText('Loading items...')).toBeInTheDocument()
      })

      // Resolve the promise
      resolvePromise!([])
      
      await waitFor(() => {
        expect(screen.queryByText('Loading items...')).not.toBeInTheDocument()
      })
    })

    it('should handle API error gracefully', async () => {
      vi.mocked(api.mealsApi.getMeals).mockRejectedValue(new Error('API Error'))

      renderWithProviders(
        <SlotMachineDemo />, 
        { authValue: mockAuthenticatedUser }
      )

      // Click on Meals mode
      const mealsButton = screen.getByText('Meals')
      mealsButton.click()

      // Wait for error handling
      await waitFor(() => {
        expect(api.mealsApi.getMeals).toHaveBeenCalled()
      })

      // Should show empty state when API fails
      await waitFor(() => {
        expect(screen.getByText('No items available')).toBeInTheDocument()
      })
    })
  })

  describe('Unauthenticated User', () => {
    const mockUnauthenticatedUser = {
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    }

    it('should not render slot machine when unauthenticated', () => {
      renderWithProviders(
        <SlotMachineDemo />, 
        { authValue: mockUnauthenticatedUser }
      )

      // Should not show slot machine content when not authenticated
      // (This would normally redirect to login, but in our test we just render nothing)
      expect(screen.queryByText('Slot Machine Demo')).not.toBeInTheDocument()
      expect(screen.queryByText('Choose Content Type')).not.toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    const mockLoadingUser = {
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      login: vi.fn(),
      logout: vi.fn(),
    }

    it('should show loading spinner when authentication is loading', () => {
      renderWithProviders(
        <SlotMachineDemo />, 
        { authValue: mockLoadingUser }
      )

      // Should not show slot machine content while loading
      expect(screen.queryByText('Slot Machine Demo')).not.toBeInTheDocument()
    })
  })
})

describe('SlotMachine Component Data Processing', () => {
  it('should convert meals to slot items correctly', () => {
    const mockMeal = {
      id: '1',
      name: 'Test Meal',
      description: 'A test meal',
      category: 'dinner',
      cuisine: 'italian',
      difficulty: 'easy' as const,
      cookingTime: 30,
      ingredients: ['test'],
      instructions: ['test'],
      image: '',
      isFavorite: false,
    }

    // Import the utility function
    const { mealsToSlotItems } = require('@/components/SlotMachine/utils')
    const slotItems = mealsToSlotItems([mockMeal])

    expect(slotItems).toHaveLength(1)
    expect(slotItems[0]).toMatchObject({
      id: '1',
      name: 'Test Meal',
      description: 'A test meal',
      category: 'dinner',
      type: 'meal',
      cuisine: 'italian',
      difficulty: 'easy',
      cookingTime: 30,
    })
  })
})