'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  Check,
  ChevronRight,
  ExternalLink,
  Layers,
  MessageSquare,
  Shield,
  Sparkles,
  Zap,
  ArrowUpRight,
  FileCode,
  AlertCircle,
} from 'lucide-react'
import { OveradsComparisonTable } from './overads-comparison-table'
import { SpotlightCard } from '@/components/ui/spotlight-card'

interface Props {
  isLoggedIn: boolean
  signupHref: string
}

const AUDIENCES = [
  'Freelance designers',
  'Web developers',
  'Brand studios',
  'Video & motion editors',
  'Copywriters',
  'Boutique agencies',
]

export function SpatialLanding({ isLoggedIn, signupHref }: Props) {
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
        'Direct invoice generation',
        'Community support',
      ],
      cta: 'Start free',
      highlighted: false,
    },
    {
      name: 'Pro',
      badge: 'Recommended for Solo Pros',
      price: billingPeriod === 'annual' ? '$15' : '$19',
      period: '/month',
      description: 'For active freelance professionals needing custom branding and file tracking.',
      features: [
        'Unlimited active projects',
        'Custom studio branding & logo',
        'Versioned deliverable approvals',
        'Milestone tracking & sign-offs',
        'VS Code & GitHub commit telemetry',
        'Priority email support',
      ],
      cta: 'Start 14-day trial',
      highlighted: true,
    },
    {
      name: 'Studio',
      price: billingPeriod === 'annual' ? '$39' : '$49',
      period: '/month',
      description: 'Built for creative studios and boutique agencies managing multiple client pipelines.',
      features: [
        'Everything in Pro',
        'Custom domain (portal.yourstudio.com)',
        'Up to 5 team collaborator seats',
        'Automated weekly client summaries',
        'Multi-currency invoicing',
        'Priority studio support',
      ],
      cta: 'Upgrade to Studio',
      highlighted: false,
    },
  ]

  return (
    <div className="theme-light relative min-h-screen bg-canvas text-ink selection:bg-accent/20 selection:text-ink overflow-x-hidden font-sans">
      {/* 1. Precision Architectural Drafting Grid (Warm Linen Tone) */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(to_right,rgba(23,23,23,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(23,23,23,0.035)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_35%,transparent_100%)]" 
        aria-hidden="true" 
      />

      {/* 2. Soft Warm Amber Illumination */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_50%_-15%,rgba(244,119,59,0.07),transparent_65%)]" 
        aria-hidden="true" 
      />

      {/* FLOATING ARCHITECTURAL NAVBAR */}
      <header className="fixed top-5 inset-x-0 z-50 flex justify-center px-4">
        <nav className="flex items-center justify-between gap-6 px-5 py-2.5 rounded-xl bg-surface/90 backdrop-blur-2xl border border-line shadow-[0_4px_24px_rgba(0,0,0,0.04)] max-w-4xl w-full">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="w-6 h-6 rounded-md bg-ink text-white flex items-center justify-center text-xs font-bold tracking-tight shadow-sm group-hover:scale-105 transition-transform">
              F
            </span>
            <span className="text-sm font-semibold tracking-tight text-ink group-hover:text-black transition-colors">
              Frevio
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-xs text-ink-muted">
            <a href="#why-frevio" className="hover:text-ink transition-colors">Workflow</a>
            <a href="#pricing" className="hover:text-ink transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-ink transition-colors">FAQ</a>
            <Link href="/calculator" className="hover:text-ink transition-colors">Free Tools</Link>
          </div>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-on-accent text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-xs text-ink-muted hover:text-ink transition-colors font-medium hidden sm:inline"
                >
                  Log in
                </Link>
                <Link
                  href={signupHref}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-on-accent text-xs font-semibold shadow-sm transition-all cursor-pointer"
                >
                  <span>Start free</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* MAIN CONTENT CONTAINER */}
      <main className="relative z-10 pt-28 sm:pt-36 pb-24 space-y-20 sm:space-y-28 lg:space-y-32">

        {/* 1. HERO SECTION */}
        <section className="text-center max-w-4xl mx-auto px-4 sm:px-6 pt-4 sm:pt-8">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-semibold tracking-[-0.03em] leading-[1.06] mb-6">
            <span className="text-ink block sm:inline">Stop chasing clients across</span>{' '}
            <span className="text-ink-muted block sm:inline font-medium">five different apps.</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-ink-muted max-w-2xl mx-auto leading-relaxed mb-9 font-normal">
            One private link for clients to review work, approve deliverables, and pay invoices. Zero accounts required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-8">
            <Link
              href={signupHref}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-lg bg-accent text-on-accent hover:bg-accent-hover text-sm font-semibold transition-all shadow-[0_4px_16px_rgba(244,119,59,0.25)] active:scale-[0.98] cursor-pointer"
            >
              <span>{isLoggedIn ? 'Go to Dashboard' : 'Start free'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#why-frevio"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-surface hover:bg-sunken border border-line hover:border-ink/20 text-ink text-sm font-medium transition-all active:scale-[0.98] shadow-sm cursor-pointer"
            >
              <span>Explore the workflow ↓</span>
            </a>
          </div>
        </section>

        {/* 2. AUDIENCE STRIP — who Frevio is built for (no borrowed logos) */}
        <section className="w-full px-4">
          <p className="text-center text-xs font-mono uppercase tracking-widest text-ink-muted font-medium mb-4">
            Built for independent client work
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 max-w-3xl mx-auto">
            {AUDIENCES.map((label) => (
              <li
                key={label}
                className="text-xs sm:text-sm font-medium text-ink-muted px-3 py-1.5 rounded-full bg-surface border border-line"
              >
                {label}
              </li>
            ))}
          </ul>
        </section>

        {/* MAIN BODY SECTIONS CONTAINER */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-24 sm:space-y-32 lg:space-y-36">

        {/* 3. METRIC PROOF COUNTERS */}
        <section id="security" className="rounded-2xl border border-line bg-surface shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-6 sm:p-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-line">
            <div className="space-y-1">
              <div className="text-3xl sm:text-5xl font-bold text-ink tracking-tight">0</div>
              <div className="text-xs text-ink-muted font-light">Client Passwords Required</div>
            </div>
            <div className="space-y-1 pt-6 md:pt-0">
              <div className="text-3xl sm:text-5xl font-bold text-ink tracking-tight">1-Click</div>
              <div className="text-xs text-ink-muted font-light">Deliverable Sign-Offs</div>
            </div>
            <div className="space-y-1 pt-6 md:pt-0">
              <div className="text-3xl sm:text-5xl font-bold text-ink tracking-tight">&lt; 60s</div>
              <div className="text-xs text-ink-muted font-light">Kickoff to Live Portal</div>
            </div>
            <div className="space-y-1 pt-6 md:pt-0">
              <div className="text-3xl sm:text-5xl font-bold text-ink tracking-tight">100%</div>
              <div className="text-xs text-ink-muted font-light">Private &amp; Encrypted</div>
            </div>
          </div>
        </section>

        {/* 4. THE WORKFLOW SHIFT (The Chaos vs The Calm) */}
        <section id="why-frevio" className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-5xl font-bold text-ink tracking-tight">
              The Workflow Shift.
            </h2>
            <p className="text-ink-muted text-base font-light">
              Stop stitching five separate tools. Give clients one calm link.
            </p>
          </div>

          {/* Centerpiece Visual: Chaos vs. Clarity Comparison */}
          <div className="relative rounded-2xl border border-line bg-surface overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
            <div className="relative w-full aspect-[16/9] sm:aspect-[16/8] bg-[#0c0d14] overflow-hidden">
              <Image
                src="/client_chaos_vs_calm.png"
                alt="Visual comparison: Scattered fragmented communication on the left vs centralized Frevio client portal on the right"
                width={1376}
                height={768}
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* Visual Breakdown Bar in Warm Paper Palette */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-line bg-sunken border-t border-line">
              <div className="p-4 sm:p-5 flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-rose-700 font-semibold">
                    Scattered Communication
                  </div>
                  <p className="text-xs text-ink-muted mt-1 leading-relaxed font-light">
                    Lost feedback in chat apps, unbilled scope requests, &ldquo;where are we on this?&rdquo; pings, and awkward payment chasing across endless email threads.
                  </p>
                </div>
              </div>
              <div className="p-4 sm:p-5 flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-ink font-semibold">
                    100% Client Clarity
                  </div>
                  <p className="text-xs text-ink-muted mt-1 leading-relaxed font-light">
                    One calm passcode link. Scope changes signed upfront, deliverables approved in one click, and milestone payments settled on time.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* The Fragmented Way */}
            <SpotlightCard
              spotlightColor="rgba(239, 68, 68, 0.08)"
              className="p-6 sm:p-8 space-y-6 border-red-200 bg-[#FDF8F7]"
            >
              <div className="flex items-center justify-between border-b border-red-200/60 pb-4">
                <span className="text-xs font-mono uppercase tracking-wider text-red-700 font-semibold">
                  Without Frevio
                </span>
                <span className="text-xs text-red-600/80 font-mono">Scattered &amp; Slow</span>
              </div>
              <ul className="space-y-4 text-sm text-ink font-light">
                <li className="flex items-start gap-3">
                  <span className="text-red-500 font-mono text-sm">✕</span>
                  <span>Slack DMs and unbilled verbal scope requests</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 font-mono text-sm">✕</span>
                  <span>Google Drive &ldquo;Request access&rdquo; permission roadblocks</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 font-mono text-sm">✕</span>
                  <span>Complex Notion boards clients never log into</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 font-mono text-sm">✕</span>
                  <span>Awkward payment chasing across email threads</span>
                </li>
              </ul>
            </SpotlightCard>

            {/* The Frevio Way */}
            <SpotlightCard
              spotlightColor="rgba(244, 119, 59, 0.08)"
              className="p-6 sm:p-8 space-y-6 border-emerald-200 bg-[#F6FAF7]"
            >
              <div className="flex items-center justify-between border-b border-emerald-200/60 pb-4">
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-700 font-semibold">
                  With Frevio
                </span>
                <span className="text-xs text-emerald-700 font-mono">1 Clean Link</span>
              </div>
              <ul className="space-y-4 text-sm text-ink font-light">
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-accent-strong flex-shrink-0 mt-0.5" />
                  <span>1-click change orders signed before out-of-scope work begins</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-accent-strong flex-shrink-0 mt-0.5" />
                  <span>Private client link with zero logins or passwords</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-accent-strong flex-shrink-0 mt-0.5" />
                  <span>Deliverables and progress in one calm dashboard</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-accent-strong flex-shrink-0 mt-0.5" />
                  <span>Milestone invoices settled directly upon deliverable sign-off</span>
                </li>
              </ul>
            </SpotlightCard>
          </div>
        </section>

        {/* 5. HONEST COMPARISON ARCHITECTURE TABLE */}
        <OveradsComparisonTable />

        {/* 6. PRICING SECTION */}
        <section id="pricing" className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-5xl font-bold text-ink tracking-tight">
              Plans that grow with you.
            </h2>
            <p className="text-ink-muted text-base font-light">
              Transparent pricing for solo freelancers and boutique creative studios.
            </p>

            {/* Billing Toggle (Geometric, No Pill) */}
            <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-surface border border-line shadow-sm">
              <button
                type="button"
                onClick={() => setBillingPeriod('monthly')}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  billingPeriod === 'monthly'
                    ? 'bg-ink text-white shadow-sm'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingPeriod('annual')}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  billingPeriod === 'annual'
                    ? 'bg-ink text-white shadow-sm'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                <span>Annual</span>
                <span className="text-xs text-accent-strong font-mono font-medium">
                  (Save 20%)
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {tiers.map((tier) => (
              <SpotlightCard
                key={tier.name}
                spotlightColor={tier.highlighted ? 'rgba(244, 119, 59, 0.12)' : 'rgba(244, 119, 59, 0.05)'}
                className={`p-6 flex flex-col justify-between transition-all ${
                  tier.highlighted
                    ? 'bg-surface border-2 border-ink shadow-[0_12px_36px_rgba(0,0,0,0.08)]'
                    : 'bg-surface border border-line shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-ink/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-ink">{tier.name}</h3>
                    {'badge' in tier && tier.badge && (
                      <span className="text-[10px] uppercase font-mono tracking-wider text-accent-strong font-semibold">
                        {tier.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ink-muted mb-6 font-light">{tier.description}</p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl font-bold text-ink">{tier.price}</span>
                    <span className="text-xs text-ink-muted">{tier.period}</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feat) => (
                      <li key={feat} className="text-xs text-ink flex items-start gap-2 font-light">
                        <Check className="w-3.5 h-3.5 text-accent-strong flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={signupHref}
                  className={`w-full py-2.5 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer ${
                    tier.highlighted
                      ? 'bg-accent hover:bg-accent-hover text-on-accent shadow-md'
                      : 'bg-canvas hover:bg-sunken text-ink border border-line'
                  }`}
                >
                  {tier.cta}
                </Link>
              </SpotlightCard>
            ))}
          </div>
        </section>

        {/* 7. FREQUENTLY ASKED QUESTIONS */}
        <section id="faq" className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-5xl font-bold text-ink tracking-tight">
              Frequently asked questions.
            </h2>
            <p className="text-ink-muted text-base font-light">
              Everything you need to know about running your client portal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <SpotlightCard spotlightColor="rgba(244, 119, 59, 0.08)" className="bg-surface border-line shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6 space-y-2">
              <h3 className="text-sm font-semibold text-ink">
                Do my clients really not need to make an account?
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed font-light">
                Yes. Clients access their portal through a secure tokenized passcode URL. They never have to choose a password, confirm an email, or install an app.
              </p>
            </SpotlightCard>

            <SpotlightCard spotlightColor="rgba(244, 119, 59, 0.08)" className="bg-surface border-line shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6 space-y-2">
              <h3 className="text-sm font-semibold text-ink">
                How does milestone invoicing work?
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed font-light">
                Attach itemized invoices directly to project milestones. Once clients approve the deliverable, they receive clear payment instructions and settlement receipts.
              </p>
            </SpotlightCard>

            <SpotlightCard spotlightColor="rgba(244, 119, 59, 0.08)" className="bg-surface border-line shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6 space-y-2">
              <h3 className="text-sm font-semibold text-ink">
                Can I use my own custom domain?
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed font-light">
                Yes, Studio plans support custom CNAME domains (e.g. `portal.yourstudio.com`) with automatic SSL provisioning.
              </p>
            </SpotlightCard>

            <SpotlightCard spotlightColor="rgba(244, 119, 59, 0.08)" className="bg-surface border-line shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6 space-y-2">
              <h3 className="text-sm font-semibold text-ink">
                What happens when I hit 2 active projects on Free?
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed font-light">
                You can archive completed projects anytime to make room, or upgrade to Pro ($19/mo) for unlimited active client workspaces.
              </p>
            </SpotlightCard>
          </div>
        </section>

        {/* 8. LAUNCH WITH FREVIO — ink section, ember CTA with ink text (AA) */}
        <section className="text-center rounded-2xl bg-ink p-10 sm:p-16 space-y-6 shadow-2xl text-white">
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight">
            Launch with Frevio.
          </h2>
          <p className="text-neutral-300 text-base sm:text-lg max-w-xl mx-auto font-light leading-relaxed">
            Stop chasing feedback across 5 apps. Give your clients one calm link that commands respect.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={signupHref}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-accent text-on-accent hover:bg-accent-hover text-sm font-semibold transition-all shadow-[0_4px_20px_rgba(244,119,59,0.35)] active:scale-[0.98] cursor-pointer"
            >
              <span>{isLoggedIn ? 'Open Your Workspace' : 'Get Started Free'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
        </div>
      </main>

      {/* ARCHITECTURAL FOOTER */}
      <footer className="relative z-10 border-t border-line bg-surface pt-16 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          
          {/* Main Footer Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
            
            {/* Brand & Mission Column (Spans 2 columns on desktop) */}
            <div className="col-span-2 space-y-4">
              <Link href="/" className="inline-flex items-center gap-2.5 group">
                <span className="w-6 h-6 rounded-md bg-ink text-white flex items-center justify-center text-xs font-bold tracking-tight shadow-sm group-hover:scale-105 transition-transform">
                  F
                </span>
                <span className="text-base font-semibold tracking-tight text-ink group-hover:text-accent-strong transition-colors">
                  Frevio
                </span>
              </Link>
              
              <p className="text-xs text-ink-muted max-w-sm leading-relaxed font-light">
                The client portal &amp; financial defense engine for modern freelancers and creative studios. One calm link for reviews, approvals, and milestone invoices.
              </p>

              {/* Status Indicator */}
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-canvas border border-line text-[11px] text-ink-muted font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>All systems operational</span>
              </div>
            </div>

            {/* Column 1: Product */}
            <div className="space-y-3">
              <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-ink">
                Product
              </div>
              <ul className="space-y-2 text-xs text-ink-muted font-light">
                <li><a href="#why-frevio" className="hover:text-ink transition-colors">Client Portal</a></li>
                <li><a href="#why-frevio" className="hover:text-ink transition-colors">Milestone Sign-Offs</a></li>
                <li><a href="#why-frevio" className="hover:text-ink transition-colors">Itemized Invoicing</a></li>
                <li><a href="#why-frevio" className="hover:text-ink transition-colors">Scope Change Orders</a></li>
                <li><a href="#pricing" className="hover:text-ink transition-colors">Pricing Plans</a></li>
              </ul>
            </div>

            {/* Column 2: Free Tools */}
            <div className="space-y-3">
              <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-ink">
                Free Tools
              </div>
              <ul className="space-y-2 text-xs text-ink-muted font-light">
                <li><Link href="/calculator" className="hover:text-ink transition-colors">Rate Calculator</Link></li>
                <li><Link href="/calculator/scope-creep" className="hover:text-ink transition-colors">Scope Creep Calculator</Link></li>
                <li><Link href="/calculator/invoice-generator" className="hover:text-ink transition-colors">Invoice Generator</Link></li>
                <li><Link href="/roadmap" className="hover:text-ink transition-colors">Public Roadmap</Link></li>
              </ul>
            </div>

            {/* Column 3: Legal & Security */}
            <div className="space-y-3">
              <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-ink">
                Trust &amp; Legal
              </div>
              <ul className="space-y-2 text-xs text-ink-muted font-light">
                <li><Link href="/privacy" className="hover:text-ink transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-ink transition-colors">Terms of Service</Link></li>
                <li><a href="#security" className="hover:text-ink transition-colors">Security Architecture</a></li>
                <li><a href="#faq" className="hover:text-ink transition-colors">FAQ</a></li>
              </ul>
            </div>

          </div>

          {/* Sub-footer Bottom Bar */}
          <div className="border-t border-line pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-muted font-light">
            <div className="flex items-center gap-2">
              <span>© 2026 Frevio Cloud Inc.</span>
              <span>·</span>
              <span>Zero-login client architecture</span>
            </div>
            <div className="flex items-center gap-6">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-ink transition-colors"
              >
                Twitter / X
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-ink transition-colors"
              >
                LinkedIn
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-ink transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>

        </div>
      </footer>
    </div>
  )
}
