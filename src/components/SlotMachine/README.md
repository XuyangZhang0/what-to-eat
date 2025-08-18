# SlotMachine Component

A feature-rich, animated slot machine component for the "What to Eat" app that provides an engaging way for users to discover random meal suggestions.

## Features

### 🎰 Core Functionality
- **3-Reel Slot Machine**: Displays spinning reels with meal/restaurant options
- **Realistic Animation**: Smooth acceleration and deceleration with easing
- **Random Selection**: Weighted random selection from provided items
- **Manual Controls**: Start, stop, and reset functionality

### 🎨 Visual Effects
- **Framer Motion Animations**: Smooth, 60fps animations
- **Confetti Celebration**: Multi-stage confetti burst on selection
- **Responsive Design**: Mobile-optimized with touch-friendly interactions
- **Theme Support**: Dark/light mode compatibility
- **Visual Indicators**: Selection highlighting and spinning effects

### 🔊 Audio Feedback
- **Spinning Sound**: Realistic mechanical spinning sounds
- **Success Chimes**: Pleasant victory sounds on selection
- **Volume Control**: Configurable sound effects
- **Web Audio API**: High-quality programmatic sound generation

### 📱 Mobile Optimization
- **Touch Interactions**: Optimized for mobile devices
- **Minimum Touch Targets**: 44px minimum button size
- **Responsive Layout**: Adapts to different screen sizes
- **Haptic Feedback**: Device vibration support

### 🤝 Shake Integration
- **Shake Detection**: Responds to device shake gestures
- **Permission Handling**: iOS 13+ motion permission support
- **Customizable Sensitivity**: Adjustable shake thresholds
- **Cooldown Period**: Prevents accidental multiple triggers

## Usage

### Basic Example

```tsx
import SlotMachine from '@/components/SlotMachine'
import { createSampleSlotItems } from '@/components/SlotMachine/utils'

function MyComponent() {
  const items = createSampleSlotItems()

  const handleSelection = (item) => {
    console.log('Selected:', item)
  }

  return (
    <SlotMachine
      items={items}
      onSelection={handleSelection}
      soundEnabled={true}
      spinDuration={3000}
    />
  )
}
```

### With Shake Detection

```tsx
import SlotMachine from '@/components/SlotMachine'
import { useShakeDetection } from '@/hooks/useShakeDetection'

function ShakeSlotMachine() {
  const [isShakeTriggered, setIsShakeTriggered] = useState(false)
  
  const { isShaking } = useShakeDetection({
    onShakeDetected: () => setIsShakeTriggered(true)
  })

  return (
    <SlotMachine
      items={items}
      isShakeTriggered={isShakeTriggered}
      onShakeReset={() => setIsShakeTriggered(false)}
      onSelection={handleSelection}
    />
  )
}
```

### Converting Data

```tsx
import { mealsToSlotItems, restaurantsToSlotItems } from '@/components/SlotMachine/utils'

// Convert meals
const mealSlots = mealsToSlotItems(meals)

// Convert restaurants  
const restaurantSlots = restaurantsToSlotItems(restaurants)

// Mix both types
const mixedSlots = [...mealSlots, ...restaurantSlots]
```

## Props

### SlotMachineProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `SlotItem[]` | **required** | Array of items to choose from |
| `onSelection` | `(item: SlotItem) => void` | `undefined` | Callback when item is selected |
| `isShakeTriggered` | `boolean` | `false` | External shake trigger |
| `onShakeReset` | `() => void` | `undefined` | Callback to reset shake trigger |
| `disabled` | `boolean` | `false` | Whether slot machine is disabled |
| `autoplay` | `boolean` | `false` | Auto-start spinning |
| `spinDuration` | `number` | `3000` | Spin duration in milliseconds |
| `reelCount` | `number` | `3` | Number of reels (1-5) |
| `celebrationDuration` | `number` | `2000` | Celebration animation duration |
| `soundEnabled` | `boolean` | `true` | Enable sound effects |
| `className` | `string` | `undefined` | Additional CSS classes |

### SlotItem Interface

```tsx
interface SlotItem {
  id: string
  name: string
  description?: string
  category?: string
  emoji?: string
  image?: string
  type?: 'meal' | 'restaurant'
  
  // Meal-specific properties
  cuisine?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  cookingTime?: number
  
  // Restaurant-specific properties
  rating?: number
  priceRange?: '$' | '$$' | '$$$' | '$$$$'
  isFavorite?: boolean
}
```

## States

The slot machine has three main states:

1. **`idle`**: Ready to spin, showing spin button
2. **`spinning`**: Actively spinning, showing stop button
3. **`celebrating`**: Showing selected result with confetti

## Animation Details

### Reel Animation
- **Acceleration Phase**: Gradual speed increase using cubic easing
- **Constant Phase**: Steady maximum speed
- **Deceleration Phase**: Gradual slowdown with realistic easing
- **Staggered Stops**: Each reel stops with a slight delay

### Confetti System
- **Initial Burst**: Main celebration explosion
- **Side Bursts**: Secondary explosions from sides  
- **Final Shower**: Gentle particle rain
- **Color Variety**: Multiple themed colors

### Sound Design
- **Spinning**: Continuous mechanical sound with frequency modulation
- **Success**: Harmonic chord progression (C-E-G major)
- **Volume Control**: Respectful of user preferences

## Accessibility

- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels and descriptions
- **Reduced Motion**: Respects user motion preferences
- **High Contrast**: Compatible with system themes
- **Touch Targets**: Minimum 44px touch areas

## Performance

- **Optimized Rendering**: Efficient animation loops
- **Memory Management**: Proper cleanup of timeouts and listeners
- **Lazy Loading**: Audio context created on demand
- **Frame Rate**: Smooth 60fps animations
- **Battery Conscious**: Minimal background processing

## Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile Browsers**: iOS Safari, Chrome Mobile
- **Web Audio API**: Falls back gracefully if unavailable
- **DeviceMotion API**: iOS 13+ permission handling

## Testing

```bash
# Run component tests
npm test SlotMachine

# Run in watch mode
npm test SlotMachine -- --watch
```

## Demo

Visit the slot machine demo page at `/slot-machine` to try all features:

- Different content types (meals, restaurants, mixed)
- Sound effect toggles
- Shake detection testing
- Mobile responsiveness

## Dependencies

- **framer-motion**: Animations and transitions
- **canvas-confetti**: Celebration effects
- **lucide-react**: Icons
- **@tanstack/react-query**: Data fetching (demo only)

## Files Structure

```
src/components/SlotMachine/
├── index.tsx              # Main SlotMachine component
├── SlotMachineReel.tsx    # Individual reel component
├── types.ts               # TypeScript interfaces
├── utils.ts               # Utility functions
├── hooks/
│   └── useSoundEffects.ts # Sound management hook
├── SlotMachine.test.tsx   # Component tests
└── README.md              # This documentation
```

## Contributing

When contributing to the SlotMachine component:

1. Maintain TypeScript strict typing
2. Add tests for new features
3. Follow existing animation patterns
4. Consider mobile performance
5. Test across different devices
6. Update documentation

## Future Enhancements

- **Custom Themes**: Additional visual themes
- **Animation Presets**: Different animation styles
- **Progressive Web App**: Offline capability
- **Analytics**: Usage tracking and insights
- **Accessibility**: Enhanced screen reader support