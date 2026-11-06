import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { FIRST_TOUCH_COOKIE, launchPlatformName, parseSignupSource } from '@/lib/attribution'
import SiteHeader from '@/components/home/site-header'
import HeroSection6 from '@/components/home/hero-section-6'
import TrustStrip from '@/components/home/trust-strip'
import ProblemSection from '@/components/home/problem-section'
import HowItWorksConnected from '@/components/home/how-it-works-connected'
import SpotlightFeatures from '@/components/home/spotlight-features'
import TestimonialsSection from '@/components/home/testimonials-section'
import PricingSection from '@/components/home/pricing-section'
import FAQSection from '@/components/home/faq-section'
import CTASection from '@/components/home/cta-section'
import Footer from '@/components/home/footer'
import type { Metadata } from 'next'

// Canonical lives here, not in the root layout, so other pages don't all point at the homepage
export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: { url: '/' },
}

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; utm_source?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user

  // Public, anon-readable counter; a missing row just hides the promo banner
  const { data: promo } = await supabase.from('launch_promo').select('claimed, cap').eq('id', 1).maybeSingle()
  const promoRemaining = promo ? Math.max(0, promo.cap - promo.claimed) : null

  // Greet launch-platform visitors by name (URL first, then their first-touch cookie)
  const params = await searchParams
  const launchPlatform =
    launchPlatformName(params.utm_source ?? params.ref) ??
    launchPlatformName(parseSignupSource((await cookies()).get(FIRST_TOUCH_COOKIE)?.value).source)

  return (
    <div className="home min-h-screen flex flex-col bg-background text-foreground antialiased">
      <SiteHeader isLoggedIn={isLoggedIn} promoRemaining={promoRemaining} launchPlatform={launchPlatform} />
      <main className="flex-1">
        <HeroSection6 />
        <TrustStrip />
        <ProblemSection />
        <HowItWorksConnected />
        <SpotlightFeatures />
        <TestimonialsSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
