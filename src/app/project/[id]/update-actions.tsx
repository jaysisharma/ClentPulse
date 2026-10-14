'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2 } from 'lucide-react'

export function UpdateActions({ updateId, projectId }: { updateId: string; projectId: string }) {
  const [deleting, setDeleting] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setDeleting(true)
    const supabase = createClient()
    await supabase.from('updates').delete().eq('id', updateId)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => router.push(`/project/${projectId}/update?edit=${updateId}`)}
        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
        title="Edit update"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>

      {confirming ? (
        <span className="inline-flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
          <span>Delete?</span>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="font-bold underline hover:text-rose-300 cursor-pointer"
          >
            Yes
          </button>
          <span className="text-slate-600">·</span>
          <button
            onClick={() => setConfirming(false)}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            Cancel
          </button>
        </span>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          disabled={deleting}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
          title="Delete update"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
