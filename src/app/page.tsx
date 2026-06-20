import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  ArrowRight, Check, X, Play, Mail, Bell,
  FolderKanban, FileText, MessageSquare, FileSignature, Globe, Star,
} from 'lucide-react'
import { FrevioDashboard } from '@/components/landing/frevio-dashboard'
import { LandingPricing } from '@/components/landing/landing-pricing'
import { LandingFaq } from '@/components/landing/landing-faq'

const ACCENT = '#6C4CFD'
const card = 'rounded-3xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_40px_-24px_rgba(15,23,42,0.12)]'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user
  const signupHref = isLoggedIn ? '/dashboard' : '/auth/login?mode=signup'

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 antialiased">

      {/* ─────────────── NAVBAR ─────────────── */}
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: ACCENT }}>
              <span className="h-3 w-3 rounded-sm bg-white" />
            </span>
            <span className="text-lg font-semibold tracking-tight">Frevio</span>
          </Link>

          <div className="hidden items-center gap-9 text-sm font-medium text-slate-600 md:flex">
            <a href="#features" className="transition-colors hover:text-slate-900">Features</a>
            <a href="#how" className="transition-colors hover:text-slate-900">How it Works</a>
            <a href="#pricing" className="transition-colors hover:text-slate-900">Pricing</a>
            <a href="#faq" className="transition-colors hover:text-slate-900">FAQ</a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href={isLoggedIn ? '/dashboard' : '/auth/login'} className="hidden rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 sm:block">
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

      {/* ─────────────── HERO ─────────────── */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-20 lg:grid-cols-2 lg:gap-10 lg:py-28">
          {/* left */}
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: ACCENT }} />
              Client Portal for Freelancers &amp; Agencies
            </div>

            <h1 className="mt-6 text-balance text-5xl font-bold leading-[1.05] tracking-tight text-slate-900 sm:text-6xl">
              Stop answering{' '}
              <span className="relative whitespace-nowrap" style={{ color: ACCENT }}>&ldquo;Any update?&rdquo;</span>{' '}
              ever again.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-500">
              Give every client a beautiful branded portal with automatic updates, invoices, files
              and progress tracking — so you can focus on building, not explaining.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={signupHref}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: ACCENT, boxShadow: '0 14px 40px -12px rgba(108,76,253,0.6)' }}
              >
                Start Free — It&apos;s Free Forever <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#how" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
                <Play className="h-4 w-4" /> Watch 60s Demo
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
              {['No credit card required', 'Setup in under 60 seconds', 'Cancel anytime'].map(t => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4" style={{ color: ACCENT }} /> {t}
                </span>
              ))}
            </div>
          </div>

          {/* right — floating mockup */}
          <div className="relative animate-fade-in lg:pl-6">
            <div className="animate-float">
              <FrevioDashboard className="shadow-[0_40px_120px_-40px_rgba(15,23,42,0.45)]" />
            </div>

            {/* floating email card */}
            <div className="animate-float-slow absolute -left-4 -top-6 hidden w-60 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.3)] sm:block">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${ACCENT}1A` }}>
                  <Mail className="h-4 w-4" style={{ color: ACCENT }} />
                </span>
                <div>
                  <div className="text-xs font-semibold text-slate-900">New update sent</div>
                  <div className="text-[11px] text-slate-400">Acme Corp · just now</div>
                </div>
              </div>
            </div>

            {/* floating progress card */}
            <div className="animate-float absolute -bottom-6 -right-2 hidden w-56 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.3)] sm:block">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-900">
                <span>Project progress</span><span style={{ color: ACCENT }}>72%</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full" style={{ width: '72%', background: ACCENT }} />
              </div>
              <div className="mt-2 text-[11px] text-slate-400">On track · 3 milestones left</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── TRUST BAR ─────────────── */}
      <section className="border-y border-slate-100 bg-slate-50/50 py-12">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-medium text-slate-400">Trusted by freelancers &amp; agencies worldwide</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {['Acme', 'Vision Labs', 'Startly', 'Northwind', 'Layers', 'RemoteBase'].map(name => (
              <span key={name} className="text-lg font-semibold tracking-tight text-slate-300">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── PROBLEM ─────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-28">
        <h2 className="mx-auto max-w-2xl text-balance text-center text-4xl font-bold tracking-tight sm:text-5xl">
          Every freelancer knows this&hellip;
        </h2>

        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          {/* without */}
          <div className="rounded-3xl border border-rose-100 bg-rose-50/60 p-8 sm:p-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-rose-600 shadow-sm">
              <X className="h-3.5 w-3.5" /> Without Frevio
            </div>
            <ul className="mt-7 space-y-4">
              {['Endless "Any update?" messages', 'Files scattered everywhere', 'Lost email threads', 'Manual status reports', 'Confused, anxious clients'].map(t => (
                <li key={t} className="flex items-start gap-3 text-[15px] text-slate-600">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-500"><X className="h-3 w-3" /></span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* with */}
          <div className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-8 sm:p-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-600 shadow-sm">
              <Check className="h-3.5 w-3.5" /> With Frevio
            </div>
            <ul className="mt-7 space-y-4">
              {['A beautiful client portal', 'Automatic update emails', 'Every file in one place', 'Progress always visible', 'Calm, happy clients'].map(t => (
                <li key={t} className="flex items-start gap-3 text-[15px] text-slate-700">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><Check className="h-3 w-3" /></span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ─────────────── HOW IT WORKS ─────────────── */}
      <section id="how" className="border-y border-slate-100 bg-slate-50/50 py-28">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mx-auto max-w-2xl text-balance text-center text-4xl font-bold tracking-tight sm:text-5xl">
            Three simple steps to calmer client work
          </h2>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              { n: '01', t: 'Create a project', d: 'Add your client and set expectations in under a minute.' },
              { n: '02', t: 'Share updates', d: 'Post progress, files and notes as the work moves forward.' },
              { n: '03', t: 'Client stays informed', d: 'Automatic branded emails and a portal they can open anytime.' },
            ].map(s => (
              <div key={s.n} className={`${card} p-8 transition-all duration-300 hover:-translate-y-1`}>
                <span className="text-sm font-bold tracking-widest" style={{ color: ACCENT }}>{s.n}</span>
                <h3 className="mt-4 text-xl font-semibold">{s.t}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-slate-500">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── PRODUCT SHOWCASE ─────────────── */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-28">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: ACCENT }}>The dashboard</span>
            <h2 className="mt-3 text-balance text-4xl font-bold tracking-tight sm:text-5xl">Everything in one calm dashboard.</h2>
            <ul className="mt-8 space-y-4">
              {['Track project progress at a glance', 'Never miss an update or deadline', 'Organize every file in one place', 'Keep clients quietly informed'].map(t => (
                <li key={t} className="flex items-center gap-3 text-[15px] text-slate-600">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full" style={{ background: `${ACCENT}1A` }}><Check className="h-3 w-3" style={{ color: ACCENT }} /></span>
                  {t}
                </li>
              ))}
            </ul>
            <Link href={signupHref} className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: ACCENT }}>
              Explore features <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <FrevioDashboard className="shadow-[0_40px_120px_-48px_rgba(15,23,42,0.45)]" />
        </div>
      </section>

      {/* ─────────────── EMAIL EXPERIENCE ─────────────── */}
      <section className="border-y border-slate-100 bg-slate-50/50 py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-2">
          {/* email preview */}
          <div className="order-2 lg:order-1">
            <div className="mx-auto max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_30px_80px_-32px_rgba(15,23,42,0.3)]">
              <div className="px-6 py-5 text-white" style={{ background: ACCENT }}>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-white/70">Weekly update</div>
                <div className="mt-1 text-lg font-semibold">Acme Website Redesign</div>
              </div>
              <div className="space-y-4 p-6">
                <p className="text-sm text-slate-600">Hi Maya, here&apos;s what we shipped this week:</p>
                {['Homepage redesign approved', 'Checkout flow rebuilt', 'Mobile nav polished'].map(b => (
                  <div key={b} className="flex items-center gap-2.5 text-sm text-slate-700">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full" style={{ background: `${ACCENT}1A` }}><Check className="h-3 w-3" style={{ color: ACCENT }} /></span>
                    {b}
                  </div>
                ))}
                <div className="pt-2">
                  <span className="inline-block rounded-lg px-4 py-2.5 text-xs font-semibold text-white" style={{ background: ACCENT }}>View full portal →</span>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: ACCENT }}>Client emails</span>
            <h2 className="mt-3 text-balance text-4xl font-bold tracking-tight sm:text-5xl">Beautiful client updates they&apos;ll actually read.</h2>
            <p className="mt-5 text-lg leading-relaxed text-slate-500">
              Branded HTML emails that automatically notify clients the moment something changes — no more writing status reports by hand.
            </p>
            <ul className="mt-8 grid grid-cols-2 gap-4">
              {['Professional', 'Fully branded', 'Mobile friendly', 'One-click access'].map(t => (
                <li key={t} className="flex items-center gap-2.5 text-[15px] text-slate-600">
                  <Check className="h-4 w-4" style={{ color: ACCENT }} /> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ─────────────── FEATURES GRID ─────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-28">
        <h2 className="mx-auto max-w-2xl text-balance text-center text-4xl font-bold tracking-tight sm:text-5xl">
          Everything you need. Nothing you don&apos;t.
        </h2>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Bell, t: 'Client Updates', d: 'Post progress and notify clients automatically.' },
            { icon: FileText, t: 'Invoices', d: 'Send invoices and get paid online via Stripe.' },
            { icon: FolderKanban, t: 'Files', d: 'Every deliverable, organized per client.' },
            { icon: MessageSquare, t: 'Feedback', d: 'Collect approvals and comments in one thread.' },
            { icon: FileSignature, t: 'Contracts', d: 'Send and sign agreements without the back-and-forth.' },
            { icon: Globe, t: 'Portfolio Pages', d: 'Turn finished work into a public showcase.' },
          ].map(f => (
            <div key={f.t} className={`${card} p-7 transition-all duration-300 hover:-translate-y-1`}>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${ACCENT}14` }}>
                <f.icon className="h-5 w-5" style={{ color: ACCENT }} />
              </span>
              <h3 className="mt-5 text-lg font-semibold">{f.t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────── TESTIMONIALS ─────────────── */}
      <section className="border-y border-slate-100 bg-slate-50/50 py-28">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center text-4xl font-bold tracking-tight sm:text-5xl">Loved by freelancers</h2>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              { q: 'Clients literally stopped asking for updates. It paid for itself in a week.', n: 'Maya Okafor', r: 'Brand Designer' },
              { q: 'It makes my one-person studio look like a 20-person agency.', n: 'Daniel Reyes', r: 'Web Developer' },
              { q: 'Saves me hours every week. The branded emails are gorgeous.', n: 'Priya Shah', r: 'Marketing Consultant' },
            ].map(t => (
              <div key={t.n} className={`${card} flex flex-col p-8`}>
                <div className="flex gap-0.5" style={{ color: ACCENT }}>
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <p className="mt-5 flex-1 text-[15px] leading-relaxed text-slate-700">&ldquo;{t.q}&rdquo;</p>
                <div className="mt-6 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: ACCENT }}>
                    {t.n.split(' ').map(w => w[0]).join('')}
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{t.n}</div>
                    <div className="text-xs text-slate-400">{t.r}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── PRICING ─────────────── */}
      <section id="pricing" className="mx-auto max-w-7xl px-6 py-28">
        <h2 className="text-center text-4xl font-bold tracking-tight sm:text-5xl">Simple pricing.</h2>
        <p className="mt-4 text-center text-lg text-slate-500">Start free. Upgrade only when you grow.</p>
        <div className="mt-12">
          <LandingPricing />
        </div>
      </section>

      {/* ─────────────── FAQ ─────────────── */}
      <section id="faq" className="border-t border-slate-100 bg-slate-50/50 py-28">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center text-4xl font-bold tracking-tight sm:text-5xl">Frequently asked questions</h2>
          <div className="mt-14">
            <LandingFaq />
          </div>
        </div>
      </section>

      {/* ─────────────── FINAL CTA ─────────────── */}
      <section className="px-6 py-28">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#0B0B12] px-8 py-24 text-center">
          <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full opacity-40 blur-[120px]" style={{ background: ACCENT }} />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Ready to stop answering &ldquo;Any update?&rdquo;
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-white/50">
              Join freelancers building better client relationships with Frevio.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href={signupHref} className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02]" style={{ background: ACCENT }}>
                Start Free <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#how" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10">
                <Play className="h-4 w-4" /> Watch Demo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── FOOTER ─────────────── */}
      <footer className="border-t border-slate-100 py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: ACCENT }}><span className="h-3 w-3 rounded-sm bg-white" /></span>
              <span className="text-lg font-semibold tracking-tight">Frevio</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">The calm client portal for freelancers and agencies.</p>
          </div>
          {[
            { h: 'Product', links: [['Features', '#features'], ['Pricing', '#pricing'], ['FAQ', '#faq']] },
            { h: 'Resources', links: [['Get started', signupHref], ['Log in', '/auth/login']] },
            { h: 'Company', links: [['Privacy', '/privacy'], ['Terms', '/terms']] },
          ].map(col => (
            <div key={col.h}>
              <div className="text-sm font-semibold text-slate-900">{col.h}</div>
              <ul className="mt-4 space-y-3 text-sm text-slate-500">
                {col.links.map(([label, href]) => (
                  <li key={label}><Link href={href} className="transition-colors hover:text-slate-900">{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-12 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-slate-100 px-6 pt-8 text-sm text-slate-400 sm:flex-row">
          <span>© {new Date().getFullYear()} Frevio. All rights reserved.</span>
          <div className="flex gap-5">
            <a href="#" className="transition-colors hover:text-slate-900">Twitter</a>
            <a href="#" className="transition-colors hover:text-slate-900">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
