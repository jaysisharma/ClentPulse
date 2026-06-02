import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Users, FolderOpen, Mail, ArrowRight, ShieldCheck, ShieldOff } from 'lucide-react'

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: projects } = await supabase
    .from('projects')
    .select('id, project_name, client_name, client_email, color, status, updates(id, sent_at)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Group projects by client — keyed by email if set, otherwise by name
  type Project = {
    id: string; project_name: string; client_name: string
    client_email: string | null; color: string; status: string
    updates: { id: string; sent_at: string | null }[]
  }

  const clientMap = new Map<string, {
    name: string
    email: string | null
    projects: Project[]
  }>()

  for (const p of (projects ?? []) as Project[]) {
    const key = p.client_email ?? `__name__${p.client_name}`
    if (!clientMap.has(key)) {
      clientMap.set(key, { name: p.client_name, email: p.client_email, projects: [] })
    }
    clientMap.get(key)!.projects.push(p)
  }

  const clients = Array.from(clientMap.values())

  const totalClients  = clients.length
  const withPortal    = clients.filter(c => c.email).length
  const activeClients = clients.filter(c => c.projects.some(p => p.status === 'active')).length

  return (
    <AppLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
          <p className="text-slate-500 text-sm mt-1">All clients across your projects.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total clients',       value: totalClients  },
            { label: 'Active clients',       value: activeClients },
            { label: 'With portal access',   value: withPortal    },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="text-3xl font-bold text-slate-900">{value}</div>
              <div className="text-sm text-slate-500 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Client list */}
        {!clients.length ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-200 p-14 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">No clients yet</h3>
            <p className="text-slate-500 text-sm mb-5">Create a project and add a client to get started.</p>
            <Link href="/project/new" className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              New project
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {clients.map(client => {
              const sentUpdates   = client.projects.flatMap(p => p.updates).filter(u => u.sent_at).length
              const activeProjects = client.projects.filter(p => p.status === 'active').length
              const initials      = client.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
              const avatarColor   = client.projects[0]?.color ?? '#6366F1'

              return (
                <div key={client.email ?? client.name} className="bg-white rounded-xl border border-slate-200 p-5">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ backgroundColor: avatarColor }}
                    >
                      {initials}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-slate-900">{client.name}</span>
                        {activeProjects > 0 && (
                          <Badge variant="active">active</Badge>
                        )}
                      </div>
                      {client.email ? (
                        <div className="flex items-center gap-1.5 text-sm text-slate-400">
                          <Mail className="w-3.5 h-3.5" />
                          {client.email}
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">No email set</span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-center flex-shrink-0">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{client.projects.length}</div>
                        <div className="text-xs text-slate-400">project{client.projects.length !== 1 ? 's' : ''}</div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{sentUpdates}</div>
                        <div className="text-xs text-slate-400">updates</div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {client.email ? (
                          <span className="flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                            <ShieldCheck className="w-3 h-3" />Portal
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                            <ShieldOff className="w-3 h-3" />No portal
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Projects */}
                  {client.projects.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                      {client.projects.map(p => (
                        <Link
                          key={p.id}
                          href={`/project/${p.id}`}
                          className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                        >
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                          {p.project_name}
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      ))}
                      <Link
                        href={`/project/new`}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-indigo-600 transition-colors px-2 py-1.5"
                      >
                        <FolderOpen className="w-3 h-3" />Add project
                      </Link>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
