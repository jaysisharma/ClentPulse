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
  draft: 'bg-slate-100 text-slate-600',
  sent: 'bg-amber-50 text-amber-700',
  paid: 'bg-emerald-50 text-emerald-700',
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
  let testimonialProjectIds = new Set<string>()

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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-900">Client portal</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 hidden sm:inline">{user.email}</span>
            {allProjects.length > 0 && (
              <ClientMessagesPanel
                projects={allProjects.map(p => ({ id: p.id, project_name: p.project_name, client_name: p.client_name }))}
              />
            )}
            <SignOutButton />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">

            {/* Greeting */}
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {firstName ? `Hi ${firstName} 👋` : 'Welcome 👋'}
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Your projects, documents, invoices, and messages — all in one place.
              </p>

              {/* At-a-glance stats */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-5">
                <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Projects</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">{activeProjectCount}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{allProjects.length} total · {activeProjectCount} active</div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Wallet className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Amount due</span>
                  </div>
                  <div className={`text-2xl font-bold mt-2 tabular-nums ${owedTotal > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                    {fmtMoney(owedTotal)}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {unpaidInvoices.length} unpaid invoice{unpaidInvoices.length !== 1 ? 's' : ''}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    {attentionCount > 0 ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span className="text-[11px] font-semibold uppercase tracking-wider">To review</span>
                  </div>
                  <div className={`text-2xl font-bold mt-2 tabular-nums ${attentionCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {attentionCount}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{attentionCount > 0 ? 'need your action' : 'all caught up'}</div>
                </div>
              </div>
            </div>


            {/* Needs your attention */}
            {attentionCount > 0 && (
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Needs your attention</h2>
                <div className="space-y-3">

                  {/* Pending approvals */}
                  {pendingApprovals.map(a => (
                    <div key={a.id}>
                      <p className="text-xs text-slate-400 mb-1.5 ml-1">{a.projectName}</p>
                      <ApprovalCard approval={a} accentColor="#6366F1" />
                    </div>
                  ))}

                  {/* Unsigned contracts */}
                  {unsignedContracts.map(c => (
                    <Link
                      key={c.id}
                      href={`/contract/${c.id}`}
                      className="flex items-center gap-4 bg-white rounded-2xl border border-amber-200 p-5 hover:border-amber-300 transition-colors group"
                    >
                      <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileSignature className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900 truncate">{c.title}</div>
                        <div className="text-sm text-slate-400">{c.projectName} · Awaiting your signature</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 transition-colors flex-shrink-0" />
                    </Link>
                  ))}

                  {/* Unpaid invoices */}
                  {unpaidInvoices.map(inv => {
                    const total = (inv.items ?? []).reduce((s, i) => s + (i.amount ?? 0), 0)
                    return (
                      <Link
                        key={inv.id}
                        href={`/invoice/${inv.id}`}
                        className="flex items-center gap-4 bg-white rounded-2xl border border-amber-200 p-5 hover:border-amber-300 transition-colors group"
                      >
                        <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-900 truncate">{inv.invoice_number}</div>
                          <div className="text-sm text-slate-400">
                            {fmtMoney(total)} due
                            {inv.due_date ? ` · ${new Date(inv.due_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-amber-700 bg-amber-100/70 px-3 py-1.5 rounded-lg flex-shrink-0 group-hover:bg-amber-100 transition-colors">Pay now</span>
                      </Link>
                    )
                  })}

                </div>
              </div>
            )}

            {/* Projects */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Your projects</h2>
              {!allProjects.length ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">
                  No projects here yet. Your freelancer will share a status link as soon as your project is set up — you can always view it without signing in.
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
                          <div key={p.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                            {/* Project header */}
                            <Link
                              href={`/p/${p.slug}`}
                              className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors group"
                            >
                              <div className="w-3 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-slate-900 truncate">{p.project_name}</div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.status === 'active' ? '#22c55e' : '#94a3b8' }} />
                                  <span className="text-sm text-slate-400 capitalize">{p.status}</span>
                                  <span className="text-slate-300">·</span>
                                  <span className="text-sm text-slate-400">{p.updates.filter(u => u.sent_at).length} updates</span>
                                </div>
                              </div>
                              <span className="text-xs text-indigo-600 font-medium group-hover:underline flex items-center gap-1 flex-shrink-0">
                                View all <ArrowRight className="w-3 h-3" />
                              </span>
                            </Link>

                            {/* Latest update inline */}
                            {latestUpdate ? (
                              <div className="px-5 pb-5 border-t border-slate-100">
                                <div className="flex items-center gap-2 py-3">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  <span className="text-xs text-slate-400 font-medium">Latest update · {new Date(latestUpdate.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                </div>
                                <ul className="space-y-2">
                                  {(latestUpdate.bullets ?? []).filter(Boolean).map((b, i) => (
                                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: p.color }} />
                                      {b}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ) : (
                              <div className="px-5 pb-4 border-t border-slate-100 pt-3">
                                <p className="text-sm text-slate-400">No updates sent yet.</p>
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
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 ml-1">Completed Projects</h3>
                      <div className="space-y-4">
                        {completedProjects.map(p => {
                          const hasTestimonial = testimonialProjectIds.has(p.id)

                          return (
                            <div key={p.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                              <div className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                  <div className="w-3 h-10 rounded-full flex-shrink-0 bg-slate-300" />
                                  <div className="flex-1 min-w-0">
                                    <Link href={`/p/${p.slug}`} className="font-semibold text-slate-800 hover:text-indigo-600 transition-colors truncate block">
                                      {p.project_name}
                                    </Link>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-xs text-slate-400 capitalize bg-slate-100 px-2 py-0.5 rounded-full font-medium">Completed</span>
                                      {hasTestimonial ? (
                                        <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">Testimonial submitted</span>
                                      ) : (
                                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">Testimonial pending</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  {!hasTestimonial && (
                                    <Link href={`/testimonial/${p.id}`}>
                                      <button className="text-xs font-semibold px-3 py-1.5 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-sm">
                                        Leave testimonial
                                      </button>
                                    </Link>
                                  )}
                                  <Link
                                    href={`/p/${p.slug}`}
                                    className="text-xs text-indigo-600 font-medium hover:underline flex items-center gap-1 flex-shrink-0"
                                  >
                                    View updates <ArrowRight className="w-3 h-3" />
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
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Invoices</h2>
                <div className="space-y-2">
                  {allInvoices.map(inv => {
                    const total = (inv.items ?? []).reduce((s, i) => s + (i.amount ?? 0), 0)
                    return (
                      <Link
                        key={inv.id}
                        href={`/invoice/${inv.id}`}
                        className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 px-5 py-4 hover:border-indigo-300 transition-colors"
                      >
                        <div>
                          <div className="font-medium text-slate-900">{inv.invoice_number}</div>
                          {inv.due_date && (
                            <div className="text-xs text-slate-400 mt-0.5">
                              Due {new Date(inv.due_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${INVOICE_STATUS_BADGE[inv.status]}`}>
                            {inv.status}
                          </span>
                          <span className="font-semibold text-slate-900 tabular-nums">{fmtMoney(total)}</span>
                          <ArrowRight className="w-4 h-4 text-slate-300" />
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
