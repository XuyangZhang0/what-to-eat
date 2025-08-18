import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import SlotMachine from './index'
import { createSampleSlotItems } from './utils'
import type { SlotItem } from './types'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
  },
  AnimatePresence: ({ children }: any) => children,
}))

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}))

// Mock sound effects hook
vi.mock('./hooks/useSoundEffects', () => ({
  useSoundEffects: () => ({
    playSpinSound: vi.fn(),
    stopSpinSound: vi.fn(),
    playWinSound: vi.fn(),
    playSuccessChime: vi.fn(),
    isEnabled: true,
  }),
}))

// Mock shake detection hook
vi.mock('@/hooks/useShakeDetection', () => ({
  useShakeDetection: () => ({
    isShaking: false,
  }),
}))

describe('SlotMachine', () => {
  const mockItems = createSampleSlotItems()
  const mockOnSelection = vi.fn()
  const mockOnShakeReset = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('renders the slot machine with initial state', () => {
    render(
      <SlotMachine
        items={mockItems}
        onSelection={mockOnSelection}
      />
    )

    expect(screen.getByText('What to Eat?')).toBeInTheDocument()
    expect(screen.getByText('Ready to spin!')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /spin/i })).toBeInTheDocument()
  })

  it('displays empty state when no items provided', () => {
    render(
      <SlotMachine
        items={[]}
        onSelection={mockOnSelection}
      />
    )

    const spinButton = screen.getByRole('button', { name: /spin/i })
    expect(spinButton).toBeDisabled()
  })

  it('starts spinning when spin button is clicked', async () => {
    render(
      <SlotMachine
        items={mockItems}
        onSelection={mockOnSelection}
        spinDuration={100} // Short duration for testing
      />
    )

    const spinButton = screen.getByRole('button', { name: /spin/i })
    fireEvent.click(spinButton)

    expect(screen.getByText('Deciding...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument()
  })

  it('calls onSelection when spinning completes', async () => {
    vi.useFakeTimers()

    render(
      <SlotMachine
        items={mockItems}
        onSelection={mockOnSelection}
        spinDuration={100}
        celebrationDuration={100}
      />
    )

    const spinButton = screen.getByRole('button', { name: /spin/i })
    fireEvent.click(spinButton)

    // Wait for spin to complete
    vi.advanceTimersByTime(100)

    await waitFor(() => {
      expect(mockOnSelection).toHaveBeenCalledWith(expect.any(Object))
    })

    expect(screen.getByText('Perfect choice!')).toBeInTheDocument()
  })

  it('can stop spinning early', async () => {
    vi.useFakeTimers()

    render(
      <SlotMachine
        items={mockItems}
        onSelection={mockOnSelection}
        spinDuration={1000} // Long duration
        celebrationDuration={100}
      />
    )

    const spinButton = screen.getByRole('button', { name: /spin/i })
    fireEvent.click(spinButton)

    // Stop before completion
    const stopButton = screen.getByRole('button', { name: /stop/i })
    fireEvent.click(stopButton)

    await waitFor(() => {
      expect(mockOnSelection).toHaveBeenCalledWith(expect.any(Object))
    })

    expect(screen.getByText('Perfect choice!')).toBeInTheDocument()
  })

  it('resets state when reset button is clicked', async () => {
    vi.useFakeTimers()

    render(
      <SlotMachine
        items={mockItems}
        onSelection={mockOnSelection}
        spinDuration={100}
        celebrationDuration={100}
      />
    )

    const spinButton = screen.getByRole('button', { name: /spin/i })
    fireEvent.click(spinButton)

    // Wait for celebration state
    vi.advanceTimersByTime(200)

    const resetButton = screen.getByTitle('Reset')
    fireEvent.click(resetButton)

    expect(screen.getByText('Ready to spin!')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /spin/i })).toBeInTheDocument()
  })

  it('responds to external shake trigger', async () => {
    vi.useFakeTimers()

    const { rerender } = render(
      <SlotMachine
        items={mockItems}
        onSelection={mockOnSelection}
        onShakeReset={mockOnShakeReset}
        isShakeTriggered={false}
        spinDuration={100}
      />
    )

    // Trigger shake
    rerender(
      <SlotMachine
        items={mockItems}
        onSelection={mockOnSelection}
        onShakeReset={mockOnShakeReset}
        isShakeTriggered={true}
        spinDuration={100}
      />
    )

    expect(mockOnShakeReset).toHaveBeenCalled()
    expect(screen.getByText('Deciding...')).toBeInTheDocument()
  })

  it('respects disabled prop', () => {
    render(
      <SlotMachine
        items={mockItems}
        onSelection={mockOnSelection}
        disabled={true}
      />
    )

    const spinButton = screen.getByRole('button', { name: /spin/i })
    expect(spinButton).toBeDisabled()
  })

  it('displays selected item details during celebration', async () => {
    vi.useFakeTimers()

    render(
      <SlotMachine
        items={mockItems}
        onSelection={mockOnSelection}
        spinDuration={100}
        celebrationDuration={1000}
      />
    )

    const spinButton = screen.getByRole('button', { name: /spin/i })
    fireEvent.click(spinButton)

    // Wait for spin to complete
    vi.advanceTimersByTime(100)

    await waitFor(() => {
      expect(screen.getByText('🎉 Your Choice 🎉')).toBeInTheDocument()
    })

    // Should call the selection callback
    expect(mockOnSelection).toHaveBeenCalledWith(expect.any(Object))
  })

  it('handles sound enabled/disabled correctly', () => {
    const { rerender } = render(
      <SlotMachine
        items={mockItems}
        onSelection={mockOnSelection}
        soundEnabled={true}
      />
    )

    rerender(
      <SlotMachine
        items={mockItems}
        onSelection={mockOnSelection}
        soundEnabled={false}
      />
    )

    // Component should render without errors regardless of sound setting
    expect(screen.getByText('What to Eat?')).toBeInTheDocument()
  })

  it('supports custom reel count', () => {
    render(
      <SlotMachine
        items={mockItems}
        onSelection={mockOnSelection}
        reelCount={5}
      />
    )

    // Should render 5 reels (this is a visual test, mainly checking no errors)
    expect(screen.getByText('What to Eat?')).toBeInTheDocument()
  })

  it('shows shake detection indicator when shaking', () => {
    // Mock the shake detection to return true
    vi.mocked(require('@/hooks/useShakeDetection').useShakeDetection).mockReturnValue({
      isShaking: true,
    })

    render(
      <SlotMachine
        items={mockItems}
        onSelection={mockOnSelection}
      />
    )

    expect(screen.getByText('Shake detected!')).toBeInTheDocument()
  })
})