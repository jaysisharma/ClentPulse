'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, Info } from 'lucide-react'

export function NotificationToast({ projectId }: { projectId: string }) {
  const [toast, setToast] = useState<{ message: string; show: boolean }>({ message: '', show: false })

  useEffect(() => {
    function handleEvent(e: Event) {
      const customEvent = e as CustomEvent<{ name: string }>
      const sectionName = customEvent.detail?.name || 'Section'
      setToast({
        message: `"${sectionName}" section hidden. You can show it back in the project settings.`,
        show: true,
      })
    }

    window.addEventListener('section-hidden', handleEvent)
    return () => window.removeEventListener('section-hidden', handleEvent)
  }, [])

  useEffect(() => {
    if (!toast.show) return
    const timer = setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }))
    }, 6000)
    return () => clearTimeout(timer)
  }, [toast.show])

  if (!toast.show) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in max-w-sm w-full bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-850 flex items-start gap-3">
      <div className="p-1 rounded-lg bg-indigo-500 text-white mt-0.5 flex-shrink-0">
        <Info className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-relaxed font-sans">{toast.message}</p>
        <Link
          href={`/project/${projectId}/settings`}
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline mt-1.5 inline-block font-sans"
        >
          Go to settings
        </Link>
      </div>
      <button
        onClick={() => setToast(prev => ({ ...prev, show: false }))}
        className="text-slate-400 hover:text-white transition-colors cursor-pointer flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
