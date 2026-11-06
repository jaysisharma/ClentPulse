'use client'

import { useState } from 'react'
import { ChevronDown, MessageSquare } from 'lucide-react'
import { formatDate, cn } from '@/lib/utils'
import { VideoEmbed } from '@/components/ui/video-embed'
import { UpdateCommentForm } from './update-comment-form'
import { DIVIDE, EmptyState, MUTED, Section } from './portal-ui'

export function UpdateItem({
  update,
  projectId,
  clientName,
  accent,
  comments,
}: {
  update: any
  projectId: string
  clientName: string
  accent: string
  comments: any[]
}) {
  const bullets: string[] = Array.isArray(update.bullets) ? update.bullets.filter(Boolean) : []
  return (
    <article className="p-5 space-y-3">
      <h3 className={cn('text-xs font-semibold', MUTED)}>
        <time dateTime={update.sent_at}>{formatDate(update.sent_at)}</time>
      </h3>
      {bullets.length > 0 && (
        <ul className="space-y-1.5">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: accent }} />
              <span className="break-words min-w-0">{b}</span>
            </li>
          ))}
        </ul>
      )}
      {update.note && <p className={cn('text-sm leading-relaxed whitespace-pre-line break-words', MUTED)}>{update.note}</p>}
      {update.video_url && <VideoEmbed url={update.video_url} accentColor={accent} />}
      <UpdateCommentForm
        updateId={update.id}
        projectId={projectId}
        accentColor={accent}
        existingComments={comments}
        defaultAuthorName={clientName}
      />
    </article>
  )
}

const PAGE_SIZE = 5

export function UpdatesTab({
  updates,
  comments,
  projectId,
  clientName,
  ownerFirstName,
  accent,
}: {
  updates: any[]
  comments: any[]
  projectId: string
  clientName: string
  ownerFirstName: string
  accent: string
}) {
  const [visible, setVisible] = useState(PAGE_SIZE)

  return (
    <Section title="Updates" bodyClassName="">
      {updates.length === 0 ? (
        <div className="px-5 pb-5">
          <EmptyState icon={MessageSquare} title="No updates yet." detail={`Progress updates from ${ownerFirstName} will show up here.`} />
        </div>
      ) : (
        <div className={cn(DIVIDE, 'border-t border-[#f1f3f7] dark:border-white/[0.05]')}>
          {updates.slice(0, visible).map(u => (
            <UpdateItem
              key={u.id}
              update={u}
              projectId={projectId}
              clientName={clientName}
              accent={accent}
              comments={comments.filter(c => c.update_id === u.id)}
            />
          ))}
          {updates.length > visible && (
            <button
              type="button"
              onClick={() => setVisible(v => v + PAGE_SIZE)}
              className="w-full min-h-11 px-5 py-3 text-xs font-semibold flex items-center justify-center gap-1 hover:bg-slate-50 dark:hover:bg-white/[0.02] cursor-pointer"
              style={{ color: accent }}
            >
              Show older updates ({updates.length - visible})
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </Section>
  )
}
