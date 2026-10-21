'use client'

import { useState } from 'react'
import {
  Home, Target, Package, MessageSquare, Folder, HelpCircle,
  User, ExternalLink, Send, Mail, Bell, ChevronRight, Check,
  CheckCircle2, Clock, Calendar, Layout, FileText, Sparkles,
  Smartphone, Globe, Activity, Menu, X, Receipt, ShieldAlert,
  ArrowRight, CreditCard, AlertTriangle, ChevronDown, MoreHorizontal,
  RotateCw, Eye, EyeOff, Maximize2
} from 'lucide-react'
import Link from 'next/link'
import { parseCanvasEmbedUrl } from '@/lib/canvas-embed'
import { fmtCurrency } from '@/lib/currencies'
import { formatDate, getWeekOf } from '@/lib/utils'
import { ApprovalCard } from './approval-actions'
import { ChangeOrderCard } from './change-order-card'
import { ClientChecklist } from './client-checklist'
import { UpdateCommentForm } from './update-comment-form'
import { PortalResources } from '@/components/integrations/portal-resources'
import { PortalAppBuilds } from '@/components/portal/portal-app-builds'
import { PortalLivePreview } from '@/components/portal/portal-live-preview'
import { PortalCanvasEmbed } from '@/components/portal/portal-canvas-embed'
import { FeedbackWidget } from './feedback-widget'
import { KpiSnapshotStrip } from '@/components/project/kpi-snapshot-strip'
import { VideoEmbed } from '@/components/ui/video-embed'
import { ThemeToggle } from '@/components/theme-toggle'
import { PortalRealtimeSubscriber } from './portal-realtime'
import type { ChangeOrder, AppBuild } from '@/types'

interface ClientPortalViewProps {
  project: any
  updates: any[] | null
  milestones: any[] | null
  checklistItems: any[] | null
  approvals: any[] | null
  projectResources: any[] | null
  projectInvoices: any[]
  teamMembers: any[]
  allComments: any[] | null
  owner: any
  orgData: any
  accentColor: string
  hoursLabel: string
  totalHours: number
  totalMilestones: number
  completedMilestones: number
  progressPercent: number
  targetLaunchDate: string | null
  contactEmail: string | null
  leadSpecialistName: string
  isDepositPending: boolean
  depositInvoice: any
  changeOrders?: ChangeOrder[]
  appBuilds?: AppBuild[]
}

type MainNavTab = 'overview' | 'milestones' | 'deliverables' | 'feedback' | 'files'

export function ClientPortalView({
  project,
  updates,
  milestones,
  checklistItems,
  approvals,
  projectResources,
  projectInvoices,
  teamMembers,
  allComments,
  owner,
  orgData,
  accentColor,
  hoursLabel,
  totalHours,
  totalMilestones,
  completedMilestones,
  progressPercent,
  targetLaunchDate,
  contactEmail,
  leadSpecialistName,
  isDepositPending,
  depositInvoice,
  changeOrders = [],
  appBuilds = [],
}: ClientPortalViewProps) {
  const [activeNav, setActiveNav] = useState<MainNavTab>('overview')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [deliverableSubTab, setDeliverableSubTab] = useState<'canvas' | 'live' | 'phone' | 'builds'>(
    project.canvas_embed_url ? 'canvas' : project.live_url ? 'live' : 'builds'
  )

  const pendingApprovals = (approvals ?? []).filter(a => a.status === 'pending')
  const pendingChangeOrders = (changeOrders ?? []).filter(c => c.status === 'pending')
  const hasActionBlocker = isDepositPending || Boolean(project.waiting_on_client) || pendingApprovals.length > 0 || pendingChangeOrders.length > 0
  const parsedCanvas = parseCanvasEmbedUrl(project.canvas_embed_url)

  const unpaidInvoices = projectInvoices.filter(i => i.status !== 'paid')
  const latestInvoice = projectInvoices[0] || null

  // Determine Next Milestone
  const nextMilestone = (milestones ?? []).find(m => !m.done)
  const nextMilestoneDate = nextMilestone?.due_date
    ? new Date(nextMilestone.due_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : targetLaunchDate || 'TBD'

  // Determine Project Start Date
  const startDateFormatted = project.created_at
    ? new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Oct 15, 2026'

  // Specialist Initials
  const specialistInitials = (leadSpecialistName || 'Jaysi Sharma')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  // Phased Stepper Logic (Planning -> Initial Design -> Development -> Launch)
  const phases = [
    { key: 'planning', label: 'Planning', status: progressPercent > 15 ? 'completed' : 'in_progress' },
    { key: 'design', label: 'Initial Design', status: progressPercent > 50 ? 'completed' : progressPercent >= 15 ? 'in_progress' : 'upcoming' },
    { key: 'development', label: 'Development', status: progressPercent > 80 ? 'completed' : progressPercent >= 50 ? 'in_progress' : 'upcoming' },
    { key: 'launch', label: 'Launch', status: progressPercent >= 100 ? 'completed' : progressPercent >= 80 ? 'in_progress' : 'upcoming' },
  ]
  const currentPhaseObj = phases.find(p => p.status === 'in_progress') || phases[1]

  const mailtoSubject = encodeURIComponent(`Question on ${project.project_name}`)
  const mailtoHref = contactEmail ? `mailto:${contactEmail}?subject=${mailtoSubject}` : '#'

  return (
    <div className="min-h-screen bg-[#07080d] text-white flex font-sans selection:bg-indigo-600 selection:text-white">

      {/* ══════════════════════════════════════════════════════════════
          1. LEFT SIDEBAR NAVIGATION (Desktop Fixed + Mobile Overlay)
      ══════════════════════════════════════════════════════════════ */}
      
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 xl:w-72 bg-[#090b11] border-r border-white/[0.06] flex flex-col justify-between p-5 sm:p-6 z-50 transition-transform duration-200 ease-out md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top: Brand Logo & Title */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-600/30 flex-shrink-0"
                style={{ backgroundColor: accentColor || '#6366f1' }}
              >
                <Layout className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm tracking-tight text-white truncate">
                  {orgData?.name || 'Frevio'}
                </div>
                <div className="text-xs text-slate-400 font-light truncate">
                  Client Portal
                </div>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2">
            <button
              onClick={() => { setActiveNav('overview'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeNav === 'overview'
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => { setActiveNav('milestones'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeNav === 'milestones'
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Target className="w-4 h-4" />
                <span>Milestones</span>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-white/5 text-slate-400">
                {completedMilestones}/{totalMilestones}
              </span>
            </button>

            <button
              onClick={() => { setActiveNav('deliverables'); setDeliverableSubTab(project.canvas_embed_url ? 'canvas' : project.live_url ? 'live' : 'builds'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeNav === 'deliverables'
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Package className="w-4 h-4" />
                <span>Deliverables</span>
              </div>
              {appBuilds.length > 0 && (
                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-400 font-semibold">
                  v{appBuilds[0].version_name}
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveNav('feedback'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeNav === 'feedback'
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <MessageSquare className="w-4 h-4" />
                <span>Feedback</span>
              </div>
              {pendingApprovals.length > 0 && (
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                  {pendingApprovals.length}
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveNav('files'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeNav === 'files'
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Folder className="w-4 h-4" />
                <span>Files</span>
              </div>
              {projectResources && projectResources.length > 0 && (
                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-white/5 text-slate-400">
                  {projectResources.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Bottom: Help & Support, Account Profile */}
        <div className="pt-6 border-t border-white/[0.06] space-y-2">
          {contactEmail && (
            <a
              href={mailtoHref}
              className="flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Help &amp; Support</span>
            </a>
          )}

          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl text-xs sm:text-sm text-slate-400 hover:text-white transition-colors">
            <div className="flex items-center gap-3.5">
              <User className="w-4 h-4" />
              <span>Appearance</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════════════
          2. MAIN VIEW CONTAINER (Padded to account for left sidebar)
      ══════════════════════════════════════════════════════════════ */}
      <div className="flex-1 md:pl-64 xl:pl-72 min-w-0 flex flex-col min-h-screen">

        {/* ── Top Bar ─────────────────────────────────────────────── */}
        <header className="h-16 border-b border-white/[0.06] bg-[#07080d]/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Back Link */}
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors font-medium"
            >
              <span>← All Projects</span>
            </Link>
          </div>

          {/* Right: Sync status, Notifications, Specialist Profile */}
          <div className="flex items-center gap-3 sm:gap-4">
            <PortalRealtimeSubscriber
              projectId={project.id}
              clientName={project.client_name}
              accentColor={accentColor}
            />

            <Link
              href={`/p/${project.slug}/subscribe`}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors relative"
              title="Notifications & Updates"
            >
              <Bell className="w-4 h-4" />
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 absolute top-2 right-2 animate-pulse" />
            </Link>

            {/* User Profile Chip */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-white/[0.08]">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-900 flex items-center justify-center font-bold text-xs shadow-xs flex-shrink-0">
                {specialistInitials}
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-left">
                <span className="text-xs font-semibold text-white truncate max-w-[120px]">
                  {leadSpecialistName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          </div>
        </header>

        {/* ── Main Workspace Body ─────────────────────────────────── */}
        <main className="flex-1 px-5 sm:px-8 lg:px-12 py-8 sm:py-10 space-y-8 sm:space-y-10 max-w-[1560px] w-full mx-auto">

          {/* ── Project Header ─────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-white/[0.06]">
            <div className="flex items-center gap-4 sm:gap-5">
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/25 flex-shrink-0"
                style={{ backgroundColor: accentColor || '#6366f1' }}
              >
                <Layout className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                  {project.project_name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs sm:text-sm">
                  <span className="text-slate-400 font-light">
                    Client: <strong className="text-slate-200 font-semibold">{project.client_name}</strong>
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="capitalize">{project.status === 'active' ? 'In Progress' : project.status}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-3 sm:gap-4 self-start sm:self-auto pt-1 sm:pt-0">
              {(project.live_url || project.canvas_embed_url) && (
                <button
                  onClick={() => { setActiveNav('deliverables'); setDeliverableSubTab(project.live_url ? 'live' : 'canvas'); }}
                  className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white transition-all shadow-xs cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View Live Website</span>
                </button>
              )}

              {contactEmail && (
                <a
                  href={mailtoHref}
                  className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
                  style={{ backgroundColor: accentColor || '#6366f1' }}
                >
                  <Send className="w-4 h-4" />
                  <span>Message Team</span>
                </a>
              )}
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              VIEW 1: OVERVIEW DASHBOARD (Senior Studio Architecture)
          ══════════════════════════════════════════════════════════════ */}
          {activeNav === 'overview' && (
            <div className="space-y-10 sm:space-y-12 animate-fade-in relative">

              {/* Ambient Studio Lighting Glow */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-indigo-500/[0.06] blur-[100px] rounded-full"
              />

              {/* ── Top Grid: Current Phase Showcase (8 cols) + Info Sidebar (4 cols) ── */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-10 items-start relative z-10">
                
                {/* ── Left 8-Col Main Stage: Current Phase Hero Card ── */}
                <div className="lg:col-span-8 space-y-10 sm:space-y-12">

                  {/* ── Hero Card: Current Phase Showcase ── */}
                  <div className="rounded-3xl border border-white/[0.09] bg-[#0c0e17]/90 backdrop-blur-xl p-7 sm:p-9 xl:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.06)] overflow-hidden relative group">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-10 items-stretch">
                      
                      {/* Left Details: Phase Info, Stepper, Next Milestone */}
                      <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
                        <div className="space-y-3">
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 font-mono text-[11px] font-semibold tracking-wider uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                            <span>Active Sprint Phase</span>
                          </div>

                          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                            {currentPhaseObj.label}
                          </h2>

                          <p className="text-xs sm:text-sm text-slate-300/80 font-normal leading-relaxed">
                            {currentPhaseObj.key === 'design'
                              ? `Architecting the core digital experience, brand design tokens, and high-fidelity layouts for ${project.project_name}.`
                              : currentPhaseObj.key === 'planning'
                              ? `Scoping architectural requirements, data contracts, and roadmap deliverables for ${project.client_name}.`
                              : currentPhaseObj.key === 'development'
                              ? `Engineering responsive interfaces, backend APIs, and native components for ${project.project_name}.`
                              : `Final deployment readiness, domain configurations, end-to-end verification and live handoff.`}
                          </p>
                        </div>

                        {/* Phased Multi-Segment Progress Track */}
                        <div className="py-4 my-1 border-y border-white/[0.06]">
                          <div className="grid grid-cols-4 gap-2.5">
                            {phases.map((p, idx) => {
                              const isCompleted = p.status === 'completed'
                              const isInProgress = p.status === 'in_progress'

                              return (
                                <div key={p.key} className="flex flex-col space-y-2">
                                  {/* Progress bar segment */}
                                  <div
                                    className={`h-1.5 rounded-full transition-all duration-300 ${
                                      isCompleted
                                        ? 'bg-indigo-500 shadow-xs shadow-indigo-500/50'
                                        : isInProgress
                                        ? 'bg-gradient-to-r from-indigo-500 to-indigo-400 animate-pulse'
                                        : 'bg-white/[0.08]'
                                    }`}
                                  />
                                  <div className="space-y-0.5">
                                    <div className="flex items-center justify-between">
                                      <span className="font-mono text-[10px] text-slate-500 font-semibold">
                                        0{idx + 1}
                                      </span>
                                      {isCompleted && (
                                        <Check className="w-3 h-3 text-indigo-400 stroke-[3]" />
                                      )}
                                    </div>
                                    <span className={`text-[11px] font-semibold block truncate ${
                                      isInProgress ? 'text-white' : isCompleted ? 'text-slate-300' : 'text-slate-500'
                                    }`}>
                                      {p.label}
                                    </span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Next Milestone Subcard */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.025] border border-white/[0.07] flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 shadow-xs">
                              <Calendar className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-[10px] font-mono uppercase tracking-wider text-indigo-300 font-semibold">
                                Next Milestone Target
                              </div>
                              <div className="text-xs sm:text-sm font-bold text-white truncate mt-0.5">
                                {nextMilestone?.title || 'Initial Design Review'}
                              </div>
                              <div className="text-xs text-slate-400 font-light truncate mt-0.5">
                                {nextMilestone?.description || "We'll share the responsive screen designs for your review."}
                              </div>
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0 pl-3 border-l border-white/[0.07]">
                            <div className="text-[10px] font-mono text-slate-400 font-medium uppercase">Due Date</div>
                            <div className="text-xs sm:text-sm font-mono font-bold text-slate-200 flex items-center gap-1 mt-0.5 justify-end">
                              <Calendar className="w-3.5 h-3.5 text-slate-500" />
                              <span>{nextMilestoneDate}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Mockup: Live Project Viewport */}
                      <div className="lg:col-span-6 flex flex-col justify-center">
                        <div
                          onClick={() => { setActiveNav('deliverables'); }}
                          className="rounded-2xl border border-white/[0.09] bg-[#08090e] overflow-hidden shadow-2xl group cursor-pointer hover:border-indigo-500/50 transition-all flex flex-col h-full min-h-[300px]"
                        >
                          {/* Studio Browser Header */}
                          <div className="px-4 py-3 bg-[#11131c] border-b border-white/[0.06] flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                            </div>
                            <div className="px-3 py-0.5 rounded-md bg-black/40 border border-white/5 text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span className="truncate max-w-[150px]">
                                {project.live_url ? project.live_url.replace(/^https?:\/\//, '') : `${project.slug}.frevio.cloud`}
                              </span>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                          </div>

                          {/* Viewport Frame */}
                          <div className="p-6 sm:p-7 flex-1 bg-gradient-to-br from-[#121520] via-[#0b0c13] to-[#07080c] flex flex-col justify-between relative overflow-hidden">
                            {/* Subtle Architectural Grid Lines */}
                            <div
                              aria-hidden="true"
                              className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-60"
                            />

                            <div className="flex items-center justify-between text-xs text-slate-400 relative z-10">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white tracking-tight text-sm">{project.project_name}</span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-slate-300">
                                  v1.0-alpha
                                </span>
                              </div>
                              <span className="font-mono text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                                {project.canvas_embed_url ? 'Canvas Synced' : 'Ready to View'}
                              </span>
                            </div>

                            <div className="space-y-2.5 my-auto relative z-10 py-4">
                              <div className="text-[10px] text-indigo-400 font-mono tracking-widest uppercase font-semibold">
                                Interactive Prototype &amp; Canvas
                              </div>
                              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                                {project.project_name}
                              </h3>
                              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-light line-clamp-2">
                                Review the complete user experience, design system specifications, and production-ready components.
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-2 relative z-10 border-t border-white/[0.06]">
                              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                                <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                                <span>Multi-Device Viewport</span>
                              </div>
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all">
                                <span>Open Deliverable</span>
                                <ArrowRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* ── Project Workspace Section (4 Architectural Glass Cards) ── */}
                  <div className="space-y-4 sm:space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                          Project Workspace
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-400 font-light mt-0.5">
                          High-priority toolkits, deliverables, and client collaboration channels.
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveNav('deliverables')}
                        className="text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>View All Areas</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
                      {/* Card 1: Designs & Preview */}
                      <div
                        onClick={() => { setActiveNav('deliverables'); setDeliverableSubTab('canvas'); }}
                        className="p-5 sm:p-6 rounded-2xl bg-[#0c0e17]/80 border border-white/[0.08] hover:border-indigo-500/40 hover:-translate-y-1 transition-all cursor-pointer group flex flex-col justify-between min-h-[165px] shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
                      >
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white flex items-center justify-center group-hover:bg-indigo-500/15 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-all">
                            <Layout className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-slate-400 font-medium">
                            {project.canvas_embed_url ? 'Live Figma' : 'Specs Ready'}
                          </span>
                        </div>
                        <div className="pt-4">
                          <div className="text-sm font-bold text-white flex items-center justify-between">
                            <span>Designs &amp; Canvas</span>
                            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                          </div>
                          <p className="text-xs text-slate-400 font-light mt-1.5 leading-relaxed">
                            Inspect interactive Figma canvas, design tokens, and mockups.
                          </p>
                        </div>
                      </div>

                      {/* Card 2: Deliverables & Builds */}
                      <div
                        onClick={() => { setActiveNav('deliverables'); setDeliverableSubTab('builds'); }}
                        className="p-5 sm:p-6 rounded-2xl bg-[#0c0e17]/80 border border-white/[0.08] hover:border-indigo-500/40 hover:-translate-y-1 transition-all cursor-pointer group flex flex-col justify-between min-h-[165px] shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
                      >
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white flex items-center justify-center group-hover:bg-cyan-500/15 group-hover:text-cyan-400 group-hover:border-cyan-500/30 transition-all">
                            <FileText className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-slate-400 font-medium">
                            {appBuilds.length > 0 ? `v${appBuilds[0].version_name}` : 'Build Pipeline'}
                          </span>
                        </div>
                        <div className="pt-4">
                          <div className="text-sm font-bold text-white flex items-center justify-between">
                            <span>Builds &amp; Releases</span>
                            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                          </div>
                          <p className="text-xs text-slate-400 font-light mt-1.5 leading-relaxed">
                            Download release binaries, APK packages, and staging builds.
                          </p>
                        </div>
                      </div>

                      {/* Card 3: Feedback & Approvals */}
                      <div
                        onClick={() => setActiveNav('feedback')}
                        className="p-5 sm:p-6 rounded-2xl bg-[#0c0e17]/80 border border-white/[0.08] hover:border-indigo-500/40 hover:-translate-y-1 transition-all cursor-pointer group flex flex-col justify-between min-h-[165px] shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
                      >
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white flex items-center justify-center group-hover:bg-emerald-500/15 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-all">
                            <MessageSquare className="w-5 h-5" />
                          </div>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-medium ${
                            pendingApprovals.length > 0 ? 'bg-amber-500/15 text-amber-300' : 'bg-white/5 text-slate-400'
                          }`}>
                            {pendingApprovals.length > 0 ? `${pendingApprovals.length} Pending` : 'All Approved'}
                          </span>
                        </div>
                        <div className="pt-4">
                          <div className="text-sm font-bold text-white flex items-center justify-between">
                            <span>Feedback &amp; Sign-offs</span>
                            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                          </div>
                          <p className="text-xs text-slate-400 font-light mt-1.5 leading-relaxed">
                            Approve milestone deliverables, comment, or request revisions.
                          </p>
                        </div>
                      </div>

                      {/* Card 4: Files & Assets */}
                      <div
                        onClick={() => setActiveNav('files')}
                        className="p-5 sm:p-6 rounded-2xl bg-[#0c0e17]/80 border border-white/[0.08] hover:border-indigo-500/40 hover:-translate-y-1 transition-all cursor-pointer group flex flex-col justify-between min-h-[165px] shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
                      >
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white flex items-center justify-center group-hover:bg-amber-500/15 group-hover:text-amber-400 group-hover:border-amber-500/30 transition-all">
                            <Folder className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-slate-400 font-medium">
                            {projectResources?.length || 0} Documents
                          </span>
                        </div>
                        <div className="pt-4">
                          <div className="text-sm font-bold text-white flex items-center justify-between">
                            <span>Files &amp; Invoices</span>
                            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                          </div>
                          <p className="text-xs text-slate-400 font-light mt-1.5 leading-relaxed">
                            Access brand guidelines, shared documents, and billing records.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Recent Activity Section (Real Dynamic Timeline) ── */}
                  <div className="space-y-4 sm:space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                          Project Activity &amp; Updates
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-400 font-light mt-0.5">
                          Verified milestone handoffs, status posts, and progress logs from the engineering team.
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveNav('milestones')}
                        className="text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>View Full Roadmap</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="rounded-3xl border border-white/[0.08] bg-[#0c0e17]/80 backdrop-blur-xl p-6 sm:p-8 divide-y divide-white/[0.06] shadow-sm">
                      {updates && updates.length > 0 ? (
                        updates.slice(0, 4).map((update, idx) => (
                          <div key={update.id || idx} className="flex items-start gap-4 sm:gap-5 py-5 first:pt-0 last:pb-0">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between text-xs sm:text-sm">
                                <span className="font-bold text-white truncate">{update.title || 'Project Update'}</span>
                                <span className="text-xs text-slate-500 font-mono flex-shrink-0 ml-2">
                                  {update.created_at ? formatDate(update.created_at) : 'Recent'}
                                </span>
                              </div>
                              <p className="text-xs sm:text-sm text-slate-400 font-light mt-1 leading-relaxed line-clamp-2">
                                {update.body}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <>
                          {/* Fallback Real Milestone Timeline */}
                          <div className="flex items-start gap-4 sm:gap-5 py-5 first:pt-0 last:pb-0">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between text-xs sm:text-sm">
                                <span className="font-bold text-white">Sprint Phase Active: {currentPhaseObj.label}</span>
                                <span className="text-xs text-slate-500 font-mono">Current</span>
                              </div>
                              <p className="text-xs sm:text-sm text-slate-400 font-light mt-1 leading-relaxed">
                                Team is actively delivering {project.project_name} deliverables and preparing for milestone reviews.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-4 sm:gap-5 py-5">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                              <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between text-xs sm:text-sm">
                                <span className="font-bold text-white">Project Scope &amp; Architecture Initialized</span>
                                <span className="text-xs text-slate-500 font-mono">{startDateFormatted}</span>
                              </div>
                              <p className="text-xs sm:text-sm text-slate-400 font-light mt-1 leading-relaxed">
                                Client portal initialized for {project.client_name} with live updates and deliverables tracking.
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                </div>

                {/* ── Right 4-Col Sidebar: Project Info & Team ── */}
                <div className="lg:col-span-4 space-y-6 sm:space-y-8">

                  {/* Card 1: Project Information */}
                  <div className="rounded-3xl border border-white/[0.08] bg-[#0c0e17]/80 backdrop-blur-xl p-6 sm:p-7 space-y-6 shadow-sm">
                    <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                      <span className="text-sm sm:text-base font-bold text-white tracking-tight">
                        Project Specifications
                      </span>
                      <MoreHorizontal className="w-4 h-4 text-slate-500 hover:text-white transition-colors cursor-pointer" />
                    </div>

                    <div className="space-y-4 text-xs sm:text-sm">
                      <div className="flex items-center justify-between py-1">
                        <span className="text-slate-400 font-light flex items-center gap-2.5">
                          <User className="w-4 h-4 text-slate-500" /> Client
                        </span>
                        <span className="font-semibold text-white">{project.client_name}</span>
                      </div>

                      <div className="flex items-center justify-between py-1">
                        <span className="text-slate-400 font-light flex items-center gap-2.5">
                          <Activity className="w-4 h-4 text-slate-500" /> Status
                        </span>
                        <span className="inline-flex items-center gap-2 text-emerald-400 font-semibold">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>In Progress</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-1">
                        <span className="text-slate-400 font-light flex items-center gap-2.5">
                          <Package className="w-4 h-4 text-slate-500" /> Deliverable
                        </span>
                        <span className="font-semibold text-white truncate max-w-[150px]">{project.project_name}</span>
                      </div>

                      <div className="flex items-center justify-between py-1">
                        <span className="text-slate-400 font-light flex items-center gap-2.5">
                          <Calendar className="w-4 h-4 text-slate-500" /> Kickoff
                        </span>
                        <span className="font-mono text-slate-200">{startDateFormatted}</span>
                      </div>

                      <div className="flex items-center justify-between py-1">
                        <span className="text-slate-400 font-light flex items-center gap-2.5">
                          <Target className="w-4 h-4 text-slate-500" /> Target Launch
                        </span>
                        <span className="font-mono text-slate-200">{targetLaunchDate || 'TBD'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Your Project Team */}
                  <div className="rounded-3xl border border-white/[0.08] bg-[#0c0e17]/80 backdrop-blur-xl p-6 sm:p-7 space-y-6 shadow-sm">
                    <span className="text-sm sm:text-base font-bold text-white tracking-tight block pb-4 border-b border-white/[0.06]">
                      Your Project Team
                    </span>

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-white text-slate-900 flex items-center justify-center font-bold text-sm shadow-md flex-shrink-0">
                        {specialistInitials}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-white truncate">
                          {leadSpecialistName}
                        </div>
                        <div className="text-xs text-slate-400 font-light truncate mt-0.5">
                          Lead Project Specialist
                        </div>
                      </div>
                    </div>

                    {contactEmail && (
                      <a
                        href={mailtoHref}
                        className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold text-slate-200 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors cursor-pointer shadow-xs"
                      >
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span>Message Specialist</span>
                      </a>
                    )}
                  </div>

                  {/* Card 3: Feedback Pulse Check */}
                  <div className="rounded-3xl border border-white/[0.08] bg-[#0c0e17]/80 backdrop-blur-xl p-5 sm:p-6 shadow-sm">
                    <FeedbackWidget projectId={project.id} accentColor={accentColor} />
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              VIEW 2: MILESTONES ROADMAP
          ══════════════════════════════════════════════════════════════ */}
          {activeNav === 'milestones' && (
            <div className="space-y-6 animate-fade-in max-w-4xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Milestones Roadmap</h2>
                  <p className="text-xs text-slate-400">Track delivery dates and verified deliverables.</p>
                </div>
                <span className="text-xs font-mono font-bold text-indigo-400">
                  {progressPercent}% Complete ({completedMilestones}/{totalMilestones})
                </span>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-[#0f111a] divide-y divide-white/[0.06] overflow-hidden">
                {milestones?.map(m => {
                  const overdue = !m.done && m.due_date && new Date(m.due_date + 'T12:00:00') < new Date(new Date().toDateString())
                  return (
                    <div key={m.id} className="p-4 flex items-center gap-3.5 hover:bg-white/[0.02] transition-colors">
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                          m.done ? 'border-transparent bg-indigo-600 text-white' : overdue ? 'border-rose-400 bg-rose-500/10' : 'border-white/20'
                        }`}
                      >
                        {m.done ? (
                          <Check className="w-3 h-3 text-white stroke-[3]" />
                        ) : overdue ? (
                          <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                        ) : null}
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className={`text-xs sm:text-sm block truncate ${m.done ? 'line-through text-slate-500' : 'text-slate-200 font-medium'}`}>
                          {m.title}
                        </span>
                      </div>

                      {m.due_date && (
                        <div className="flex items-center gap-1.5 text-[11px] font-mono flex-shrink-0">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span className={overdue ? 'text-rose-400 font-medium' : m.done ? 'text-slate-500' : 'text-slate-400'}>
                            {new Date(m.due_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              VIEW 3: DELIVERABLES & INTERACTIVE PREVIEW
          ══════════════════════════════════════════════════════════════ */}
          {activeNav === 'deliverables' && (
            <div className="space-y-6 animate-fade-in">
              {/* Deliverable Sub-Navigation */}
              <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] w-fit">
                {project.canvas_embed_url && parsedCanvas && (
                  <button
                    onClick={() => setDeliverableSubTab('canvas')}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      deliverableSubTab === 'canvas'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Layout className="w-3.5 h-3.5" />
                    <span>Strategy Canvas</span>
                  </button>
                )}

                {project.live_url && (
                  <button
                    onClick={() => setDeliverableSubTab('live')}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      deliverableSubTab === 'live'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Live Website</span>
                  </button>
                )}

                <button
                  onClick={() => setDeliverableSubTab('phone')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    deliverableSubTab === 'phone'
                      ? 'bg-violet-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Phone View</span>
                </button>

                {appBuilds.length > 0 && (
                  <button
                    onClick={() => setDeliverableSubTab('builds')}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      deliverableSubTab === 'builds'
                        ? 'bg-cyan-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>App Builds ({appBuilds.length})</span>
                  </button>
                )}
              </div>

              {/* Sub-Tab 1: Strategy Canvas Embed */}
              {deliverableSubTab === 'canvas' && project.canvas_embed_url && parsedCanvas && (
                <PortalCanvasEmbed
                  embedUrl={parsedCanvas.embedUrl}
                  originalUrl={parsedCanvas.originalUrl}
                  title={project.canvas_embed_title}
                  platformName={parsedCanvas.platformName}
                  accentColor={accentColor}
                />
              )}

              {/* Sub-Tab 2: Live Website Preview */}
              {deliverableSubTab === 'live' && project.live_url && (
                <PortalLivePreview
                  primaryUrl={project.live_url}
                  projectName={project.project_name}
                  accentColor={accentColor}
                />
              )}

              {/* Sub-Tab 3: Phone View */}
              {deliverableSubTab === 'phone' && (project.canvas_embed_url || project.live_url) && (
                <div>
                  {project.canvas_embed_url && parsedCanvas ? (
                    <PortalCanvasEmbed
                      embedUrl={parsedCanvas.embedUrl}
                      originalUrl={parsedCanvas.originalUrl}
                      title={project.canvas_embed_title}
                      platformName={parsedCanvas.platformName}
                      accentColor={accentColor}
                      initialDeviceMode="mobile"
                    />
                  ) : (
                    <PortalLivePreview
                      primaryUrl={project.live_url}
                      projectName={project.project_name}
                      accentColor={accentColor}
                      initialDeviceMode="mobile"
                    />
                  )}
                </div>
              )}

              {/* Sub-Tab 4: App Builds */}
              {deliverableSubTab === 'builds' && appBuilds.length > 0 && (
                <PortalAppBuilds
                  builds={appBuilds}
                  projectName={project.project_name}
                  accentColor={accentColor}
                />
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              VIEW 4: FEEDBACK & APPROVALS
          ══════════════════════════════════════════════════════════════ */}
          {activeNav === 'feedback' && (
            <div className="space-y-6 animate-fade-in max-w-4xl">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Feedback &amp; Approvals</h2>
                <p className="text-xs text-slate-400">Review deliverables awaiting approval and share notes with the team.</p>
              </div>

              {/* Approvals */}
              {pendingApprovals.length > 0 ? (
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-white">Pending Sign-off ({pendingApprovals.length})</div>
                  {pendingApprovals.map(a => (
                    <ApprovalCard key={a.id} approval={a} accentColor={accentColor} />
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-2xl border border-white/[0.08] bg-[#0f111a] text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <div className="text-xs font-semibold text-white">All deliverables approved</div>
                  <p className="text-[11px] text-slate-400 font-light mt-1">No items currently waiting on your review.</p>
                </div>
              )}

              {/* Feedback Widget */}
              <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0f111a]">
                <FeedbackWidget projectId={project.id} accentColor={accentColor} />
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              VIEW 5: FILES & INVOICES
          ══════════════════════════════════════════════════════════════ */}
          {activeNav === 'files' && (
            <div className="space-y-6 animate-fade-in max-w-4xl">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Shared Assets &amp; Invoices</h2>
                <p className="text-xs text-slate-400">Access project documents, brand assets and payment receipts.</p>
              </div>

              {/* Shared Files List */}
              {projectResources && projectResources.length > 0 ? (
                <div className="rounded-2xl border border-white/[0.08] bg-[#0f111a] divide-y divide-white/[0.06] overflow-hidden">
                  {projectResources.map(res => (
                    <a
                      key={res.id}
                      href={res.external_url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors group text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <Folder className="w-4 h-4 text-indigo-400" />
                        <span className="font-semibold text-white">{res.name}</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-2xl border border-white/[0.08] bg-[#0f111a] text-center text-xs text-slate-400">
                  No files uploaded yet.
                </div>
              )}

              {/* Invoices List */}
              {projectInvoices.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-semibold text-white">Invoices &amp; Receipts ({projectInvoices.length})</div>
                  <div className="rounded-2xl border border-white/[0.08] bg-[#0f111a] divide-y divide-white/[0.06] overflow-hidden">
                    {projectInvoices.map(inv => (
                      <div key={inv.id} className="p-4 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <Receipt className="w-4 h-4 text-emerald-400" />
                          <div>
                            <span className="font-semibold text-white">{inv.invoice_number || 'Invoice'}</span>
                            <span className="text-[10px] text-slate-400 block capitalize">{inv.status}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono font-semibold text-white">
                            {fmtCurrency(inv.total || inv.amount || 0, inv.currency || 'USD')}
                          </span>
                          <Link
                            href={`/invoice/${inv.id}`}
                            className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium text-[11px]"
                          >
                            Receipt
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </main>
      </div>

    </div>
  )
}
