import type { Metadata } from 'next'
import { cn } from '@/lib/utils'
import { requireClientWorkspace } from '../client-context'
import { ClientShell } from '../client-shell'
import { MUTED, PANEL } from '../client-ui'
import { MessagesView, type Thread } from './messages-view'

export const metadata: Metadata = { title: 'Messages', robots: { index: false, follow: false } }

export default async function ClientMessagesPage({ searchParams }: { searchParams: Promise<{ project?: string }> }) {
  const [{ email, workspace }, { project }] = await Promise.all([requireClientWorkspace(), searchParams])

  // Active projects first; a conversation per project
  const threads: Thread[] = [...workspace.projects]
    .sort((a, b) => Number(a.status === 'completed') - Number(b.status === 'completed'))
    .map(p => ({ id: p.id, name: p.name, clientName: p.clientName, studio: p.studio, finished: p.status === 'completed' }))
  const explicit = Boolean(project && threads.some(t => t.id === project))
  const selectedId = explicit ? project! : threads[0]?.id ?? null
  const showStudio = new Set(threads.map(t => t.studio.id)).size > 1

  return (
    <ClientShell active="messages" email={email} projectIds={threads.map(t => t.id)} wide>
      <section>
        <h1 className="text-[26px] sm:text-[28px] font-bold tracking-[-0.02em]">Messages</h1>
        <p className={cn('mt-2 text-base leading-relaxed', MUTED)}>One conversation per project with the team doing the work.</p>
      </section>

      {threads.length === 0 ? (
        <section className={cn(PANEL, 'max-w-[720px]')}>
          <h2 className="text-lg font-bold">No conversations yet</h2>
          <p className={cn('mt-2 text-[15px] leading-relaxed', MUTED)}>You can message a studio here once you have a project with them.</p>
        </section>
      ) : (
        <MessagesView threads={threads} selectedId={selectedId} explicit={explicit} showStudio={showStudio} />
      )}
    </ClientShell>
  )
}
