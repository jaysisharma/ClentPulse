import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { ClientWorkspace } from '@/lib/client-workspace'
import { ClientShell } from '../client-shell'
import { MUTED, PANEL, RULE, StudioDot, shortDate } from '../client-ui'
import { buildUpdates, type UpdateEntry } from '../dashboard/dashboard-model'

function monthLabel(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function groupByMonth(updates: UpdateEntry[]) {
  const groups: { label: string; items: UpdateEntry[] }[] = []
  for (const u of updates) {
    const label = monthLabel(u.sentAt)
    const last = groups[groups.length - 1]
    if (last?.label === label) last.items.push(u)
    else groups.push({ label, items: [u] })
  }
  return groups
}

export function UpdatesView({
  email,
  workspace,
  projectSlug,
}: {
  email: string
  workspace: ClientWorkspace
  /** Show one project's updates only. */
  projectSlug?: string
}) {
  const all = buildUpdates(workspace)
  const filtered = projectSlug ? all.filter(u => u.slug === projectSlug) : all
  const projectsWithUpdates = workspace.projects.filter(p => p.updates.length > 0)
  const showStudio = new Set(workspace.projects.map(p => p.studio.id)).size > 1

  const chip = (active: boolean) => cn(
    'inline-flex items-center gap-2 min-h-9 px-3 rounded-full border text-sm transition-colors',
    active
      ? 'border-[#111318] dark:border-white bg-[#111318] dark:bg-white text-white dark:text-[#111318] font-semibold'
      : 'border-[#E7E7E3] dark:border-white/[0.1] text-[#3A3F4A] dark:text-slate-300 hover:border-[#9A9EA8]'
  )

  return (
    <ClientShell active="updates" email={email} projectIds={workspace.projects.map(p => p.id)}>
      <section>
        <h1 className="text-[26px] sm:text-[28px] font-bold tracking-[-0.02em]">Updates</h1>
        <p className={cn('mt-2 text-base leading-relaxed', MUTED)}>What your studios have shared, newest first.</p>
      </section>

      {projectsWithUpdates.length > 1 && (
        <nav aria-label="Filter by project" className="-mt-6 flex flex-wrap gap-2">
          <Link href="/client/updates" aria-current={!projectSlug ? 'page' : undefined} className={chip(!projectSlug)}>All</Link>
          {projectsWithUpdates.map(p => (
            <Link
              key={p.id}
              href={`/client/updates?project=${encodeURIComponent(p.slug)}`}
              aria-current={projectSlug === p.slug ? 'page' : undefined}
              className={chip(projectSlug === p.slug)}
            >
              <StudioDot studio={p.studio} />{p.name}
            </Link>
          ))}
        </nav>
      )}

      {filtered.length === 0 ? (
        <section className={PANEL}>
          <h2 className="text-lg font-bold">No updates yet</h2>
          <p className={cn('mt-2 text-[15px] leading-relaxed', MUTED)}>Progress updates from your studios will appear here as they’re sent.</p>
        </section>
      ) : (
        groupByMonth(filtered).map(group => (
          <section key={group.label} aria-label={group.label}>
            <h2 className="mb-1.5 text-[13px] font-semibold text-[#5A5F6B] dark:text-slate-400">{group.label}</h2>
            <ol className={cn('border-b', RULE)}>
              {group.items.map(u => (
                <li key={u.id} className={cn('border-t py-5', RULE)}>
                  <article>
                    <header className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                      <span className="flex items-center gap-2 font-semibold">
                        <StudioDot studio={u.studio} />{u.projectName}
                      </span>
                      <span className={MUTED}>
                        {showStudio && `${u.studio.name} · `}<time dateTime={u.sentAt}>{shortDate(u.sentAt)}</time>
                      </span>
                    </header>
                    {u.bullets.length > 0 && (
                      <ul className="mt-3 space-y-1.5 text-[15px] leading-relaxed">
                        {u.bullets.map((b, i) => (
                          <li key={i} className="flex gap-3">
                            <span aria-hidden className="mt-[10px] w-1 h-1 rounded-full bg-[#9A9EA8] flex-shrink-0" />
                            <span className="break-words min-w-0">{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {u.note && <p className={cn('mt-3 text-[15px] leading-relaxed whitespace-pre-line break-words', MUTED)}>{u.note}</p>}
                    <Link
                      href={`/p/${u.slug}#updates`}
                      className="mt-3 inline-flex items-center min-h-9 text-sm font-medium text-[#3A3F4A] dark:text-slate-300 underline-offset-4 hover:underline"
                    >
                      Reply or see details
                    </Link>
                  </article>
                </li>
              ))}
            </ol>
          </section>
        ))
      )}
    </ClientShell>
  )
}
