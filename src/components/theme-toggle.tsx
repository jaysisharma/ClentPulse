'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from './theme-provider'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { theme, toggleTheme } = useTheme()

  const handleClick = () => {
    toggleTheme()
  }

  if (!mounted) {
    return (
      <button
        disabled
        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors opacity-50"
        aria-label="Toggle theme"
      >
        <Moon className="w-5 h-5" />
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </button>
  )
}
