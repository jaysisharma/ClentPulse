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
      <div className={'w-8 h-8 rounded-full border border-slate-200/50 dark:border-white/10 bg-slate-100/50 dark:bg-white/5 animate-pulse ' + className} />
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className={
        'flex items-center justify-center w-8 h-8 rounded-full border ' +
        'border-slate-200/80 dark:border-white/10 ' +
        'bg-slate-100/70 dark:bg-white/[0.05] ' +
        'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white ' +
        'transition-all hover:bg-slate-200/70 dark:hover:bg-white/10 cursor-pointer shadow-xs ' +
        className
      }
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-600" />
      )}
    </button>
  )
}
