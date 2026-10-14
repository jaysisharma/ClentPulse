import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { OveradsNavbar } from '@/components/landing/overads-navbar'
import { OveradsHero } from '@/components/landing/overads-hero'
import { OveradsWorkflowsSection } from '@/components/landing/overads-workflows-section'
import { OveradsScreensShowcase } from '@/components/landing/overads-screens-showcase'
import { OveradsComparisonTable } from '@/components/landing/overads-comparison-table'
import { OveradsIntegrations } from '@/components/landing/overads-integrations'
import { OveradsTestimonials } from '@/components/landing/overads-testimonials'
import { LandingPricing } from '@/components/landing/landing-pricing'
import { LandingFaq } from '@/components/landing/landing-faq'
import { OveradsCta } from '@/components/landing/overads-cta'
import { Logo } from '@/components/ui/logo'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user
  const signupHref = isLoggedIn ? '/dashboard' : '/auth/login?mode=signup'

  return (
    <div className="min-h-screen bg-[#08090a] font-sans text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-white">

      {/* ── 0. Floating Glass Navbar (Overads Pill Nav) ── */}
      <OveradsNavbar
        isLoggedIn={isLoggedIn}
        signupHref={signupHref}
        promoRemaining={17}
      />

      <main className="flex-1">

        {/* ── 1. Hero: Light Uppercase Display + Rotating Prompts + Workspace Showcase ── */}
        <OveradsHero signupHref={signupHref} />

        {/* ── 2. Workflows: Plain English Automation ("Tell it once. It does it every week.") ── */}
        <OveradsWorkflowsSection signupHref={signupHref} />

        {/* ── 3. Screens: Inside Frevio ("Three screens. That is the whole job.") ── */}
        <OveradsScreensShowcase />

        {/* ── 4. Honest Comparison Table (7 Capabilities vs Stack of Tools vs Traditional) ── */}
        <OveradsComparisonTable />

        {/* ── 5. Connected Toolchain (VS Code, GitHub, Figma, Drive, Stripe Pipeline) ── */}
        <OveradsIntegrations />

        {/* ── 6. Testimonials: Verified Client & Specialist Outcomes ── */}
        <OveradsTestimonials />

        {/* ── 7. Pricing: Simple Plans. Predictable Growth. ── */}
        <section id="pricing" className="py-24 lg:py-32 px-4 sm:px-6 bg-[#08090a] border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-indigo-400">
                <span>Pricing</span>
              </div>
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-light uppercase tracking-[-0.02em] text-white leading-[0.98]">
                Simple plans. Predictable growth.
              </h2>
              <p className="text-sm sm:text-base text-slate-400 font-light leading-relaxed">
                Start completely free for 2 active projects. Upgrade to Pro or Agency as your studio scales.
              </p>
            </div>

            <LandingPricing />
          </div>
        </section>

        {/* ── 8. FAQ: Frequently Answered ── */}
        <section id="faq" className="py-24 lg:py-32 px-6 bg-[#08090a] border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-indigo-400">
                <span>FAQ</span>
              </div>
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-light uppercase tracking-[-0.02em] text-white leading-[0.98]">
                Frequently answered
              </h2>
              <p className="text-sm sm:text-base text-slate-400 font-light leading-relaxed">
                Everything you need to know about the client operating system.
              </p>
            </div>

            <LandingFaq />
          </div>
        </section>

        {/* ── 9. Final CTA: "Your client work runs itself. You just approve." ── */}
        <OveradsCta signupHref={signupHref} />

      </main>

      {/* ── Footer: Ultra-Clean Studio Footer ── */}
      <footer className="border-t border-white/5 bg-[#050608] py-16 px-6 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2.5">
            <Logo className="w-5 h-5 text-white" />
            <span className="font-bold text-white text-sm tracking-tight font-mono">Frevio</span>
            <span className="text-slate-700">/</span>
            <span className="text-slate-400 font-light">The client operating system for modern studios</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-slate-400 font-mono text-[11px]">
            <a href="#workflows" className="hover:text-white transition-colors">Workflows</a>
            <a href="#screens" className="hover:text-white transition-colors">Inside</a>
            <a href="#comparison" className="hover:text-white transition-colors">Comparison</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          </div>

          <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>All systems operational</span>
            <span className="text-slate-700">·</span>
            <span>© {new Date().getFullYear()} Frevio Inc.</span>
          </div>
        </div>
      </footer>

    </div>
  )
}
