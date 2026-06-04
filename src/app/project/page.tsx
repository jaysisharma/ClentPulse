import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, FolderOpen } from 'lucide-react'
import { ProjectsClientGrid, type Project } from './projects-client-grid'

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: projects } = await supabase
    .from('projects')
    .select(`*, updates(id, created_at, sent_at), approvals(id, status), contracts(id, signed_at), milestones(id, done)`)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const allProjects = projects ?? []
  const activeCount = allProjects.filter(p => p.status === 'active').length

  return (
    <AppLayout>
      <div className="animate-fade-in space-y-6 pb-10">

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
            <p className="text-slate-500 text-sm mt-1">
              {allProjects.length === 0
                ? 'Create your first project to get started.'
                : `${activeCount} active · ${allProjects.length} total`}
            </p>
          </div>
          <Link href="/project/new">
            <Button size="sm">
              <Plus className="w-4 h-4" />
              New project
            </Button>
          </Link>
        </div>

        {!allProjects.length ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-200 p-16 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">No projects yet</h3>
            <p className="text-slate-500 text-sm mb-5 max-w-sm mx-auto">
              Create your first client project to start tracking updates, invoices, and time.
            </p>
            <Link href="/project/new">
              <Button size="sm"><Plus className="w-4 h-4" />Create project</Button>
            </Link>
          </div>
        ) : (
          <ProjectsClientGrid projects={allProjects as unknown as Project[]} />
        )}

      </div>
    </AppLayout>
  )
}
