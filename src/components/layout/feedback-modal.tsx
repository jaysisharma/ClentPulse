'use client'

import { useState } from 'react'
import { X, Sparkles, MessageSquare, AlertTriangle, HelpCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
}

type FeedbackCategory = 'feature_request' | 'bug_report' | 'support_message' | 'nps_score'

const categories: { value: FeedbackCategory; label: string; desc: string; icon: any; color: string; bg: string }[] = [
  {
    value: 'nps_score',
    label: 'Overall Rating',
    desc: 'Rate your overall experience.',
    icon: MessageSquare,
    color: 'text-pink-500 dark:text-pink-400',
    bg: 'bg-pink-500/10 border-pink-500/20'
  },
  {
    value: 'feature_request',
    label: 'Feature Request',
    desc: 'Suggest a new capability or tool.',
    icon: Sparkles,
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-500/10 border-indigo-500/20'
  },
  {
    value: 'bug_report',
    label: 'Bug Report',
    desc: 'Report something broken or sluggish.',
    icon: AlertTriangle,
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/20'
  },
  {
    value: 'support_message',
    label: 'Support / Inquiry',
    desc: 'Ask a question or seek assistance.',
    icon: HelpCircle,
    color: 'text-sky-600 dark:text-sky-400',
    bg: 'bg-sky-500/10 border-sky-500/20'
  },
]

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [category, setCategory] = useState<FeedbackCategory>('nps_score')
  const [subject, setSubject] = useState('')
  const [comment, setComment] = useState('')
  const [rating, setRating] = useState<number>(8)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleRatingClick = (val: number) => {
    setRating(val)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!comment.trim()) {
      setError('Please write a message explaining your feedback.')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/freelancer-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          subject: category === 'nps_score' ? 'Overall Rating' : subject,
          comment,
          rating: (category === 'nps_score' || category === 'feature_request') ? rating : null,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit feedback')
      }

      setSuccess(true)
      setTimeout(() => {
        handleReset()
        onClose()
      }, 2500)
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setCategory('nps_score')
    setSubject('')
    setComment('')
    setRating(8)
    setSuccess(false)
    setError(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md dark:backdrop-blur-xl animate-fade-in">
      <div
        className={cn(
          "w-full max-w-xl rounded-[28px] bg-white dark:bg-[#0c0d12] border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/10 shadow-2xl dark:shadow-[0_30px_90px_rgba(0,0,0,0.95)] overflow-hidden transition-all duration-300 relative",
          success ? "scale-[0.98] border-emerald-500/20" : "scale-100"
        )}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {success ? (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-4 animate-scale-up">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 dark:text-emerald-400 mb-2">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-medium tracking-tight text-slate-900 dark:text-white">Feedback Received</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed font-normal">
              We review every note carefully. Your feedback and suggestions help shape future Frevio releases.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400 dark:text-slate-400">
                  Feedback & Suggestions
                </span>
              </div>
              <h2 className="text-xl font-normal tracking-tight text-slate-900 dark:text-white">Share Your Thoughts</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Help us refine Frevio for high-performing freelancers and boutique studios.
              </p>
            </div>

            {/* Category Selectors */}
            <div className="space-y-2">
              <label className="block text-[10px] font-medium uppercase tracking-[0.15em] text-slate-400 dark:text-slate-400">
                Channel
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map(cat => {
                  const Icon = cat.icon
                  const active = category === cat.value
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={cn(
                        "flex flex-col items-start text-left p-3 rounded-xl border transition-all cursor-pointer",
                        active
                          ? "bg-indigo-50/50 border-indigo-300 dark:bg-white/[0.08] dark:border-white/30 ring-1 ring-indigo-500/20 dark:ring-white/10"
                          : "border-slate-200 dark:border-white/5 bg-slate-50/60 dark:bg-white/[0.02] hover:bg-slate-100/60 dark:hover:bg-white/[0.05] hover:border-slate-300 dark:hover:border-white/15"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className={cn("p-1 rounded-md border", active ? cat.bg : "bg-white dark:bg-white/5 border-slate-200 dark:border-transparent")}>
                          <Icon className={cn("w-3.5 h-3.5", active ? cat.color : "text-slate-400 dark:text-slate-500")} />
                        </span>
                        <span className={cn("text-xs font-medium", active ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400")}>
                          {cat.label}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 mt-1.5 leading-snug">
                        {cat.desc}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Subject Input */}
            {category !== 'nps_score' && (
              <div className="space-y-1.5">
                <label htmlFor="subject" className="block text-[10px] font-medium uppercase tracking-[0.15em] text-slate-400 dark:text-slate-400">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder={
                    category === 'bug_report' ? 'E.g., Invoices not rendering in PDF view' :
                      category === 'feature_request' ? 'E.g., Multi-currency client invoicing support' :
                        'E.g., Question about Stripe webhook renewals'
                  }
                  className="w-full text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] rounded-xl px-3.5 py-2.5 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 dark:focus:border-white/30 focus:ring-1 focus:ring-indigo-500/20 dark:focus:ring-white/20 transition-all"
                />
              </div>
            )}

            {/* NPS / Feature Score */}
            {(category === 'nps_score' || category === 'feature_request') && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-medium uppercase tracking-[0.15em] text-slate-400 dark:text-slate-400">
                    {category === 'nps_score' ? 'How likely are you to recommend Frevio?' : 'Priority Rating'}
                  </label>
                  <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 px-2 py-0.5 rounded-full font-medium">
                    {rating} / 10
                  </span>
                </div>
                <div className="grid grid-cols-10 gap-1">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleRatingClick(val)}
                      className={cn(
                        "h-8 rounded-lg flex items-center justify-center text-xs font-mono transition-all border cursor-pointer",
                        rating === val
                          ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white font-bold shadow-xs dark:shadow-[0_0_12px_rgba(255,255,255,0.3)]"
                          : "bg-slate-100 dark:bg-white/[0.02] border-slate-200/80 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                      )}
                    >
                      {val}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 px-0.5">
                  <span>{category === 'nps_score' ? 'Not Likely' : 'Nice-to-have'}</span>
                  <span>{category === 'nps_score' ? 'Extremely Likely' : 'Critical Requirement'}</span>
                </div>
              </div>
            )}

            {/* Message/Comment Textarea */}
            <div className="space-y-1.5">
              <label htmlFor="comment" className="block text-[10px] font-medium uppercase tracking-[0.15em] text-slate-400 dark:text-slate-400">
                {category === 'bug_report' ? 'Steps to Reproduce / Details' :
                  category === 'support_message' ? 'What can we help you with?' :
                    category === 'nps_score' ? 'What is the main reason for your score?' :
                      'Describe the feature & workflow value'}
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={4}
                placeholder={
                  category === 'bug_report' ? 'Describe what happened, what you expected, and any errors seen.' :
                    category === 'nps_score' ? 'What do you appreciate most, or what would get us to a 10/10?' :
                      'Describe your ideal workflow or requested integration.'
                }
                className="w-full text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] rounded-xl px-3.5 py-2.5 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 dark:focus:border-white/30 focus:ring-1 focus:ring-indigo-500/20 dark:focus:ring-white/20 transition-all resize-none leading-relaxed"
              />
            </div>

            {/* Error Notice */}
            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs rounded-xl flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white px-5 py-2 text-xs transition-all cursor-pointer disabled:opacity-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold px-6 py-2 text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit Feedback'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
