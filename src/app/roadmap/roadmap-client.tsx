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
      const stored = localStorage.getItem('frevio_upvoted_features')
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

      // Fetch updated list of feature requests
      // For instant response, we can append a mock item or trigger a query.
      // Since it's a demo, we can just append it locally to state:
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
  // Features with more votes go first. Completed/declined items go to the bottom.
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
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'planned':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
      case 'declined':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    }
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            Product Specs & Roadmap
          </h1>
          <p className="text-xs text-slate-400 mt-1">See what is implemented, what is in active specs, or suggest and upvote community ideas.</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-900 border border-white/5 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('official')}
            className={cn(
              "px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer",
              activeTab === 'official'
                ? "bg-white/10 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            )}
          >
            Official Specs
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={cn(
              "px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer",
              activeTab === 'community'
                ? "bg-white/10 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            )}
          >
            Community Requests
          </button>
        </div>
      </div>

      {activeTab === 'official' ? (
        <div className="prose-like bg-slate-900/40 p-6 md:p-8 rounded-3xl border border-white/5 backdrop-blur-xs">
          <div dangerouslySetInnerHTML={{ __html: htmlSpecs }} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Suggestions List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-3 bg-slate-900 border border-white/5 rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search community features..."
                className="w-full bg-transparent text-xs text-white focus:outline-none placeholder:text-slate-500"
              />
            </div>

            {filteredSuggestions.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-white/10 rounded-3xl bg-slate-900/20 text-slate-450">
                <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                <p className="text-xs">No feature suggestions found.</p>
                <p className="text-[10px] text-slate-500 mt-1">Be the first to submit one in the panel next door!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSuggestions.map(s => {
                  const hasUpvoted = upvotedIds.includes(s.id)
                  return (
                    <div 
                      key={s.id}
                      className="p-5 bg-slate-900 border border-white/5 rounded-2xl flex items-start gap-4 hover:border-white/10 transition-colors"
                    >
                      {/* Upvote Button */}
                      <button
                        onClick={() => handleUpvote(s.id)}
                        disabled={hasUpvoted || s.status === 'completed' || s.status === 'declined'}
                        className={cn(
                          "flex flex-col items-center justify-center w-12 h-14 rounded-xl border transition-all flex-shrink-0 cursor-pointer",
                          hasUpvoted
                            ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-400"
                            : s.status === 'completed' || s.status === 'declined'
                              ? "bg-slate-900 border-white/5 text-slate-650 opacity-40 cursor-not-allowed"
                              : "bg-white/[0.01] border-white/5 text-slate-400 hover:bg-white/[0.03] hover:text-white hover:border-white/15"
                        )}
                      >
                        <ThumbsUp className={cn("w-4 h-4", hasUpvoted && "fill-indigo-400")} />
                        <span className="text-[10px] font-bold font-mono mt-1">{s.votes}</span>
                      </button>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-white leading-tight truncate">{s.subject}</h3>
                          <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider flex-shrink-0", getStatusBadgeClass(s.status))}>
                            {s.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-medium">{s.comment}</p>
                        {s.rating !== null && (
                          <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-bold uppercase pt-1">
                            <span>Freelancer Priority Impact:</span>
                            <span className="text-indigo-400 font-mono">{s.rating}/10</span>
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
          <div className="lg:col-span-5 bg-slate-900 border border-white/5 p-6 rounded-3xl space-y-5">
            <div className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-indigo-400" />
              <h2 className="text-sm font-bold text-white tracking-tight">Suggest a Feature</h2>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              Have an idea that would save you administrative hours? Submit it below. If other freelancers upvote it, we will prioritize building it.
            </p>

            <form onSubmit={handleSubmitSuggestion} className="space-y-4 pt-1">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Feature Title</label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="E.g., Automated time tracking desktop widget"
                  className="w-full text-xs text-white border border-white/5 bg-white/[0.01] rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white/[0.03] transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Critical Rating</label>
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mb-1">
                  <span>How important is this to you?</span>
                  <span className="text-indigo-400 font-mono">{rating}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={rating}
                  onChange={e => setRating(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[8px] text-slate-500 font-bold px-0.5">
                  <span>Nice to have</span>
                  <span>Dealbreaker</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Details & Value</label>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows={4}
                  placeholder="Explain what problem this solves and how it fits into your freelance workflow."
                  className="w-full text-xs text-white border border-white/5 bg-white/[0.01] rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white/[0.03] transition-all resize-none"
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Suggestion submitted and added to the board!</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 cursor-pointer"
                style={{ backgroundColor: '#6C4CFD' }}
              >
                {submitting ? 'Submitting...' : 'Submit Suggestion'}
              </button>
            </form>
          </div>

        </div>
      )}
    </div>
  )
}
