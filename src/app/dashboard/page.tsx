import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Plus, Timer, FolderOpen, DollarSign, Wallet,
  FileSignature, CheckCircle2, Send, ChevronRight, ArrowRight, Sparkles, FileText,
} from 'lucide-react'
import { UpgradeToast } from './upgrade-toast'
import { RemindSelfButton } from './remind-self-button'
import { DarkShell } from '@/components/layout/dark-shell'
import { Greeting } from '@/components/dashboard/greeting'
import { StatCard } from '@/components/ui/stat-card'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { cn } from '@/lib/utils'

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
  if (parts.length === 0 && totalSecs > 0) {
    return `${totalSecs}s`
  }
  if (parts.length === 0) parts.push('0m')
  return parts.join(' ')
}

// Human "when is this due" label relative to today, e.g. "Due in 3 days",
// "Due today", "5 days overdue". Returns null when the invoice has no due date.
function dueLabel(due: string | null): { text: string; overdue: boolean } | null {
  if (!due) return { text: 'No due date', overdue: false }
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const d = new Date(due); d.setHours(0, 0, 0, 0)
  const days = Math.round((d.getTime() - today.getTime()) / 86_400_000)
  if (days < 0)  return { text: `${-days} day${days === -1 ? '' : 's'} overdue`, overdue: true }
  if (days === 0) return { text: 'Due today', overdue: true }
  if (days === 1) return { text: 'Due tomorrow', overdue: false }
  return { text: `Due in ${days} days`, overdue: false }
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
    projectsRes,
    profileRes,
    invoicesRes,
    lastMonthRes,
    timeRes,
    lastWeekRes,
    expensesRes,
  ] = await Promise.all([
    supabase
      .from('projects')
      .select('id, project_name, client_name, color, status, created_at, updates(id, sent_at), approvals(id, title, status), contracts(id, title, signed_at)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase.from('users').select('name, plan').eq('id', user.id).single(),
    supabase.from('invoices').select('id, invoice_number, client_name, status, items, due_date, created_at, paid_at').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('invoices').select('items').eq('user_id', user.id).eq('status', 'paid').gte('created_at', lastMonthStart).lt('created_at', monthStart),
    supabase.from('time_entries').select('hours').eq('user_id', user.id).gte('date', weekStart),
    supabase.from('time_entries').select('hours').eq('user_id', user.id).gte('date', lastWeekStart).lt('date', weekStart),
    supabase.from('expenses').select('date, amount').eq('user_id', user.id),
  ])

  // Fail honestly: a DB error on the core data must surface as an error state,
  // not masquerade as an empty dashboard. error.tsx catches this.
  const criticalError = projectsRes.error || invoicesRes.error || expensesRes.error
  if (criticalError) throw new Error(`Failed to load dashboard data: ${criticalError.message}`)

  const projects          = projectsRes.data
  const profile           = profileRes.data
  const invoices          = invoicesRes.data
  const lastMonthInvoices = lastMonthRes.data
  const timeEntries       = timeRes.data
  const lastWeekEntries   = lastWeekRes.data
  const expenses          = expensesRes.data

  type Update   = { id: string; sent_at: string | null }
  type Approval = { id: string; title: string; status: string }
  type Contract = { id: string; title: string; signed_at: string | null }
  type Project  = { id: string; project_name: string; client_name: string; color: string; status: string; created_at: string; updates: Update[]; approvals: Approval[]; contracts: Contract[] }
  type Invoice  = { id: string; invoice_number: string; client_name: string; status: string; items: { amount: number }[]; due_date: string | null; created_at: string; paid_at: string | null }
  type Expense  = { date: string; amount: string }

  const allProjects = (projects ?? []) as Project[]
  const allInvoices = (invoices ?? []) as Invoice[]
  const allExpenses = (expenses ?? []) as Expense[]

  const sumItems = (inv: { items: { amount: number }[] }[]) =>
    inv.flatMap(i => i.items ?? []).reduce((s, item) => s + (item.amount ?? 0), 0)

  // ── Box 1 · You're owed ────────────────────────────────────────────────
  const unpaidInvoices = allInvoices.filter(i => i.status === 'sent')
  const owedAmount     = sumItems(unpaidInvoices)
  const overdueCount   = unpaidInvoices.filter(i => i.due_date && new Date(i.due_date) < new Date()).length

  // Soonest-due (and overdue) unpaid invoices for the right-rail list. Undated
  // invoices sort last so the ones with a real deadline surface first.
  const upcomingInvoices = [...unpaidInvoices]
    .sort((a, b) => (a.due_date ? new Date(a.due_date).getTime() : Infinity) - (b.due_date ? new Date(b.due_date).getTime() : Infinity))
    .slice(0, 5)

  // ── Box 2 · You made (net = earnings − expenses) ───────────────────────
  const expenseInMonth = (start: string, end?: string) =>
    allExpenses
      .filter(e => e.date >= start && (!end || e.date < end))
      .reduce((s, e) => s + (parseFloat(e.amount) || 0), 0)

  const earningsThisMonth = sumItems(allInvoices.filter(i => i.status === 'paid' && i.created_at >= monthStart))
  const earningsLastMonth = sumItems(lastMonthInvoices ?? [])
  const netThisMonth = earningsThisMonth - expenseInMonth(monthStart)
  const netLastMonth = earningsLastMonth - expenseInMonth(lastMonthStart, monthStart)
  const netDiff = netThisMonth - netLastMonth

  // ── Box 3 · You worked ─────────────────────────────────────────────────
  const hoursThisWeek = (timeEntries ?? []).reduce((s, e) => s + (e.hours ?? 0), 0)
  const hoursLastWeek = (lastWeekEntries ?? []).reduce((s, e) => s + (e.hours ?? 0), 0)
  const hoursDiff     = hoursThisWeek - hoursLastWeek

  // ── Box 4 · Your projects ──────────────────────────────────────────────
  const activeProjects = allProjects.filter(p => p.status === 'active')

  // Brand-new account: no projects, no invoices, no expenses → show setup state.
  const isNewUser = allProjects.length === 0 && allInvoices.length === 0 && allExpenses.length === 0

  // ── Needs attention ────────────────────────────────────────────────────
  const overdueProjects = activeProjects.filter(p => {
    const sent = p.updates.filter(u => u.sent_at)
    if (!sent.length) return new Date(p.created_at) < new Date(cutoff7d)
    const latest = [...sent].sort((a, b) => new Date(b.sent_at!).getTime() - new Date(a.sent_at!).getTime())[0]
    return new Date(latest.sent_at!) < new Date(cutoff7d)
  })
  const pendingApprovals = allProjects.flatMap(p =>
    p.approvals.filter(a => a.status === 'pending').map(a => ({ ...a, projectId: p.id, projectName: p.project_name }))
  )
  const unsignedContracts = allProjects.flatMap(p =>
    p.contracts.filter(c => !c.signed_at).map(c => ({ ...c, projectId: p.id, projectName: p.project_name }))
  )
  const attentionCount = overdueProjects.length + pendingApprovals.length + unsignedContracts.length

  // ── Greeting ───────────────────────────────────────────────────────────
  const firstName = profile?.name ? profile.name.split(' ')[0] : ''
  const displayName = firstName ? firstName.charAt(0).toUpperCase() + firstName.slice(1) : ''
  const emailLocal = (user.email?.split('@')[0] ?? '').toLowerCase()
  const looksAutoName = !!displayName && (/\d/.test(displayName) || displayName.toLowerCase() === emailLocal)
  const greetName = looksAutoName ? '' : displayName

  // ── Chart data ─────────────────────────────────────────────────────────
  const paidPoints = allInvoices
    .filter(i => i.status === 'paid')
    .map(i => ({
      date: (i.paid_at ? new Date(i.paid_at) : new Date(i.created_at)).toISOString().split('T')[0],
      amount: sumItems([i]),
    }))
  const expensePoints = allExpenses.map(e => ({
    date: new Date(e.date).toISOString().split('T')[0],
    amount: parseFloat(e.amount) || 0,
  }))

  return (
    <AppLayout dark user={profile ? { name: profile.name ?? null, plan: profile.plan as 'free' | 'pro' } : undefined}>
      <DarkShell dark>
        <div className="relative z-10 space-y-8 pb-10">
          <UpgradeToast />

          {/* ── Header ───────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-100 tracking-tight">
                <Greeting name={greetName} />
              </h1>
              <p className="text-slate-400 text-sm mt-2">
                {activeProjects.length} active project{activeProjects.length !== 1 ? 's' : ''} · {attentionCount > 0 ? `${attentionCount} thing${attentionCount !== 1 ? 's' : ''} need your attention` : 'everything is on track'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/time">
                <Button variant="secondary" size="sm" className="bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800 hover:text-white">
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

          {isNewUser ? (
            /* ── New-user setup state ─────────────────────────────────── */
            <div className="rounded-2xl bg-slate-900 border border-slate-800/60 py-16 px-6 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-indigo-950/40 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-indigo-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-100 mt-5">Let&apos;s set up your workspace</h2>
              <p className="text-sm text-slate-400 mt-2 max-w-sm">
                Create your first project to start tracking time, sending client updates, and getting paid — your dashboard fills in from there.
              </p>
              <Link href="/project/new" className="mt-6">
                <Button>
                  <Plus className="w-4 h-4" />
                  Create your first project
                </Button>
              </Link>
              <Link href="/clients" className="mt-3 text-xs font-medium text-slate-400 hover:text-slate-300 inline-flex items-center gap-1">
                or add a client first <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ) : (
            <>
          {/* ── 4 number boxes ───────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard variant="dark"
              label="Outstanding"
              value={fmt$(owedAmount)}
              icon={DollarSign}
              tone={overdueCount > 0 ? 'danger' : 'default'}
              caption={
                owedAmount > 0
                  ? overdueCount > 0
                    ? <span className="text-rose-500 font-semibold">{overdueCount} invoice{overdueCount !== 1 ? 's' : ''} overdue</span>
                    : <span>awaiting payment</span>
                  : <span>all paid up</span>
              }
            />
            <StatCard variant="dark"
              label="This month"
              value={fmt$(netThisMonth)}
              icon={Wallet}
              trend={
                netThisMonth !== 0 || netLastMonth !== 0
                  ? { dir: netDiff > 0 ? 'up' : netDiff < 0 ? 'down' : 'flat', label: fmt$(Math.abs(netDiff)) }
                  : undefined
              }
              caption={netDiff > 0 ? 'more than last month' : netDiff < 0 ? 'less than last month' : 'vs last month'}
            />
            <StatCard variant="dark"
              label="Hours this week"
              value={fmtHours(hoursThisWeek)}
              icon={Timer}
              trend={
                hoursThisWeek > 0 || hoursLastWeek > 0
                  ? { dir: hoursDiff > 0 ? 'up' : hoursDiff < 0 ? 'down' : 'flat', label: fmtHours(Math.abs(hoursDiff)) }
                  : undefined
              }
              caption={hoursDiff > 0 ? 'more than last week' : hoursDiff < 0 ? 'less than last week' : 'vs last week'}
            />
            <StatCard variant="dark"
              label="Active projects"
              value={activeProjects.length}
              icon={FolderOpen}
              caption={`of ${allProjects.length} total`}
            />
          </div>

          {/* ── Two-column workspace ─────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* Left column (wider): chart + needs attention */}
          <div className="lg:col-span-2 space-y-6">
          {/* ── Money in vs out chart ────────────────────────────────── */}
          <RevenueChart paid={paidPoints} expenses={expensePoints} dark />

          {/* ── Needs attention to-do list ───────────────────────────── */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Needs attention</h2>

            {attentionCount === 0 ? (
              <div className="rounded-2xl bg-slate-900 border border-slate-800/60 py-12 px-6 flex flex-col items-center text-center gap-2">
                <div className="w-11 h-11 rounded-full bg-emerald-950/40 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-sm font-semibold text-slate-200">You're all caught up</p>
                <p className="text-xs text-slate-400">No updates, approvals, or contracts waiting on you.</p>
              </div>
            ) : (
              <div className="rounded-2xl bg-slate-900 border border-slate-800/60 divide-y divide-slate-800/60 overflow-hidden">
                {overdueProjects.map(p => (
                  <div key={`u-${p.id}`} className="flex items-center gap-4 p-4 hover:bg-slate-800/40 transition-colors">
                    <span className="w-9 h-9 rounded-lg bg-amber-950/40 flex items-center justify-center flex-shrink-0">
                      <Send className="w-4 h-4 text-amber-500" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-100 truncate">{p.project_name}</p>
                      <p className="text-xs text-slate-400 truncate">No update sent in over a week · {p.client_name}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <RemindSelfButton projectId={p.id} />
                      <Link href={`/project/${p.id}/update`}>
                        <Button size="sm" className="text-xs">Send update</Button>
                      </Link>
                    </div>
                  </div>
                ))}

                {pendingApprovals.map(a => (
                  <div key={`a-${a.id}`} className="flex items-center gap-4 p-4 hover:bg-slate-800/40 transition-colors">
                    <span className="w-9 h-9 rounded-lg bg-amber-950/40 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-amber-500" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-100 truncate">{a.title}</p>
                      <p className="text-xs text-slate-400 truncate">Waiting on client approval · {a.projectName}</p>
                    </div>
                    <Link href={`/project/${a.projectId}`} className="flex-shrink-0">
                      <Button size="sm" variant="secondary" className="text-xs">Follow up</Button>
                    </Link>
                  </div>
                ))}

                {unsignedContracts.map(c => (
                  <div key={`c-${c.id}`} className="flex items-center gap-4 p-4 hover:bg-slate-800/40 transition-colors">
                    <span className="w-9 h-9 rounded-lg bg-amber-950/40 flex items-center justify-center flex-shrink-0">
                      <FileSignature className="w-4 h-4 text-amber-500" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-100 truncate">{c.title}</p>
                      <p className="text-xs text-slate-400 truncate">Contract not signed yet · {c.projectName}</p>
                    </div>
                    <Link href={`/project/${c.projectId}/contract`} className="flex-shrink-0">
                      <Button size="sm" className="text-xs">Review &amp; sign</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>
          </div>

          {/* Right column: invoices due + active projects */}
          <div className="space-y-6 lg:sticky lg:top-8">

          {/* ── Upcoming & overdue invoices ──────────────────────────── */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Invoices due</h2>
              <Link href="/invoices" className="text-xs font-medium text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-0.5">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {upcomingInvoices.length === 0 ? (
              <div className="rounded-2xl bg-slate-900 border border-slate-800/60 py-10 px-6 flex flex-col items-center text-center gap-2">
                <div className="w-11 h-11 rounded-full bg-emerald-950/40 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-sm font-semibold text-slate-200">Nothing outstanding</p>
                <p className="text-xs text-slate-400">No unpaid invoices right now.</p>
              </div>
            ) : (
              <div className="rounded-2xl bg-slate-900 border border-slate-800/60 divide-y divide-slate-800/60 overflow-hidden">
                {upcomingInvoices.map(inv => {
                  const due = dueLabel(inv.due_date)
                  return (
                    <Link
                      key={inv.id}
                      href={`/invoices/${inv.id}`}
                      className="flex items-center gap-3 p-4 hover:bg-slate-800/40 transition-colors group"
                    >
                      <span className={cn(
                        'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
                        due?.overdue ? 'bg-rose-950/40 text-rose-500' : 'bg-slate-800 text-slate-400',
                      )}>
                        <FileText className="w-4 h-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-100 truncate group-hover:text-indigo-400 transition-colors">{inv.client_name}</p>
                        <p className={cn('text-xs truncate', due?.overdue ? 'text-rose-600 font-medium' : 'text-slate-400')}>
                          {inv.invoice_number} · {due?.text}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-slate-100 tabular-nums flex-shrink-0">{fmt$(sumItems([inv]))}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </section>

          {/* ── Active projects (home base) ──────────────────────────── */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Active projects</h2>
              <Link href="/project" className="text-xs font-medium text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-0.5">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {activeProjects.length === 0 ? (
              <div className="rounded-2xl bg-slate-900 border border-slate-800/60 py-10 px-6 flex flex-col items-center text-center gap-2">
                <div className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-200">No active projects</p>
                <Link href="/project/new" className="text-xs font-medium text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 mt-1">
                  <Plus className="w-3.5 h-3.5" /> Start a project
                </Link>
              </div>
            ) : (
              <div className="rounded-2xl bg-slate-900 border border-slate-800/60 divide-y divide-slate-800/60 overflow-hidden">
                {activeProjects.slice(0, 5).map(p => (
                  <Link
                    key={p.id}
                    href={`/project/${p.id}`}
                    className="flex items-center gap-3 p-4 hover:bg-slate-800/40 transition-colors group"
                  >
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-100 truncate group-hover:text-indigo-400 transition-colors">{p.project_name}</p>
                      <p className="text-xs text-slate-400 truncate">{p.client_name}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 flex-shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </section>
          </div>

          </div>
            </>
          )}
        </div>
      </DarkShell>
    </AppLayout>
  )
}
