'use client'

import { useState } from 'react'
import { Globe, Layout, Package, Smartphone, Eye, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { parseCanvasEmbedUrl } from '@/lib/canvas-embed'
import { PortalAppBuilds } from '@/components/portal/portal-app-builds'
import { PortalLivePreview } from '@/components/portal/portal-live-preview'
import { PortalCanvasEmbed } from '@/components/portal/portal-canvas-embed'
import type { AppBuild, ChangeOrder } from '@/types'
import { ApprovalCard, ApprovalHistoryRow, type Approval } from './approval-actions'
import { ChangeOrderCard, ChangeOrderHistoryRow } from './change-order-card'
import { changeOrderNeedsPayment } from './portal-model'
import { DIVIDE, EmptyState, Section } from './portal-ui'

type PreviewTab = 'canvas' | 'live' | 'phone' | 'builds'

export function DeliverablePreviews({
  project,
  appBuilds,
  accent,
  overdueInvoice,
}: {
  project: any
  appBuilds: AppBuild[]
  accent: string
  overdueInvoice?: any
}) {
  const isOverdueLocked = Boolean(overdueInvoice && project.overdue_lock_enabled !== false)
  if (isOverdueLocked) {
    return (
      <Section title="Preview the work" bodyClassName="p-6">
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Deliverable Preview On Hold
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
              Live preview and staging environments are temporarily paused pending overdue invoice settlement ({overdueInvoice.invoice_number || 'Invoice'}).
            </p>
          </div>
          <div className="pt-2">
            <a
              href={`/invoice/${overdueInvoice.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-xs transition-all"
            >
              <span>Pay Outstanding Invoice with Stripe →</span>
            </a>
          </div>
        </div>
      </Section>
    )
  }

  const parsedCanvas = parseCanvasEmbedUrl(project.canvas_embed_url)
  const tabs: { key: PreviewTab; label: string; icon: React.ElementType }[] = [
    ...(parsedCanvas ? [{ key: 'canvas' as const, label: parsedCanvas.platformName || 'Design', icon: Layout }] : []),
    ...(project.live_url ? [{ key: 'live' as const, label: 'Live site', icon: Globe }] : []),
    ...(parsedCanvas || project.live_url ? [{ key: 'phone' as const, label: 'On a phone', icon: Smartphone }] : []),
    ...(appBuilds.length > 0 ? [{ key: 'builds' as const, label: `App builds (${appBuilds.length})`, icon: Package }] : []),
  ]
  const [tab, setTab] = useState<PreviewTab | undefined>(tabs[0]?.key)
  if (tabs.length === 0 || !tab) return null

  return (
    <Section
      title="Preview the work"
      bodyClassName="px-5 pb-5"
      action={tabs.length > 1 ? (
        <div role="tablist" aria-label="Preview type" className="flex items-center gap-1 p-0.5 rounded-md bg-slate-100/80 dark:bg-white/[0.05] border border-slate-200/50 dark:border-white/10 overflow-x-auto max-w-full">
          {tabs.map(t => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors cursor-pointer',
                tab === t.key
                  ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              )}
            >
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>
      ) : undefined}
    >
      {tab === 'canvas' && parsedCanvas && (
        <PortalCanvasEmbed
          embedUrl={parsedCanvas.embedUrl}
          originalUrl={parsedCanvas.originalUrl}
          title={project.canvas_embed_title}
          platformName={parsedCanvas.platformName}
          accentColor={accent}
        />
      )}
      {tab === 'live' && project.live_url && (
        <PortalLivePreview primaryUrl={project.live_url} projectName={project.project_name} accentColor={accent} />
      )}
      {tab === 'phone' && (
        parsedCanvas ? (
          <PortalCanvasEmbed
            embedUrl={parsedCanvas.embedUrl}
            originalUrl={parsedCanvas.originalUrl}
            title={project.canvas_embed_title}
            platformName={parsedCanvas.platformName}
            accentColor={accent}
            initialDeviceMode="mobile"
          />
        ) : project.live_url ? (
          <PortalLivePreview primaryUrl={project.live_url} projectName={project.project_name} accentColor={accent} initialDeviceMode="mobile" />
        ) : null
      )}
      {tab === 'builds' && appBuilds.length > 0 && (
        <PortalAppBuilds builds={appBuilds} projectName={project.project_name} accentColor={accent} />
      )}
    </Section>
  )
}

export function ReviewTab({
  project,
  appBuilds,
  approvals,
  changeOrders,
  accent,
  overdueInvoice,
  isDemo,
  onApprovalDecided,
  onChangeOrderUpdated,
}: {
  project: any
  appBuilds: AppBuild[]
  approvals: Approval[]
  changeOrders: ChangeOrder[]
  accent: string
  overdueInvoice?: any
  isDemo: boolean
  onApprovalDecided: (a: Approval) => void
  onChangeOrderUpdated: (co: ChangeOrder) => void
}) {
  const pendingApprovals = approvals.filter(a => a.status === 'pending')
  const openChangeOrders = changeOrders.filter(c => c.status === 'pending' || changeOrderNeedsPayment(c))
  const decidedApprovals = approvals.filter(a => a.status !== 'pending')
  const decidedChangeOrders = changeOrders.filter(c => !openChangeOrders.includes(c))
  const waitingCount = pendingApprovals.length + openChangeOrders.length
  const hasPreviews = Boolean(project.canvas_embed_url || project.live_url || appBuilds.length > 0)

  return (
    <div className="space-y-6">
      <DeliverablePreviews project={project} appBuilds={appBuilds} accent={accent} overdueInvoice={overdueInvoice} />

      <Section title="Waiting for your sign-off" count={waitingCount}>
        {waitingCount === 0 ? (
          <EmptyState
            icon={Eye}
            title="Nothing to sign off right now."
            detail={hasPreviews ? 'You can still look around the previews above.' : 'Work ready for review will appear here.'}
          />
        ) : (
          <div className="space-y-3">
            {pendingApprovals.map(a => (
              <ApprovalCard key={a.id} approval={a} accentColor={accent} onDecided={onApprovalDecided} />
            ))}
            {openChangeOrders.map(co => (
              <ChangeOrderCard key={co.id} changeOrder={co} accentColor={accent} onStatusChange={onChangeOrderUpdated} isDemo={isDemo} />
            ))}
          </div>
        )}
      </Section>

      {(decidedApprovals.length > 0 || decidedChangeOrders.length > 0) && (
        <Section title="Decision history" bodyClassName="px-5 pb-2">
          {decidedApprovals.length > 0 && (
            <>
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Sign-offs</h3>
              <ul className={cn(DIVIDE, 'mb-3')}>
                {decidedApprovals.map(a => <ApprovalHistoryRow key={a.id} approval={a} />)}
              </ul>
            </>
          )}
          {decidedChangeOrders.length > 0 && (
            <>
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Scope changes</h3>
              <ul className={DIVIDE}>
                {decidedChangeOrders.map(co => <ChangeOrderHistoryRow key={co.id} order={co} />)}
              </ul>
            </>
          )}
        </Section>
      )}
    </div>
  )
}
