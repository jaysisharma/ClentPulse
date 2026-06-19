import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { DarkShell } from '@/components/layout/dark-shell'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/ui/stat-card'
import { ClientsView, type ClientCard } from './clients-view'
import Link from 'next/link'
import { Users, Activity, ShieldCheck, Plus } from 'lucide-react'

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: projects, error } = await supabase
    .from('projects')
    .select('id, project_name, client_name, client_email, color, status, updates(id, sent_at)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Fail honestly: surface a DB error instead of rendering an empty "no clients"
  // state that hides the real problem — matches the dashboard/projects pages.
  if (error) throw new Error(`Failed to load clients: ${error.message}`)

  // Group projects by client — keyed by email if set, otherwise by name.
  type Project = {
    id: string; project_name: string; client_name: string
    client_email: string | null; color: string; status: string
    updates: { id: string; sent_at: string | null }[]
  }

  const clientMap = new Map<string, { name: string; email: string | null; projects: Project[] }>()
  for (const p of (projects ?? []) as Project[]) {
    const key = p.client_email ?? `__name__${p.client_name}`
    if (!clientMap.has(key)) clientMap.set(key, { name: p.client_name, email: p.client_email, projects: [] })
    clientMap.get(key)!.projects.push(p)
  }

  const clients: ClientCard[] = Array.from(clientMap.entries()).map(([key, c]) => ({
    key,
    name: c.name,
    email: c.email,
    initials: c.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    avatarColor: c.projects[0]?.color ?? '#6366F1',
    projectCount: c.projects.length,
    sentUpdates: c.projects.flatMap(p => p.updates).filter(u => u.sent_at).length,
    activeProjects: c.projects.filter(p => p.status === 'active').length,
    projects: c.projects.map(p => ({ id: p.id, project_name: p.project_name, color: p.color })),
  }))

  const totalClients  = clients.length
  const activeClients = clients.filter(c => c.activeProjects > 0).length
  const withPortal    = clients.filter(c => c.email).length

  return (
    <AppLayout>
      <DarkShell>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clients</h1>
            <p className="text-slate-500 text-sm mt-1.5">
              {totalClients > 0
                ? `${totalClients} client${totalClients !== 1 ? 's' : ''} across your projects.`
                : 'All clients across your projects.'}
            </p>
          </div>
          <Link href="/project/new">
            <Button size="sm"><Plus className="w-4 h-4" />New project</Button>
          </Link>
        </div>

        {clients.length === 0 ? (
          /* Empty state */
          <div className="rounded-2xl bg-white border border-slate-200 p-14 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">No clients yet</h3>
            <p className="text-slate-500 text-sm mb-5">Create a project and add a client to get started.</p>
            <Link href="/project/new" className="inline-block">
              <Button><Plus className="w-4 h-4" />New project</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard label="Total clients"      value={totalClients}  icon={Users} />
              <StatCard label="Active clients"      value={activeClients} icon={Activity} />
              <StatCard label="With portal access"  value={withPortal}    icon={ShieldCheck} />
            </div>

            {/* Searchable client list */}
            <ClientsView clients={clients} />
          </div>
        )}
      </DarkShell>
    </AppLayout>
  )
}
