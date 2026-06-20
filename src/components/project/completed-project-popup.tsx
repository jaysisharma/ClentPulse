'use client'

import { useState, useEffect } from 'react'
import { X, Star, Award, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface CompletedProjectPopupProps {
  projectId: string
  projectName: string
  accentColor?: string
}

export function CompletedProjectPopup({
  projectId,
  projectName,
  accentColor = '#6366F1'
}: CompletedProjectPopupProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Check if user dismissed it in this session/browser
    const dismissed = localStorage.getItem(`dismissed-testimonial-${projectId}`)
    if (!dismissed) {
      // Small delay to make the entrance feel smooth and deliberate
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [projectId])

  function handleDismiss() {
    localStorage.setItem(`dismissed-testimonial-${projectId}`, 'true')
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/65 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
        onClick={handleDismiss}
      />

      {/* Modal Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 p-8 max-w-md w-full shadow-2xl relative z-10 overflow-hidden transform transition-all duration-300 scale-100 animate-in fade-in zoom-in-95">
        
        {/* Sparkles / Festive background elements */}
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10 bg-current pointer-events-none" style={{ color: accentColor }} />
        <div className="absolute -bottom-10 -left-10 w-24 h-24 rounded-full opacity-5 bg-current pointer-events-none" style={{ color: accentColor }} />

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Celebratory Icon */}
        <div className="flex justify-center mb-5 relative">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center relative shadow-lg"
            style={{ backgroundColor: `${accentColor}15` }}
          >
            <Award className="w-9 h-9" style={{ color: accentColor }} />
            <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-amber-500 animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 px-2">
          Project Completed! 🎉
        </h2>

        {/* Message */}
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          Congratulations on completing <span className="font-semibold text-slate-800 dark:text-slate-200">{projectName}</span>! 
          We would love to hear about your experience. Would you mind taking a minute to share your feedback?
        </p>

        {/* Rating Preview indicator just to grab attention */}
        <div className="flex justify-center gap-1 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className="w-6 h-6 text-amber-400 fill-amber-400/10 hover:fill-amber-400 transition-colors cursor-pointer" />
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Link href={`/testimonial/${projectId}`} onClick={handleDismiss} className="w-full">
            <button 
              className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white shadow-md hover:shadow-lg transition-all transform active:scale-[0.98]"
              style={{ backgroundColor: accentColor }}
            >
              Leave a testimonial
            </button>
          </Link>
          <button
            onClick={handleDismiss}
            className="w-full py-2.5 px-4 rounded-xl font-medium text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
          >
            Remind me later
          </button>
        </div>
      </div>
    </div>
  )
}
