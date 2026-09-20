'use client'

import { useState, use, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Zap, Star, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function TestimonialPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>
  searchParams: Promise<{ rating?: string }>
}) {
  const { projectId } = use(params)
  const { rating: queryRating } = use(searchParams)
  const [project, setProject] = useState<{ project_name: string; client_name: string } | null>(null)
  const [owner, setOwner] = useState<{ name: string | null; accent_color: string | null } | null>(null)
  const [ownerId, setOwnerId] = useState<string | null>(null)
  const [clientName, setClientName] = useState('')
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.from('projects').select('project_name,client_name,user_id').eq('id', projectId).single().then(async ({ data: p }: { data: any }) => {
      if (!p) return
      setProject(p)
      setClientName(p.client_name)
      setOwnerId(p.user_id)   // keep so submit() doesn't have to re-query
      const { data: u }: { data: any } = await supabase.from('users').select('name,accent_color').eq('id', p.user_id).single()
      setOwner(u)
    })
  }, [projectId])

  useEffect(() => {
    if (queryRating) {
      const r = parseInt(queryRating)
      if (r >= 1 && r <= 5) setRating(r)
    }
  }, [queryRating])

  const accent = owner?.accent_color ?? '#6366F1'

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!rating) return
    if (!ownerId) { setError('We couldn’t load this project. Please refresh and try again.'); return }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: insErr } = await supabase
      .from('testimonials')
      .insert({ project_id: projectId, user_id: ownerId, client_name: clientName, rating, content })
    setLoading(false)
    // Only show the success screen if it actually saved — otherwise the client
    // walks away thinking they left a review that never reached the freelancer.
    if (insErr) { setError('Something went wrong submitting your feedback. Please try again.'); return }
    setDone(true)
  }

  if (done) return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#08090a] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/5 blur-3xl rounded-full pointer-events-none" />
      <div className="relative bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 backdrop-blur-md p-8 sm:p-10 max-w-sm w-full text-center shadow-xl dark:shadow-none space-y-4">
        <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
          <Check className="w-7 h-7" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-[10px] font-medium tracking-widest uppercase text-emerald-700 dark:text-emerald-400">
          Client Feedback
        </div>
        <h1 className="text-xl font-light uppercase tracking-[-0.02em] text-slate-900 dark:text-white">
          Review Received
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-normal">
          Your endorsement has been securely recorded and safely delivered to {owner?.name ?? 'your studio lead'}.
        </p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#08090a] text-slate-900 dark:text-white font-sans relative overflow-hidden selection:bg-slate-200 dark:selection:bg-white/20">
      {/* Subtle top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 bg-indigo-500/5 dark:bg-indigo-500/[0.03] blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#08090a]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-lg mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs" style={{ backgroundColor: accent }}>
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-slate-900 dark:text-white text-sm">{owner?.name ?? 'Studio Showcase'}</span>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">Client Feedback Portal</div>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-6 py-10 relative">
        <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 backdrop-blur-md p-7 sm:p-9 shadow-xs dark:shadow-none">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100/70 dark:bg-white/[0.03] text-[10px] font-medium tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-2">
            Verified Review
          </div>
          <h1 className="text-xl sm:text-2xl font-light uppercase tracking-[-0.02em] text-slate-900 dark:text-white mb-1">
            Client Experience Review
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mb-6 leading-relaxed">
            {project ? `Share your collaborative experience regarding ${project.project_name}.` : 'Share your thoughts on the collaboration.'}
          </p>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Your Name & Title
              </label>
              <input
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-white/30 transition-colors"
                placeholder="Jane Smith, VP of Product"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                Overall Engagement Rating
              </label>
              <div className="flex items-center gap-2 p-3 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] w-fit">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(n)}
                    className="p-1 cursor-pointer transition-transform hover:scale-110 active:scale-95"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        n <= (hover || rating)
                          ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                          : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Detailed Testimonial
              </label>
              <textarea
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-white/30 resize-none transition-colors"
                rows={4}
                placeholder="What was it like collaborating with the studio? What stood out most in communication, velocity, and quality?"
                value={content}
                onChange={e => setContent(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl px-3.5 py-2.5">
                {error}
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              disabled={!rating}
              className="w-full h-11 justify-center rounded-full text-xs font-semibold uppercase tracking-wider transition-all shadow-sm text-white disabled:opacity-50"
              style={{ backgroundColor: accent, borderColor: accent }}
            >
              Submit Verified Testimonial
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
