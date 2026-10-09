import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { OveradsNavbar } from '@/components/landing/overads-navbar'
import { OveradsHero } from '@/components/landing/overads-hero'
import { ProblemSection } from '@/components/landing/problem-section'
import { SolutionSection } from '@/components/landing/solution-section'
import { InteractiveWorkspaceDemo } from '@/components/landing/interactive-workspace-demo'
import { HowItWorksSection } from '@/components/landing/how-it-works-section'
import { UseCasesSection } from '@/components/landing/use-cases-section'
import { AutomationSection } from '@/components/landing/automation-section'
import { TrustSection } from '@/components/landing/trust-section'
import { PricingSection } from '@/components/landing/pricing-section'
import { FaqSection } from '@/components/landing/faq-section'
import { BottomCtaSection } from '@/components/landing/bottom-cta-section'
import { OveradsFooter } from '@/components/landing/overads-footer'

export const metadata: Metadata = {
  title: 'Frevio Cloud — A Better Client Workspace for Freelancers',
  description:
    'Give clients one clear place to follow project progress, review deliverables, and manage project updates. Discover a simpler way to work with Frevio.',
  keywords: [
    'client portal for freelancers',
    'freelancer client management',
    'client workspace for designers',
    'project approval tools',
    'client collaboration for freelancers',
    'freelancer project management',
    'Frevio Cloud',
  ],
  openGraph: {
    title: 'Frevio Cloud — A Better Client Workspace for Freelancers',
    description:
      'Give clients one clear place to follow project progress, review deliverables, and manage project updates. Discover a simpler way to work with Frevio.',
    url: 'https://www.frevio.cloud',
    siteName: 'Frevio Cloud',
    type: 'website',
  },
}

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user
  const signupHref = isLoggedIn ? '/dashboard' : '/auth/login?mode=signup'

  return (
    <div className="min-h-screen bg-[#101113] text-[#F5F5F3] font-sans antialiased selection:bg-[#A7B8FF]/20 selection:text-[#F5F5F3]">
      
      {/* ── Section 1: Navigation ── */}
      <OveradsNavbar isLoggedIn={isLoggedIn} signupHref={signupHref} />

      <main className="flex-1">
        {/* ── Section 2: Hero (Client Workspace Interface Preview) ── */}
        <OveradsHero signupHref={signupHref} />

        {/* ── Section 3: The Problem ── */}
        <ProblemSection />

        {/* ── Section 4: The Solution ── */}
        <SolutionSection signupHref={signupHref} />

        {/* ── Section 5: Interactive Client Workspace Demonstration ── */}
        <InteractiveWorkspaceDemo />

        {/* ── Section 6: How It Works ── */}
        <HowItWorksSection />

        {/* ── Section 7: Designed for Different Kinds of Work ── */}
        <UseCasesSection />

        {/* ── Section 8: Automation and Productivity ── */}
        <AutomationSection />

        {/* ── Section 9: Trust and Credibility ── */}
        <TrustSection />

        {/* ── Section 10: Pricing ── */}
        <PricingSection signupHref={signupHref} />

        {/* ── Section 11: Frequently Asked Questions ── */}
        <FaqSection />

        {/* ── Section 12: Final CTA ── */}
        <BottomCtaSection signupHref={signupHref} />
      </main>

      {/* ── Section 13: Footer ── */}
      <OveradsFooter />

    </div>
  )
}
