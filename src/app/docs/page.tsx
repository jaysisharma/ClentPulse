import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, FileText, FileSignature, ClipboardList, ArrowRight } from 'lucide-react'

type DocType = 'proposal' | 'agreement' | 'requirements'

const TYPE_META: Record<DocType, { label: string; icon: React.ElementType; color: string }> = {
  proposal:     { label: 'Proposal',     icon: FileText,      color: 'bg-violet-50 text-violet-600' },
  agreement:    { label: 'Agreement',    icon: FileSignature, color: 'bg-blue-50 text-blue-600'     },
  requirements: { label: 'Requirements', icon: ClipboardList, color: 'bg-amber-50 text-amber-600'   },
}

const STATUS_STYLES: Record<string, string> = {
  draft:    'bg-slate-100 text-slate-600',
  sent:     'bg-blue-50 text-blue-700',
  accepted: 'bg-emerald-50 text-emerald-700',
  signed:   'bg-emerald-50 text-emerald-700',
  declined: 'bg-red-50 text-red-700',
}

export default async function DocsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: docs } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const proposals     = (docs ?? []).filter(d => d.type === 'proposal')
  const agreements    = (docs ?? []).filter(d => d.type === 'agreement')
  const requirements  = (docs ?? []).filter(d => d.type === 'requirements')

  return (
    <AppLayout>
      <div className="animate-fade-in">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Documents</h1>
            <p className="text-slate-500 text-sm mt-1">Proposals, agreements, and requirement docs for your clients.</p>
          </div>
          <Link href="/docs/new">
            <Button><Plus className="w-4 h-4" />New document</Button>
          </Link>
        </div>

        {!docs?.length ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-16 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">No documents yet</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
              Create proposals, service agreements, and requirement docs — all with professional templates.
            </p>
            <Link href="/docs/new"><Button><Plus className="w-4 h-4" />Create your first document</Button></Link>
          </div>
        ) : (
          <div className="space-y-10">
            {([
              { type: 'proposal',     items: proposals    },
              { type: 'agreement',    items: agreements   },
              { type: 'requirements', items: requirements },
            ] as { type: DocType; items: typeof docs }[]).map(({ type, items }) => {
              if (!items.length) return null
              const meta = TYPE_META[type]
              const Icon = meta.icon
              return (
                <div key={type}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${meta.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <h2 className="text-sm font-semibold text-slate-700">{meta.label}s</h2>
                    <span className="text-xs text-slate-400">({items.length})</span>
                  </div>
                  <div className="space-y-2">
                    {items.map(doc => (
                      <Link
                        key={doc.id}
                        href={`/docs/${doc.id}`}
                        className="flex items-center gap-4 bg-white rounded-xl border border-slate-200 p-4 hover:border-indigo-300 hover:shadow-sm transition-all group"
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-semibold text-slate-900 truncate">{doc.title}</span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_STYLES[doc.status] ?? STATUS_STYLES.draft}`}>
                              {doc.status}
                            </span>
                          </div>
                          {doc.client_name && (
                            <span className="text-sm text-slate-500">{doc.client_name}</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 flex-shrink-0">
                          {new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
