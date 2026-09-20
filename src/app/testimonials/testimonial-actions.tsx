'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Check, Trash2 } from 'lucide-react'

export function TestimonialActions({ id, approved = false }: { id: string; approved?: boolean }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function approve() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('testimonials').update({ approved: true }).eq('id', id)
    setLoading(false); router.refresh()
  }

  async function del() {
    if (!confirm('Delete this testimonial?')) return
    setLoading(true)
    const supabase = createClient()
    await supabase.from('testimonials').delete().eq('id', id)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      {!approved && (
        <button
          onClick={approve}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 transition-all disabled:opacity-50 shadow-xs"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Approve</span>
        </button>
      )}
      <button
        onClick={del}
        disabled={loading}
        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all disabled:opacity-50"
        aria-label="Delete testimonial"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
