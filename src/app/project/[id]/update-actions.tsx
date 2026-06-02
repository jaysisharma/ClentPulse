'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2 } from 'lucide-react'

export function UpdateActions({ updateId, projectId }: { updateId: string; projectId: string }) {
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('Delete this update? This cannot be undone.')) return
    setDeleting(true)
    const supabase = createClient()
    await supabase.from('updates').delete().eq('id', updateId)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => router.push(`/project/${projectId}/update?edit=${updateId}`)}
        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
        title="Edit update"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
        title="Delete update"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
