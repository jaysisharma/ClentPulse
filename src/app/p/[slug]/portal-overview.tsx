'use client'

import { useState } from 'react'
import {
  AlertTriangle, Check, CheckCircle2, ChevronDown, CreditCard, Mail, Receipt, Upload, X,
} from 'lucide-react'
import { fmtCurrency } from '@/lib/currencies'
import { formatDate, cn } from '@/lib/utils'
import { CARD } from '@/components/dashboard/styles'
import { KpiSnapshotStrip } from '@/components/project/kpi-snapshot-strip'
import { PortalCanvasEmbed } from '@/components/portal/portal-canvas-embed'
import { parseCanvasEmbedUrl } from '@/lib/canvas-embed'
import type { ChangeOrder } from '@/types'
import { ApprovalCard, type Approval } from './approval-actions'
import { ChangeOrderCard } from './change-order-card'
import { FeedbackWidget } from './feedback-widget'
import { UpdateItem } from './portal-updates'
import {
  invoiceTotal, isMilestoneOverdue,
  type PortalChecklistItem, type PortalMilestone, type PortalTab, type PortalTodos,
} from './portal-model'
import { DIVIDE, EmptyState, MUTED, PRIMARY_BUTTON, SECONDARY_BUTTON, Section, TodoRow, initials, shortDate } from './portal-ui'

function ChecklistBox({ item, accent, onToggle }: { item: PortalChecklistItem; accent: string; onToggle?: () => void }) {
  const box = (
    <span
      className={cn(
        'w-5 h-5 rounded border flex items-center justify-center flex-shrink-0',
        item.done ? 'border-transparent text-white' : 'border-slate-300 dark:border-white/25 bg-white dark:bg-transparent'
      )}
      style={item.done ? { backgroundColor: accent } : undefined}
    >
      {item.done && <Check className="w-3 h-3 stroke-[3]" />}
    </span>
  )
  const label = (
    <span className={cn('text-sm break-words min-w-0', item.done ? 'text-slate-400 dark:text-slate-500 line-through' : 'font-medium')}>
      {item.title}
    </span>
  )
  if (!onToggle) return <div className="flex items-center gap-3 min-h-9">{box}{label}</div>
  return (
    <button type="button" role="checkbox" aria-checked={item.done} onClick={onToggle} className="flex items-center gap-3 min-h-9 text-left cursor-pointer w-full">
      {box}{label}
    </button>
  )
}

export function OverviewTab({
  project,
  todos,
  checklist,
  onToggleTask,
  notice,
  onDismissNotice,
  onApprovalDecided,
  onChangeOrderUpdated,
  latestUpdate,
  updateCount,
  comments,
  milestones,
  nextMilestone,
  targetLaunchDate,
  hoursLabel,
  leadName,
  team,
  mailtoHref,
  messageLabel,
  accent,
  isDemo,
  onGoTo,
}: {
  project: any
  todos: PortalTodos
  checklist: PortalChecklistItem[]
  onToggleTask: (item: PortalChecklistItem) => void
  notice: string | null
  onDismissNotice: () => void
  onApprovalDecided: (a: Approval) => void
  onChangeOrderUpdated: (co: ChangeOrder) => void
  latestUpdate: any | null
  updateCount: number
  comments: any[]
  milestones: PortalMilestone[]
  nextMilestone: PortalMilestone | null
  targetLaunchDate: string | null
  hoursLabel: string
  leadName: string
  team: any[]
  mailtoHref: string | null
  messageLabel: string
  accent: string
  isDemo: boolean
  onGoTo: (tab: PortalTab) => void
}) {
  const [checklistOpen, setChecklistOpen] = useState(false)
  const checklistDone = checklist.filter(i => i.done).length
  // Pending and approved-but-unpaid scope changes share one list, so a card keeps
  // its state as it moves from "decide" to "pay".
  const openChangeOrders = [...todos.pendingChangeOrders, ...todos.payableChangeOrders]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-8 space-y-6 min-w-0">

        {project.kpis && Array.isArray(project.kpis) && project.kpis.length > 0 && (
          <KpiSnapshotStrip kpis={project.kpis} accentColor={accent} />
        )}

        <Section title="Needs you" count={todos.count}>
          {notice && (
            <div role="status" className="mb-3 flex items-center gap-2 px-3 py-2 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/40 text-sm text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 min-w-0">{notice}</span>
              <button type="button" onClick={onDismissNotice} aria-label="Dismiss" className="p-1 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900/40 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {todos.count === 0 ? (
            <EmptyState icon={CheckCircle2} title="You’re all caught up." detail="Nothing needs your attention right now." />
          ) : (
            <div className="space-y-3">
              {todos.depositPending && (
                <TodoRow
                  icon={CreditCard}
                  accent={accent}
                  title={`Pay the ${fmtCurrency(Number(project.deposit_required) || 0, todos.depositInvoice?.currency || 'USD')} kickoff deposit`}
                  detail={todos.depositInvoice?.status === 'sent' ? 'Work starts as soon as the deposit is paid.' : 'Your deposit invoice is on its way.'}
                >
                  {todos.depositInvoice?.status === 'sent' && (
                    <a href={`/invoice/${todos.depositInvoice.id}`} className={PRIMARY_BUTTON} style={{ backgroundColor: accent }}>Pay deposit</a>
                  )}
                </TodoRow>
              )}

              {todos.waitingOnClient && (
                <TodoRow
                  icon={AlertTriangle}
                  tone="warning"
                  accent={accent}
                  title="Your team is waiting on you"
                  detail={project.waiting_reason || 'Something is needed from you before work can continue.'}
                >
                  <button type="button" onClick={() => onGoTo('files')} className={PRIMARY_BUTTON} style={{ backgroundColor: '#b45309' }}>
                    <Upload className="w-3.5 h-3.5" /> Upload files
                  </button>
                </TodoRow>
              )}

              {todos.unpaidInvoices.map(inv => (
                <TodoRow
                  key={inv.id}
                  icon={Receipt}
                  accent={accent}
                  title={`Pay invoice ${inv.invoice_number || ''} · ${fmtCurrency(invoiceTotal(inv), inv.currency || 'USD')}`}
                  detail={inv.due_date ? `Due ${formatDate(inv.due_date)}` : 'Due on receipt'}
                >
                  <a href={`/invoice/${inv.id}`} className={PRIMARY_BUTTON} style={{ backgroundColor: accent }}>Pay now</a>
                </TodoRow>
              ))}

              {todos.pendingApprovals.map(a => (
                <ApprovalCard key={a.id} approval={a} accentColor={accent} onDecided={onApprovalDecided} />
              ))}

              {openChangeOrders.map(co => (
                <ChangeOrderCard key={co.id} changeOrder={co} accentColor={accent} onStatusChange={onChangeOrderUpdated} isDemo={isDemo} />
              ))}

              {todos.openClientTasks.length > 0 && (
                <div className="p-4 rounded-md border border-[#eaecf2] dark:border-white/[0.08] bg-slate-50/60 dark:bg-white/[0.02]">
                  <p className="text-sm font-bold">Tick off when done</p>
                  <p className={cn('text-xs mt-0.5 mb-2', MUTED)}>Your part of the kickoff checklist.</p>
                  <div className="space-y-0.5">
                    {todos.openClientTasks.map(item => (
                      <ChecklistBox key={item.id} item={item} accent={accent} onToggle={() => onToggleTask(item)} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Section>

        <Section
          title="Latest update"
          bodyClassName=""
          action={updateCount > 1 ? (
            <button type="button" onClick={() => onGoTo('updates')} className="text-xs font-semibold cursor-pointer hover:underline" style={{ color: accent }}>
              All updates ({updateCount})
            </button>
          ) : undefined}
        >
          {latestUpdate ? (
            <div className="border-t border-[#f1f3f7] dark:border-white/[0.05]">
              <UpdateItem
                update={latestUpdate}
                projectId={project.id}
                clientName={project.client_name}
                accent={accent}
                comments={comments.filter(c => c.update_id === latestUpdate.id)}
              />
            </div>
          ) : (
            <div className="px-5 pb-5">
              <EmptyState icon={Mail} title="No updates yet." detail={`${leadName.split(' ')[0]} will post progress here.`} />
            </div>
          )}
        </Section>

        {project.report_embed_url && (
          <Section title={project.report_embed_title || 'Live Performance Report'}>
            <PortalCanvasEmbed
              embedUrl={parseCanvasEmbedUrl(project.report_embed_url)?.embedUrl || project.report_embed_url}
              originalUrl={parseCanvasEmbedUrl(project.report_embed_url)?.originalUrl || project.report_embed_url}
              title={project.report_embed_title || 'Live Performance Report'}
              platformName={parseCanvasEmbedUrl(project.report_embed_url)?.platformName || 'Performance Report'}
              accentColor={accent}
            />
          </Section>
        )}

        {project.canvas_embed_url && (
          <Section title={project.canvas_embed_title || 'Strategy & Design Canvas'}>
            <PortalCanvasEmbed
              embedUrl={parseCanvasEmbedUrl(project.canvas_embed_url)?.embedUrl || project.canvas_embed_url}
              originalUrl={parseCanvasEmbedUrl(project.canvas_embed_url)?.originalUrl || project.canvas_embed_url}
              title={project.canvas_embed_title || 'Strategy & Design Canvas'}
              platformName={parseCanvasEmbedUrl(project.canvas_embed_url)?.platformName || 'Interactive Canvas'}
              accentColor={accent}
            />
          </Section>
        )}

        <Section
          id="checklist"
          title="Plan"
          action={milestones.length > 0 ? (
            <span className={cn('text-xs font-semibold', MUTED)}>
              {milestones.filter(m => m.done).length} of {milestones.length} milestones
            </span>
          ) : undefined}
        >
          {milestones.length === 0 ? (
            <p className={cn('text-sm', MUTED)}>Milestones will show here once the plan is set.</p>
          ) : (
            <ol className={cn(DIVIDE, 'border-t border-[#f1f3f7] dark:border-white/[0.05]')}>
              {milestones.map(m => {
                const overdue = isMilestoneOverdue(m)
                const isNext = m.id === nextMilestone?.id
                return (
                  <li key={m.id} className="flex items-center gap-3 py-2.5">
                    <span
                      className={cn(
                        'w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0',
                        m.done ? 'border-transparent text-white' : overdue ? 'border-amber-500' : 'border-slate-300 dark:border-white/20'
                      )}
                      style={m.done ? { backgroundColor: accent } : isNext && !overdue ? { borderColor: accent } : undefined}
                    >
                      {m.done && <Check className="w-3 h-3 stroke-[3]" />}
                    </span>
                    <span className={cn('flex-1 min-w-0 text-sm break-words', m.done ? 'text-slate-400 dark:text-slate-500 line-through' : 'font-medium')}>
                      {m.title}
                    </span>
                    {isNext && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white flex-shrink-0" style={{ backgroundColor: accent }}>Next</span>
                    )}
                    {m.due_date && (
                      <span className={cn('text-xs flex-shrink-0 tabular-nums', overdue ? 'text-amber-700 dark:text-amber-400 font-semibold' : MUTED)}>
                        {overdue ? 'Was due ' : ''}{shortDate(m.due_date)}
                      </span>
                    )}
                  </li>
                )
              })}
            </ol>
          )}

          {checklist.length > 0 && (
            <div className="mt-4 rounded-md border border-[#eaecf2] dark:border-white/[0.08]">
              <button
                type="button"
                aria-expanded={checklistOpen}
                onClick={() => setChecklistOpen(o => !o)}
                className="w-full flex items-center justify-between gap-3 px-4 min-h-11 text-sm font-semibold cursor-pointer"
              >
                <span>Kickoff checklist</span>
                <span className={cn('flex items-center gap-2 text-xs', MUTED)}>
                  {checklistDone}/{checklist.length} done
                  <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', checklistOpen && 'rotate-180')} />
                </span>
              </button>
              {checklistOpen && (
                <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  {(['client', 'freelancer'] as const).map(side => {
                    const items = checklist.filter(i => i.assigned_to === side)
                    if (items.length === 0) return null
                    return (
                      <div key={side}>
                        <h3 className={cn('text-xs font-semibold mb-1', MUTED)}>{side === 'client' ? 'Your tasks' : 'Studio tasks'}</h3>
                        {items.map(item => (
                          <ChecklistBox key={item.id} item={item} accent={accent} onToggle={side === 'client' ? () => onToggleTask(item) : undefined} />
                        ))}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </Section>
      </div>

      <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-32">
        <section aria-label="Who you're working with" className={cn(CARD, 'p-5 space-y-4')}>
          <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Who you’re working with</h2>
          <ul className="space-y-3">
            <li className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: accent }}>
                {initials(leadName)}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{leadName}</p>
                <p className={cn('text-xs', MUTED)}>Project lead</p>
              </div>
            </li>
            {team.map(m => (
              <li key={m.id} className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {initials(m.user.name || m.user.email || '?')}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{m.user.name || m.user.email}</p>
                  <p className={cn('text-xs truncate', MUTED)}>{m.role_title}</p>
                </div>
              </li>
            ))}
          </ul>
          {mailtoHref && (
            <a href={mailtoHref} className={cn(SECONDARY_BUTTON, 'w-full text-sm')}>
              <Mail className="w-4 h-4" /> {messageLabel}
            </a>
          )}
        </section>

        <section aria-label="Project details" className={cn(CARD, 'p-5')}>
          <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight mb-3">Project details</h2>
          <dl className="space-y-2.5 text-sm">
            <Detail label="Started" value={project.created_at ? formatDate(project.created_at) : null} />
            <Detail label="Next milestone" value={nextMilestone ? `${nextMilestone.title}${nextMilestone.due_date ? ` · ${shortDate(nextMilestone.due_date)}` : ''}` : null} />
            <Detail label="Target finish" value={targetLaunchDate} />
            {project.show_time_logged && <Detail label="Time logged" value={hoursLabel} />}
          </dl>
        </section>

        <section aria-label="Feedback" className={cn(CARD, 'p-5')}>
          <FeedbackWidget projectId={project.id} accentColor={accent} />
        </section>
      </aside>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className={cn('flex-shrink-0', MUTED)}>{label}</dt>
      <dd className="font-semibold text-right min-w-0 break-words">{value}</dd>
    </div>
  )
}
