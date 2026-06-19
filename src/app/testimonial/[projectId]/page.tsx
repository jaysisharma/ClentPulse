'use client'

import { useState, use, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Zap, Star, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function TestimonialPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params)
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-10 max-w-sm text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${accent}20` }}>
          <Check className="w-7 h-7" style={{ color: accent }} />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Thank you!</h1>
        <p className="text-slate-500 text-sm">Your feedback has been submitted and is awaiting review.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: accent }}>
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-slate-900 text-sm">{owner?.name ?? 'Your freelancer'}</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Leave a testimonial</h1>
          <p className="text-slate-500 text-sm mb-6">
            {project ? `Share your experience working on ${project.project_name}.` : 'Share your experience.'}
          </p>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Your name</label>
              <input className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Jane Smith" value={clientName} onChange={e => setClientName(e.target.value)} required />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} type="button"
                    onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => setRating(n)}>
                    <Star className={`w-8 h-8 transition-colors ${n <= (hover || rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Your feedback</label>
              <textarea
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                rows={4}
                placeholder="What was it like working together? What did you appreciate most?"
                value={content}
                onChange={e => setContent(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</div>
            )}
            <Button type="submit" loading={loading} disabled={!rating} className="w-full justify-center">
              Submit testimonial
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
