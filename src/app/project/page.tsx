import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { DarkShell } from '@/components/layout/dark-shell'
import Link from 'next/link'
import { Plus, Sparkles } from 'lucide-react'
import { ProjectsList, type Project } from './projects-list'

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: projects, error } = await supabase
    .from('projects')
    .select(`id, project_name, client_name, color, status, budget, created_at,
             updates(id, sent_at), approvals(id, status), contracts(id, signed_at),
             milestones(id, done), invoices(items)`)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Failed to load projects: ${error.message}`)

  const allProjects = (projects ?? []) as unknown as Project[]
  const activeCount = allProjects.filter(p => p.status === 'active').length

  return (
    <AppLayout>
      <DarkShell>
        <div className="relative z-10 space-y-6 pb-10">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Projects</h1>
              <p className="text-slate-500 text-sm mt-1.5 font-medium">
                {allProjects.length === 0
                  ? 'Create your first project to get started.'
                  : `${activeCount} active · ${allProjects.length} total`}
              </p>
            </div>
            {allProjects.length > 0 && (
              <Link
                href="/project/new"
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold px-4 py-2.5 hover:bg-indigo-700 hover:shadow-md transition-all flex-shrink-0"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                New project
              </Link>
            )}
          </div>

          {allProjects.length === 0 ? (
            /* New-user setup state */
            <div className="rounded-3xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06),0_12px_32px_-12px_rgba(79,70,229,0.12)] py-16 px-6 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-indigo-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-5">No projects yet</h2>
              <p className="text-sm text-slate-500 mt-2 max-w-sm">
                Create your first client project to start tracking updates, time, and invoices.
              </p>
              <Link href="/project/new" className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold px-4 py-2.5 hover:bg-indigo-700 hover:shadow-md transition-all">
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                Create your first project
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
