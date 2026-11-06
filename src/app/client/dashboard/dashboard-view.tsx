import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { ClientWorkspace } from '@/lib/client-workspace'
import { ClientShell } from '../client-shell'
import { MUTED, PANEL, RULE, Row, SECTION_LABEL, StudioDot, buttonColor, shortDate } from '../client-ui'
import { buildDashboard, buildUpdates, type ActionItem } from './dashboard-model'

// The client's home across every studio they work with. Built around one idea:
// show ONE thing to do first, keep everything else quiet. Depth lives in the
// sub pages (projects, billing, updates, messages) and each project's portal.

function firstName(fullName: string | undefined, email: string | undefined) {
  const name = fullName?.trim().split(/\s+/)[0]
  if (name) return name
  const local = email?.split('@')[0]?.split(/[._-]/)[0] ?? ''
  return local ? local[0].toUpperCase() + local.slice(1) : ''
}

function FocusCard({ item, position, total }: { item: ActionItem; position: number; total: number }) {
  const mailto = item.studio.contactEmail
    ? `mailto:${item.studio.contactEmail}?subject=${encodeURIComponent(`Question about ${item.projectName || 'my project'}`)}`
    : null
  return (
    <section
      aria-labelledby="focus-title"
      className="rounded-2xl bg-white dark:bg-[#12141c] p-6 sm:p-7 shadow-[0_1px_2px_rgba(17,19,24,0.04),0_8px_24px_rgba(17,19,24,0.06)] dark:shadow-none dark:border dark:border-white/[0.08]"
    >
      <div className="flex items-center justify-between gap-3 text-[13px]">
        <span className={cn('font-bold', item.blocking ? 'text-[#9A4A00] dark:text-amber-400' : MUTED)}>{item.reason}</span>
        {total > 1 && <span className={MUTED}>{position} of {total}</span>}
      </div>
      <h2 id="focus-title" className="mt-3 text-[22px] font-bold tracking-[-0.01em] leading-snug break-words">{item.title}</h2>
      <p className={cn('mt-2 text-[15px] leading-relaxed', MUTED)}>{item.context}</p>
      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
        <Link
          href={item.href}
          className="inline-flex items-center min-h-[46px] px-[22px] rounded-[10px] text-white text-[15px] font-semibold hover:opacity-90 transition-opacity"
          style={{ backgroundColor: buttonColor(item.studio.accent) }}
        >
          {item.actionLabel}
        </Link>
        {mailto && (
          <a href={mailto} className="text-sm font-medium text-[#3A3F4A] dark:text-slate-300 underline-offset-4 hover:underline">
            Ask {item.studio.name} a question
          </a>
        )}
      </div>
    </section>
  )
}

export function ClientDashboardView({
  email,
  fullName,
  workspace,
}: {
  email: string
  fullName?: string
  workspace: ClientWorkspace
}) {
  const dashboard = buildDashboard(workspace)
  const [focus, ...rest] = dashboard.items
  const name = firstName(fullName, email)
  const blockingCount = dashboard.items.filter(i => i.blocking).length
  const latestUpdate = buildUpdates(workspace)[0]

  // When nothing needs the client, say when the next thing likely will
  const upcoming = workspace.projects
    .filter(p => p.status === 'active')
    .flatMap(p => p.milestones.filter(m => !m.done && m.due_date).map(m => ({ project: p.name, title: m.title, due: m.due_date! })))
    .sort((a, b) => a.due.localeCompare(b.due))[0]

  const count = dashboard.items.length === 1 ? 'One thing needs you' : `${dashboard.items.length} things need you`
  const subline = !focus
    ? 'Nothing needs you right now. Your studios are working.'
    : blockingCount > 0
      ? `${count}. Start with the one holding up work.`
      : `Your projects are moving. ${count} when you have a moment.`

  return (
    <ClientShell active="home" email={email} projectIds={workspace.projects.map(p => p.id)}>
      <section>
        <h1 className="text-[26px] sm:text-[28px] font-bold tracking-[-0.02em]">{name ? `Hi ${name}` : 'Welcome'}</h1>
        {workspace.projects.length > 0 && <p className={cn('mt-2 text-base leading-relaxed', MUTED)}>{subline}</p>}
      </section>

      {workspace.projects.length === 0 ? (
        <section className={PANEL}>
          <h2 className="text-lg font-bold">Your projects will appear here</h2>
          <p className={cn('mt-2 text-[15px] leading-relaxed', MUTED)}>
            As soon as a studio adds <strong className="text-[#111318] dark:text-white font-semibold">{email}</strong> to a project,
            its approvals, invoices and updates show up on this page. Working under a different email? Ask your studio to update it.
          </p>
        </section>
      ) : (
        <>
          {focus ? (
            <FocusCard item={focus} position={1} total={dashboard.items.length} />
          ) : (
            <section className={PANEL}>
              <h2 className="text-lg font-bold">You’re all caught up</h2>
              <p className={cn('mt-2 text-[15px] leading-relaxed', MUTED)}>
                {upcoming
                  ? `Next thing likely to need you: ${upcoming.title} for ${upcoming.project}, around ${shortDate(upcoming.due)}.`
                  : 'We’ll email you as soon as something needs you.'}
              </p>
            </section>
          )}

          {rest.length > 0 && (
            <section aria-labelledby="after-h">
              <h2 id="after-h" className={SECTION_LABEL}>After that</h2>
              <ul className={cn('border-b', RULE)}>
                {rest.map(item => (
                  <Row key={item.key} href={item.href} meta={item.meta}>
                    <span className="text-[15px] break-words">{item.title}</span>
                    <span className={cn('text-[15px]', MUTED)}> · {item.context}</span>
                  </Row>
                ))}
              </ul>
            </section>
          )}

          {dashboard.active.length > 0 && (
            <section aria-labelledby="projects-h">
              <h2 id="projects-h" className={SECTION_LABEL}>How your projects are going</h2>
              <ul className={cn('border-b', RULE)}>
                {dashboard.active.map(p => (
                  <Row key={p.id} href={`/p/${p.slug}`}>
                    <span className="flex items-center gap-4">
                      <StudioDot studio={p.studio} />
                      <span className="min-w-0">
                        <span className="block text-[15px] font-semibold break-words">{p.name}</span>
                        <span className={cn('block text-sm mt-0.5', MUTED)}>
                          {dashboard.studioCount > 1 && `${p.studio.name} · `}{p.status}
                        </span>
                      </span>
                    </span>
                  </Row>
                ))}
              </ul>
            </section>
          )}

          <nav aria-label="More" className="flex flex-wrap gap-x-7 gap-y-2 text-sm">
            {latestUpdate && (
              <Link href="/client/updates" className="min-h-9 inline-flex items-center font-medium text-[#3A3F4A] dark:text-slate-300 underline-offset-4 hover:underline">
                Latest update · {shortDate(latestUpdate.sentAt)}
              </Link>
            )}
            <Link href="/client/billing" className="min-h-9 inline-flex items-center font-medium text-[#3A3F4A] dark:text-slate-300 underline-offset-4 hover:underline">
              Budget &amp; receipts
            </Link>
            {dashboard.finished.length > 0 && (
              <Link href="/client/projects#finished" className="min-h-9 inline-flex items-center font-medium text-[#3A3F4A] dark:text-slate-300 underline-offset-4 hover:underline">
                Finished projects ({dashboard.finished.length})
              </Link>
            )}
          </nav>
        </>
      )}
    </ClientShell>
  )
}
