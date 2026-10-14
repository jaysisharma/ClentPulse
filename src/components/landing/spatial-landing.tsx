'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  ExternalLink,
  Eye,
  FileCheck,
  Layers,
  Lock,
  MessageSquare,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react'

// Dynamically import Three.js spatial canvas to avoid SSR issues
const SpatialCanvas = dynamic(
  () => import('./spatial-canvas').then((mod) => mod.SpatialCanvas),
  { ssr: false }
)

interface Props {
  isLoggedIn: boolean
  signupHref: string
}

export function SpatialLanding({ isLoggedIn, signupHref }: Props) {
  const [activeTab, setActiveTab] = useState<'client' | 'freelancer'>('client')
  const [isApproved, setIsApproved] = useState(false)
  const [isPaid, setIsPaid] = useState(false)
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly')

  const tiers = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Ideal for independent freelancers with 1–2 ongoing client projects.',
      features: [
        'Up to 2 active projects',
        'Direct passcode client portal',
        'Milestone deliverables & approvals',
        'Basic Stripe invoicing',
        'Community support',
      ],
      cta: 'Start free',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: billingPeriod === 'annual' ? '$15' : '$19',
      period: '/month',
      description: 'For active freelance professionals needing custom branding and file tracking.',
      features: [
        'Unlimited active projects',
        'Custom studio branding & logo',
        'Versioned deliverable approvals',
        'Instant Stripe milestone escrow',
        'VS Code & GitHub commit telemetry',
        'Priority email support',
      ],
      cta: 'Start 14-day trial',
      highlighted: true,
    },
    {
      name: 'Agency',
      price: billingPeriod === 'annual' ? '$39' : '$49',
      period: '/month',
      description: 'Built for creative studios and boutique agencies managing multiple client pipelines.',
      features: [
        'Everything in Pro',
        'Custom domain (portal.yourstudio.com)',
        'Up to 5 team collaborator seats',
        'Automated AI weekly client briefs',
        'Multi-currency invoicing',
        'Dedicated onboarding',
      ],
      cta: 'Upgrade to Agency',
      highlighted: false,
    },
    {
      name: 'Scale',
      price: billingPeriod === 'annual' ? '$119' : '$149',
      period: '/month',
      description: 'For established agencies and design consultancies with high volume.',
      features: [
        'Everything in Agency',
        'Unlimited team seats',
        'Dedicated account manager',
        'Custom Stripe Connect fee splits',
        'SLA 99.9% uptime guarantee',
        'Custom integration engineering',
      ],
      cta: 'Contact Sales',
      highlighted: false,
    },
  ]

  return (
    <div className="relative min-h-screen bg-[#040407] text-white selection:bg-purple-600/30 selection:text-purple-200 overflow-x-hidden font-sans">
      {/* 3D WebGL Spatial Background Scene */}
      <SpatialCanvas />

      {/* Subtle Ambient Radial Lighting */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.12),transparent_55%)]" 
        aria-hidden="true" 
      />

      {/* FLOATING PILL NAVBAR (Peachworlds Aesthetic) */}
      <header className="fixed top-5 inset-x-0 z-50 flex justify-center px-4">
        <nav className="flex items-center justify-between gap-6 px-5 py-2.5 rounded-full bg-[#0a0a10]/80 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.5)] max-w-4xl w-full">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xs font-bold tracking-tight text-white shadow-sm group-hover:scale-105 transition-transform">
              F
            </span>
            <span className="text-sm font-semibold tracking-tight text-white group-hover:text-purple-300 transition-colors">
              Frevio
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-xs text-neutral-400">
            <a href="#engine" className="hover:text-white transition-colors">Engine</a>
            <a href="#portal" className="hover:text-white transition-colors">Portal</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={isLoggedIn ? '/dashboard' : '/auth/login'}
              className="text-xs text-neutral-300 hover:text-white transition-colors hidden sm:inline"
            >
              {isLoggedIn ? 'Dashboard' : 'Sign in'}
            </Link>
            <Link
              href={signupHref}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-black hover:bg-neutral-200 text-xs font-medium transition-colors cursor-pointer"
            >
              <span>{isLoggedIn ? 'Open app' : 'Start free'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </nav>
      </header>

      {/* MAIN CONTENT CONTAINER */}
      <main className="relative z-10 pt-32 sm:pt-40 pb-24 max-w-6xl mx-auto px-4 sm:px-6 space-y-36">

        {/* 1. HERO SECTION */}
        <section className="text-center max-w-4xl mx-auto pt-8 sm:pt-16">
          {/* Announcement pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs mb-8">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Introducing Frevio 2.0 — Zero client logins, 1-click approvals</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.08] mb-6">
            Turn Client Chaos <br className="hidden sm:inline" />
            Into Pure Clarity.
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed mb-10 font-light">
            The spatial client workspace for designers, engineers, and creative studios.
            Deliver milestones, gather approvals, and settle Stripe invoices through one calm link.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <Link
              href={signupHref}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-white text-black hover:bg-neutral-200 text-sm font-semibold transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] cursor-pointer"
            >
              <span>{isLoggedIn ? 'Go to Dashboard' : 'Start free now'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#portal"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-neutral-300 text-sm font-medium transition-colors"
            >
              <span>Explore Live Workspace</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-500 font-light">
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-purple-400" /> Free for 2 active projects
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-purple-400" /> No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-purple-400" /> Clients never need an account
            </span>
          </div>

          {/* 2. THE LIVE CODED INSTRUMENT (Peachworlds Floating Glass Slab) */}
          <div id="portal" className="mt-16 text-left" data-ui="true">
            <div className="relative rounded-2xl border border-white/[0.12] bg-[#0c0d14]/85 backdrop-blur-2xl shadow-[0_30px_90px_rgba(0,0,0,0.8)] overflow-hidden">
              
              {/* Window Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:px-6 border-b border-white/[0.08] bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                    <span className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                    <span className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                  </div>
                  <span className="text-xs font-mono text-neutral-400 pl-2">
                    frevio.cloud/portal/acme-brand-2026
                  </span>
                </div>

                {/* Perspective Switcher */}
                <div className="inline-flex p-1 rounded-lg bg-black/50 border border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setActiveTab('client')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      activeTab === 'client'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Client Portal View
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('freelancer')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      activeTab === 'freelancer'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Freelancer Cockpit
                  </button>
                </div>
              </div>

              {/* Window Body */}
              <div className="p-6 sm:p-8">
                {activeTab === 'client' ? (
                  <div className="space-y-6">
                    {/* Project Title Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
                      <div>
                        <div className="text-xs text-purple-400 font-medium mb-1">
                          Active Milestone: Stage 3 of 4
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                          Acme Global Brand System &amp; Web Platform
                        </h3>
                        <p className="text-xs text-neutral-400 mt-1 font-light">
                          Prepared by Studio Mono · Passcode Secured Portal · Updated 14m ago
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Ready for Review
                        </span>
                      </div>
                    </div>

                    {/* Milestone Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-neutral-400">
                        <span>Milestone Progress (Stage 3: Interactive Design System)</span>
                        <span className="font-mono text-white">75% Complete</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 w-3/4 rounded-full" />
                      </div>
                    </div>

                    {/* Deliverable Review & Approval Action */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                      <div className="lg:col-span-2 rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-300">
                              <FileCheck className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-white">
                                Design_System_Figma_Handoff_v2.4
                              </div>
                              <div className="text-xs text-neutral-400 font-light">
                                Figma Tokens, Component Library &amp; High-Fi Interactive Prototype
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-neutral-400 font-mono">14.2 MB</span>
                        </div>

                        <p className="text-xs text-neutral-300 leading-relaxed font-light">
                          &ldquo;Hi Claire! The typography scale, responsive navigation, and dark mode tokens are now fully baked. Click below to sign off on this deliverable to unlock the deployment phase.&rdquo;
                        </p>

                        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setIsApproved(!isApproved)}
                            className={`w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                              isApproved
                                ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                                : 'bg-purple-600 hover:bg-purple-500 text-white'
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{isApproved ? 'Deliverable Approved ✓' : 'Approve Milestone Deliverable'}</span>
                          </button>
                          <span className="text-xs text-neutral-500 font-light">
                            {isApproved ? 'Approval logged on blockchain timestamp' : 'One click sign-off · Zero login required'}
                          </span>
                        </div>
                      </div>

                      {/* Direct Stripe Invoicing Block */}
                      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-neutral-400 font-medium">Milestone Invoice</span>
                            <span className="text-xs px-2 py-0.5 rounded bg-white/[0.06] text-neutral-300 font-mono">
                              INV-2026-084
                            </span>
                          </div>
                          <div className="text-xs text-neutral-400 font-light mb-1">Due on Approval</div>
                          <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
                            $3,500.00
                          </div>
                          <p className="text-xs text-neutral-500 leading-relaxed mb-4 font-light">
                            Settled directly via Stripe with automated payout to Studio Mono.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsPaid(!isPaid)}
                          className={`w-full py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                            isPaid
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-white hover:bg-neutral-200 text-black'
                          }`}
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>{isPaid ? 'Payment Settled via Stripe ✓' : 'Pay via Stripe (1-Click)'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* FREELANCER COCKPIT TAB */
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
                      <div>
                        <div className="text-xs text-emerald-400 font-medium mb-1">Studio Cockpit</div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                          Active Client Operations Dashboard
                        </h3>
                        <p className="text-xs text-neutral-400 mt-1 font-light">
                          Internal telemetry, heartbeat trackers, and unbilled revenue pipeline
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
                        <Zap className="w-3.5 h-3.5" />
                        VS Code Heartbeat Syncing
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                        <span className="text-xs text-neutral-400">Logged Hours (This Week)</span>
                        <div className="text-2xl font-bold text-white mt-1">18.4 hrs</div>
                        <span className="text-xs text-emerald-400">Captured via IDE extension</span>
                      </div>
                      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                        <span className="text-xs text-neutral-400">Unbilled Milestone Balance</span>
                        <div className="text-2xl font-bold text-white mt-1">$5,250.00</div>
                        <span className="text-xs text-neutral-400">Ready to convert to invoice</span>
                      </div>
                      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                        <span className="text-xs text-neutral-400">Client Portal Views</span>
                        <div className="text-2xl font-bold text-white mt-1">16 views</div>
                        <span className="text-xs text-neutral-400">Claire viewed 8m ago</span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-white">
                          <Sparkles className="w-4 h-4 text-purple-400" />
                          Weekly Client Digest Generated
                        </div>
                        <p className="text-xs text-neutral-400 font-light mt-1">
                          Frevio summarized 14 GitHub commits and 6 Figma components into a clean 3-point client update.
                        </p>
                      </div>
                      <button
                        type="button"
                        className="px-4 py-2 rounded-lg bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-colors cursor-pointer"
                      >
                        Publish to Portal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 3. THE ALL-IN-ONE CLIENT ENGINE (Peachworlds Bento Triad) */}
        <section id="engine" className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
              Your all-in-one client engine.
            </h2>
            <p className="text-neutral-400 text-base font-light">
              Milestones, approvals, and instant payouts — everything you need to ship client work, zero friction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d14]/70 backdrop-blur-xl p-8 space-y-4 hover:border-purple-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Frictionless Client Access
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed font-light">
                Clients open one permanent passcode link. No registration forms, no forgotten passwords, no onboarding hurdles.
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d14]/70 backdrop-blur-xl p-8 space-y-4 hover:border-purple-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Milestone Sign-Offs
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed font-light">
                Publish deliverables with live previews. Clients review versions and sign off with a single verified click.
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d14]/70 backdrop-blur-xl p-8 space-y-4 hover:border-purple-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Automated Stripe Settlements
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed font-light">
                Connect invoices directly to milestones. Approvals trigger escrow releases and deposit straight into your bank.
              </p>
            </div>
          </div>
        </section>

        {/* 4. SPATIAL WALKTHROUGH (Side-by-Side Storytelling) */}
        <section className="space-y-24">
          {/* Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-5">
              <div className="text-xs text-purple-400 font-semibold tracking-wider uppercase">
                The Client Experience
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Meet your client&apos;s new favorite bookmark.
              </h2>
              <p className="text-neutral-400 leading-relaxed font-light">
                Instead of searching Slack threads, messy email chains, and shared Google Drive folders, your client checks one link. They see the timeline, approve deliverables, and pay invoices in seconds.
              </p>
              <div className="pt-2">
                <Link
                  href={signupHref}
                  className="inline-flex items-center gap-2 text-sm text-purple-300 hover:text-white font-medium transition-colors"
                >
                  <span>Experience the portal demo</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between text-xs text-neutral-400 pb-3 border-b border-white/[0.06]">
                <span>Recent Milestone Activity</span>
                <span className="text-emerald-400 font-medium">Live Sync</span>
              </div>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-black/40 border border-white/[0.04] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-xs text-neutral-200">Stage 1: Brand Discovery &amp; Strategy</span>
                  </div>
                  <span className="text-xs text-neutral-400 font-mono">Approved</span>
                </div>
                <div className="p-3 rounded-lg bg-black/40 border border-white/[0.04] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-xs text-neutral-200">Stage 2: Wireframes &amp; Architecture</span>
                  </div>
                  <span className="text-xs text-neutral-400 font-mono">Approved</span>
                </div>
                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                    <span className="text-xs text-purple-200 font-medium">Stage 3: High-Fi Design System</span>
                  </div>
                  <span className="text-xs text-purple-300 font-mono">In Review</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between text-xs text-neutral-400 pb-3 border-b border-white/[0.06]">
                <span>Connected Toolchain Sync</span>
                <span className="text-purple-400 font-mono">5/5 Connected</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-black/40 border border-white/[0.04] flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  <span className="text-neutral-200">Stripe Invoicing</span>
                </div>
                <div className="p-3 rounded-lg bg-black/40 border border-white/[0.04] flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-pink-400" />
                  <span className="text-neutral-200">Figma Prototype</span>
                </div>
                <div className="p-3 rounded-lg bg-black/40 border border-white/[0.04] flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className="text-neutral-200">GitHub Commits</span>
                </div>
                <div className="p-3 rounded-lg bg-black/40 border border-white/[0.04] flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  <span className="text-neutral-200">VS Code Extension</span>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-5">
              <div className="text-xs text-purple-400 font-semibold tracking-wider uppercase">
                Zero Context Switching
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Connect your work. Keep your flow.
              </h2>
              <p className="text-neutral-400 leading-relaxed font-light">
                Frevio hooks directly into your existing development and design tools. Your commits and Figma components automatically become readable progress markers for your client without manual reporting.
              </p>
              <div className="pt-2">
                <Link
                  href={signupHref}
                  className="inline-flex items-center gap-2 text-sm text-purple-300 hover:text-white font-medium transition-colors"
                >
                  <span>See integration details</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 5. METRIC PROOF COUNTERS (Vexel Spatial Stats) */}
        <section id="security" className="rounded-3xl border border-white/[0.08] bg-[#0c0d14]/80 backdrop-blur-2xl p-8 sm:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
            <div className="space-y-1">
              <div className="text-3xl sm:text-5xl font-bold text-white tracking-tight">100%</div>
              <div className="text-xs text-neutral-400 font-light">Zero-Login Client Access</div>
            </div>
            <div className="space-y-1 pt-6 md:pt-0">
              <div className="text-3xl sm:text-5xl font-bold text-white tracking-tight">3.4x</div>
              <div className="text-xs text-neutral-400 font-light">Faster Milestone Sign-Offs</div>
            </div>
            <div className="space-y-1 pt-6 md:pt-0">
              <div className="text-3xl sm:text-5xl font-bold text-white tracking-tight">&lt; 60s</div>
              <div className="text-xs text-neutral-400 font-light">Kickoff to Live Portal</div>
            </div>
            <div className="space-y-1 pt-6 md:pt-0">
              <div className="text-3xl sm:text-5xl font-bold text-white tracking-tight">99.9%</div>
              <div className="text-xs text-neutral-400 font-light">Uptime &amp; SLA Reliability</div>
            </div>
          </div>
        </section>

        {/* 6. PRICING SECTION */}
        <section id="pricing" className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
              Plans that grow with you.
            </h2>
            <p className="text-neutral-400 text-base font-light">
              Transparent pricing for solo freelancers, creative studios, and scaling agencies.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-3 p-1 rounded-full bg-white/[0.04] border border-white/[0.08]">
              <button
                type="button"
                onClick={() => setBillingPeriod('monthly')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingPeriod('annual')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                  billingPeriod === 'annual'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <span>Annual</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-2xl p-6 backdrop-blur-xl flex flex-col justify-between transition-all ${
                  tier.highlighted
                    ? 'bg-purple-950/20 border-2 border-purple-500/50 shadow-[0_0_40px_rgba(139,92,246,0.15)]'
                    : 'bg-[#0c0d14]/70 border border-white/[0.08] hover:border-white/[0.2]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                    {tier.highlighted && (
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-purple-500 text-white">
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 mb-6 font-light">{tier.description}</p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl font-bold text-white">{tier.price}</span>
                    <span className="text-xs text-neutral-400">{tier.period}</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feat) => (
                      <li key={feat} className="text-xs text-neutral-300 flex items-start gap-2 font-light">
                        <Check className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={signupHref}
                  className={`w-full py-2.5 rounded-xl text-xs font-semibold text-center transition-all ${
                    tier.highlighted
                      ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md'
                      : 'bg-white/[0.08] hover:bg-white/[0.14] text-white'
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* 7. FREQUENTLY ASKED QUESTIONS */}
        <section id="faq" className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
              Frequently asked questions.
            </h2>
            <p className="text-neutral-400 text-base font-light">
              Everything you need to know about setting up and running your client portal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d14]/70 p-6 space-y-2">
              <h3 className="text-sm font-semibold text-white">
                Do my clients really not need to make an account?
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-light">
                Yes. Clients access their portal through a secure tokenized passcode URL. They never have to choose a password, confirm an email, or install an app.
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d14]/70 p-6 space-y-2">
              <h3 className="text-sm font-semibold text-white">
                How does Stripe milestone escrow work?
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-light">
                You connect your standard Stripe account with 1-click. When a client approves a milestone, the invoice can be settled instantly and deposited directly into your bank account.
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d14]/70 p-6 space-y-2">
              <h3 className="text-sm font-semibold text-white">
                Can I use my own custom domain?
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-light">
                Yes, Agency and Scale plans support custom CNAME domains (e.g. `portal.yourstudio.com`) with automatic SSL provisioning.
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d14]/70 p-6 space-y-2">
              <h3 className="text-sm font-semibold text-white">
                What happens when I hit 2 active projects on Free?
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-light">
                You can archive completed projects anytime to make room, or upgrade to Pro ($19/mo) for unlimited active client workspaces.
              </p>
            </div>
          </div>
        </section>

        {/* 8. LAUNCH WITH FREVIO (Peachworlds Finale) */}
        <section className="text-center rounded-3xl border border-white/[0.1] bg-gradient-to-b from-[#0c0d14] to-black p-12 sm:p-20 space-y-6">
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight">
            Launch with Frevio.
          </h2>
          <p className="text-neutral-400 text-base sm:text-lg max-w-xl mx-auto font-light leading-relaxed">
            Stop chasing feedback across 5 apps. Give your clients one calm link that commands respect.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={signupHref}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-white text-black hover:bg-neutral-200 text-sm font-semibold transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] cursor-pointer"
            >
              <span>{isLoggedIn ? 'Open Your Workspace' : 'Get Started Free'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="text-xs text-neutral-500 font-light pt-2">
            No credit card required · 2 active projects free forever
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/[0.06] py-10 max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
        <div className="flex items-center gap-3">
          <span className="text-neutral-400 font-semibold">Frevio</span>
          <span>© 2026 Frevio Cloud Inc. All rights reserved.</span>
        </div>

        <div className="flex items-center gap-6">
          <span className="inline-flex items-center gap-1.5 text-neutral-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            All systems operational
          </span>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
        </div>
      </footer>
    </div>
  )
}
