'use client'

import { useTheme } from '@/components/theme-provider'
import { Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={'w-9 h-9 rounded-lg border border-slate-200/20 dark:border-white/10 bg-slate-100/50 dark:bg-white/5 animate-pulse ' + className} />
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className={
        'flex items-center justify-center w-9 h-9 rounded-lg border ' +
        'border-slate-200 dark:border-white/10 ' +
        'bg-slate-50 dark:bg-white/[0.02] ' +
        'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white ' +
        'transition-all hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer shadow-xs ' +
        className
      }
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-500 animate-pulse-slow" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-500" />
      )}
    </button>
  )
}
