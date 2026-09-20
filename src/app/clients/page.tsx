import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { DarkShell } from '@/components/layout/dark-shell'
import { ClientsView, type ClientCard } from './clients-view'
import Link from 'next/link'
import { Users, Activity, ShieldCheck, Plus, Sparkles } from 'lucide-react'

function OveradsClientStatCard({
  label,
  value,
  icon: Icon,
  caption,
}: {
  label: string
  value: number
  icon: React.ElementType
  caption?: string
}) {
  return (
    <div className="rounded-2xl bg-white dark:bg-[#0c0d12] border border-slate-200 dark:border-white/10 p-5 ring-1 ring-slate-950/5 dark:ring-white/5 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-200 shadow-xs dark:shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</span>
          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-slate-400">
            <Icon className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-3 text-2xl sm:text-3xl font-light font-mono tracking-tight text-slate-900 dark:text-white tabular-nums">
          {value}
        </div>
      </div>
      {caption && (
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 truncate">
          {caption}
        </div>
      )}
    </div>
  )
}

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: projects, error } = await supabase
    .from('projects')
    .select('id, project_name, client_name, client_email, client_user_id, color, status, updates(id, sent_at)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Failed to load clients: ${error.message}`)

  type Project = {
    id: string; project_name: string; client_name: string
    client_email: string | null; client_user_id: string | null; color: string; status: string
    updates: { id: string; sent_at: string | null }[]
  }

  const clientMap = new Map<string, { name: string; email: string | null; hasPortal: boolean; projects: Project[] }>()
  for (const p of (projects ?? []) as Project[]) {
    const key = p.client_email ?? `__name__${p.client_name}`
    if (!clientMap.has(key)) {
      clientMap.set(key, { name: p.client_name, email: p.client_email, hasPortal: !!p.client_user_id, projects: [] })
    } else if (p.client_user_id) {
      clientMap.get(key)!.hasPortal = true
    }
    clientMap.get(key)!.projects.push(p)
  }

  const clients: ClientCard[] = Array.from(clientMap.entries()).map(([key, c]) => ({
    key,
    name: c.name,
    email: c.email,
    hasPortal: c.hasPortal,
    initials: c.name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    avatarColor: c.projects[0]?.color ?? '#6366F1',
    projectCount: c.projects.length,
    sentUpdates: c.projects.flatMap(p => p.updates).filter(u => u.sent_at).length,
    activeProjects: c.projects.filter(p => p.status === 'active').length,
    projects: c.projects.map(p => ({ id: p.id, project_name: p.project_name, color: p.color })),
  }))

  const totalClients  = clients.length
  const activeClients = clients.filter(c => c.activeProjects > 0).length
  const withPortal    = clients.filter(c => c.hasPortal).length

  return (
    <AppLayout>
      <DarkShell>
        <div className="relative z-10 space-y-7 pb-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-light uppercase tracking-[-0.03em] text-slate-900 dark:text-white">
                Clients
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 flex items-center gap-2">
                <span>{totalClients > 0 ? `${totalClients} client${totalClients !== 1 ? 's' : ''} across your projects` : 'Manage all client relationships'}</span>
              </p>
            </div>

            <Link href="/project/new">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 px-4 py-2 text-xs font-semibold dark:hover:bg-slate-100 transition-all hover:scale-[1.02] shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add client via project
              </button>
            </Link>
          </div>

          {/* 3 Overview KPI tiles */}
          {totalClients > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <OveradsClientStatCard
                label="Total Clients"
                value={totalClients}
                icon={Users}
                caption="Recorded across all projects"
              />
              <OveradsClientStatCard
                label="Active Clients"
                value={activeClients}
                icon={Activity}
                caption={`${activeClients} with in-flight work`}
              />
              <OveradsClientStatCard
                label="Portal Access"
                value={withPortal}
                icon={ShieldCheck}
                caption={`${withPortal} authenticated on status portal`}
              />
            </div>
          )}

          {/* Empty state or clients view */}
          {totalClients === 0 ? (
            <div className="rounded-3xl bg-white dark:bg-[#0c0d12] border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 py-16 px-6 flex flex-col items-center text-center shadow-md dark:shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-xl font-normal text-slate-900 dark:text-white tracking-tight mt-5">No clients added yet</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
                Clients are automatically added when you create projects and send progress updates.
              </p>
              <Link href="/project/new" className="mt-6">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 px-6 py-2.5 text-xs font-semibold dark:hover:bg-slate-100 transition-all shadow-md cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create project with client
                </button>
              </Link>
            </div>
          ) : (
            <ClientsView clients={clients} />
          )}
        </div>
      </DarkShell>
    </AppLayout>
  )
}
