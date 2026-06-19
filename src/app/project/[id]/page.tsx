import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { DarkShell } from '@/components/layout/dark-shell'
import { Button } from '@/components/ui/button'
import { formatDate, getWeekOf } from '@/lib/utils'
import Link from 'next/link'
import {
  ArrowLeft, Plus, Link2, Check, Send,
  Clock, AlertTriangle, FileSignature, CheckCircle2, ChevronRight,
} from 'lucide-react'
import { CopyLinkButton } from './copy-link-button'
import { StatusToggle } from './status-toggle'
import { UpdateActions } from './update-actions'
import { ApprovalsSection } from './approvals-section'
import { MilestonesWidget } from './milestones-widget'
import { KickoffChecklist } from './kickoff-checklist'
import { ProjectActionsMenu } from './project-actions-menu'
import { CollapsibleSection } from './collapsible-section'
import { CollapsibleCard } from './collapsible-card'

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [
    { data: project },
    { data: updates },
    { data: invoices },
    { data: timeEntries },
    { data: milestones },
    { data: approvals },
    { data: contracts },
  ] = await Promise.all([
    supabase.from('projects').select('*').eq('id', id).eq('user_id', user.id).single(),
    supabase.from('updates').select('*').eq('project_id', id).order('created_at', { ascending: false }),
    supabase.from('invoices').select('items').eq('project_id', id),
    supabase.from('time_entries').select('hours').eq('project_id', id),
    supabase.from('milestones').select('id, title, due_date, done').eq('project_id', id).order('due_date', { ascending: true, nullsFirst: false }),
    supabase.from('approvals').select('*').eq('project_id', id).order('created_at', { ascending: false }),
    supabase.from('contracts').select('id, signed_at').eq('project_id', id),
  ])

  if (!project) notFound()

  const { data: owner } = await supabase.from('users').select('name').eq('id', user.id).single()
  const ownerName = owner?.name || (user.email?.split('@')[0] ?? 'You')

  const publicUrl   = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/p/${project.slug}`
  const invoiced    = (invoices ?? []).flatMap(i => i.items ?? []).reduce((s: number, x: { amount: number }) => s + (x.amount ?? 0), 0)
  const hours       = (timeEntries ?? []).reduce((s, e) => s + (e.hours ?? 0), 0)
  const hoursLabel  = hours % 1 === 0 ? `${hours}h` : `${hours.toFixed(1)}h`
  const sentUpdates = (updates ?? []).filter(u => u.sent_at).length

  // ── Attention strip: surface here what the projects list flags ──────────
  const cutoff7d = new Date(); cutoff7d.setDate(cutoff7d.getDate() - 7)
  const lastSent = (updates ?? []).filter(u => u.sent_at)
    .sort((a, b) => new Date(b.sent_at!).getTime() - new Date(a.sent_at!).getTime())[0]
  const lastActivity = lastSent ? new Date(lastSent.sent_at!) : new Date(project.created_at)
  const isOverdue = project.status === 'active' && lastActivity < cutoff7d
  const pendingApprovals  = (approvals ?? []).filter(a => a.status === 'pending').length
  const hasContracts      = (contracts ?? []).length > 0
  const unsignedContracts = (contracts ?? []).filter(c => !c.signed_at).length

  const attention: { label: string; href: string; cta: string; icon: typeof AlertTriangle }[] = []
  if (isOverdue) attention.push({ label: 'No update sent in over a week', href: `/project/${id}/update`, cta: 'Send update', icon: Send })
  if (unsignedContracts > 0) attention.push({ label: `${unsignedContracts} contract${unsignedContracts > 1 ? 's' : ''} awaiting signature`, href: `/project/${id}/contract`, cta: 'Review', icon: FileSignature })
  if (pendingApprovals > 0) attention.push({ label: `${pendingApprovals} approval${pendingApprovals > 1 ? 's' : ''} pending`, href: `/project/${id}#approvals`, cta: 'View', icon: CheckCircle2 })

  // Kickoff matters most while the project is young — float it up until it's lived in.
  const isYoung = sentUpdates === 0

  return (
    <AppLayout>
      <DarkShell>
        <div className="relative z-10 animate-fade-in pb-12">

        {/* Back navigation */}
        <div className="mb-8">
          <Link 
            href="/project" 
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to projects
          </Link>
        </div>

        {/* Header Title section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-200/60">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-1 h-12 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
            <div className="min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight truncate">{project.project_name}</h1>
                <StatusToggle projectId={project.id} current={project.status as 'active' | 'paused' | 'completed'} />
              </div>
              <p className="text-slate-500 font-medium mt-1">{project.client_name}</p>

              {/* Compact Inline Metrics */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-sm text-slate-500">
                {project.budget && (
                  <Link
                    href={`/project/${id}/settings`}
                    className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors group"
                  >
                    <span className="font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">Budget:</span>
                    <span className={invoiced > project.budget ? 'text-rose-600 font-semibold' : 'text-slate-900 font-medium'}>
                      ${invoiced.toLocaleString()} / ${project.budget.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400">({Math.round((invoiced / project.budget) * 100)}%)</span>
                  </Link>
                )}
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-700 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Time Logged:
                  </span>
                  <span className="text-slate-900 font-medium">{hoursLabel}</span>
                  <Link href="/time" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium underline ml-1">
                    Log time
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href={`/project/${id}/update`}>
              <Button size="sm"><Plus className="w-4 h-4" />Send update</Button>
            </Link>
            <ProjectActionsMenu projectId={id} />
          </div>
        </div>

        {/* Attention strip — mirrors the health signal from the projects list */}
        {attention.length > 0 && (
          <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 divide-y divide-amber-100 overflow-hidden shadow-sm">
            {attention.map((a, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                <a.icon className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span className="text-sm font-semibold text-amber-950 flex-1 min-w-0">{a.label}</span>
                <Link href={a.href} className="flex-shrink-0">
                  <Button size="sm" variant="secondary" className="text-xs bg-white border border-amber-200 text-amber-900 hover:bg-amber-50">{a.cta}</Button>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Main: Updates + Approvals ────────────────────── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Updates — the hero of this page */}
            <CollapsibleSection
              title="Updates"
              count={updates?.length ?? 0}
              action={
                <Link href={`/project/${id}/update`}>
                  <Button variant="secondary" size="sm"><Plus className="w-4 h-4" />New</Button>
                </Link>
              }
            >
              {!updates?.length ? (
                <div className="bg-white border border-dashed border-slate-200/80 rounded-2xl p-12 text-center shadow-xs">
                  <p className="text-sm text-slate-400 mb-4">No updates sent to {project.client_name} yet.</p>
                  <Link href={`/project/${id}/update`}>
                    <Button size="sm"><Plus className="w-4 h-4" />Send first update</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {updates.map(update => (
                    <div key={update.id} className="bg-white border border-slate-200/60 shadow-sm rounded-2xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-semibold text-slate-900">{getWeekOf(update.created_at)}</span>
                        <div className="flex items-center gap-2">
                          {update.sent_at ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                              <Check className="w-3 h-3" />Sent {formatDate(update.sent_at)}
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">Draft</span>
                          )}
                          <UpdateActions updateId={update.id} projectId={id} />
                        </div>
                      </div>
                      <ul className="space-y-2.5">
                        {(update.bullets ?? []).filter(Boolean).map((b: string, i: number) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed">
                            <div className="w-1.5 h-1.5 rounded-full mt-[7px] flex-shrink-0" style={{ backgroundColor: project.color }} />
                            {b}
                          </li>
                        ))}
                      </ul>
                      {update.note && (
                        <p className="text-sm text-slate-500 italic border-t border-slate-100 pt-3 mt-4">{update.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CollapsibleSection>

            {/* Approvals */}
            <div id="approvals" className="scroll-mt-6">
              <ApprovalsSection projectId={project.id} initialApprovals={approvals ?? []} />
            </div>

            {/* Testimonial — completed only */}
            {project.status === 'completed' && (
              <div className="bg-white border border-slate-200/60 shadow-sm rounded-2xl p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Request a testimonial</h3>
                  <p className="text-xs text-slate-400 mt-1">Collect a review from {project.client_name}.</p>
                </div>
                <Link href={`/testimonial/${project.id}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="sm">Open form</Button>
                </Link>
              </div>
            )}
          </div>

          {/* ── Sidebar: grouped by meaning ──────────────────── */}
          <div className="space-y-6 lg:sticky lg:top-6 self-start">

            {/* Kickoff — floated to the top while the project is young */}
            {isYoung && <KickoffChecklist projectId={project.id} />}

            {/* Progress: milestones */}
            <MilestonesWidget
              projectId={project.id}
              color={project.color}
              initialMilestones={milestones ?? []}
            />

            {/* Client access: status page + contract status, grouped together */}
            <CollapsibleCard icon={<Link2 className="w-4 h-4 text-slate-400 flex-shrink-0" />} title="Client access" defaultOpen={false}>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700">Status page</span>
                    <div className="flex items-center gap-1.5">
                      <CopyLinkButton url={publicUrl} />
                      <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm">View</Button>
                      </a>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 truncate bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">{publicUrl}</p>
                </div>

                <Link href={`/project/${id}/contract`} className="border-t border-slate-100 pt-4 flex items-center justify-between group">
                  <div className="flex items-center gap-2">
                    <FileSignature className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-700">Contract</span>
                  </div>
                  {unsignedContracts > 0 ? (
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">Unsigned</span>
                  ) : hasContracts ? (
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">Signed</span>
                  ) : (
                    <span className="text-xs font-medium text-indigo-600 group-hover:text-indigo-700 inline-flex items-center gap-1">Add <ChevronRight className="w-3 h-3" /></span>
                  )}
                </Link>
              </div>
            </CollapsibleCard>

            {/* Kickoff — drops to the bottom once the project is lived-in */}
            {!isYoung && <KickoffChecklist projectId={project.id} />}
          </div>

        </div>
        </div>
      </DarkShell>
    </AppLayout>
  )
}
