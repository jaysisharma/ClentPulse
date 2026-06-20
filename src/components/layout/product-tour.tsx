'use client'

import { useState, useEffect } from 'react'
import { X, ChevronRight, ChevronLeft, Sparkles, HelpCircle } from 'lucide-react'

const TOUR_STEPS = [
  {
    title: "Welcome to Frevio! 🚀",
    content: "Let's take a quick 1-minute tour of your new workspace to show you where everything is.",
    target: "body",
    placement: "center"
  },
  {
    title: "Log Your Time ⏱️",
    content: "Track your working hours manually or launch an active timer to log progress in real-time.",
    target: '[data-tour-time-btn]',
    placement: "bottom"
  },
  {
    title: "Create a Project 📁",
    content: "Start a new project to manage kickoff checklists, client deliverables, and share progress updates.",
    target: '[data-tour-project-btn]',
    placement: "bottom"
  },
  {
    title: "Sidebar Navigation 🧭",
    content: "Access your active projects, client database, invoices, time tracking sheets, and analytics.",
    target: '[data-tour="dashboard"]',
    placement: "right"
  },
  {
    title: "Client Testimonials ⭐",
    content: "Manage reviews sent by your clients. Approve reviews to display them on your public portfolio.",
    target: '[data-tour="testimonials"]',
    placement: "right"
  },
  {
    title: "Public Portfolio 🌐",
    content: "Showcase your completed projects, work screenshots, demo videos, and testimonials to attract new clients.",
    target: '[data-tour="portfolio"]',
    placement: "right"
  },
  {
    title: "You're All Set! 🎉",
    content: "You're ready to make the most of Frevio. Start by creating a project or setting up your portfolio!",
    target: "body",
    placement: "center"
  }
]

export function ProductTour() {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [highlightRect, setHighlightRect] = useState<{
    top: number
    left: number
    width: number
    height: number
  } | null>(null)

  // Listen to the custom tour event
  useEffect(() => {
    function handleStartTour() {
      setStep(0)
      setIsOpen(true)
    }
    window.addEventListener('start-frevio-tour', handleStartTour)

    // Check if new user who hasn't completed tour yet
    const completed = localStorage.getItem('frevio-tour-completed')
    if (!completed) {
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 1500)
      return () => clearTimeout(timer)
    }

    return () => window.removeEventListener('start-frevio-tour', handleStartTour)
  }, [])

  // Find target element coordinates on step change
  useEffect(() => {
    if (!isOpen || step < 0 || step >= TOUR_STEPS.length) return

    const activeStep = TOUR_STEPS[step]
    if (activeStep.target === 'body') {
      setHighlightRect(null)
      return
    }

    const el = document.querySelector(activeStep.target)
    if (el) {
      const updateRect = () => {
        const r = el.getBoundingClientRect()
        if (r.width === 0 && r.height === 0) {
          setHighlightRect(null)
        } else {
          setHighlightRect({
            top: r.top,
            left: r.left,
            width: r.width,
            height: r.height
          })
        }
      }
      updateRect()
      window.addEventListener('resize', updateRect)
      window.addEventListener('scroll', updateRect, { passive: true })
      return () => {
        window.removeEventListener('resize', updateRect)
        window.removeEventListener('scroll', updateRect)
      }
    } else {
      setHighlightRect(null)
    }
  }, [step, isOpen])

  function handleNext() {
    if (step < TOUR_STEPS.length - 1) {
      setStep(step + 1)
    } else {
      handleComplete()
    }
  }

  function handleBack() {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  function handleComplete() {
    localStorage.setItem('frevio-tour-completed', 'true')
    setIsOpen(false)
  }

  if (!isOpen) return null

  const activeStep = TOUR_STEPS[step]

  // Calculate coordinates for dynamic tooltips
  let tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9999,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  }

  if (highlightRect) {
    const margin = 14
    if (activeStep.placement === 'right') {
      tooltipStyle.top = highlightRect.top + highlightRect.height / 2 - 80
      tooltipStyle.left = highlightRect.left + highlightRect.width + margin
    } else if (activeStep.placement === 'bottom') {
      tooltipStyle.top = highlightRect.top + highlightRect.height + margin
      tooltipStyle.left = highlightRect.left + highlightRect.width / 2 - 160
    } else {
      tooltipStyle.top = highlightRect.top - 180 - margin
      tooltipStyle.left = highlightRect.left + highlightRect.width / 2 - 160
    }

    // Boundary protection for tooltips
    if (typeof window !== 'undefined') {
      if (Number(tooltipStyle.top) < 16) tooltipStyle.top = 16
      if (Number(tooltipStyle.top) + 220 > window.innerHeight) {
        tooltipStyle.top = window.innerHeight - 236
      }
      if (Number(tooltipStyle.left) < 16) tooltipStyle.left = 16
      if (Number(tooltipStyle.left) + 330 > window.innerWidth) {
        tooltipStyle.left = window.innerWidth - 346
      }
    }
  } else {
    tooltipStyle.top = '50%'
    tooltipStyle.left = '50%'
    tooltipStyle.transform = 'translate(-50%, -50%)'
  }

  return (
    <div className="fixed inset-0 z-[9990] overflow-hidden pointer-events-none">
      {/* Dim overlay with cutout highlight spotlight */}
      <div 
        className="absolute inset-0 transition-all duration-300 pointer-events-auto bg-slate-950/45 dark:bg-slate-950/70"
        style={highlightRect ? {
          clipPath: `polygon(
            0% 0%, 
            0% 100%, 
            ${highlightRect.left}px 100%, 
            ${highlightRect.left}px ${highlightRect.top}px, 
            ${highlightRect.left + highlightRect.width}px ${highlightRect.top}px, 
            ${highlightRect.left + highlightRect.width}px ${highlightRect.top + highlightRect.height}px, 
            ${highlightRect.left}px ${highlightRect.top + highlightRect.height}px, 
            ${highlightRect.left}px 100%, 
            100% 100%, 
            100% 0%
          )`
        } : undefined}
        onClick={handleComplete}
      />

      {/* Spotlight border overlay */}
      {highlightRect && (
        <div 
          className="absolute border-2 border-indigo-500 rounded-xl transition-all duration-300 pointer-events-none shadow-[0_0_15px_rgba(99,102,241,0.5)] animate-pulse"
          style={{
            top: highlightRect.top - 4,
            left: highlightRect.left - 4,
            width: highlightRect.width + 8,
            height: highlightRect.height + 8,
          }}
        />
      )}

      {/* Interactive Tooltip Card */}
      <div 
        style={tooltipStyle}
        className="w-[320px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-2xl pointer-events-auto select-none"
      >
        <button
          onClick={handleComplete}
          className="absolute top-3 right-3 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-2 text-indigo-500">
          <Sparkles className="w-4 h-4 animate-bounce" />
          <span className="text-[11px] font-bold uppercase tracking-wider">Quick Tour</span>
        </div>

        <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1.5 leading-snug">
          {activeStep.title}
        </h3>
        
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
          {activeStep.content}
        </p>

        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4">
          <span className="text-[11px] font-medium text-slate-400">
            Step {step + 1} of {TOUR_STEPS.length}
          </span>
          <div className="flex gap-1.5">
            {step > 0 && (
              <button
                onClick={handleBack}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                aria-label="Previous step"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex items-center gap-1 py-1.5 px-3 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
            >
              {step === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
              {step < TOUR_STEPS.length - 1 && <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function TourTrigger() {
  function startTour() {
    window.dispatchEvent(new CustomEvent('start-frevio-tour'))
  }

  return (
    <button
      onClick={startTour}
      className="inline-flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold transition-colors focus:outline-none hover:underline mt-1"
    >
      <HelpCircle className="w-3.5 h-3.5" />
      Take a quick tour
    </button>
  )
}
