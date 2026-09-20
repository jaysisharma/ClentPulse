import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { AppLayout } from '@/components/layout/app-layout'
import { DarkShell } from '@/components/layout/dark-shell'
import Link from 'next/link'
import { Plus, Sparkles, Building2 } from 'lucide-react'
import { ProjectsList, type Project } from './projects-list'
import { ACTIVE_WORKSPACE_COOKIE, parseActiveWorkspaceId } from '@/lib/workspace'

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const cookieStore = await cookies()
  const activeWorkspaceId = parseActiveWorkspaceId(cookieStore.get(ACTIVE_WORKSPACE_COOKIE)?.value)

  let query = supabase
    .from('projects')
    .select(`id, project_name, client_name, color, status, budget, created_at,
             updates(id, sent_at), approvals(id, status), contracts(id, signed_at),
             milestones(id, done), invoices(items)`)
    .order('created_at', { ascending: false })

  let currentOrgName: string | null = null
  if (activeWorkspaceId !== 'personal') {
    query = query.eq('org_id', activeWorkspaceId)
    const { data: orgData } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', activeWorkspaceId)
      .maybeSingle()
    currentOrgName = orgData?.name ?? null
  } else {
    query = query.eq('user_id', user.id).is('org_id', null)
  }

  const { data: projects, error } = await query

  if (error) throw new Error(`Failed to load projects: ${error.message}`)

  const allProjects = (projects ?? []) as unknown as Project[]
  const activeCount = allProjects.filter(p => p.status === 'active').length

  return (
    <AppLayout>
      <DarkShell>
        <div className="relative z-10 space-y-7 pb-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {currentOrgName ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
                    <Building2 className="w-3 h-3" />
                    {currentOrgName} Workspace
                  </span>
                ) : (
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Personal Studio
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-light uppercase tracking-[-0.03em] text-slate-900 dark:text-white">
                Projects
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 flex items-center gap-2">
                <span>{allProjects.length === 0 ? 'Create your first project to get started.' : `${activeCount} active`}</span>
                {allProjects.length > 0 && (
                  <>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <span>{allProjects.length} total projects</span>
                  </>
                )}
              </p>
            </div>

            {allProjects.length > 0 && (
              <Link href="/project/new">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 px-4 py-2 text-xs font-semibold dark:hover:bg-slate-100 transition-all hover:scale-[1.02] shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New project
                </button>
              </Link>
            )}
          </div>

          {allProjects.length === 0 ? (
            /* New-user setup state */
            <div className="rounded-3xl bg-white dark:bg-[#0c0d12] border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 py-16 px-6 flex flex-col items-center text-center shadow-md dark:shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-xl font-normal text-slate-900 dark:text-white tracking-tight mt-5">No projects yet</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
                Create your first client project to start tracking updates, live presence, and invoices.
              </p>
              <Link href="/project/new" className="mt-6">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 px-6 py-2.5 text-xs font-semibold dark:hover:bg-slate-100 transition-all shadow-md cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create your first project
                </button>
              </Link>
            </div>
          ) : (
            <ProjectsList projects={allProjects} />
          )}
        </div>
      </DarkShell>
    </AppLayout>
  )
}
