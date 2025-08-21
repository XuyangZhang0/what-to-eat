import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import RestaurantDetail from '../RestaurantDetail'
import * as useRestaurantModule from '../../hooks/useRestaurant'

// Mock the useRestaurant hook
vi.mock('../../hooks/useRestaurant')

// Mock the useAuth hook
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn()
  })
}))

// Mock useParams to return a restaurant ID
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ id: '1' })
  }
})

// Mock restaurant data
const mockRestaurant = {
  id: '1',
  name: 'Test Restaurant',
  description: 'A great place to eat',
  cuisine_type: 'Italian',
  address: '123 Main St',
  phone: '+1 555-0123',
  website: 'https://test-restaurant.com',
  rating: 4.5,
  price_range: '$$',
  isOpen: true,
  distance: 500,
  isFavorite: false,
  opening_hours: {
    monday: '11:00 AM - 10:00 PM',
    tuesday: '11:00 AM - 10:00 PM'
  }
}

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('RestaurantDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state initially', () => {
    vi.mocked(useRestaurantModule.useRestaurant).mockReturnValue({
      restaurant: null,
      loading: true,
      error: null,
      refetch: vi.fn()
    })

    renderWithRouter(<RestaurantDetail />)
    
    expect(screen.getByText('Loading restaurant details...')).toBeInTheDocument()
  })

  it('shows error state when restaurant not found', () => {
    vi.mocked(useRestaurantModule.useRestaurant).mockReturnValue({
      restaurant: null,
      loading: false,
      error: 'Restaurant not found',
      refetch: vi.fn()
    })

    renderWithRouter(<RestaurantDetail />)
    
    expect(screen.getByText('Restaurant Not Found')).toBeInTheDocument()
    expect(screen.getByText('Restaurant not found')).toBeInTheDocument()
  })

  it('displays restaurant details when loaded successfully', async () => {
    vi.mocked(useRestaurantModule.useRestaurant).mockReturnValue({
      restaurant: mockRestaurant,
      loading: false,
      error: null,
      refetch: vi.fn()
    })

    renderWithRouter(<RestaurantDetail />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Restaurant')).toBeInTheDocument()
      expect(screen.getByText('A great place to eat')).toBeInTheDocument()
      expect(screen.getByText('Italian')).toBeInTheDocument()
      expect(screen.getByText('123 Main St')).toBeInTheDocument()
      expect(screen.getByText('+1 555-0123')).toBeInTheDocument()
      expect(screen.getByText('4.5')).toBeInTheDocument()
    })
  })

  it('shows open status indicator', async () => {
    vi.mocked(useRestaurantModule.useRestaurant).mockReturnValue({
      restaurant: mockRestaurant,
      loading: false,
      error: null,
      refetch: vi.fn()
    })

    renderWithRouter(<RestaurantDetail />)
    
    await waitFor(() => {
      expect(screen.getByText('Open')).toBeInTheDocument()
    })
  })

  it('displays opening hours when available', async () => {
    vi.mocked(useRestaurantModule.useRestaurant).mockReturnValue({
      restaurant: mockRestaurant,
      loading: false,
      error: null,
      refetch: vi.fn()
    })

    renderWithRouter(<RestaurantDetail />)
    
    // Click on the Hours tab
    const hoursTab = screen.getByRole('button', { name: 'Hours' })
    hoursTab.click()
    
    await waitFor(() => {
      expect(screen.getByText('monday')).toBeInTheDocument()
      expect(screen.getByText('tuesday')).toBeInTheDocument()
      expect(screen.getAllByText('11:00 AM - 10:00 PM')).toHaveLength(2)
    })
  })

  it('handles restaurant with minimal data', async () => {
    const minimalRestaurant = {
      id: '2',
      name: 'Minimal Restaurant',
      description: null,
      cuisine_type: null,
      address: null,
      phone: null,
      website: null,
      rating: null,
      price_range: null,
      isOpen: false,
      distance: null,
      isFavorite: false,
      opening_hours: null
    }

    vi.mocked(useRestaurantModule.useRestaurant).mockReturnValue({
      restaurant: minimalRestaurant,
      loading: false,
      error: null,
      refetch: vi.fn()
    })

    renderWithRouter(<RestaurantDetail />)
    
    await waitFor(() => {
      expect(screen.getByText('Minimal Restaurant')).toBeInTheDocument()
      expect(screen.getByText('No description available.')).toBeInTheDocument()
      expect(screen.getByText('Cuisine not specified')).toBeInTheDocument()
      expect(screen.getByText('Closed')).toBeInTheDocument()
    })
  })

  it('uses correct restaurant ID from URL params', () => {
    const useRestaurantSpy = vi.mocked(useRestaurantModule.useRestaurant)
    useRestaurantSpy.mockReturnValue({
      restaurant: null,
      loading: true,
      error: null,
      refetch: vi.fn()
    })

    renderWithRouter(<RestaurantDetail />)
    
    // Verify that useRestaurant was called with the correct ID from useParams
    expect(useRestaurantSpy).toHaveBeenCalledWith('1')
  })
})