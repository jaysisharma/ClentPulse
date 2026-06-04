'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function PageLoading() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const handleStart = () => {
      setIsLoading(true)
    }

    const handleStop = () => {
      setIsLoading(false)
    }

    // Listen to route changes
    window.addEventListener('beforeunload', handleStart)

    return () => {
      window.removeEventListener('beforeunload', handleStart)
    }
  }, [router])

  // Also use MutationObserver to detect document changes (for client-side navigation)
  useEffect(() => {
    if (!isLoading) return

    // Auto-hide loading after 3 seconds as fallback
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [isLoading])

  return (
    <>
      {isLoading && (
        <>
          {/* Progress Bar */}
          <div className="fixed top-0 left-0 h-1 bg-gradient-to-r from-indigo-600 to-violet-600 animate-pulse z-[9999]" style={{ width: '80%' }} />

          {/* Loading Overlay with Spinner */}
          <div className="fixed inset-0 bg-white dark:bg-slate-950 bg-opacity-50 dark:bg-opacity-50 flex items-center justify-center z-[9998] transition-colors">
            <div className="flex flex-col items-center gap-4">
              {/* Spinner */}
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-700"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 dark:border-t-indigo-400 animate-spin"></div>
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Loading...</p>
            </div>
          </div>
        </>
      )}
    </>
  )
}
