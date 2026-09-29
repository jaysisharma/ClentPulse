'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Sparkles, ArrowRight, ShieldCheck, Zap,
  CheckCircle2, Bell, Radio, Eye, Building2,
  ExternalLink, ArrowUpRight
} from 'lucide-react'
import { ClientPortalView } from '@/app/p/[slug]/client-portal-view'
import { ThemeToggle } from '@/components/theme-toggle'
import { Logo } from '@/components/ui/logo'

export function DemoPortalClient() {
  const [demoBannerDismissed, setDemoBannerDismissed] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  function showToast(msg: string) {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  // Pre-seeded high-fidelity demonstration data
  const accentColor = '#6366F1'

  const orgData = {
    id: 'demo-org-1',
    name: 'Vanguard Design & Tech Studio',
    slug: 'vanguard-studio',
    logo_url: null,
    favicon_url: null,
    accent_color: accentColor,
    white_label: false,
    custom_domain: 'status.vanguardstudio.dev',
  }

  const owner = {
    id: 'demo-user-1',
    name: 'Alex Chen',
    email: 'alex@vanguardstudio.dev',
    username: 'alexchen',
    logo_url: null,
    accent_color: accentColor,
    plan: 'agency_scale',
  }

  const project = {
    id: 'demo-project-1',
    user_id: owner.id,
    org_id: orgData.id,
    project_name: 'Acme Mobile App Redesign & API Integration',
    client_name: 'Acme Corporation',
    slug: 'demo',
    color: accentColor,
    status: 'active',
    hourly_rate: 125,
    budget: 9000,
    deposit_required: 4500,
    deposit_paid: true,
    show_time_logged: true,
    waiting_on_client: true,
    blocker_reason: 'Waiting for Meta Pixel ID & Production DNS CNAME records',
    last_heartbeat_at: new Date().toISOString(),
    active_focus_area: 'Payment Gateway (Stripe) & Webhooks',
    report_embed_url: 'https://lookerstudio.google.com/embed/reporting/demo',
    kpis: [
      { label: 'Blended ROAS', value: '4.8x', change: '+1.2x', trend: 'up' },
      { label: 'Active Beta Users', value: '1,420', change: '+340', trend: 'up' },
      { label: 'P95 API Latency', value: '42ms', change: '-18ms', trend: 'up' },
      { label: 'Sprint Velocity', value: '96%', change: '+4%', trend: 'up' },
    ],
  }

  const teamMembers = [
    {
      id: 'pod-1',
      role_title: 'Lead Architect & Founder',
      user_id: 'user-1',
      user: {
        id: 'user-1',
        name: 'Alex Chen',
        email: 'alex@vanguardstudio.dev',
        logo_url: null,
        last_heartbeat_at: new Date().toISOString(),
        active_focus_area: 'Payment Gateway (Stripe)',
      },
    },
    {
      id: 'pod-2',
      role_title: 'Staff Product Designer',
      user_id: 'user-2',
      user: {
        id: 'user-2',
        name: 'Sarah Lin',
        email: 'sarah@vanguardstudio.dev',
        logo_url: null,
        last_heartbeat_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        active_focus_area: 'Design System & Mobile Components',
      },
    },
    {
      id: 'pod-3',
      role_title: 'Backend Specialist',
      user_id: 'user-3',
      user: {
        id: 'user-3',
        name: 'Marcus Vance',
        email: 'marcus@vanguardstudio.dev',
        logo_url: null,
        last_heartbeat_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        active_focus_area: 'Database Indexes & Edge Routing',
      },
    },
  ]

  const milestones = [
    { id: 'm-1', title: 'System Discovery & Edge Architecture Spec', due_date: '2026-10-05', done: true },
    { id: 'm-2', title: 'Mobile UI/UX Figma Prototype & Design System', due_date: '2026-10-18', done: true },
    { id: 'm-3', title: 'Stripe Invoicing & Multi-Currency Engine', due_date: '2026-11-05', done: false },
    { id: 'm-4', title: 'Security Audit, Penetration Test & Public Launch', due_date: '2026-11-15', done: false },
  ]

  const checklistItems = [
    { id: 'c-1', title: 'Connect Supabase Auth with Google OAuth', assigned_to: 'Alex Chen', done: true, done_at: '2026-10-12T10:00:00Z' },
    { id: 'c-2', title: 'Finalize Figma design tokens and mobile components', assigned_to: 'Sarah Lin', done: true, done_at: '2026-10-16T14:30:00Z' },
    { id: 'c-3', title: 'Configure Stripe webhook idempotency & retries', assigned_to: 'Marcus Vance', done: true, done_at: '2026-10-22T09:15:00Z' },
    { id: 'c-4', title: 'Set up DNS CNAME records for custom domain', assigned_to: 'Acme Team (Pending)', done: false, done_at: null },
  ]

  const approvals = [
    {
      id: 'demo-approval-1',
      title: 'Mobile App Design System & Component Library (Figma)',
      url: 'https://figma.com/@vanguard/acme-mobile',
      preview_type: 'figma',
      status: 'pending',
      feedback: null,
    },
    {
      id: 'demo-approval-2',
      title: 'Staging Environment Preview (v1.2.0-rc3)',
      url: 'https://staging-acme.frevio.dev',
      preview_type: 'staging',
      status: 'approved',
      feedback: 'Approved by Acme team — staging looks responsive across iOS and Android.',
    },
    {
      id: 'demo-approval-3',
      title: 'Stripe Multi-Currency Checkout Pull Request #42',
      url: 'https://github.com/acme/app/pull/42',
      preview_type: 'code_pr',
      status: 'pending',
      feedback: null,
    },
    {
      id: 'demo-approval-4',
      title: 'Q4 Launch Campaign Creative Specs & Ad Copy Deck',
      url: 'https://docs.google.com/document/d/demo-acme-spec',
      preview_type: 'copy_deck',
      status: 'approved',
      feedback: 'Approved without edits.',
    },
  ]

  const updates = [
    {
      id: 'u-1',
      bullets: [
        'Finished multi-currency Stripe billing support (USD, EUR, GBP) with automatic Tax/VAT compliance.',
        'Deployed staging release v1.2.0-rc3 with real-time push notifications.',
        'Awaiting client DNS CNAME records to point status.acme.com to production.',
      ],
      note: 'Everything is tracking smoothly for our Nov 15 production cutover. Please review the pending Figma deliverable above when your team has 5 minutes!',
      video_url: 'https://www.loom.com/share/e1234567890abcdef',
      sent_at: '2026-10-24T18:00:00Z',
      created_at: '2026-10-24T17:45:00Z',
    },
    {
      id: 'u-2',
      bullets: [
        'Completed full UX audit of mobile checkout funnel.',
        'Added biometric passcode authentication & OTP recovery.',
      ],
      note: 'Week 2 deliverables finalized on schedule.',
      video_url: null,
      sent_at: '2026-10-17T18:00:00Z',
      created_at: '2026-10-17T17:30:00Z',
    },
  ]

  const projectInvoices = [
    {
      id: 'inv-1',
      invoice_number: 'INV-2026-001',
      amount: 4500,
      total: 4500,
      currency: 'usd',
      status: 'paid',
      is_deposit: true,
      due_date: '2026-10-01',
      paid_at: '2026-10-02T11:20:00Z',
      created_at: '2026-10-01T08:00:00Z',
    },
    {
      id: 'inv-2',
      invoice_number: 'INV-2026-002',
      amount: 2250,
      total: 2250,
      currency: 'usd',
      status: 'paid',
      is_deposit: false,
      due_date: '2026-10-20',
      paid_at: '2026-10-19T16:45:00Z',
      created_at: '2026-10-15T09:00:00Z',
    },
    {
      id: 'inv-3',
      invoice_number: 'INV-2026-003',
      amount: 2250,
      total: 2250,
      currency: 'usd',
      status: 'sent',
      is_deposit: false,
      due_date: '2026-11-10',
      paid_at: null,
      created_at: '2026-10-25T10:00:00Z',
    },
  ]

  const projectResources = [
    {
      id: 'res-1',
      title: 'Production Design Tokens (Figma)',
      url: 'https://figma.com/@vanguard/acme-tokens',
      resource_type: 'figma',
      integration_connections: null,
    },
    {
      id: 'res-2',
      title: 'API OpenAPI Documentation',
      url: 'https://api.acme.frevio.dev/docs',
      resource_type: 'doc',
      integration_connections: null,
    },
    {
      id: 'res-3',
      title: 'Shared Assets Drive',
      url: 'https://drive.google.com/drive/folders/demo-acme',
      resource_type: 'gdrive',
      integration_connections: { status: 'connected', provider_account_email: 'team@vanguardstudio.dev' },
    },
  ]

  const allComments = [
    {
      id: 'c-1',
      update_id: 'u-1',
      author_name: 'Jessica Vance (Acme VP Product)',
      body: 'Staging looks super clean! We will verify the DNS records with our IT team this afternoon.',
      created_at: '2026-10-24T19:30:00Z',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#08090a] text-slate-900 dark:text-white relative selection:bg-slate-900 selection:text-white dark:selection:bg-white dark:selection:text-slate-900 font-sans transition-colors duration-200">
      
      {/* ── Sticky Demo Header Bar ── */}
      <div className="bg-indigo-600 text-white px-4 py-2.5 shadow-md sticky top-0 z-50 transition-all">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            <span className="font-semibold tracking-wide">Interactive Demo Portal</span>
            <span className="hidden md:inline text-indigo-200">|</span>
            <span className="text-indigo-100 hidden md:inline">
              This is the live portal your clients receive. Test deliverables, inspect milestones, and view developer presence.
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => showToast('Simulating live heartbeat: Editor active in PaymentGateway.ts')}
              className="px-2.5 py-1 rounded-md bg-white/15 hover:bg-white/25 text-white font-medium transition-colors cursor-pointer"
            >
              Ping Heartbeat
            </button>
            <Link
              href="/auth/login?mode=signup"
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white text-indigo-700 hover:bg-indigo-50 font-bold shadow-xs transition-transform hover:scale-105"
            >
              <span>Build My Portal Free</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 dark:border-slate-200 text-xs font-medium flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Ambient background illumination */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-12 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 blur-3xl opacity-30 dark:opacity-20 -z-10"
        style={{
          background: `radial-gradient(ellipse 60% 40% at 50% 0%, ${accentColor} 0%, transparent 80%)`,
        }}
      />

      {/* ── Client Portal Navigation Header ─────────────────────────── */}
      <header className="border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c0d12]/80 backdrop-blur-md sticky top-10 z-30 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs flex-shrink-0"
              style={{ backgroundColor: accentColor }}
            >
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                {orgData.name}
              </div>
              <h1 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white truncate">
                {project.project_name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Live Developer Telemetry Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-[#0c0d12]/90 border border-slate-200 dark:border-white/10 shadow-2xs text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-medium text-emerald-700 dark:text-emerald-400">
                Currently working on this
              </span>
              <span className="text-slate-400 dark:text-slate-500 border-l border-slate-200 dark:border-white/10 pl-2 hidden sm:inline">
                Focus: {project.active_focus_area}
              </span>
            </div>

            <ThemeToggle className="rounded-full w-8 h-8 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-white/10" />

            <Link
              href="/auth/login?mode=signup"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow-xs transition-transform hover:scale-105"
              style={{ backgroundColor: accentColor }}
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Portal Body View ─────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <ClientPortalView
          project={project}
          updates={updates}
          milestones={milestones}
          checklistItems={checklistItems}
          approvals={approvals}
          projectResources={projectResources}
          projectInvoices={projectInvoices}
          teamMembers={teamMembers}
          allComments={allComments}
          owner={owner}
          orgData={orgData}
          accentColor={accentColor}
          hoursLabel="38.5h"
          totalHours={38.5}
          totalMilestones={4}
          completedMilestones={2}
          progressPercent={50}
          targetLaunchDate="Nov 15, 2026"
          contactEmail="alex@vanguardstudio.dev"
          leadSpecialistName="Alex Chen"
          isDepositPending={false}
          depositInvoice={projectInvoices[0]}
        />
      </main>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200/80 dark:border-white/10 py-8 px-4 text-center">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Logo className="w-4 h-4 text-indigo-600 dark:text-white" />
            <span className="font-mono font-medium">Powered by Frevio · The Freelancer & Studio Operating System</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/pricing" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Pricing
            </Link>
            <Link
              href="/auth/login?mode=signup"
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Create Your Free Portal →
            </Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
