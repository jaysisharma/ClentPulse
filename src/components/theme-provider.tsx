'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('theme')

    // Only accept 'light' or 'dark'; default to 'dark' when unset.
    const initial: Theme = stored === 'light' ? 'light' : 'dark'

    setTheme(initial)

    // Apply theme to DOM
    if (initial === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light'

      // Update localStorage
      localStorage.setItem('theme', newTheme)

      // Update DOM - remove first, then add
      document.documentElement.classList.remove('dark')

      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark')
      }

      return newTheme
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    return {
      theme: 'light' as Theme,
      toggleTheme: () => {
        const current = 'light'
        const newTheme = 'dark'

        localStorage.setItem('theme', newTheme)
        document.documentElement.classList.add('dark')
      },
    }
  }

  return context
}
