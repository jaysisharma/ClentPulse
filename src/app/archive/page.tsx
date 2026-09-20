import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { DarkShell } from '@/components/layout/dark-shell'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { ArrowRight, Archive } from 'lucide-react'

export default async function ArchivePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: projects, error } = await supabase
  .from('projects')
  .select('*, updates(id, sent_at)')
  .eq('user_id', user.id)
  .eq('status', 'completed')
  .order('created_at', { ascending: false })

  if (error) throw new Error(`Failed to load archive: ${error.message}`)

  const archivedProjects = projects ?? []

  return (
    <AppLayout>
      <DarkShell>
        <div className="relative z-10 animate-fade-in space-y-8 pb-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
                <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Archived Projects
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-light uppercase tracking-[-0.03em] text-slate-900 dark:text-white">
                Archive
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-light mt-1">
                Completed client engagements, historical broadcasts, and preserved records.
              </p>
            </div>
            <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full px-3 py-1.5 w-fit">
              {archivedProjects.length} completed project{archivedProjects.length !== 1 ? 's' : ''}
            </div>
          </div>

          {!archivedProjects.length ? (
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-white/10 bg-white/70 dark:bg-[#0c0d12]/60 p-16 text-center ring-1 ring-slate-950/5 dark:ring-white/5 backdrop-blur-md">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center mx-auto mb-4">
                <Archive className="w-6 h-6 text-slate-400 dark:text-slate-400" />
              </div>
              <h3 className="font-normal text-lg text-slate-900 dark:text-white mb-1">No archived projects</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-light mb-6 max-w-sm mx-auto">
                Projects marked as completed will be safely archived here for your records.
              </p>
              <Link href="/project">
                <button className="rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold px-4 py-2 text-xs transition-all inline-flex items-center gap-1.5 shadow-sm">
                  <span>View active projects</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/90 divide-y divide-slate-100 dark:divide-white/5 overflow-hidden ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-none">
              {archivedProjects.map((project) => {
                const updates = project.updates ?? []
                const sentCount = updates.filter((u: { sent_at: string | null }) => u.sent_at).length
                return (
                  <Link
                    key={project.id}
                    href={`/project/${project.id}`}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: project.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 dark:text-white text-xs sm:text-sm truncate transition-colors">
                        {project.project_name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-light truncate mt-0.5">
                        Client: {project.client_name}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 text-xs text-slate-500 dark:text-slate-400 font-mono">
                      <div>{sentCount} update{sentCount !== 1 ? 's' : ''}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Completed {formatDate(project.created_at)}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-600 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all ml-1 flex-shrink-0" />
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </DarkShell>
    </AppLayout>
  )
}
