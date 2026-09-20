import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { DarkShell } from '@/components/layout/dark-shell'
import Link from 'next/link'
import { Plus, FileText, FileSignature, ClipboardList, ArrowRight, CheckCircle2 } from 'lucide-react'

type DocType = 'proposal' | 'agreement' | 'requirements'

const TYPE_META: Record<DocType, { label: string; icon: React.ElementType; color: string; badgeColor: string }> = {
  proposal:     { label: 'Proposal',     icon: FileText,      color: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400', badgeColor: 'text-indigo-400' },
  agreement:    { label: 'Agreement',    icon: FileSignature, color: 'bg-blue-500/10 border-blue-500/20 text-blue-400',     badgeColor: 'text-blue-400'   },
  requirements: { label: 'Requirements', icon: ClipboardList, color: 'bg-amber-500/10 border-amber-500/20 text-amber-400',   badgeColor: 'text-amber-400'  },
}

const STATUS_STYLES: Record<string, string> = {
  draft:    'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10',
  sent:     'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20',
  accepted: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20',
  signed:   'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20',
  declined: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20',
}

export default async function DocsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: docs, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Failed to load documents: ${error.message}`)

  const allDocs       = docs ?? []
  const proposals     = allDocs.filter(d => d.type === 'proposal')
  const agreements    = allDocs.filter(d => d.type === 'agreement')
  const requirements  = allDocs.filter(d => d.type === 'requirements')
  const signed        = allDocs.filter(d => d.status === 'signed' || d.status === 'accepted')

  return (
    <AppLayout>
      <DarkShell>
        <div className="relative z-10 animate-fade-in space-y-8 pb-10">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Contracts & Documents
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-light uppercase tracking-[-0.03em] text-slate-900 dark:text-white">
                Documents
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-light mt-1">
                Proposals, master service agreements, and technical requirements with client e-signatures.
              </p>
            </div>
            <Link href="/docs/new">
              <button className="rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold px-4 py-2 text-xs transition-all flex items-center gap-1.5 w-fit shadow-xs flex-shrink-0">
                <Plus className="w-3.5 h-3.5" />
                <span>New document</span>
              </button>
            </Link>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/90 p-5 ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-none backdrop-blur-md">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Proposals</span>
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 dark:text-indigo-400">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <div className="font-mono font-light text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">{proposals.length}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-light mt-1.5">pitch & pricing documents</div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/90 p-5 ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-none backdrop-blur-md">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Agreements</span>
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 dark:text-blue-400">
                  <FileSignature className="w-4 h-4" />
                </div>
              </div>
              <div className="font-mono font-light text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">{agreements.length}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-light mt-1.5">service contracts</div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/90 p-5 ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-none backdrop-blur-md">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Requirements</span>
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400">
                  <ClipboardList className="w-4 h-4" />
                </div>
              </div>
              <div className="font-mono font-light text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">{requirements.length}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-light mt-1.5">specifications & scope</div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/90 p-5 ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-none backdrop-blur-md">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Executed</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="font-mono font-light text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">{signed.length}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-light mt-1.5">signed or accepted</div>
            </div>
          </div>

          {!allDocs.length ? (
            <div className="rounded-2xl border border-dashed border-slate-200 dark:border-white/10 bg-white/60 dark:bg-[#0c0d12]/60 p-16 text-center ring-1 ring-slate-950/5 dark:ring-white/5">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="font-light text-lg text-slate-900 dark:text-white mb-1">No documents created yet</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-light max-w-sm mx-auto mb-6">
                Create proposals, service contracts, and scope requirements with integrated client signature workflows.
              </p>
              <Link href="/docs/new">
                <button className="rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold px-4 py-2 text-xs transition-all inline-flex items-center gap-1.5 shadow-xs">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create your first document</span>
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {([
                { type: 'proposal',     items: proposals    },
                { type: 'agreement',    items: agreements   },
                { type: 'requirements', items: requirements },
              ] as { type: DocType; items: typeof docs }[]).map(({ type, items }) => {
                if (!items?.length) return null
                const meta = TYPE_META[type]
                const Icon = meta.icon
                return (
                  <div key={type} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-lg border flex items-center justify-center ${meta.color}`}>
                        <Icon className="w-3 h-3" />
                      </div>
                      <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                        {meta.label}s
                      </span>
                      <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full px-2 py-0.5 ml-1">
                        {items.length}
                      </span>
                    </div>
                    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/90 divide-y divide-slate-100 dark:divide-white/5 overflow-hidden ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-none backdrop-blur-md">
                      {items.map(doc => (
                        <Link
                          key={doc.id}
                          href={`/docs/${doc.id}`}
                          className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors group"
                        >
                          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2.5 mb-1">
                              <span className="font-medium text-slate-900 dark:text-white text-xs sm:text-sm truncate group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                {doc.title}
                              </span>
                              <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_STYLES[doc.status] ?? STATUS_STYLES.draft}`}>
                                {doc.status}
                              </span>
                            </div>
                            {doc.client_name && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-light truncate">
                                Client: {doc.client_name}
                              </p>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 font-mono flex-shrink-0">
                            {new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-600 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </DarkShell>
    </AppLayout>
  )
}
