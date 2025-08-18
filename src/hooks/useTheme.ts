import { useState, useEffect } from 'react'

type Theme = 'light' | 'dark' | 'system'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme')
    return (stored as Theme) || 'system'
  })

  useEffect(() => {
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(current => {
      switch (current) {
        case 'light':
          return 'dark'
        case 'dark':
          return 'system'
        default:
          return 'light'
      }
    })
  }

  return {
    theme,
    setTheme,
    toggleTheme,
  }
}