import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
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

  return (
    <AppLayout>
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Archive</h1>
            <p className="text-slate-500 text-sm mt-1">Completed projects.</p>
          </div>
        </div>

        {!projects?.length ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-200 p-16 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Archive className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">No archived projects</h3>
            <p className="text-slate-500 text-sm mb-5">
              Projects marked as <span className="font-medium">completed</span> will appear here.
            </p>
            <Link href="/project">
              <Button variant="secondary" size="sm">View active projects</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => {
              const updates = project.updates ?? []
              const sentCount = updates.filter((u: { sent_at: string | null }) => u.sent_at).length
              return (
                <Link
                  key={project.id}
                  href={`/project/${project.id}`}
                  className="flex items-center gap-4 bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-sm transition-all group opacity-80 hover:opacity-100"
                >
                  <div className="w-3 h-10 rounded-full flex-shrink-0 opacity-50" style={{ backgroundColor: project.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-700">{project.project_name}</div>
                    <div className="text-sm text-slate-400">{project.client_name}</div>
                  </div>
                  <div className="text-right flex-shrink-0 text-xs text-slate-400">
                    <div>{sentCount} update{sentCount !== 1 ? 's' : ''} sent</div>
                    <div>Created {formatDate(project.created_at)}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400 transition-colors ml-2" />
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
