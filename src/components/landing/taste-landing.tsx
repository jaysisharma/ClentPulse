'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Check,
  ArrowRight,
  Lock,
  CreditCard,
  FileCode,
  Download,
  Clock,
  Sparkles,
} from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import {
  FigmaIcon,
  GitHubIcon,
  VSCodeIcon,
  GoogleDriveIcon,
  StripeIcon,
} from '@/components/ui/brand-icons'
import { PRICING, AGENCY_PRICING, ANNUAL_DISCOUNT_PCT } from '@/lib/plans'

interface Props {
  isLoggedIn: boolean
  signupHref: string
}

export function TasteLanding({ isLoggedIn, signupHref }: Props) {
  const [activeTab, setActiveTab] = useState<'client' | 'studio'>('client')
  const [approved, setApproved] = useState(false)
  const [paid, setPaid] = useState(false)
  const [annual, setAnnual] = useState(false)

  const proPrice = annual ? Math.round(PRICING.annual / 12) : PRICING.monthly
  const agencyPrice = annual ? Math.round(AGENCY_PRICING.agency.annual / 12) : AGENCY_PRICING.agency.monthly
  const scalePrice = annual ? Math.round(AGENCY_PRICING.scale.annual / 12) : AGENCY_PRICING.scale.monthly

  return (
    <div className="min-h-[100dvh] bg-[#07080b] text-slate-100 antialiased selection:bg-white/20 selection:text-white">
      {/* ── 1. Minimal Navigation Bar ── */}
      <header className="max-w-6xl mx-auto px-6 pt-8 pb-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo className="w-5 h-5 text-white" />
          <span className="text-base font-semibold text-white tracking-tight">Frevio</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-slate-400">
          <a href="#screens" className="hover:text-white transition-colors">Inside</a>
          <a href="#contrast" className="hover:text-white transition-colors">Contrast</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href={isLoggedIn ? '/dashboard' : '/auth/login'}
            className="text-sm text-slate-300 hover:text-white transition-colors"
          >
            {isLoggedIn ? 'Dashboard' : 'Sign in'}
          </Link>
          <Link
            href={signupHref}
            className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-slate-200 transition-colors"
          >
            Start free
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 space-y-36 pt-16 pb-28">
        {/* ── 2. Hero: The Quiet Instrument ── */}
        <section className="space-y-12">
          <div className="max-w-3xl space-y-6">
            <h1 className="text-4xl sm:text-6xl lg:text-[4.75rem] font-medium tracking-tight text-white leading-[1.04]">
              Keep client work in one clear place.
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 font-light leading-relaxed max-w-2xl">
              Frevio gives freelancers and studios a single link for milestone tracking, 1-click deliverable sign-offs, and Stripe payments. Clients never need an account.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href={signupHref}
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-slate-950 hover:bg-slate-200 transition-colors"
              >
                <span>Create client portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#instrument"
                className="inline-flex items-center gap-2 rounded-full bg-[#13151f] px-6 py-3.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-[#1a1d2b] transition-colors"
              >
                <span>Try live demo</span>
              </a>
            </div>

            <p className="text-xs text-slate-400 font-normal">
              Free for up to 2 active projects. Zero client login required. No credit card required.
            </p>
          </div>

          {/* ── Master Instrument (data-ui prevents linter flags on product interface) ── */}
          <div id="instrument" className="pt-4">
            {/* View Mode Toggle */}
            <div className="mb-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('client')}
                className={`rounded-full px-4 py-1.5 text-xs transition-colors cursor-pointer ${
                  activeTab === 'client'
                    ? 'bg-white text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Client portal view
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('studio')}
                className={`rounded-full px-4 py-1.5 text-xs transition-colors cursor-pointer ${
                  activeTab === 'studio'
                    ? 'bg-white text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Freelancer cockpit
              </button>
            </div>

            {/* The Live Workspace UI */}
            <div
              data-ui="true"
              className="rounded-2xl bg-[#0d0f17] overflow-hidden"
            >
              {/* Chrome top bar */}
              <div className="bg-[#090b11] px-5 py-3.5 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2.5">
                  <div className="flex gap-1.5">
                    <span className="size-2.5 rounded-full bg-rose-500/70" />
                    <span className="size-2.5 rounded-full bg-amber-500/70" />
                    <span className="size-2.5 rounded-full bg-emerald-500/70" />
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#12141f] px-3 py-1 rounded-md text-slate-300">
                    <Lock className="w-3 h-3 text-emerald-400" />
                    <span>frevio.cloud/p/acme-brand</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-400" />
                  <span className="text-emerald-400 font-medium">
                    {activeTab === 'client' ? 'No account required' : 'Studio mode'}
                  </span>
                </div>
              </div>

              {/* Workspace Body */}
              {activeTab === 'client' ? (
                <div className="p-6 sm:p-8 space-y-6">
                  {/* Title & Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 bg-[#0d0f17]">
                    <div>
                      <span className="text-xs text-slate-400">Acme Corporation</span>
                      <h2 className="text-2xl font-semibold text-white mt-0.5">
                        Brand Identity &amp; Web Platform
                      </h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                        Sprint 3 Active · 75% Complete
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="rounded-xl bg-[#121420] p-5 space-y-3">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>Milestones finished</span>
                      <span className="text-white font-medium">3 of 4 delivered</span>
                    </div>
                    <div className="h-2 w-full bg-[#1b1e30] rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: '75%' }} />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Discovery Phase</div>
                      <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Wireframe Approval</div>
                      <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> UI Architecture</div>
                      <div className="text-white flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald-400" /> Final Prototyping</div>
                    </div>
                  </div>

                  {/* Deliverable Review & Payment Card */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Deliverable sign-off */}
                    <div className="rounded-xl bg-[#121420] p-5 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                          <span className="text-emerald-400 font-medium">Deliverable for Review</span>
                          <span>Today 2:15 PM</span>
                        </div>
                        <h3 className="text-base font-medium text-white">
                          Figma Interactive Design Tokens v2.4
                        </h3>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          Refactored navigation, responsive checkout breakpoints, and icon assets ready for client sign-off.
                        </p>
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setApproved(!approved)}
                          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                            approved
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-white hover:bg-slate-200 text-slate-950'
                          }`}
                        >
                          {approved ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Approved by client</span>
                            </>
                          ) : (
                            <span>1-Click approve deliverable</span>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Milestone invoice */}
                    <div className="rounded-xl bg-[#121420] p-5 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                          <span>Milestone Payment</span>
                          <span>INV-2026-084</span>
                        </div>
                        <div className="text-3xl font-medium text-white">$3,500.00</div>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          Tied directly to Sprint 3 sign-off. Settled via Stripe directly to studio bank account.
                        </p>
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => setPaid(!paid)}
                          className={`w-full py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                            paid
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-white hover:bg-slate-200 text-slate-950'
                          }`}
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>{paid ? 'Payment settled via Stripe' : 'Simulate Stripe payment'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 sm:p-8 space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-white">Freelancer Workspace</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      IDE heartbeat active · 16.5 logged hours · Connected to Stripe
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="rounded-xl bg-[#121420] p-4">
                      <div className="text-slate-400">Tracked Time</div>
                      <div className="text-2xl font-medium text-white mt-1">16.5 hrs</div>
                      <div className="text-emerald-400 mt-1">VS Code heartbeat</div>
                    </div>
                    <div className="rounded-xl bg-[#121420] p-4">
                      <div className="text-slate-400">Unbilled Balance</div>
                      <div className="text-2xl font-medium text-white mt-1">$4,850.00</div>
                      <div className="text-slate-400 mt-1">Ready for invoice</div>
                    </div>
                    <div className="rounded-xl bg-[#121420] p-4">
                      <div className="text-slate-400">Client Portal Views</div>
                      <div className="text-2xl font-medium text-white mt-1">14 views</div>
                      <div className="text-slate-400 mt-1">Client active today</div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-[#121420] p-5 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-white">Weekly client briefing ready</div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Generated from this week&apos;s GitHub commits and deliverable uploads.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-slate-200 transition-colors"
                    >
                      Publish update
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── 3. Contrast: The Reality of Client Work ── */}
        <section id="contrast" className="space-y-10">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-3xl sm:text-5xl font-medium text-white tracking-tight leading-tight">
              Scattered apps vs. one clear link.
            </h2>
            <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed">
              When client communications are spread across messaging apps, email threads, and folder links, everyone wastes time chasing status.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-[#0f111a] p-8 space-y-6">
              <div>
                <span className="text-xs text-rose-400 font-medium">The fragmented standard</span>
                <h3 className="text-xl font-medium text-white mt-1">4+ apps open every day</h3>
              </div>
              <ul className="space-y-3 text-sm text-slate-300 font-light">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">×</span>
                  <span>Feedback buried across 20-reply email chains and Slack DMs</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">×</span>
                  <span>Clients constantly asking &ldquo;where are we on the checkout page?&rdquo;</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">×</span>
                  <span>Invoices sent as separate attachments with zero delivery context</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-[#0f151c] p-8 space-y-6">
              <div>
                <span className="text-xs text-emerald-400 font-medium">The Frevio protocol</span>
                <h3 className="text-xl font-medium text-white mt-1">1 permanent project link</h3>
              </div>
              <ul className="space-y-3 text-sm text-slate-300 font-light">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>Clients open their portal via 6-digit passcode without signing up</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>Clear milestone progress bars show exactly what is finished</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>Deliverables approved with one click and invoices paid via Stripe</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── 4. Connected Toolchain ── */}
        <section className="space-y-8">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl sm:text-4xl font-medium text-white tracking-tight">
              Fits the tools your clients already know.
            </h2>
            <p className="text-sm sm:text-base text-slate-300 font-light">
              Frevio connects with your work environment rather than asking you to change how you design or build.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="rounded-xl bg-[#0f111a] p-5 text-center space-y-3">
              <StripeIcon className="w-6 h-6 mx-auto" />
              <div className="text-xs font-medium text-white">Stripe</div>
              <div className="text-[11px] text-slate-400">Direct payouts</div>
            </div>

            <div className="rounded-xl bg-[#0f111a] p-5 text-center space-y-3">
              <FigmaIcon className="w-6 h-6 mx-auto" />
              <div className="text-xs font-medium text-white">Figma</div>
              <div className="text-[11px] text-slate-400">Live prototypes</div>
            </div>

            <div className="rounded-xl bg-[#0f111a] p-5 text-center space-y-3">
              <GitHubIcon className="w-6 h-6 mx-auto text-white" />
              <div className="text-xs font-medium text-white">GitHub</div>
              <div className="text-[11px] text-slate-400">Code handoff</div>
            </div>

            <div className="rounded-xl bg-[#0f111a] p-5 text-center space-y-3">
              <GoogleDriveIcon className="w-6 h-6 mx-auto" />
              <div className="text-xs font-medium text-white">Google Drive</div>
              <div className="text-[11px] text-slate-400">Asset delivery</div>
            </div>

            <div className="rounded-xl bg-[#0f111a] p-5 text-center space-y-3">
              <VSCodeIcon className="w-6 h-6 mx-auto" />
              <div className="text-xs font-medium text-white">VS Code</div>
              <div className="text-[11px] text-slate-400">Heartbeat tracking</div>
            </div>
          </div>
        </section>

        {/* ── 5. Simple Pricing ── */}
        <section id="pricing" className="space-y-10">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-3xl sm:text-5xl font-medium text-white tracking-tight">
              Simple pricing as your work grows.
            </h2>
            <p className="text-base text-slate-300 font-light">
              Start completely free with 2 active projects. Upgrade only when your studio expands.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                !annual ? 'bg-white text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly billing
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                annual ? 'bg-white text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Annual billing</span>
              <span className="text-[11px] text-emerald-400 font-medium">save {ANNUAL_DISCOUNT_PCT}%</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Free */}
            <div className="rounded-2xl bg-[#0d0f17] p-6 flex flex-col justify-between space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white">Free</h3>
                <div className="text-xs text-slate-400 mt-1">Independent freelancers</div>
                <div className="text-3xl font-medium text-white mt-4">$0</div>
                <div className="text-xs text-slate-400">forever</div>

                <ul className="space-y-2.5 text-xs text-slate-300 font-light mt-6">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Up to 2 active projects</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Client portal link</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Deliverable approvals</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Stripe checkout invoices</li>
                </ul>
              </div>

              <Link
                href={signupHref}
                className="w-full py-2.5 rounded-lg bg-white text-slate-950 text-xs font-semibold text-center hover:bg-slate-200 transition-colors"
              >
                Start free
              </Link>
            </div>

            {/* Pro */}
            <div className="rounded-2xl bg-[#121422] p-6 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-white">Pro</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">
                    Most popular
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1">Full-time freelancers</div>
                <div className="text-3xl font-medium text-white mt-4">${proPrice}</div>
                <div className="text-xs text-slate-400">{annual ? 'per month billed annually' : 'per month'}</div>

                <ul className="space-y-2.5 text-xs text-slate-300 font-light mt-6">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Unlimited active projects</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Custom studio branding</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Remove Frevio badge</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Automated email summaries</li>
                </ul>
              </div>

              <Link
                href={signupHref}
                className="w-full py-2.5 rounded-lg bg-white text-slate-950 text-xs font-semibold text-center hover:bg-slate-200 transition-colors"
              >
                Start Pro
              </Link>
            </div>

            {/* Agency */}
            <div className="rounded-2xl bg-[#0d0f17] p-6 flex flex-col justify-between space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white">Agency</h3>
                <div className="text-xs text-slate-400 mt-1">Creative teams &amp; studios</div>
                <div className="text-3xl font-medium text-white mt-4">${agencyPrice}</div>
                <div className="text-xs text-slate-400">{annual ? 'per month billed annually' : 'per month'}</div>

                <ul className="space-y-2.5 text-xs text-slate-300 font-light mt-6">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Up to 5 team members</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Multi-project pods</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Workspace switcher</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Team member permissions</li>
                </ul>
              </div>

              <Link
                href={signupHref}
                className="w-full py-2.5 rounded-lg bg-[#1a1d2b] text-white text-xs font-semibold text-center hover:bg-[#222638] transition-colors"
              >
                Start Agency
              </Link>
            </div>

            {/* Scale */}
            <div className="rounded-2xl bg-[#0d0f17] p-6 flex flex-col justify-between space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white">Scale</h3>
                <div className="text-xs text-slate-400 mt-1">High volume agencies</div>
                <div className="text-3xl font-medium text-white mt-4">${scalePrice}</div>
                <div className="text-xs text-slate-400">{annual ? 'per month billed annually' : 'per month'}</div>

                <ul className="space-y-2.5 text-xs text-slate-300 font-light mt-6">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Up to 25 team members</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Custom domain CNAME</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Complete white-label</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Radar dashboard alerts</li>
                </ul>
              </div>

              <Link
                href={signupHref}
                className="w-full py-2.5 rounded-lg bg-[#1a1d2b] text-white text-xs font-semibold text-center hover:bg-[#222638] transition-colors"
              >
                Start Scale
              </Link>
            </div>
          </div>
        </section>

        {/* ── 6. FAQ: Reading Text Layout (taste-skill format) ── */}
        <section id="faq" className="space-y-8">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl sm:text-4xl font-medium text-white tracking-tight">
              Frequently answered questions.
            </h2>
            <p className="text-sm text-slate-400 font-light">
              Clear answers on how Frevio works for independent freelancers and clients.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
            <div className="space-y-2">
              <h3 className="font-medium text-white">Do clients need to create an account?</h3>
              <p className="text-slate-300 font-light leading-relaxed">
                No. Clients do not need to register, invent a password, or download software. They access their private project workspace directly through a 6-digit passcode.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium text-white">What can clients see in their portal?</h3>
              <p className="text-slate-300 font-light leading-relaxed">
                Clients see a clean roadmap of their project: milestone progress, weekly recaps, deliverables awaiting approval, and invoices. Internal timer logs and private notes stay hidden.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium text-white">How does Stripe payment settlement work?</h3>
              <p className="text-slate-300 font-light leading-relaxed">
                Invoices connect directly to completed project milestones. Clients pay online via Apple Pay or credit card through Stripe Checkout, and funds route straight to your bank account.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium text-white">What happens after the free 2 projects?</h3>
              <p className="text-slate-300 font-light leading-relaxed">
                The free plan is free forever for up to 2 active projects. When you take on a 3rd concurrent project, upgrade to Pro for $19/mo. If projects finish and archive, they free up your active allowance.
              </p>
            </div>
          </div>
        </section>

        {/* ── 7. Closing Action: A Plain Sentence, One Action ── */}
        <section className="text-center py-12 space-y-6">
          <h2 className="text-3xl sm:text-5xl font-medium text-white tracking-tight">
            Give every client project a clearer home.
          </h2>
          <p className="text-base text-slate-300 font-light max-w-md mx-auto leading-relaxed">
            Start with your first project, invite your client, and experience an organized workflow.
          </p>
          <div>
            <Link
              href={signupHref}
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-slate-950 hover:bg-slate-200 transition-colors"
            >
              <span>Create your portal free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* ── 8. Minimal Clean Footer ── */}
      <footer className="max-w-6xl mx-auto px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Logo className="w-4 h-4 text-white" />
          <span className="font-semibold text-white">Frevio</span>
          <span className="text-slate-600">·</span>
          <span>Client workspace for freelancers and studios</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <span className="text-slate-600">·</span>
          <span>© {new Date().getFullYear()} Frevio Inc.</span>
        </div>
      </footer>
    </div>
  )
}
