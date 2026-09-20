'use client'

import { useState, useEffect } from 'react'
import { ThumbsUp, Sparkles, MessageSquare, Search, PlusCircle, AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Suggestion {
  id: string
  subject: string
  comment: string
  rating: number | null
  votes: number
  status: 'pending' | 'planned' | 'in_progress' | 'completed' | 'declined'
  created_at: string
}

interface RoadmapClientProps {
  htmlSpecs: string
  initialSuggestions: Suggestion[]
}

export function RoadmapClient({ htmlSpecs, initialSuggestions }: RoadmapClientProps) {
  const [activeTab, setActiveTab] = useState<'official' | 'community'>('official')
  const [suggestions, setSuggestions] = useState<Suggestion[]>(initialSuggestions)
  const [searchQuery, setSearchQuery] = useState('')
  const [upvotedIds, setUpvotedIds] = useState<string[]>([])

  // Form states
  const [subject, setSubject] = useState('')
  const [comment, setComment] = useState('')
  const [rating, setRating] = useState<number>(5)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load upvoted items from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('frevio_upvoted_features') || localStorage.getItem('clientpulse_upvoted_features')
      if (stored) {
        setUpvotedIds(JSON.parse(stored))
      }
    } catch (e) {
      console.error('Failed to load upvoted features from localStorage:', e)
    }
  }, [])

  const handleUpvote = async (id: string) => {
    if (upvotedIds.includes(id)) return

    try {
      const response = await fetch('/api/freelancer-feedback/upvote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbackId: id }),
      })

      if (!response.ok) throw new Error('Failed to upvote')

      const data = await response.json()
      
      // Update local votes count
      setSuggestions(prev => 
        prev.map(s => s.id === id ? { ...s, votes: data.votes } : s)
      )

      // Save to upvoted list
      const newUpvoted = [...upvotedIds, id]
      setUpvotedIds(newUpvoted)
      localStorage.setItem('frevio_upvoted_features', JSON.stringify(newUpvoted))
    } catch (err) {
      console.error('Upvote failed:', err)
    }
  }

  const handleSubmitSuggestion = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!subject.trim() || !comment.trim()) {
      setError('Please fill in both a title and details for your feature request.')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/freelancer-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'feature_request',
          subject,
          comment,
          rating,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit suggestion')
      }

      setSuccess(true)
      
      // Clear form
      setSubject('')
      setComment('')
      setRating(5)

      const newSuggestion: Suggestion = {
        id: Math.random().toString(), // fallback temporary id
        subject,
        comment,
        rating,
        votes: 1,
        status: 'pending',
        created_at: new Date().toISOString(),
      }
      setSuggestions(prev => [newSuggestion, ...prev])

      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to submit feature request.')
    } finally {
      setSubmitting(false)
    }
  }

  // Filter and sort suggestions
  const filteredSuggestions = suggestions
    .filter(s => 
      s.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.comment.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const isAEnded = a.status === 'completed' || a.status === 'declined'
      const isBEnded = b.status === 'completed' || b.status === 'declined'
      if (isAEnded && !isBEnded) return 1
      if (!isAEnded && isBEnded) return -1
      return b.votes - a.votes
    })

  const getStatusBadgeClass = (status: Suggestion['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
      case 'in_progress':
        return 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20'
      case 'planned':
        return 'bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-500/20'
      case 'declined':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
      default:
        return 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Product Roadmap & Specs
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light uppercase tracking-[-0.03em] text-slate-900 dark:text-white">
            Roadmap
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-normal">
            Inspect live platform features, active engineering specifications, and community initiatives.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-white/[0.04] p-1 rounded-full border border-slate-200 dark:border-white/10 self-start sm:self-auto shadow-xs">
          <button
            onClick={() => setActiveTab('official')}
            className={cn(
              "px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer",
              activeTab === 'official'
                ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            Platform Specs
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={cn(
              "px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer",
              activeTab === 'community'
                ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            Community Board
          </button>
        </div>
      </div>

      {activeTab === 'official' ? (
        <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 backdrop-blur-md p-6 sm:p-8 shadow-xs dark:shadow-none">
          <div dangerouslySetInnerHTML={{ __html: htmlSpecs }} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Suggestions List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search community feature requests..."
                className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors w-full shadow-xs"
              />
            </div>

            {filteredSuggestions.length === 0 ? (
              <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/40 text-slate-500 dark:text-slate-400">
                <MessageSquare className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">No feature suggestions match your search.</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Be the first to submit a proposal using the form!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSuggestions.map(s => {
                  const hasUpvoted = upvotedIds.includes(s.id)
                  return (
                    <div 
                      key={s.id}
                      className="p-5 bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 flex items-start gap-4 transition-all hover:border-slate-300 dark:hover:border-white/20 shadow-xs dark:shadow-none"
                    >
                      {/* Upvote Button */}
                      <button
                        onClick={() => handleUpvote(s.id)}
                        disabled={hasUpvoted || s.status === 'completed' || s.status === 'declined'}
                        className={cn(
                          "flex flex-col items-center justify-center w-12 h-14 rounded-xl border transition-all flex-shrink-0 cursor-pointer shadow-xs",
                          hasUpvoted
                            ? "bg-indigo-50 dark:bg-indigo-500/15 border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 font-semibold"
                            : s.status === 'completed' || s.status === 'declined'
                              ? "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 text-slate-400 opacity-40 cursor-not-allowed"
                              : "bg-slate-50/60 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white"
                        )}
                      >
                        <ThumbsUp className={cn("w-4 h-4", hasUpvoted && "fill-indigo-600 dark:fill-indigo-400")} />
                        <span className="text-[10px] font-bold font-mono mt-1">{s.votes}</span>
                      </button>

                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap justify-between">
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight truncate">{s.subject}</h3>
                          <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-semibold border uppercase tracking-wider flex-shrink-0", getStatusBadgeClass(s.status))}>
                            {s.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">{s.comment}</p>
                        {s.rating !== null && (
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider pt-1">
                            <span>Impact priority:</span>
                            <span className="text-indigo-600 dark:text-indigo-400 font-mono font-semibold">{s.rating}/10</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Submission Widget */}
          <div className="lg:col-span-5 bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 backdrop-blur-md p-6 space-y-5 shadow-xs dark:shadow-none">
            <div className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Suggest a Feature</h2>
            </div>
            
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
              Have an idea that would save studio time or enhance client relationships? Submit it below for community voting.
            </p>

            <form onSubmit={handleSubmitSuggestion} className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Feature Title</label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. Automated PDF ledger statement generation"
                  className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors w-full"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  <label className="uppercase tracking-wider">Importance Rating</label>
                  <span className="text-indigo-600 dark:text-indigo-400 font-mono font-semibold">{rating}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={rating}
                  onChange={e => setRating(parseInt(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-400 dark:text-slate-500 font-medium px-0.5">
                  <span>Nice to have</span>
                  <span>Critical requirement</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Details & Impact</label>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows={4}
                  placeholder="Describe the workflow problem this solves and how it fits into your daily operations..."
                  className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors w-full resize-none"
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs rounded-xl flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Suggestion submitted to the community board!</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold px-5 py-2.5 text-xs transition-all shadow-xs disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {submitting ? 'Submitting proposal...' : 'Submit Proposal'}
              </button>
            </form>
          </div>

        </div>
      )}
    </div>
  )
}
