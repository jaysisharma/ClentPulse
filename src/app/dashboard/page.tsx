import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import {
  Plus, FolderOpen, AlertCircle,
  FileText, Timer, CheckCircle2, FileSignature, Send,
  DollarSign, ChevronRight,
} from 'lucide-react'
import { UpgradeToast } from './upgrade-toast'
import { RemindSelfButton } from './remind-self-button'

function localWeekStart() {
  const d = new Date()
  const day = d.getDay()
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function localLastWeekStart() {
  const d = new Date()
  const day = d.getDay()
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1) - 7)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function localMonthStart() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

function localLastMonthStart() {
  const d = new Date()
  d.setMonth(d.getMonth() - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

function sevenDaysAgo() {
  const d = new Date()
  d.setDate(d.getDate() - 7)
  return d.toISOString()
}

function fmt$(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function fmtHours(h: number) {
  const totalSecs = Math.round(h * 3600)
  const hrs  = Math.floor(totalSecs / 3600)
  const mins = Math.floor((totalSecs % 3600) / 60)
  const parts: string[] = []
  if (hrs  > 0) parts.push(`${hrs}h`)
  if (mins > 0) parts.push(`${mins}m`)
  if (parts.length === 0) parts.push('0m')
  return parts.join(' ')
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const weekStart      = localWeekStart()
  const lastWeekStart  = localLastWeekStart()
  const monthStart     = localMonthStart()
  const lastMonthStart = localLastMonthStart()
  const cutoff7d       = sevenDaysAgo()

  const [
    { data: projects },
    { data: profile },
    { data: invoices },
    { data: lastMonthInvoices },
    { data: timeEntries },
    { data: lastWeekEntries },
    { data: activeTimer },
  ] = await Promise.all([
    supabase
      .from('projects')
      .select('id, project_name, client_name, color, status, created_at, updates(id, created_at, sent_at), approvals(id, title, status), contracts(id, title, signed_at)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase.from('users').select('name, plan').eq('id', user.id).single(),
    supabase.from('invoices').select('id, invoice_number, status, items, client_name, due_date, created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('invoices').select('status, items, created_at').eq('user_id', user.id).eq('status', 'paid').gte('created_at', lastMonthStart).lt('created_at', monthStart),
    supabase.from('time_entries').select('hours').eq('user_id', user.id).gte('date', weekStart),
    supabase.from('time_entries').select('hours').eq('user_id', user.id).gte('date', lastWeekStart).lt('date', weekStart),
    supabase.from('timers').select('*').eq('user_id', user.id).maybeSingle(),
  ])

  type Update   = { id: string; created_at: string; sent_at: string | null }
  type Approval = { id: string; title: string; status: string }
  type Contract = { id: string; title: string; signed_at: string | null }
  type Project  = { id: string; project_name: string; client_name: string; color: string; status: string; created_at: string; updates: Update[]; approvals: Approval[]; contracts: Contract[] }
  type Invoice  = { id: string; invoice_number: string; status: string; items: { amount: number }[]; client_name: string; due_date: string | null; created_at: string }

  const allProjects = (projects ?? []) as Project[]
  const allInvoices = (invoices ?? []) as Invoice[]

  const activeProjects  = allProjects.filter(p => p.status === 'active')
  const unpaidInvoices  = allInvoices.filter(i => i.status === 'sent')
  const unpaidAmount    = unpaidInvoices.flatMap(i => i.items ?? []).reduce((s, i) => s + (i.amount ?? 0), 0)
  const overdueCount    = unpaidInvoices.filter(i => i.due_date && new Date(i.due_date) < new Date()).length

  const earningsThisMonth = allInvoices
    .filter(i => i.status === 'paid' && i.created_at >= monthStart)
    .flatMap(i => i.items ?? [])
    .reduce((s, item) => s + (item.amount ?? 0), 0)

  const earningsLastMonth = (lastMonthInvoices ?? [])
    .flatMap(i => i.items ?? [])
    .reduce((s: number, item: { amount: number }) => s + (item.amount ?? 0), 0)

  const earningsDiff = earningsThisMonth - earningsLastMonth

  const hoursThisWeek = (timeEntries ?? []).reduce((s, e) => s + (e.hours ?? 0), 0)
  const hoursLastWeek = (lastWeekEntries ?? []).reduce((s, e) => s + (e.hours ?? 0), 0)
  const hoursDiff     = hoursThisWeek - hoursLastWeek

  const overdueProjects = activeProjects.filter(p => {
    const sentUpdates = p.updates.filter(u => u.sent_at)
    if (!sentUpdates.length) return new Date(p.created_at) < new Date(cutoff7d)
    const latest = [...sentUpdates].sort((a, b) => new Date(b.sent_at!).getTime() - new Date(a.sent_at!).getTime())[0]
    return new Date(latest.sent_at!) < new Date(cutoff7d)
  })

  const pendingApprovals = allProjects.flatMap(p =>
    p.approvals.filter(a => a.status === 'pending').map(a => ({ ...a, projectId: p.id, projectName: p.project_name }))
  )
  const unsignedContracts = allProjects.flatMap(p =>
    p.contracts.filter(c => !c.signed_at).map(c => ({ ...c, projectId: p.id, projectName: p.project_name }))
  )
  const attentionCount = overdueProjects.length + pendingApprovals.length + unsignedContracts.length

  const firstName = profile?.name ? profile.name.split(' ')[0] : ''

  return (
    <AppLayout user={profile ? { name: profile.name ?? null, plan: profile.plan as 'free' | 'pro' } : undefined}>
      <div className="animate-fade-in space-y-6 pb-10">
        <UpgradeToast />

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {firstName ? `Welcome back, ${firstName}` : 'Dashboard'}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {activeProjects.length} active project{activeProjects.length !== 1 ? 's' : ''}
              {attentionCount > 0 && ` · ${attentionCount} item${attentionCount !== 1 ? 's' : ''} need attention`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/time">
              <Button variant="secondary" size="sm">
                <Timer className="w-4 h-4" />
                Log time
              </Button>
            </Link>
            <Link href="/project/new">
              <Button size="sm">
                <Plus className="w-4 h-4" />
                New project
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Outstanding */}
          <div className={`rounded-xl border p-5 transition-colors ${
            unpaidAmount > 0 ? 'bg-rose-50 border-rose-100' : 'bg-white border-slate-200'
          }`}>
            <div className="text-sm text-slate-500 mb-1">Outstanding</div>
            <div className={`text-2xl font-bold ${unpaidAmount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {fmt$(unpaidAmount)}
            </div>
            <div className="text-xs mt-1">
              {overdueCount > 0
                ? <span className="text-rose-500">{overdueCount} invoice{overdueCount !== 1 ? 's' : ''} overdue</span>
                : <span className="text-slate-400">{unpaidInvoices.length} awaiting payment</span>
              }
            </div>
          </div>

          {/* This month */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="text-sm text-slate-500 mb-1">This month</div>
            <div className="text-2xl font-bold text-slate-900">{fmt$(earningsThisMonth)}</div>
            <div className="text-xs mt-1">
              {earningsThisMonth === 0 && earningsLastMonth === 0 ? (
                <span className="text-slate-400">no paid invoices yet</span>
              ) : earningsDiff === 0 ? (
                <span className="text-slate-400">same as last month</span>
              ) : earningsDiff > 0 ? (
                <span className="text-emerald-600">↑ {fmt$(earningsDiff)} more than last month</span>
              ) : (
                <span className="text-rose-500">↓ {fmt$(Math.abs(earningsDiff))} less than last month</span>
              )}
            </div>
          </div>

          {/* Active projects */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="text-sm text-slate-500 mb-1">Active projects</div>
            <div className="text-2xl font-bold text-slate-900">{activeProjects.length}</div>
            <div className="text-xs text-slate-400 mt-1">of {allProjects.length} total</div>
          </div>

          {/* Hours this week */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="text-sm text-slate-500 mb-1">Hours this week</div>
            <div className="text-2xl font-bold text-slate-900">{fmtHours(hoursThisWeek)}</div>
            <div className="text-xs mt-1">
              {hoursThisWeek === 0 && hoursLastWeek === 0 ? (
                <span className="text-slate-400">{activeTimer ? 'timer running now' : 'no time logged yet'}</span>
              ) : hoursDiff === 0 ? (
                <span className="text-slate-400">same as last week</span>
              ) : hoursDiff > 0 ? (
                <span className="text-emerald-600">↑ {fmtHours(hoursDiff)} more than last week</span>
              ) : (
                <span className="text-slate-400">↓ {fmtHours(Math.abs(hoursDiff))} less than last week</span>
              )}
            </div>
          </div>

        </div>

        {/* Needs attention */}
        {attentionCount > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span className="text-sm font-semibold text-slate-800">Needs attention</span>
              <span className="ml-auto text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {attentionCount}
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {overdueProjects.map(p => (
                <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-slate-800">{p.project_name}</span>
                      <span className="text-xs text-slate-400 ml-2">{p.client_name}</span>
                    </div>
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100 flex-shrink-0">
                      7+ days no update
                    </span>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                    <RemindSelfButton projectId={p.id} />
                    <Link href={`/project/${p.id}/update`}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors">
                      <Send className="w-3.5 h-3.5" />
                      Send update
                    </Link>
                  </div>
                </div>
              ))}
              {pendingApprovals.map(a => (
                <Link key={a.id} href={`/project/${a.projectId}`}
                  className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-3 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">{a.title}</div>
                      <div className="text-xs text-slate-400">{a.projectName}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-amber-600">Awaiting approval</span>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                </Link>
              ))}
              {unsignedContracts.map(c => (
                <Link key={c.id} href={`/project/${c.projectId}/contract`}
                  className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileSignature className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">{c.title}</div>
                      <div className="text-xs text-slate-400">{c.projectName}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-amber-600">Not signed</span>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Projects — 2 cols */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-700">Projects</h2>
              <Link href="/project" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-0.5">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {!allProjects.length ? (
              <div className="bg-white rounded-xl border border-dashed border-slate-200 p-12 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <FolderOpen className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">No projects yet</h3>
                <p className="text-slate-500 text-sm mb-5">Create your first client project to start tracking updates, invoices, and time.</p>
                <Link href="/project/new">
                  <Button size="sm"><Plus className="w-4 h-4" />Create project</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {allProjects.slice(0, 8).map(project => {
                  const updates    = project.updates ?? []
                  const sentCount  = updates.filter(u => u.sent_at).length
                  const latestSent = [...updates]
                    .filter(u => u.sent_at)
                    .sort((a, b) => new Date(b.sent_at!).getTime() - new Date(a.sent_at!).getTime())[0]

                  return (
                    <Link key={project.id} href={`/project/${project.id}`}
                      className="flex items-center gap-4 bg-white rounded-xl border border-slate-200 px-4 py-3.5 hover:border-slate-300 hover:shadow-sm transition-all group">
                      <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                            {project.project_name}
                          </span>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            project.status === 'active'  ? 'bg-emerald-50 text-emerald-700'
                            : project.status === 'paused' ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-500'
                          }`}>
                            {project.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{project.client_name}</div>
                      </div>
                      <div className="text-right flex-shrink-0 hidden sm:block">
                        <div className="text-xs text-slate-600">
                          {latestSent ? formatDate(latestSent.sent_at!) : 'No updates sent'}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {sentCount} update{sentCount !== 1 ? 's' : ''} sent
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
                    </Link>
                  )
                })}
                {allProjects.length > 8 && (
                  <Link href="/project"
                    className="block text-center text-xs text-slate-500 hover:text-slate-700 bg-white border border-slate-200 hover:border-slate-300 py-3 rounded-xl transition-colors">
                    + {allProjects.length - 8} more project{allProjects.length - 8 !== 1 ? 's' : ''}
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Sidebar — 1 col */}
          <div className="space-y-4">

            {/* Active timer */}
            {activeTimer && (
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-medium text-slate-600">Timer running</span>
                  </div>
                  <Link href="/time" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">Open</Link>
                </div>
                <div className="text-sm font-medium text-slate-800 truncate">
                  {activeTimer.description || 'Untitled session'}
                </div>
                {(() => {
                  const proj = allProjects.find(p => p.id === activeTimer.project_id)
                  return proj ? (
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: proj.color }} />
                      {proj.project_name}
                    </div>
                  ) : null
                })()}
              </div>
            )}

            {/* Unpaid invoices */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-semibold text-slate-800">Unpaid invoices</span>
                </div>
                <Link href="/invoices" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">View all</Link>
              </div>
              {!unpaidInvoices.length ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-xs text-slate-400">No outstanding invoices.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {unpaidInvoices.slice(0, 5).map(inv => {
                    const total    = (inv.items ?? []).reduce((s, i) => s + (i.amount ?? 0), 0)
                    const isOverdue = inv.due_date && new Date(inv.due_date) < new Date()
                    return (
                      <Link key={inv.id} href={`/invoices/${inv.id}`}
                        className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors group">
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-slate-800 group-hover:text-indigo-600 transition-colors">
                            {inv.invoice_number}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[140px]">{inv.client_name}</div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {isOverdue && (
                            <span className="text-[10px] font-medium text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">Overdue</span>
                          )}
                          <span className="text-xs font-semibold text-slate-700">{fmt$(total)}</span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* New invoice shortcut */}
            <Link href="/invoices/new"
              className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 px-4 py-3.5 hover:border-slate-300 hover:shadow-sm transition-all group">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                <FileText className="w-4 h-4 text-slate-500 group-hover:text-indigo-600 transition-colors" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-800">New invoice</div>
                <div className="text-xs text-slate-400">Bill a client</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 ml-auto" />
            </Link>

          </div>
        </div>

        {/* Upgrade banner */}
        {profile?.plan === 'free' && (
          <div className="bg-indigo-600 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-white">Go Pro — free during Beta</div>
              <div className="text-xs text-indigo-200 mt-0.5">Unlimited projects, auto email delivery to clients, and white-label status pages.</div>
            </div>
            <Link href="/upgrade" className="flex-shrink-0">
              <Button variant="secondary" size="sm" className="font-medium">Upgrade free</Button>
            </Link>
          </div>
        )}

      </div>
    </AppLayout>
  )
}
