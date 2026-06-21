import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  ArrowRight, Check, X, Play, Mail, Bell, Sparkles,
  FolderKanban, FileText, MessageSquare, FileSignature, Globe,
  CreditCard, Lock, Palette, ShieldCheck
} from 'lucide-react'
import { FrevioDashboard } from '@/components/landing/frevio-dashboard'
import { FrevioClientPortal } from '@/components/landing/frevio-client-portal'
import { LandingPricing } from '@/components/landing/landing-pricing'
import { LandingFaq } from '@/components/landing/landing-faq'
import { DemoButton } from '@/components/landing/demo-modal'
import { Logo } from '@/components/ui/logo'
import { ThemeToggle } from '@/components/landing/theme-toggle'

const ACCENT = '#6C4CFD'
const card = 'rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.01] shadow-sm dark:shadow-[0_4px_30px_rgba(0,0,0,0.4)] transition-all duration-300'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user
  const signupHref = isLoggedIn ? '/dashboard' : '/auth/login?mode=signup'

  const { data: promoData } = await supabase
    .from('launch_promo')
    .select('claimed, cap')
    .eq('id', 1)
    .maybeSingle()
  const remaining = promoData ? Math.max(0, promoData.cap - promoData.claimed) : null

  const dotGridPattern = {
    backgroundImage: 'radial-gradient(rgba(108, 76, 253, 0.05) 1px, transparent 1px)',
    backgroundSize: '24px 24px'
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030303] font-sans text-slate-800 dark:text-slate-100 antialiased selection:bg-[#6C4CFD]/30 selection:text-white transition-colors duration-300">

      {/* ─────────────── TOP PROMO STRIP ─────────────── */}
      {remaining !== null && remaining > 0 && (
        <div className="bg-[#6C4CFD] py-2.5 px-4 text-center text-xs font-semibold text-white relative z-50 flex items-center justify-center gap-2 shadow-md">
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-yellow-300" />
          <span>
            🔥 Launch Promo: First 50 signups get <span className="underline font-bold">1 Month of Frevio Pro FREE</span> — only <span className="bg-white text-[#6C4CFD] px-1.5 py-0.5 rounded-md font-bold text-[10px] font-mono">{remaining}</span> spots left!
          </span>
          <Link href={signupHref} className="hover:underline flex items-center gap-0.5 font-bold ml-1.5 text-indigo-100">
            Claim Spot <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* ─────────────── NAVBAR ─────────────── */}
      <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-white/5 bg-white/75 dark:bg-[#030303]/75 backdrop-blur-xl transition-colors">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo className="w-7 h-7" />
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Frevio</span>
          </Link>

          <div className="hidden items-center gap-9 text-sm font-medium text-slate-500 dark:text-slate-400 md:flex">
            <Link href="/" className="transition-colors hover:text-slate-900 dark:hover:text-white">Home</Link>
            <a href="#features" className="transition-colors hover:text-slate-900 dark:hover:text-white">Features</a>
            <a href="#how" className="transition-colors hover:text-slate-900 dark:hover:text-white">How it Works</a>
            <a href="#pricing" className="transition-colors hover:text-slate-900 dark:hover:text-white">Pricing</a>
            <a href="#faq" className="transition-colors hover:text-slate-900 dark:hover:text-white">FAQ</a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link href={isLoggedIn ? '/dashboard' : '/auth/login'} className="hidden rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 transition-colors dark:hover:text-white sm:block">
              {isLoggedIn ? 'Dashboard' : 'Log In'}
            </Link>
            <Link
              href={signupHref}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: ACCENT }}
            >
              Start Free
            </Link>
          </div>
        </nav>
      </header>

      {/* ─────────────── HERO (The Hook) ─────────────── */}
      <section className="relative overflow-hidden border-b border-slate-200 dark:border-white/5 py-20 lg:py-28" style={dotGridPattern}>
        {/* Glowing background lights */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-[#6C4CFD]/5 dark:bg-[#6C4CFD]/8 blur-[130px] pointer-events-none" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-12 lg:gap-10">
          {/* left text */}
          <div className="animate-fade-in lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/[0.03] px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: ACCENT }} />
              Client Portals for Modern Freelance Studios
            </div>

            <h1 className="mt-6 text-balance text-4xl font-bold leading-[1.08] tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
              Stop answering{' '}
              <span className="relative whitespace-nowrap text-[#6C4CFD] dark:text-[#B7A6FF]">&ldquo;Any updates?&rdquo;</span>{' '}
              texts at 11 PM.
            </h1>

            <p className="mt-6 text-base leading-relaxed text-slate-600 dark:text-slate-400 sm:text-lg">
              Frevio gives your clients a single, passcode-locked dashboard to track project milestones, sign agreements, and pay invoices via Stripe. No client registrations required.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={signupHref}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: ACCENT, boxShadow: '0 14px 40px -12px rgba(108,76,253,0.4)' }}
              >
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Link>
              <DemoButton className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-6 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-200/50 dark:hover:bg-white/10">
                <Play className="h-4 w-4" /> See the live portal demo
              </DemoButton>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
              {['No credit card required', 'Free forever tier', 'Set up in 60 seconds'].map(t => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-500" /> {t}
                </span>
              ))}
            </div>
          </div>

          {/* right mockup */}
          <div className="relative animate-fade-in lg:col-span-6 lg:pl-4">
            <div className="animate-float">
              <FrevioDashboard className="shadow-lg dark:shadow-[0_30px_90px_-30px_rgba(0,0,0,0.8)]" />
            </div>

            {/* floating email card */}
            <div className="animate-float-slow absolute -left-4 -top-6 hidden w-60 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#0B0B12] p-4 shadow-lg dark:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] sm:block">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${ACCENT}20` }}>
                  <Mail className="h-4 w-4" style={{ color: '#6C4CFD' }} />
                </span>
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">New update sent</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Acme Corp · just now</div>
                </div>
              </div>
            </div>

            {/* floating progress card */}
            <div className="animate-float absolute -bottom-6 -right-2 hidden w-56 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#0B0B12] p-4 shadow-lg dark:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] sm:block">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
                <span>Project progress</span><span style={{ color: '#6C4CFD' }}>72%</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                <div className="h-full rounded-full" style={{ width: '72%', background: ACCENT }} />
              </div>
              <div className="mt-2 text-[11px] text-slate-500">On track · 3 milestones left</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── TRUST BAR ─────────────── */}
      <section className="border-b border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-[#08080C] py-10 transition-colors">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-12 gap-y-4 px-6 text-sm font-medium text-slate-600 dark:text-slate-400">
          {[
            { icon: CreditCard, label: 'Direct Stripe Payments' },
            { icon: Lock, label: 'Secure Passcode Gates' },
            { icon: Palette, label: 'Custom Client Branding' },
            { icon: ShieldCheck, label: 'Live Client Feedback' },
          ].map(({ icon: Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-2">
              <Icon className="h-4.5 w-4.5 text-slate-500 dark:text-slate-400" /> {label}
            </span>
          ))}
        </div>
      </section>

      {/* ─────────────── THE CHAOS (Problem) ─────────────── */}
      <section className="relative border-b border-slate-200 dark:border-white/5 bg-white dark:bg-[#0E0E16] py-24 sm:py-32 overflow-hidden transition-colors" style={dotGridPattern}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-40">
          <div className="absolute top-10 left-1/4 h-72 w-72 rounded-full blur-[140px]" style={{ background: `${ACCENT}15` }} />
          <div className="absolute bottom-10 right-1/4 h-72 w-72 rounded-full bg-emerald-500/5 blur-[140px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#6C4CFD] dark:text-[#B7A6FF]">The Admin Burden</span>
            <h2 className="mx-auto max-w-2xl text-balance text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              Every freelancer knows this friction.
            </h2>
            <p className="mx-auto max-w-lg text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              Project administration and status tracking shouldn&apos;t consume hours of your billable week.
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-2 max-w-5xl mx-auto">
            {/* The Old Way */}
            <div className="group rounded-3xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.01] p-8 sm:p-10 transition-all duration-300 hover:border-rose-500/20 hover:bg-rose-50 dark:hover:bg-rose-950/[0.04]">
              <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider border border-rose-500/20">
                <X className="h-3.5 w-3.5" /> Scattered Slack &amp; Email
              </div>

              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-6 mb-4">
                Hours spent chasing and repeating
              </h3>

              <ul className="space-y-4">
                {[
                  'Answering the same "Any updates?" texts on three channels',
                  'Digging through old threads to locate feedback or design files',
                  'Manually copy-pasting hour logs into invoice drafts',
                  'Chasing down client signatures on separate document apps',
                  'Explaining payment terms manually without direct gateways',
                ].map(t => (
                  <li key={t} className="flex items-start gap-3.5 text-sm text-slate-600 dark:text-slate-400">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/25">
                      <X className="h-3 w-3" />
                    </span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* The Frevio Way */}
            <div className="group rounded-3xl border border-indigo-200/50 dark:border-white/10 bg-indigo-50/20 dark:bg-white/[0.03] p-8 sm:p-10 shadow-sm dark:shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/[0.04] hover:scale-[1.01] relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: ACCENT }} />

              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider border border-emerald-500/20">
                <Check className="h-3.5 w-3.5" /> Branded Portal
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-6 mb-4">
                A single link of truth for clients
              </h3>

              <ul className="space-y-4">
                {[
                  'Clients open one secure URL to self-serve progress updates',
                  'Time entries convert directly into Stripe invoices in one click',
                  'Contracts, deliverable files, and update histories in one place',
                  'Weekly email digests reach clients automatically',
                  'Your studio looks organized, premium, and fully professional',
                ].map(t => (
                  <li key={t} className="flex items-start gap-3.5 text-sm text-slate-700 dark:text-slate-300">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/25">
                      <Check className="h-3 w-3" />
                    </span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── CLIENT VIEW (The Solution) ─────────────── */}
      <section className="bg-slate-50 dark:bg-[#030303] border-b border-slate-200 dark:border-white/5 py-24 sm:py-32 transition-colors">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-12">

            {/* left column */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#6C4CFD] dark:text-[#B7A6FF]">Zero Portal Friction</span>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                A secure client portal they don&apos;t need to log in to.
              </h2>
              <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400">
                Password reset loops and login screens kill project momentum. Frevio uses passcode gating. Your clients access their project page using a clean, simple code.
              </p>

              <div className="space-y-4 pt-2">
                {[
                  { title: 'Passcode Secured', desc: 'Secure project tracking using client-specific codes.' },
                  { title: 'Self-Serve Billing', desc: 'Clients review hourly sheets and pay invoices on the fly.' },
                  { title: 'Custom Color Themes', desc: 'Portals carry your studio branding, accent theme, and logo.' }
                ].map(item => (
                  <div key={item.title} className="flex gap-3">
                    <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-500/20">
                      <Check className="h-3.5 w-3.5" style={{ color: '#6C4CFD' }} />
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.title}</h4>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* right column (Client Portal mockup render) */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.01] p-4 sm:p-6 shadow-sm dark:shadow-2xl">
                <FrevioClientPortal />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── HOW IT WORKS (Three Steps) ─────────────── */}
      <section id="how" className="border-b border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-[#08080C] py-24 sm:py-32 transition-colors">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Lifecycle</span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Three simple steps to trust
            </h2>
            <p className="mx-auto max-w-md text-sm text-slate-600 dark:text-slate-400">
              Frevio wraps your tracking, client updates, and invoice gateways into one loop.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              { n: '01', t: 'Spin up a portal', d: 'Enter the client name, project details, and hourly rate. Frevio outputs a passcode link instantly.' },
              { n: '02', t: 'Log time & ship updates', d: 'Log hours directly using our integrated stopwatch, and type quick timeline update logs.' },
              { n: '03', t: 'Clients pay & self-serve', d: 'Convert unbilled logs to Stripe invoices with one click. Invoices render on the portal ready for checkout.' },
            ].map(s => (
              <div key={s.n} className={`${card} p-8 hover:border-slate-350 dark:hover:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.02]`}>
                <span className="text-sm font-bold tracking-widest text-[#6C4CFD] dark:text-[#B7A6FF]">{s.n}</span>
                <h3 className="mt-4 text-lg font-bold text-slate-800 dark:text-slate-200">{s.t}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── EMAIL DIGESTS ─────────────── */}
      <section className="bg-slate-50 dark:bg-[#030303] border-b border-slate-200 dark:border-white/5 py-24 sm:py-32 transition-colors">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-12">

          {/* email preview column */}
          <div className="order-2 lg:order-1 lg:col-span-5">
            <div className="mx-auto max-w-md overflow-hidden rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#0B0B12] shadow-sm dark:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)]">
              <div className="px-6 py-5 text-white" style={{ background: ACCENT }}>
                <div className="text-[10px] font-bold uppercase tracking-wider text-white/80">Weekly progress summary</div>
                <div className="mt-1 text-base font-semibold">Project: Acme Web Platform</div>
              </div>
              <div className="space-y-4 p-6">
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Hi Maya, here is the summary of progress updates logged this week:</p>
                {['Database schemas successfully migrated', 'Checkout flow webhook tests passed', 'Client settings page polished'].map(b => (
                  <div key={b} className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full" style={{ background: `${ACCENT}20` }}><Check className="h-3 w-3" style={{ color: '#6C4CFD' }} /></span>
                    <span>{b}</span>
                  </div>
                ))}
                <div className="pt-2">
                  <span className="inline-block rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-sm" style={{ background: ACCENT }}>View Branded Portal →</span>
                </div>
              </div>
            </div>
          </div>

          {/* text description column */}
          <div className="order-1 lg:order-2 lg:col-span-7 space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-[#6C4CFD] dark:text-[#B7A6FF]">Automation</span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Updates clients actually read.</h2>
            <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400">
              When you post progress bullets in your project log, Frevio formats and emails HTML digest summaries to your client&apos;s inbox. A single click logs them straight in.
            </p>
            <ul className="grid grid-cols-2 gap-4 pt-2">
              {['Beautiful HTML layout', 'White-labeled emails', 'Mobile optimized cards', 'Instant passcode routing'].map(t => (
                <li key={t} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
                  <Check className="h-4 w-4 text-emerald-500" /> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ─────────────── FEATURES GRID (Pillars) ─────────────── */}
      <section id="features" className="bg-slate-50 dark:bg-[#030303] border-b border-slate-200 dark:border-white/5 py-24 sm:py-32 transition-colors" style={dotGridPattern}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Suite</span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Built for the business of one.
            </h2>
            <p className="mx-auto max-w-lg text-sm text-slate-600 dark:text-slate-400">
              No bloating sprints or team permission configuration matrices. Just the key assets needed to secure client approvals.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Bell, t: 'Timeline Updates', d: 'Log bullet points and trigger automated HTML email updates.' },
              { icon: FileText, t: 'Stripe Billing', d: 'Import hourly logs into Stripe invoices to collect credit card checkouts.' },
              { icon: FolderKanban, t: 'Client Checklists', d: 'Assign tasks to clients and keep milestones aligned.' },
              { icon: MessageSquare, t: 'Update Comments', d: 'Enable structured comments directly underneath timeline cards.' },
              { icon: FileSignature, t: 'Digital Contracts', d: 'Draft agreements, collect signatures, and download countersigned PDFs.' },
              { icon: Globe, t: 'Secure Gates', d: 'Obfuscated, client-specific access passcode cookie verification.' },
            ].map(f => (
              <div key={f.t} className={`${card} p-7 hover:border-indigo-500/20 hover:bg-slate-100 dark:hover:bg-white/[0.02] hover:shadow-md`}>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl animate-none" style={{ background: `${ACCENT}15` }}>
                  <f.icon className="h-5 w-5" style={{ color: '#6C4CFD' }} />
                </span>
                <h3 className="mt-5 text-base font-bold text-slate-800 dark:text-slate-200">{f.t}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── LAUNCH FEEDBACK PROGRAM ─────────────── */}
      <section className="border-b border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-[#0E0E16] py-24 sm:py-32 relative overflow-hidden transition-colors" style={dotGridPattern}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-[#6C4CFD]/5 blur-[120px] pointer-events-none" />

        <div className="relative mx-auto max-w-3xl px-6 text-center space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-3 py-1 text-xs font-semibold text-[#6C4CFD] dark:text-[#B7A6FF] mx-auto shadow-sm">
            <Sparkles className="h-3.5 w-3.5" /> Early Adopter Program
          </span>

          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            We are building this for independent studios.
          </h2>

          <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400">
            Frevio is designed to resolve freelancer admin overhead. To get feedback and shape the product, the first <span className="font-bold text-slate-900 dark:text-white bg-[#6C4CFD]/15 dark:bg-[#6C4CFD]/30 px-1.5 py-0.5 rounded">50 signups get 1 month of Frevio Pro free.</span>
          </p>

          <div className="pt-2">
            <Link
              href={signupHref}
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: ACCENT, boxShadow: '0 14px 40px -12px rgba(108,76,253,0.4)' }}
            >
              Claim your free Pro spot <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────── PRICING ─────────────── */}
      <section id="pricing" className="bg-slate-50 dark:bg-[#030303] border-b border-slate-200 dark:border-white/5 py-24 sm:py-32 transition-colors">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center space-y-3 mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Tier Matrix</span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Simple pricing.</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Start free. Upgrade only when you run a larger client base.</p>
          </div>
          <LandingPricing />
        </div>
      </section>

      {/* ─────────────── FAQ ─────────────── */}
      <section id="faq" className="bg-slate-100/50 dark:bg-[#08080C] border-b border-slate-200 dark:border-white/5 py-24 sm:py-32 transition-colors">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center space-y-3 mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Help</span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Frequently asked questions</h2>
          </div>
          <LandingFaq />
        </div>
      </section>

      {/* ─────────────── FINAL CTA (Midnight Glow) ─────────────── */}
      <section className="bg-slate-50 dark:bg-[#030303] px-6 py-24 transition-colors">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-slate-100/50 dark:bg-[#09090E] px-8 py-24 text-center border border-slate-200 dark:border-white/5">
          <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full opacity-35 blur-[120px]" style={{ background: ACCENT }} />

          <div className="relative max-w-xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Ready to stop answering &ldquo;Any updates?&rdquo;
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Join independent builders who secure logs, publish portals, and automate invoicing via Frevio.
            </p>
            <div className="pt-2 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href={signupHref} className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02]" style={{ background: ACCENT }}>
                Start Free <ArrowRight className="h-4 w-4" />
              </Link>
              <DemoButton className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-6 py-3.5 text-sm font-semibold text-slate-800 dark:text-white transition-colors hover:bg-slate-200/50 dark:hover:bg-white/10">
                <Play className="h-4 w-4" /> See portal in action
              </DemoButton>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── FOOTER ─────────────── */}
      <footer className="border-t border-slate-200 dark:border-white/5 py-16 bg-slate-50 dark:bg-[#030303] transition-colors">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <Logo className="w-7 h-7" />
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Frevio</span>
            </Link>
            <p className="mt-4 max-w-xs text-xs leading-relaxed text-slate-600 dark:text-slate-500 font-medium">Professional client pages and automated invoicing pipelines for modern freelancers.</p>
          </div>
          {[
            { h: 'Product', links: [['Features', '#features'], ['Pricing', '#pricing'], ['FAQ', '#faq']] },
            { h: 'Resources', links: [['Get started', signupHref], ['Log in', '/auth/login']] },
            { h: 'Company', links: [['Privacy', '/privacy'], ['Terms', '/terms']] },
          ].map(col => (
            <div key={col.h}>
              <div className="text-xs font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider">{col.h}</div>
              <ul className="mt-4 space-y-3 text-xs text-slate-500 dark:text-slate-500 font-medium">
                {col.links.map(([label, href]) => (
                  <li key={label}><Link href={href} className="transition-colors hover:text-slate-900 dark:hover:text-white">{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-12 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-slate-200 dark:border-white/5 px-6 pt-8 text-xs text-slate-600 sm:flex-row">
          <span>© {new Date().getFullYear()} Frevio. All rights reserved.</span>
          <div className="flex gap-5 font-semibold">
            <a href="#" className="transition-colors hover:text-slate-400 dark:hover:text-slate-400">Twitter</a>
            <a href="#" className="transition-colors hover:text-slate-400 dark:hover:text-slate-400">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
