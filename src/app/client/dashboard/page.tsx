import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  Zap, FolderOpen, FileText, ArrowRight, Clock, FileSignature,
  AlertCircle, CheckCircle2, Wallet,
} from 'lucide-react'
import { SignOutButton } from '@/components/ui/sign-out-button'
import { ApprovalCard } from '@/app/p/[slug]/approval-actions'
import { ClientMessagesPanel } from './client-messages-panel'
import { CompletedProjectPopup } from '@/components/project/completed-project-popup'
import Link from 'next/link'

const INVOICE_STATUS_BADGE: Record<string, string> = {
  draft: 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10',
  sent: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20',
  paid: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20',
}

const INVOICE_SORT: Record<string, number> = { sent: 0, draft: 1, paid: 2 }

function fmtMoney(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

export default async function ClientDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: projects }, { data: invoices }] = await Promise.all([
    supabase
      .from('projects')
      .select('id,project_name,client_name,slug,color,status,hide_approvals,updates(id,bullets,sent_at,created_at),approvals(id,title,url,status,feedback),contracts(id,title,signed_at)')
      .eq('client_email', user.email)
      .order('created_at', { ascending: false }),
    supabase
      .from('invoices')
      .select('id,invoice_number,status,items,due_date')
      .eq('client_email', user.email)
      .order('created_at', { ascending: false }),
  ])

  type Update = { id: string; bullets: string[]; sent_at: string | null; created_at: string }
  type Approval = { id: string; title: string; url: string | null; status: string; feedback: string | null }
  type Contract = { id: string; title: string; signed_at: string | null }
  type Project = { id: string; project_name: string; client_name: string; slug: string; color: string; status: string; hide_approvals: boolean; updates: Update[]; approvals: Approval[]; contracts: Contract[] }
  type Invoice = { id: string; invoice_number: string; status: string; items: { amount: number }[]; due_date: string | null }

  const allProjects = (projects ?? []) as Project[]
  const allInvoices = ((invoices ?? []) as Invoice[]).sort((a, b) => (INVOICE_SORT[a.status] ?? 9) - (INVOICE_SORT[b.status] ?? 9))

  const completedProjects = allProjects.filter(p => p.status === 'completed')
  const testimonialProjectIds = new Set<string>()

  if (completedProjects.length > 0) {
    const { data: testimonialsData } = await supabase
      .from('testimonials')
      .select('project_id')
      .in('project_id', completedProjects.map(p => p.id))
    if (testimonialsData) {
      testimonialsData.forEach(t => {
        if (t.project_id) testimonialProjectIds.add(t.project_id)
      })
    }
  }

  const popupProject = completedProjects.find(p => !testimonialProjectIds.has(p.id))

  const pendingApprovals = allProjects
    .filter(p => !p.hide_approvals)
    .flatMap(p =>
      p.approvals.filter(a => a.status === 'pending').map(a => ({ ...a, projectName: p.project_name, slug: p.slug }))
    )
  const unsignedContracts = allProjects.flatMap(p =>
    p.contracts.filter(c => !c.signed_at).map(c => ({ ...c, projectName: p.project_name }))
  )
  const unpaidInvoices = allInvoices.filter(inv => inv.status === 'sent')
  const owedTotal = unpaidInvoices.reduce((s, inv) => s + (inv.items ?? []).reduce((t, i) => t + (i.amount ?? 0), 0), 0)

  const attentionCount = pendingApprovals.length + unsignedContracts.length + unpaidInvoices.length
  const activeProjectCount = allProjects.filter(p => p.status === 'active').length

  const clientName = allProjects[0]?.client_name || (user.email?.split('@')[0] ?? '')
  const firstName = clientName.split(' ')[0]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#08090a] text-slate-900 dark:text-white font-sans relative selection:bg-slate-200 dark:selection:bg-white/20">
      {/* Subtle top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-80 bg-indigo-500/5 dark:bg-indigo-500/[0.03] blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="bg-white/80 dark:bg-[#08090a]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-900 text-white dark:bg-white dark:text-slate-950 rounded-xl flex items-center justify-center shadow-xs">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-slate-900 dark:text-white tracking-tight">Client Portal</span>
              <span className="hidden sm:inline-block text-[10px] font-medium uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-2.5 px-2 py-0.5 rounded-full border border-slate-200 dark:border-white/10">
                Studio Space
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline font-mono">{user.email}</span>
            {allProjects.length > 0 && (
              <ClientMessagesPanel
                projects={allProjects.map(p => ({ id: p.id, project_name: p.project_name, client_name: p.client_name }))}
              />
            )}
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10 relative">

        {/* Greeting */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] shadow-xs mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Verified Client Overview
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light uppercase tracking-[-0.03em] text-slate-900 dark:text-white">
            {firstName ? `Welcome back, ${firstName}` : 'Welcome to your portal'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
            Real-time milestone tracking, contracts, invoices, and studio communication in one centralized hub.
          </p>

          {/* At-a-glance stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-6">
            <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 backdrop-blur-md p-4 sm:p-5 shadow-xs dark:shadow-none">
              <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                <FolderOpen className="w-3.5 h-3.5" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">Active Projects</span>
              </div>
              <div className="text-2xl font-light text-slate-900 dark:text-white mt-2 tabular-nums">{activeProjectCount}</div>
              <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">{allProjects.length} total · {activeProjectCount} ongoing</div>
            </div>

            <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 backdrop-blur-md p-4 sm:p-5 shadow-xs dark:shadow-none">
              <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                <Wallet className="w-3.5 h-3.5" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">Balance Due</span>
              </div>
              <div className={`text-2xl font-light mt-2 tabular-nums ${owedTotal > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                {fmtMoney(owedTotal)}
              </div>
              <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {unpaidInvoices.length} outstanding invoice{unpaidInvoices.length !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 backdrop-blur-md p-4 sm:p-5 shadow-xs dark:shadow-none">
              <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                {attentionCount > 0 ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                <span className="text-[10px] font-semibold uppercase tracking-wider">Pending Action</span>
              </div>
              <div className={`text-2xl font-light mt-2 tabular-nums ${attentionCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {attentionCount}
              </div>
              <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">{attentionCount > 0 ? 'items require your review' : 'all caught up'}</div>
            </div>
          </div>
        </div>

        {/* Needs your attention */}
        {attentionCount > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Pending Your Review ({attentionCount})
              </h2>
            </div>
            <div className="space-y-3">
              {/* Pending approvals */}
              {pendingApprovals.map(a => (
                <div key={a.id}>
                  <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">{a.projectName}</p>
                  <ApprovalCard approval={a} accentColor="#6366F1" />
                </div>
              ))}

              {/* Unsigned contracts */}
              {unsignedContracts.map(c => (
                <Link
                  key={c.id}
                  href={`/contract/${c.id}`}
                  className="flex items-center gap-4 bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-amber-300 dark:border-amber-500/30 p-5 hover:border-amber-400 dark:hover:border-amber-500/50 transition-colors group shadow-xs dark:shadow-none"
                >
                  <div className="w-9 h-9 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0 text-amber-600 dark:text-amber-400">
                    <FileSignature className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">{c.title}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{c.projectName} · Awaiting your signature</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-amber-500 transition-colors flex-shrink-0" />
                </Link>
              ))}

              {/* Unpaid invoices */}
              {unpaidInvoices.map(inv => {
                const total = (inv.items ?? []).reduce((s, i) => s + (i.amount ?? 0), 0)
                return (
                  <Link
                    key={inv.id}
                    href={`/invoice/${inv.id}`}
                    className="flex items-center gap-4 bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-amber-300 dark:border-amber-500/30 p-5 hover:border-amber-400 dark:hover:border-amber-500/50 transition-colors group shadow-xs dark:shadow-none"
                  >
                    <div className="w-9 h-9 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0 text-amber-600 dark:text-amber-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">{inv.invoice_number}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {fmtMoney(total)} due
                        {inv.due_date ? ` · ${new Date(inv.due_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full flex-shrink-0 group-hover:bg-amber-500/20 transition-colors">
                      Pay Now
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Projects */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FolderOpen className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Engagements
            </h2>
          </div>

          {!allProjects.length ? (
            <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 p-10 text-center text-xs text-slate-400 dark:text-slate-500">
              No projects linked to this portal yet. Your studio lead will share a live link as soon as your workspace is active.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Active / Paused Projects */}
              {allProjects.filter(p => p.status !== 'completed').length > 0 && (
                <div className="space-y-4">
                  {allProjects.filter(p => p.status !== 'completed').map(p => {
                    const latestUpdate = [...p.updates]
                      .filter(u => u.sent_at)
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

                    return (
                      <div key={p.id} className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 backdrop-blur-md overflow-hidden shadow-xs dark:shadow-none transition-colors">
                        {/* Project header */}
                        <Link
                          href={`/p/${p.slug}`}
                          className="flex items-center gap-4 p-5 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group"
                        >
                          <div className="w-2.5 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: p.color || '#6366F1' }} />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {p.project_name}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.status === 'active' ? '#22c55e' : '#94a3b8' }} />
                              <span className="text-xs text-slate-400 dark:text-slate-500 capitalize">{p.status}</span>
                              <span className="text-slate-300 dark:text-slate-600">·</span>
                              <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">{p.updates.filter(u => u.sent_at).length} updates</span>
                            </div>
                          </div>
                          <span className="text-xs text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white font-medium flex items-center gap-1.5 flex-shrink-0 px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 transition-all">
                            View Portal <ArrowRight className="w-3 h-3" />
                          </span>
                        </Link>

                        {/* Latest update inline */}
                        {latestUpdate ? (
                          <div className="px-5 pb-5 border-t border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/[0.01]">
                            <div className="flex items-center gap-2 py-3">
                              <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                                Latest Briefing · {new Date(latestUpdate.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            <ul className="space-y-2">
                              {(latestUpdate.bullets ?? []).filter(Boolean).map((b, i) => (
                                <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: p.color || '#6366F1' }} />
                                  <span>{b}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <div className="px-5 pb-4 border-t border-slate-100 dark:border-white/5 pt-3">
                            <p className="text-xs text-slate-400 dark:text-slate-500">No project updates posted yet.</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Completed Projects Section */}
              {completedProjects.length > 0 && (
                <div className="pt-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 ml-1">
                    Archived & Completed
                  </h3>
                  <div className="space-y-4">
                    {completedProjects.map(p => {
                      const hasTestimonial = testimonialProjectIds.has(p.id)

                      return (
                        <div key={p.id} className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 backdrop-blur-md overflow-hidden shadow-xs dark:shadow-none transition-colors">
                          <div className="flex items-center justify-between p-5 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div className="w-2.5 h-10 rounded-full flex-shrink-0 bg-slate-300 dark:bg-slate-700" />
                              <div className="flex-1 min-w-0">
                                <Link href={`/p/${p.slug}`} className="text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate block">
                                  {p.project_name}
                                </Link>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-2 py-0.5 rounded-full font-medium">
                                    Completed
                                  </span>
                                  {hasTestimonial ? (
                                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                                      Testimonial Submitted
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-medium">
                                      Testimonial Requested
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {!hasTestimonial && (
                                <Link href={`/testimonial/${p.id}`}>
                                  <button className="text-xs font-semibold px-3 py-1.5 rounded-full text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 transition-all shadow-xs">
                                    Leave Testimonial
                                  </button>
                                </Link>
                              )}
                              <Link
                                href={`/p/${p.slug}`}
                                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium flex items-center gap-1 flex-shrink-0"
                              >
                                View Portal <ArrowRight className="w-3 h-3" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Invoices */}
        {allInvoices.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Invoices & Statements
              </h2>
            </div>
            <div className="space-y-2.5">
              {allInvoices.map(inv => {
                const total = (inv.items ?? []).reduce((s, i) => s + (i.amount ?? 0), 0)
                return (
                  <Link
                    key={inv.id}
                    href={`/invoice/${inv.id}`}
                    className="flex items-center justify-between bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 backdrop-blur-md px-5 py-4 hover:border-slate-300 dark:hover:border-white/20 transition-colors shadow-xs dark:shadow-none group"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {inv.invoice_number}
                      </div>
                      {inv.due_date && (
                        <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                          Due {new Date(inv.due_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${INVOICE_STATUS_BADGE[inv.status]}`}>
                        {inv.status}
                      </span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white tabular-nums">{fmtMoney(total)}</span>
                      <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

      </div>

      {popupProject && (
        <CompletedProjectPopup
          projectId={popupProject.id}
          projectName={popupProject.project_name}
        />
      )}
    </div>
  )
}
