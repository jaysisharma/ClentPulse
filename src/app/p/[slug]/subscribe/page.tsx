'use client'

import { useState, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Zap, Check, Bell } from 'lucide-react'
import Link from 'next/link'

export default function SubscribePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: project } = await supabase.from('projects').select('id').eq('slug', slug).single()
    if (!project) { setError('Project not found.'); setLoading(false); return }

    const { error: err } = await supabase.from('subscribers').insert({ project_id: project.id, email, name: name || null })
    if (err) {
      setError(err.code === '23505' ? 'You\'re already subscribed!' : err.message)
      setLoading(false)
      return
    }

    setLoading(false)
    setDone(true)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <Link href={`/p/${slug}`} className="flex items-center gap-2 mb-10">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-slate-900">Frevio</span>
      </Link>

      <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        {done ? (
          <div className="text-center">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7 text-emerald-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">You&apos;re subscribed!</h1>
            <p className="text-slate-500 text-sm mb-6">You&apos;ll get an email every time a new update is posted.</p>
            <Link href={`/p/${slug}`} className="text-sm text-indigo-600 font-medium hover:underline">
              ← Back to status page
            </Link>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-5">
              <Bell className="w-6 h-6 text-indigo-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-1">Get update notifications</h1>
            <p className="text-slate-500 text-sm mb-6">Enter your email to be notified whenever a new progress update is posted.</p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Your name (optional)"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />

              {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Subscribing…' : 'Subscribe to updates'}
              </button>
            </form>

            <p className="text-xs text-slate-400 mt-4 text-center">No spam. Unsubscribe any time.</p>
          </>
        )}
      </div>
    </div>
  )
}
