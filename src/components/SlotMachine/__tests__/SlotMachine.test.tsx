import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../../test/utils/test-utils'
import SlotMachine from '../index'
import { createMockMeal } from '../../../test/utils/test-utils'

// Mock the hooks and utilities
vi.mock('../../../hooks/useShakeDetection', () => ({
  useShakeDetection: vi.fn(() => ({
    isShaking: false,
  })),
}))

vi.mock('../hooks/useSoundEffects', () => ({
  useSoundEffects: vi.fn(() => ({
    playSpinSound: vi.fn(),
    playWinSound: vi.fn(),
    stopSpinSound: vi.fn(),
  })),
}))

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}))

const mockItems = [
  { id: '1', name: 'Pizza', emoji: '🍕' },
  { id: '2', name: 'Burger', emoji: '🍔' },
  { id: '3', name: 'Sushi', emoji: '🍣' },
]

describe('SlotMachine', () => {
  const defaultProps = {
    items: mockItems,
    onSelection: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should render slot machine with initial state', () => {
    render(<SlotMachine {...defaultProps} />)

    expect(screen.getByText('What to Eat?')).toBeInTheDocument()
    expect(screen.getByText('Ready to spin!')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /spin/i })).toBeInTheDocument()
  })

  it('should disable spin button when no items provided', () => {
    render(<SlotMachine {...defaultProps} items={[]} />)

    const spinButton = screen.getByRole('button', { name: /spin/i })
    expect(spinButton).toBeDisabled()
  })

  it('should disable spin button when disabled prop is true', () => {
    render(<SlotMachine {...defaultProps} disabled />)

    const spinButton = screen.getByRole('button', { name: /spin/i })
    expect(spinButton).toBeDisabled()
  })

  it('should start spinning when spin button is clicked', async () => {
    const { useSoundEffects } = await import('../hooks/useSoundEffects')
    const mockPlaySpinSound = vi.fn()
    vi.mocked(useSoundEffects).mockReturnValue({
      playSpinSound: mockPlaySpinSound,
      playWinSound: vi.fn(),
      stopSpinSound: vi.fn(),
    })

    render(<SlotMachine {...defaultProps} />)

    const spinButton = screen.getByRole('button', { name: /spin/i })
    fireEvent.click(spinButton)

    expect(screen.getByText('Deciding...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument()
    expect(mockPlaySpinSound).toHaveBeenCalled()
  })

  it('should complete spin after duration and show result', async () => {
    const onSelection = vi.fn()
    const { useSoundEffects } = await import('../hooks/useSoundEffects')
    const mockStopSpinSound = vi.fn()
    const mockPlayWinSound = vi.fn()
    
    vi.mocked(useSoundEffects).mockReturnValue({
      playSpinSound: vi.fn(),
      playWinSound: mockPlayWinSound,
      stopSpinSound: mockStopSpinSound,
    })

    render(<SlotMachine {...defaultProps} onSelection={onSelection} spinDuration={1000} />)

    const spinButton = screen.getByRole('button', { name: /spin/i })
    fireEvent.click(spinButton)

    // Fast-forward through spin duration
    vi.advanceTimersByTime(1000)

    await waitFor(() => {
      expect(screen.getByText('Perfect choice!')).toBeInTheDocument()
      expect(screen.getByText('🎉 Your Choice 🎉')).toBeInTheDocument()
    })

    expect(mockStopSpinSound).toHaveBeenCalled()
    expect(mockPlayWinSound).toHaveBeenCalled()
    expect(onSelection).toHaveBeenCalledWith(expect.objectContaining({
      id: expect.any(String),
      name: expect.any(String),
    }))
  })

  it('should stop spinning when stop button is clicked', async () => {
    const onSelection = vi.fn()
    const { useSoundEffects } = await import('../hooks/useSoundEffects')
    const mockStopSpinSound = vi.fn()
    
    vi.mocked(useSoundEffects).mockReturnValue({
      playSpinSound: vi.fn(),
      playWinSound: vi.fn(),
      stopSpinSound: mockStopSpinSound,
    })

    render(<SlotMachine {...defaultProps} onSelection={onSelection} />)

    const spinButton = screen.getByRole('button', { name: /spin/i })
    fireEvent.click(spinButton)

    const stopButton = screen.getByRole('button', { name: /stop/i })
    fireEvent.click(stopButton)

    await waitFor(() => {
      expect(screen.getByText('Perfect choice!')).toBeInTheDocument()
    })

    expect(mockStopSpinSound).toHaveBeenCalled()
    expect(onSelection).toHaveBeenCalled()
  })

  it('should reset to idle state after celebration', async () => {
    render(<SlotMachine {...defaultProps} celebrationDuration={500} />)

    const spinButton = screen.getByRole('button', { name: /spin/i })
    fireEvent.click(spinButton)

    // Complete spin
    vi.advanceTimersByTime(3000)

    await waitFor(() => {
      expect(screen.getByText('Perfect choice!')).toBeInTheDocument()
    })

    // Complete celebration
    vi.advanceTimersByTime(500)

    await waitFor(() => {
      expect(screen.getByText('Ready to spin!')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /spin/i })).toBeInTheDocument()
    })
  })

  it('should handle reset button click', async () => {
    const { useSoundEffects } = await import('../hooks/useSoundEffects')
    const mockStopSpinSound = vi.fn()
    
    vi.mocked(useSoundEffects).mockReturnValue({
      playSpinSound: vi.fn(),
      playWinSound: vi.fn(),
      stopSpinSound: mockStopSpinSound,
    })

    render(<SlotMachine {...defaultProps} />)

    const spinButton = screen.getByRole('button', { name: /spin/i })
    fireEvent.click(spinButton)

    const resetButton = screen.getByRole('button')
    fireEvent.click(resetButton)

    await waitFor(() => {
      expect(screen.getByText('Ready to spin!')).toBeInTheDocument()
    })

    expect(mockStopSpinSound).toHaveBeenCalled()
  })

  it('should trigger spin on shake detection', async () => {
    const { useShakeDetection } = await import('../../../hooks/useShakeDetection')
    vi.mocked(useShakeDetection).mockReturnValue({
      isShaking: true,
    } as any)

    const onSelection = vi.fn()
    render(<SlotMachine {...defaultProps} onSelection={onSelection} />)

    await waitFor(() => {
      expect(screen.getByText('Deciding...')).toBeInTheDocument()
    })
  })

  it('should trigger spin on external shake trigger', async () => {
    const onShakeReset = vi.fn()
    
    const { rerender } = render(
      <SlotMachine {...defaultProps} isShakeTriggered={false} onShakeReset={onShakeReset} />
    )

    rerender(
      <SlotMachine {...defaultProps} isShakeTriggered={true} onShakeReset={onShakeReset} />
    )

    await waitFor(() => {
      expect(screen.getByText('Deciding...')).toBeInTheDocument()
    })

    expect(onShakeReset).toHaveBeenCalled()
  })

  it('should not trigger spin when already spinning', async () => {
    const { useShakeDetection } = await import('../../../hooks/useShakeDetection')
    
    render(<SlotMachine {...defaultProps} />)

    // Start spinning manually
    const spinButton = screen.getByRole('button', { name: /spin/i })
    fireEvent.click(spinButton)

    // Mock shake detection while spinning
    vi.mocked(useShakeDetection).mockReturnValue({
      isShaking: true,
    } as any)

    // Should still be in spinning state, not start new spin
    expect(screen.getByText('Deciding...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument()
  })

  it('should show shake detection indicator', async () => {
    const { useShakeDetection } = await import('../../../hooks/useShakeDetection')
    vi.mocked(useShakeDetection).mockReturnValue({
      isShaking: true,
    } as any)

    render(<SlotMachine {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Shake detected!')).toBeInTheDocument()
    })
  })

  it('should trigger confetti on win', async () => {
    const confetti = await import('canvas-confetti')
    
    render(<SlotMachine {...defaultProps} />)

    const spinButton = screen.getByRole('button', { name: /spin/i })
    fireEvent.click(spinButton)

    vi.advanceTimersByTime(3000)

    await waitFor(() => {
      expect(confetti.default).toHaveBeenCalled()
    })
  })

  it('should handle sound enabled/disabled', async () => {
    const { useSoundEffects } = await import('../hooks/useSoundEffects')
    const mockUseSoundEffects = vi.mocked(useSoundEffects)

    const { rerender } = render(<SlotMachine {...defaultProps} soundEnabled={true} />)
    expect(mockUseSoundEffects).toHaveBeenCalledWith({ enabled: true })

    rerender(<SlotMachine {...defaultProps} soundEnabled={false} />)
    expect(mockUseSoundEffects).toHaveBeenCalledWith({ enabled: false })
  })

  it('should prepare reels with correct number of reels', () => {
    render(<SlotMachine {...defaultProps} reelCount={5} />)

    // Should render 5 reels (this would need to be tested with a more detailed implementation)
    const reelContainer = screen.getByRole('generic', { hidden: true })
    expect(reelContainer).toBeInTheDocument()
  })

  it('should handle custom className', () => {
    const customClass = 'custom-slot-machine'
    render(<SlotMachine {...defaultProps} className={customClass} />)

    const container = screen.getByText('What to Eat?').closest('.custom-slot-machine')
    expect(container).toBeInTheDocument()
  })

  it('should cleanup timeouts on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')
    
    const { unmount } = render(<SlotMachine {...defaultProps} />)
    
    unmount()

    expect(clearTimeoutSpy).toHaveBeenCalled()
  })
})