import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Zap, FolderOpen, FileText, ArrowRight, Clock, FileSignature, AlertCircle } from 'lucide-react'
import { SignOutButton } from '@/components/ui/sign-out-button'
import { ApprovalCard } from '@/app/p/[slug]/approval-actions'
import Link from 'next/link'

const INVOICE_STATUS_BADGE: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  sent:  'bg-amber-50 text-amber-700',
  paid:  'bg-emerald-50 text-emerald-700',
}

const INVOICE_SORT: Record<string, number> = { sent: 0, draft: 1, paid: 2 }

export default async function ClientDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: projects }, { data: invoices }] = await Promise.all([
    supabase
      .from('projects')
      .select('id,project_name,client_name,slug,color,status,updates(id,bullets,sent_at,created_at),approvals(id,title,url,status,feedback),contracts(id,title,signed_at)')
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
  type Project = { id: string; project_name: string; client_name: string; slug: string; color: string; status: string; updates: Update[]; approvals: Approval[]; contracts: Contract[] }
  type Invoice = { id: string; invoice_number: string; status: string; items: { amount: number }[]; due_date: string | null }

  const allProjects = (projects ?? []) as Project[]
  const allInvoices = ((invoices ?? []) as Invoice[]).sort((a, b) => (INVOICE_SORT[a.status] ?? 9) - (INVOICE_SORT[b.status] ?? 9))

  const pendingApprovals = allProjects.flatMap(p =>
    p.approvals.filter(a => a.status === 'pending').map(a => ({ ...a, projectName: p.project_name, slug: p.slug }))
  )
  const unsignedContracts = allProjects.flatMap(p =>
    p.contracts.filter(c => !c.signed_at).map(c => ({ ...c, projectName: p.project_name }))
  )
  const unpaidInvoices = allInvoices.filter(inv => inv.status === 'sent')

  const attentionCount = pendingApprovals.length + unsignedContracts.length + unpaidInvoices.length

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-900">Client portal</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">{user.email}</span>
            <SignOutButton />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">

        {/* Needs your attention */}
        {attentionCount > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Needs your attention
              <span className="ml-1 bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">{attentionCount}</span>
            </h2>
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
                  className="flex items-center gap-4 bg-white rounded-xl border border-amber-200 p-5 hover:border-amber-300 hover:shadow-sm transition-all group"
                >
                  <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileSignature className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900">{c.title}</div>
                    <div className="text-sm text-slate-400">{c.projectName} · Awaiting your signature</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 transition-colors" />
                </Link>
              ))}

              {/* Unpaid invoices */}
              {unpaidInvoices.map(inv => {
                const total = (inv.items ?? []).reduce((s, i) => s + (i.amount ?? 0), 0)
                return (
                  <Link
                    key={inv.id}
                    href={`/invoice/${inv.id}`}
                    className="flex items-center gap-4 bg-white rounded-xl border border-amber-200 p-5 hover:border-amber-300 hover:shadow-sm transition-all group"
                  >
                    <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900">{inv.invoice_number}</div>
                      <div className="text-sm text-slate-400">
                        ${total.toLocaleString()} due
                        {inv.due_date ? ` · ${new Date(inv.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 transition-colors" />
                  </Link>
                )
              })}

            </div>
          </div>
        )}

        {/* Projects */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-slate-400" />Your projects
          </h2>
          {!allProjects.length ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">
              No projects found. Ask your freelancer to add your email to your project.
            </div>
          ) : (
            <div className="space-y-4">
              {allProjects.map(p => {
                const latestUpdate = [...p.updates]
                  .filter(u => u.sent_at)
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

                return (
                  <div key={p.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    {/* Project header */}
                    <Link
                      href={`/p/${p.slug}`}
                      className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors group"
                    >
                      <div className="w-3 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900">{p.project_name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: p.status === 'active' ? '#22c55e' : '#94a3b8' }}
                          />
                          <span className="text-sm text-slate-400 capitalize">{p.status}</span>
                          <span className="text-slate-300">·</span>
                          <span className="text-sm text-slate-400">{p.updates.filter(u => u.sent_at).length} updates</span>
                        </div>
                      </div>
                      <span className="text-xs text-indigo-600 font-medium group-hover:underline flex items-center gap-1">
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
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 flex-shrink-0" style={{ backgroundColor: p.color }} />
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
        </div>

        {/* Invoices */}
        {allInvoices.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-400" />Invoices
            </h2>
            <div className="space-y-2">
              {allInvoices.map(inv => {
                const total = (inv.items ?? []).reduce((s, i) => s + (i.amount ?? 0), 0)
                return (
                  <Link
                    key={inv.id}
                    href={`/invoice/${inv.id}`}
                    className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-5 py-4 hover:border-indigo-300 hover:shadow-sm transition-all"
                  >
                    <div>
                      <div className="font-medium text-slate-900">{inv.invoice_number}</div>
                      {inv.due_date && (
                        <div className="text-xs text-slate-400 mt-0.5">
                          Due {new Date(inv.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${INVOICE_STATUS_BADGE[inv.status]}`}>
                        {inv.status}
                      </span>
                      <span className="font-semibold text-slate-900">${total.toLocaleString()}</span>
                      <ArrowRight className="w-4 h-4 text-slate-300" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
