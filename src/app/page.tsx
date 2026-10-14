import { createClient } from '@/lib/supabase/server'
import { OveradsNavbar } from '@/components/landing/overads-navbar'
import { StoryColdOpen } from '@/components/landing/story-cold-open'
import { StoryComparison } from '@/components/landing/story-comparison'
import { OveradsScreensShowcase } from '@/components/landing/overads-screens-showcase'
import { StoryMoments } from '@/components/landing/story-moments'
import { StoryInteractiveSandbox } from '@/components/landing/story-interactive-sandbox'
import { OveradsIntegrations } from '@/components/landing/overads-integrations'
import { FrevioPricing } from '@/components/landing/frevio-pricing'
import { FrevioFaq } from '@/components/landing/frevio-faq'
import { OveradsCta } from '@/components/landing/overads-cta'
import { FrevioFooter } from '@/components/landing/frevio-footer'

export default async function LandingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isLoggedIn = !!user
  const signupHref = isLoggedIn ? '/dashboard' : '/auth/login?mode=signup'

  return (
    <div className="min-h-screen bg-[#030407] font-sans text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-white overflow-x-hidden">
      {/* ── 0. Floating Glass Navbar ── */}
      <OveradsNavbar isLoggedIn={isLoggedIn} signupHref={signupHref} />

      <main className="flex-1">
        {/* ── Act I: The Cold Open (Cinematic Hook & Master Interactive Viewport) ── */}
        <StoryColdOpen signupHref={signupHref} />

        {/* ── Act II: The Friction & Architectural Contrast (Traditional Chaos vs Frevio) ── */}
        <StoryComparison />

        {/* ── Act III: Inside Frevio ("Three screens. That is the whole job.") ── */}
        <OveradsScreensShowcase />

        {/* ── Act IV: The Four Key Moments (Kickoff to Final Stripe Payout) ── */}
        <StoryMoments />

        {/* ── Act V: Interactive Sandbox (Hands-on Live Simulator) ── */}
        <StoryInteractiveSandbox />

        {/* ── Act VI: Connected Toolchain (VS Code, GitHub, Figma, Drive, Stripe) ── */}
        <OveradsIntegrations />

        {/* ── Act VII: Transparent Pricing (Free, Pro, Agency, Scale) ── */}
        <FrevioPricing signupHref={signupHref} />

        {/* ── Act VIII: Frequently Answered Questions ── */}
        <FrevioFaq />

        {/* ── Act IX: Final Closing CTA ── */}
        <OveradsCta signupHref={signupHref} />
      </main>

      {/* ── Footer: Clean Studio Footer ── */}
      <FrevioFooter />
    </div>
  )
}
