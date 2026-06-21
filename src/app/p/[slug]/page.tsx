import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatDate, getWeekOf } from '@/lib/utils'
import { Zap, Bell } from 'lucide-react'
import Link from 'next/link'
import { FeedbackWidget } from './feedback-widget'
import { ApprovalCard } from './approval-actions'
import { UpdateCommentForm } from './update-comment-form'
import { ClientChecklist } from './client-checklist'
import { CompletedProjectPopup } from '@/components/project/completed-project-popup'
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { PasscodeGate } from './passcode-gate'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: projectRows } = await supabase
    .rpc('get_project_by_slug', { p_slug: slug })
  const project = projectRows?.[0] ?? null

  if (!project) {
    return {
      title: 'Project Status | Frevio',
      robots: { index: false, follow: false }
    }
  }

  return {
    title: `${project.project_name} — Project Updates | Frevio`,
    description: `Track milestones, updates, and deliverables for ${project.project_name} on Frevio.`,
    robots: {
      index: false,
      follow: false
    }
  }
}

export default async function PublicProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: projectRows } = await supabase
    .rpc('get_project_by_slug', { p_slug: slug })

  const project = projectRows?.[0] ?? null
  if (!project) notFound()

  if (project.passcode) {
    const cookieStore = await cookies()
    const enteredPasscode = cookieStore.get(`client_project_passcode_${slug}`)?.value
    if (enteredPasscode !== project.passcode) {
      return <PasscodeGate slug={slug} projectColor={project.color} />
    }
  }

  const { data: updates } = await supabase
    .from('updates')
    .select('*')
    .eq('project_id', project.id)
    .not('sent_at', 'is', null)
    .order('created_at', { ascending: false })

  const { data: owner } = await supabase
    .from('users')
    .select('name, logo_url, accent_color, plan')
    .eq('id', project.user_id)
    .single()

  const accentColor = owner?.plan === 'pro' && owner?.accent_color ? owner.accent_color : '#6366F1'

  const { data: approvals } = await supabase
    .from('approvals')
    .select('*')
    .eq('project_id', project.id)
    .order('created_at', { ascending: false })

  const { data: allComments } = await supabase
    .from('update_comments')
    .select('id, update_id, author_name, body, created_at')
    .eq('project_id', project.id)
    .order('created_at', { ascending: true })

  const { data: milestones } = await supabase
    .from('milestones')
    .select('id, title, due_date, done')
    .eq('project_id', project.id)
    .order('due_date', { ascending: true, nullsFirst: false })

  const { data: checklistItems } = await supabase
    .from('checklist_items')
    .select('id, title, assigned_to, done, done_at')
    .eq('project_id', project.id)
    .order('created_at', { ascending: true })

  let hasTestimonial = false
  if (project.status === 'completed') {
    const { data: testimonialsData } = await supabase
      .from('testimonials')
      .select('id')
      .eq('project_id', project.id)
      .limit(1)
    hasTestimonial = (testimonialsData ?? []).length > 0
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {owner?.plan === 'pro' && owner?.logo_url ? (
              <img src={owner.logo_url} alt="Logo" className="h-8 w-auto object-contain" />
            ) : (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: accentColor }}>
                <Zap className="w-4 h-4 text-white" />
              </div>
            )}
            <div>
              <div className="font-semibold text-slate-900 text-sm">{project.project_name}</div>
              <div className="text-xs text-slate-400">for {project.client_name}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: project.status === 'active' ? '#22c55e' : '#94a3b8' }}
              />
              <span className="text-xs font-medium text-slate-500 capitalize">{project.status}</span>
            </div>
            <Link
              href={`/p/${project.slug}/subscribe`}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 border border-slate-200 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors"
            >
              <Bell className="w-3 h-3" />
              Subscribe
            </Link>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-2xl mx-auto px-6 pt-12 pb-8">
        <div
          className="w-12 h-1.5 rounded-full mb-6"
          style={{ backgroundColor: accentColor }}
        />
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{project.project_name}</h1>
        <p className="text-slate-500">Weekly progress updates from {owner?.name ?? 'your freelancer'}.</p>

        <div className="flex items-center gap-4 mt-6 text-sm text-slate-400">
          <span>{updates?.length ?? 0} update{(updates?.length ?? 0) !== 1 ? 's' : ''} sent</span>
          {updates?.[0] && (
            <span>Last update {formatDate(updates[0].created_at)}</span>
          )}
        </div>
      </div>

      {/* Kickoff checklist — shown when items exist and not hidden */}
      {!project.hide_kickoff && checklistItems && checklistItems.length > 0 && (
        <div className="max-w-2xl mx-auto px-6 pb-6">
          <ClientChecklist items={checklistItems as Parameters<typeof ClientChecklist>[0]['items']} accentColor={accentColor} />
        </div>
      )}

      {/* Milestones — only shown when there are any and not hidden */}
      {!project.hide_milestones && milestones && milestones.length > 0 && (
        <div className="max-w-2xl mx-auto px-6 pb-8">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Milestones</h2>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
            {/* Progress bar */}
            {(() => {
              const done  = milestones.filter(m => m.done).length
              const total = milestones.length
              return total > 0 ? (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                    <span>{done} of {total} complete</span>
                    <span>{Math.round((done / total) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="h-1.5 rounded-full transition-all" style={{ width: `${Math.round((done / total) * 100)}%`, backgroundColor: accentColor }} />
                  </div>
                </div>
              ) : null
            })()}
            {milestones.map(m => {
              const overdue = !m.done && m.due_date && new Date(m.due_date + 'T12:00:00') < new Date(new Date().toDateString())
              return (
                <div key={m.id} className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${m.done ? 'border-transparent' : overdue ? 'border-red-400' : 'border-slate-300'}`}
                    style={m.done ? { backgroundColor: accentColor } : {}}>
                    {m.done && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <span className={`flex-1 text-sm ${m.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>{m.title}</span>
                  {m.due_date && (
                    <span className={`text-xs flex-shrink-0 ${overdue ? 'text-red-500 font-medium' : m.done ? 'text-slate-300' : 'text-slate-400'}`}>
                      {new Date(m.due_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Updates */}
      <div className="max-w-2xl mx-auto px-6 pb-16">
        {!updates?.length ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <p className="text-slate-400">No updates have been sent yet. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-5">
            {updates.map((update, i) => (
              <div key={update.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">{getWeekOf(update.created_at)}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{formatDate(update.sent_at!)}</div>
                  </div>
                  {i === 0 && (
                    <span
                      className="text-xs font-medium px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                    >
                      Latest
                    </span>
                  )}
                </div>
                <div className="px-6 py-5">
                  <ul className="space-y-3">
                    {(update.bullets ?? []).filter(Boolean).map((bullet: string, j: number) => (
                      <li key={j} className="flex items-start gap-3 text-sm text-slate-700">
                        <div
                          className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                          style={{ backgroundColor: accentColor }}
                        />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                  {update.note && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-sm text-slate-500 italic">{update.note}</p>
                    </div>
                  )}
                  <UpdateCommentForm
                    updateId={update.id}
                    projectId={project.id}
                    accentColor={accentColor}
                    existingComments={(allComments ?? []).filter(c => c.update_id === update.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approvals — only show pending ones to the client when not hidden */}
      {!project.hide_approvals && approvals && approvals.filter(a => a.status === 'pending').length > 0 && (
        <div className="max-w-2xl mx-auto px-6 pb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Awaiting your review</h2>
          <div className="space-y-4">
            {approvals.filter(a => a.status === 'pending').map(a => (
              <ApprovalCard key={a.id} approval={a} accentColor={accentColor} />
            ))}
          </div>
        </div>
      )}

      {/* Feedback */}
      <div className="max-w-2xl mx-auto px-6 pb-4 border-t border-slate-100">
        <FeedbackWidget projectId={project.id} accentColor={accentColor} />
      </div>

      {/* Powered by — hidden for Pro users */}
      {owner?.plan !== 'pro' && (
        <div className="border-t border-slate-100 py-6 text-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors">
            <div className="w-4 h-4 bg-indigo-600 rounded flex items-center justify-center">
              <Zap className="w-2.5 h-2.5 text-white" />
            </div>
            Powered by Frevio
          </Link>
        </div>
      )}

      {project.status === 'completed' && !hasTestimonial && (
        <CompletedProjectPopup
          projectId={project.id}
          projectName={project.project_name}
          accentColor={accentColor}
        />
      )}
    </div>
  )
}
