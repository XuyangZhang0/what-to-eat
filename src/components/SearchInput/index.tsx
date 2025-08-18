import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/utils/cn'

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
  showClearButton?: boolean;
  autoFocus?: boolean;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
  className,
  showClearButton = true,
  autoFocus = false,
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value)
  const debounceRef = useRef<NodeJS.Timeout>()
  const inputRef = useRef<HTMLInputElement>(null)

  // Update local value when external value changes
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  // Auto focus if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  const handleInputChange = (newValue: string) => {
    setLocalValue(newValue)

    // Clear existing timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Set new timeout for debounced update
    debounceRef.current = setTimeout(() => {
      onChange(newValue)
    }, debounceMs)
  }

  const handleClear = () => {
    setLocalValue('')
    onChange('')
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear()
    }
  }

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        placeholder={placeholder}
      />
      {showClearButton && localValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}