import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { ClientWorkspace } from '@/lib/client-workspace'
import { ClientShell } from '../client-shell'
import { MUTED, PANEL, RULE, Row, SECTION_LABEL, StudioDot, shortDate } from '../client-ui'
import { buildProjectList, type ProjectCard } from '../dashboard/dashboard-model'

function Steps({ done, total }: { done: number; total: number }) {
  if (total === 0) return null
  return (
    <span role="img" aria-label={`${done} of ${total} milestones done`} className="mt-2.5 flex gap-1 max-w-[220px]">
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={cn('h-1.5 flex-1 rounded-full', i < done ? 'bg-[#111318] dark:bg-white' : 'bg-[#E7E7E3] dark:bg-white/[0.1]')} />
      ))}
    </span>
  )
}

function ProjectRow({ project, showStudio }: { project: ProjectCard; showStudio: boolean }) {
  return (
    <Row
      href={`/p/${project.slug}`}
      meta={project.needsYou > 0 ? `${project.needsYou} need${project.needsYou === 1 ? 's' : ''} you` : undefined}
    >
      <span className="flex items-start gap-4">
        <span className="pt-2"><StudioDot studio={project.studio} /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold break-words">{project.name}</span>
          <span className={cn('block text-sm mt-0.5', MUTED)}>
            {showStudio && `${project.studio.name} · `}{project.status}
          </span>
          {project.lastUpdate && <span className={cn('block text-[13px] mt-0.5', MUTED)}>Last update {shortDate(project.lastUpdate)}</span>}
          <Steps done={project.done} total={project.total} />
        </span>
      </span>
    </Row>
  )
}

export function ProjectsView({ email, workspace }: { email: string; workspace: ClientWorkspace }) {
  const list = buildProjectList(workspace)
  const showStudio = list.studioCount > 1
  const empty = list.active.length + list.paused.length + list.finished.length === 0

  return (
    <ClientShell active="projects" email={email} projectIds={workspace.projects.map(p => p.id)}>
      <section>
        <h1 className="text-[26px] sm:text-[28px] font-bold tracking-[-0.02em]">Projects</h1>
        {!empty && (
          <p className={cn('mt-2 text-base leading-relaxed', MUTED)}>
            {list.active.length} active{showStudio ? ` with ${list.studioCount} studios` : ''}. Open one to see its work, files and invoices.
          </p>
        )}
      </section>

      {empty && (
        <section className={PANEL}>
          <h2 className="text-lg font-bold">No projects yet</h2>
          <p className={cn('mt-2 text-[15px] leading-relaxed', MUTED)}>Projects appear here once a studio adds {email} to one.</p>
        </section>
      )}

      {list.active.length > 0 && (
        <section aria-labelledby="active-h">
          <h2 id="active-h" className={SECTION_LABEL}>Active</h2>
          <ul className={cn('border-b', RULE)}>
            {list.active.map(p => <ProjectRow key={p.id} project={p} showStudio={showStudio} />)}
          </ul>
        </section>
      )}

      {list.paused.length > 0 && (
        <section aria-labelledby="paused-h">
          <h2 id="paused-h" className={SECTION_LABEL}>Paused</h2>
          <ul className={cn('border-b', RULE)}>
            {list.paused.map(p => <ProjectRow key={p.id} project={p} showStudio={showStudio} />)}
          </ul>
        </section>
      )}

      {list.finished.length > 0 && (
        <section id="finished" aria-labelledby="finished-h" className="scroll-mt-24">
          <h2 id="finished-h" className={SECTION_LABEL}>Finished</h2>
          <ul className={cn('border-b', RULE)}>
            {list.finished.map(p => (
              <li key={p.id} className={cn('border-t py-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-2', RULE)}>
                <span className="flex items-center gap-4 min-w-0">
                  <StudioDot studio={p.studio} />
                  <span className="min-w-0">
                    <span className="block text-[15px] font-semibold break-words">{p.name}</span>
                    <span className={cn('block text-sm mt-0.5', MUTED)}>{p.studio.name}{p.needsYou > 0 ? ` · ${p.needsYou} left to pay` : ''}</span>
                  </span>
                </span>
                <span className="flex items-center gap-5 text-sm font-medium">
                  {!p.hasTestimonial && (
                    <Link href={`/testimonial/${p.id}`} className="min-h-9 inline-flex items-center underline-offset-4 hover:underline">Leave a review</Link>
                  )}
                  <Link href={`/p/${p.slug}#files`} className="min-h-9 inline-flex items-center underline-offset-4 hover:underline">Files</Link>
                  <Link href={`/p/${p.slug}`} className="min-h-9 inline-flex items-center underline-offset-4 hover:underline">Open</Link>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </ClientShell>
  )
}
