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
    color: 'text-pink-400',
    bg: 'bg-pink-500/10 border-pink-500/20'
  },
  {
    value: 'feature_request',
    label: 'Feature Request',
    desc: 'Suggest a new capability or upgrade.',
    icon: Sparkles,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10 border-indigo-500/20'
  },
  {
    value: 'bug_report',
    label: 'Bug Report',
    desc: 'Report something broken or sluggish.',
    icon: AlertTriangle,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/20'
  },
  {
    value: 'support_message',
    label: 'Support / Ask',
    desc: 'Ask a question or seek assistance.',
    icon: HelpCircle,
    color: 'text-sky-400',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div
        className={cn(
          "w-full max-w-xl rounded-3xl bg-slate-900 border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-300 relative",
          success ? "scale-[0.98] border-emerald-500/20" : "scale-100"
        )}
      >

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="p-10 flex flex-col items-center justify-center text-center space-y-4 animate-scale-up">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Thank you for your feedback!</h3>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              We review every submission carefully. Your insights help shape the future of Frevio.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Share your thoughts</h2>
              <p className="text-xs text-slate-400 mt-1">Help us make Frevio the best client portal tool for builders.</p>
            </div>

            {/* Category Selectors */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Select Feedback Type</label>
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
                          ? cn("bg-white/[0.03] border-white/20 shadow-inner")
                          : "border-white/5 bg-white/[0.01] hover:bg-white/[0.02]"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className={cn("p-1 rounded-md border", active ? cat.bg : "bg-white/5 border-transparent")}>
                          <Icon className={cn("w-3.5 h-3.5", active ? cat.color : "text-slate-500")} />
                        </span>
                        <span className={cn("text-xs font-bold", active ? "text-white" : "text-slate-400")}>{cat.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1.5 leading-snug">{cat.desc}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Subject Input */}
            {category !== 'nps_score' && (
              <div className="space-y-1.5">
                <label htmlFor="subject" className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Subject</label>
                <input
                  type="text"
                  id="subject"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder={
                    category === 'bug_report' ? 'E.g., Invoices not opening in printing view' :
                      category === 'feature_request' ? 'E.g., Multi-currency client invoicing support' :
                        'E.g., Question about Stripe subscription renewals'
                  }
                  className="w-full text-xs text-white border border-white/5 bg-white/[0.02] rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white/[0.04] transition-all"
                />
              </div>
            )}

            {/* NPS / Feature Score */}
            {(category === 'nps_score' || category === 'feature_request') && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {category === 'nps_score' ? 'How likely are you to recommend Frevio?' : 'Priority Rating'}
                  </label>
                  <span className="text-xs font-mono font-bold text-indigo-400">{rating}/10</span>
                </div>
                <div className="flex gap-1 justify-between">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleRatingClick(val)}
                      className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-all border cursor-pointer",
                        rating === val
                          ? "bg-indigo-600 border-indigo-500 text-white shadow-lg"
                          : "bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      {val}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-[9px] text-slate-500 font-bold px-0.5">
                  <span>{category === 'nps_score' ? 'Not Likely' : 'Nice-to-have'}</span>
                  <span>{category === 'nps_score' ? 'Extremely Likely' : 'Critical Need'}</span>
                </div>
              </div>
            )}

            {/* Message/Comment Textarea */}
            <div className="space-y-1.5">
              <label htmlFor="comment" className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
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
                  category === 'bug_report' ? 'Please describe what happened, what you expected, and any console/device errors.' :
                    category === 'nps_score' ? 'What do you love most, or what is holding you back from a perfect 10 rating?' :
                      'Tell us as much detail as possible so we can build it correctly!'
                }
                className="w-full text-xs text-white border border-white/5 bg-white/[0.02] rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white/[0.04] transition-all resize-none"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl border border-white/5 text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-xs font-semibold disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 flex items-center gap-2 cursor-pointer"
                style={{ backgroundColor: '#6C4CFD' }}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </>
                ) : 'Submit Feedback'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
