'use client'

import { useState, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Activity, Check, Bell, ArrowLeft } from 'lucide-react'
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
      setError(err.code === '23505' ? 'You are already subscribed!' : err.message)
      setLoading(false)
      return
    }

    setLoading(false)
    setDone(true)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#08090a] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl rounded-full pointer-events-none" />
      
      <Link href={`/p/${slug}`} className="relative flex items-center gap-2 mb-8 group">
        <div className="w-8 h-8 bg-slate-900 text-white dark:bg-white dark:text-slate-950 rounded-xl flex items-center justify-center shadow-sm">
          <Activity className="w-4 h-4" />
        </div>
        <span className="font-semibold text-slate-900 dark:text-white tracking-tight group-hover:opacity-80 transition-opacity">
          Frevio
        </span>
      </Link>

      <div className="relative w-full max-w-sm bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 backdrop-blur-md shadow-xl dark:shadow-none p-8">
        {done ? (
          <div className="text-center">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400">
              <Check className="w-6 h-6" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-[10px] font-medium tracking-widest uppercase text-emerald-700 dark:text-emerald-400 mb-2">
              Subscription Active
            </div>
            <h1 className="text-xl font-light uppercase tracking-[-0.02em] text-slate-900 dark:text-white mb-2">
              Notifications Enabled
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs mb-6 leading-relaxed">
              You will receive an email whenever milestone deliverables or progress reports are published.
            </p>
            <Link
              href={`/p/${slug}`}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-semibold transition-colors shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to status portal
            </Link>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-2xl flex items-center justify-center mb-5 text-slate-700 dark:text-slate-300 shadow-xs">
              <Bell className="w-5 h-5" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100/70 dark:bg-white/[0.03] text-[10px] font-medium tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-2">
              Client Notifications
            </div>
            <h1 className="text-xl font-light uppercase tracking-[-0.02em] text-slate-900 dark:text-white mb-1">
              Follow Progress
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs mb-6 leading-relaxed">
              Provide your details to be notified whenever new project updates or milestone proofs are published.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jane Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full h-11 px-3.5 text-xs sm:text-sm border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50/60 dark:bg-white/[0.03] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-white/30 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full h-11 px-3.5 text-xs sm:text-sm border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50/60 dark:bg-white/[0.03] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-white/30 transition-colors"
                />
              </div>

              {error && (
                <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl px-3.5 py-2.5">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50 shadow-xs mt-2"
              >
                {loading ? 'Subscribing…' : 'Subscribe to Updates'}
              </button>
            </form>

            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-4 text-center">
              Zero spam. You can unsubscribe at any time.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
