import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { OveradsNavbar } from '@/components/landing/overads-navbar'
import { FrevioHero } from '@/components/landing/frevio-hero'
import { ClientProofTicker } from '@/components/landing/client-proof-ticker'
import { TensionSection } from '@/components/landing/tension-section'
import { BentoShowroom } from '@/components/landing/bento-showroom'
import { InteractiveSandbox } from '@/components/landing/interactive-sandbox'
import { FrevioPricing } from '@/components/landing/frevio-pricing'
import { CinematicCta } from '@/components/landing/cinematic-cta'
import { OveradsFooter } from '@/components/landing/overads-footer'

export const metadata: Metadata = {
  title: 'Frevio — Client Workspace & Business Management for Freelancers',
  description:
    'The dedicated client workspace that keeps creative projects moving and clients informed. Milestone tracking, 1-click deliverable sign-offs, and Stripe settlements with zero client logins.',
}

export default async function LandingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isLoggedIn = !!user
  const signupHref = isLoggedIn ? '/dashboard' : '/auth/login?mode=signup'

  return (
    <div className="min-h-screen bg-[#08090A] text-[#F3F4F6] font-sans antialiased selection:bg-[#5E6AD2]/30 selection:text-white flex flex-col">
      {/* ── Fixed Blur Glass Header ── */}
      <OveradsNavbar isLoggedIn={isLoggedIn} signupHref={signupHref} />

      <main className="flex-1 flex flex-col">
        {/* ── 01. Hero with Interactive Canvas Particles & 3D Tilt ── */}
        <FrevioHero signupHref={signupHref} />

        {/* ── 02. Continuous Studio Marquee Ticker ── */}
        <ClientProofTicker />

        {/* ── 03. Tension Section: Chaos vs Calm with Problem Spotlights ── */}
        <TensionSection />

        {/* ── 04. 12-Column 21st.dev Bento Grid Showroom ── */}
        <BentoShowroom />

        {/* ── 05. Live Interactive Client Portal Sandbox ── */}
        <InteractiveSandbox />

        {/* ── 06. Transparent Pricing with Annual/Monthly Toggle ── */}
        <FrevioPricing signupHref={signupHref} />

        {/* ── 07. Cinematic Horizon CTA Section ── */}
        <CinematicCta signupHref={signupHref} />
      </main>

      {/* ── Footer ── */}
      <OveradsFooter />
    </div>
  )
}
