import { createClient } from '@/lib/supabase/server'
import { OveradsNavbar } from '@/components/landing/overads-navbar'
import { OveradsHero } from '@/components/landing/overads-hero'
import { ProblemSection } from '@/components/landing/problem-section'
import { SolutionSection } from '@/components/landing/solution-section'
import { HowItWorksSection } from '@/components/landing/how-it-works-section'
import { FreelancerDashboardSection } from '@/components/landing/freelancer-dashboard-section'
import { IntegrationsSection } from '@/components/landing/integrations-section'
import { PricingSection } from '@/components/landing/pricing-section'
import { TestimonialsSection } from '@/components/landing/testimonials-section'
import { BottomCtaSection } from '@/components/landing/bottom-cta-section'
import { OveradsFooter } from '@/components/landing/overads-footer'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user
  const signupHref = isLoggedIn ? '/dashboard' : '/auth/login?mode=signup'

  return (
    <div className="min-h-screen bg-white dark:bg-[#07080D] font-sans text-slate-900 dark:text-slate-100 antialiased selection:bg-indigo-500/20 dark:selection:bg-indigo-500/30 selection:text-indigo-900 dark:selection:text-indigo-200 transition-colors duration-300">

      {/* ── 0. Floating Glass Navbar ── */}
      <OveradsNavbar
        isLoggedIn={isLoggedIn}
        signupHref={signupHref}
        promoRemaining={17}
      />

      <main className="flex-1">

        {/* ── 1. Hero: Dark Frevio Dashboard Replica ── */}
        <OveradsHero signupHref={signupHref} />

        {/* ── 2. The Problem: "Your work isn't the problem. Client communication is." ── */}
        <ProblemSection />

        {/* ── 3. The Solution: "One link. Everything your client needs." ── */}
        <SolutionSection signupHref={signupHref} />

        {/* ── 4. See How It Works: "A simple experience for both sides" ── */}
        <HowItWorksSection />

        {/* ── 5. Freelancer Dashboard: "Everything organized in one place" ── */}
        <FreelancerDashboardSection signupHref={signupHref} />

        {/* ── 6. Integrations: "Works with the tools you already use" ── */}
        <IntegrationsSection />

        {/* ── 7. Pricing: "Simple, transparent pricing" ── */}
        <PricingSection signupHref={signupHref} />

        {/* ── 8. Testimonials: "Built for freelancers, by freelancers" ── */}
        <TestimonialsSection />

        {/* ── 9. Bottom CTA: "Give every client a better way to work with you." ── */}
        <BottomCtaSection signupHref={signupHref} />

      </main>

      {/* ── 10. Footer ── */}
      <OveradsFooter />

    </div>
  )
}
