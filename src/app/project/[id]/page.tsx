import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { formatDate, getWeekOf } from '@/lib/utils'
import Link from 'next/link'
import {
  ArrowLeft, Plus, Link2, Check, Settings,
  NotebookPen, FileSignature, Clock, DollarSign, Flag,
} from 'lucide-react'
import { CopyLinkButton } from './copy-link-button'
import { StatusToggle } from './status-toggle'
import { UpdateActions } from './update-actions'
import { BudgetWidget } from './budget-widget'
import { ApprovalsSection } from './approvals-section'
import { MilestonesWidget } from './milestones-widget'
import { KickoffChecklist } from './kickoff-checklist'

function fmt$(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

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
  ] = await Promise.all([
    supabase.from('projects').select('*').eq('id', id).eq('user_id', user.id).single(),
    supabase.from('updates').select('*').eq('project_id', id).order('created_at', { ascending: false }),
    supabase.from('invoices').select('items').eq('project_id', id),
    supabase.from('time_entries').select('hours').eq('project_id', id),
    supabase.from('milestones').select('id, title, due_date, done').eq('project_id', id).order('due_date', { ascending: true, nullsFirst: false }),
    supabase.from('approvals').select('*').eq('project_id', id).order('created_at', { ascending: false }),
  ])

  if (!project) notFound()

  const publicUrl   = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/p/${project.slug}`
  const invoiced    = (invoices ?? []).flatMap(i => i.items ?? []).reduce((s: number, x: { amount: number }) => s + (x.amount ?? 0), 0)
  const hours       = (timeEntries ?? []).reduce((s, e) => s + (e.hours ?? 0), 0)
  const mTotal      = (milestones ?? []).length
  const mDone       = (milestones ?? []).filter(m => m.done).length
  const sentUpdates = (updates ?? []).filter(u => u.sent_at).length

  return (
    <AppLayout>
      <div className="animate-fade-in pb-10">

        {/* Back */}
        <Link href="/project" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to projects
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-1 h-11 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900 truncate">{project.project_name}</h1>
                <StatusToggle projectId={project.id} current={project.status as 'active' | 'paused' | 'completed'} />
              </div>
              <p className="text-sm text-slate-500 mt-0.5">{project.client_name}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0 ml-4">
            <Link href={`/project/${id}/notes`}>
              <Button variant="ghost" size="sm"><NotebookPen className="w-4 h-4" />Notes</Button>
            </Link>
            <Link href={`/project/${id}/contract`}>
              <Button variant="ghost" size="sm"><FileSignature className="w-4 h-4" />Contract</Button>
            </Link>
            <Link href={`/project/${id}/settings`}>
              <Button variant="ghost" size="sm"><Settings className="w-4 h-4" /></Button>
            </Link>
            <Link href={`/project/${id}/update`}>
              <Button size="sm"><Plus className="w-4 h-4" />Send update</Button>
            </Link>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-3">
            <Check className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div>
              <div className="text-base font-semibold text-slate-900">{sentUpdates}</div>
              <div className="text-xs text-slate-400">updates sent</div>
            </div>
          </div>
          {project.budget ? (
            <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-3">
              <DollarSign className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div>
                <div className="text-base font-semibold text-slate-900">{fmt$(invoiced)}</div>
                <div className="text-xs text-slate-400">of {fmt$(project.budget)} budget</div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-3">
              <DollarSign className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div>
                <div className="text-base font-semibold text-slate-900">{fmt$(invoiced)}</div>
                <div className="text-xs text-slate-400">invoiced</div>
              </div>
            </div>
          )}
          <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-3">
            <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div>
              <div className="text-base font-semibold text-slate-900">
                {hours % 1 === 0 ? hours : hours.toFixed(1)}h
              </div>
              <div className="text-xs text-slate-400">hours logged</div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-3">
            <Flag className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div>
              <div className="text-base font-semibold text-slate-900">
                {mTotal > 0 ? `${mDone}/${mTotal}` : '—'}
              </div>
              <div className="text-xs text-slate-400">milestones done</div>
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Main: Updates + Approvals ────────────────────── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Updates */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-700">
                  Updates
                  <span className="ml-1.5 font-normal text-slate-400">({updates?.length ?? 0})</span>
                </h2>
                <Link href={`/project/${id}/update`}>
                  <Button variant="secondary" size="sm"><Plus className="w-4 h-4" />New</Button>
                </Link>
              </div>

              {!updates?.length ? (
                <div className="bg-white rounded-xl border border-dashed border-slate-200 p-12 text-center">
                  <p className="text-sm text-slate-500 mb-4">No updates sent to {project.client_name} yet.</p>
                  <Link href={`/project/${id}/update`}>
                    <Button size="sm"><Plus className="w-4 h-4" />Send first update</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {updates.map(update => (
                    <div key={update.id} className="bg-white rounded-xl border border-slate-200 p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-slate-900">{getWeekOf(update.created_at)}</span>
                        <div className="flex items-center gap-2">
                          {update.sent_at ? (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                              <Check className="w-3 h-3" />Sent {formatDate(update.sent_at)}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">Draft</span>
                          )}
                          <UpdateActions updateId={update.id} projectId={id} />
                        </div>
                      </div>
                      <ul className="space-y-2">
                        {(update.bullets ?? []).filter(Boolean).map((b: string, i: number) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                            <div className="w-1.5 h-1.5 rounded-full mt-[7px] flex-shrink-0" style={{ backgroundColor: project.color }} />
                            {b}
                          </li>
                        ))}
                      </ul>
                      {update.note && (
                        <p className="text-sm text-slate-500 italic border-t border-slate-100 pt-3 mt-3">{update.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Approvals */}
            <ApprovalsSection projectId={project.id} initialApprovals={approvals ?? []} />

            {/* Testimonial — completed only */}
            {project.status === 'completed' && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-900">Request a testimonial</div>
                  <div className="text-xs text-slate-400 mt-0.5">Collect a review from {project.client_name}.</div>
                </div>
                <Link href={`/testimonial/${project.id}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="sm">Open form</Button>
                </Link>
              </div>
            )}
          </div>

          {/* ── Sidebar ──────────────────────────────────────── */}
          <div className="space-y-4 lg:sticky lg:top-6 self-start">

            {/* Budget progress */}
            <BudgetWidget
              projectId={project.id}
              budget={project.budget ?? null}
              invoiced={invoiced}
              color={project.color}
            />

            {/* Milestones */}
            <MilestonesWidget
              projectId={project.id}
              color={project.color}
              initialMilestones={milestones ?? []}
            />

            {/* Client status page */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-700">Status page</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CopyLinkButton url={publicUrl} />
                  <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm">View</Button>
                  </a>
                </div>
              </div>
              <p className="text-xs text-slate-400 truncate pl-6">{publicUrl}</p>
            </div>

            {/* Kickoff checklist */}
            <KickoffChecklist projectId={project.id} />
          </div>

        </div>
      </div>
    </AppLayout>
  )
}
