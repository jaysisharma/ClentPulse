import { createClient } from '@/lib/supabase/server'
import { FrevioNavbar } from '@/components/landing/frevio-navbar'
import { FrevioHero } from '@/components/landing/frevio-hero'
import { FrevioTrust } from '@/components/landing/frevio-trust'
import { FrevioProblem } from '@/components/landing/frevio-problem'
import { FrevioSolution } from '@/components/landing/frevio-solution'
import { FrevioWorkflow } from '@/components/landing/frevio-workflow'
import { FrevioClientExperience } from '@/components/landing/frevio-client-experience'
import { FrevioAudience } from '@/components/landing/frevio-audience'
import { FrevioPricing } from '@/components/landing/frevio-pricing'
import { FrevioFaq } from '@/components/landing/frevio-faq'
import { FrevioCta } from '@/components/landing/frevio-cta'
import { FrevioFooter } from '@/components/landing/frevio-footer'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user
  const signupHref = isLoggedIn ? '/dashboard' : '/auth/login?mode=signup'

  return (
    <div className="min-h-screen bg-[#08090a] font-sans text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-white">

      {/* ── 0. Navigation ── */}
      <FrevioNavbar
        isLoggedIn={isLoggedIn}
        signupHref={signupHref}
      />

      <main className="flex-1">

        {/* ── 1. Hero: Editorial Split (Headline + Substantial Product UI) ── */}
        <FrevioHero signupHref={signupHref} />

        {/* ── 2. Credibility & Authentic Trust ── */}
        <FrevioTrust />

        {/* ── 3. Problem: Client Work Gets Messy When It's Everywhere ── */}
        <FrevioProblem />

        {/* ── 4. Solution: Everything Your Client Needs. One Clear Place. ── */}
        <FrevioSolution />

        {/* ── 5. Workflow: From Project Start to Final Delivery ── */}
        <FrevioWorkflow />

        {/* ── 6. Client Experience: In The Loop Without The Back And Forth ── */}
        <FrevioClientExperience />

        {/* ── 7. Audience: Built For People Who Work With Clients ── */}
        <FrevioAudience />

        {/* ── 8. Pricing: Simple Pricing As Your Work Grows (Free, Pro, Agency, Scale) ── */}
        <FrevioPricing signupHref={signupHref} />

        {/* ── 9. FAQ: Frequently Answered Questions (8 Real Purchase Questions) ── */}
        <FrevioFaq />

        {/* ── 10. Quiet & Confident Closing CTA ── */}
        <FrevioCta signupHref={signupHref} />

      </main>

      {/* ── 11. Refined Studio Footer ── */}
      <FrevioFooter />

    </div>
  )
}
