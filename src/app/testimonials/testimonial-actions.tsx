'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Check, Trash2, X } from 'lucide-react'

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
    <div className="flex items-center gap-1 flex-shrink-0">
      {!approved && (
        <button onClick={approve} disabled={loading}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50">
          <Check className="w-3 h-3" />Approve
        </button>
      )}
      <button onClick={del} disabled={loading}
        className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
