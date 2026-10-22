import { cn } from '@/lib/utils'
import { Nav } from './nav'
import { Hero } from './hero'
import { Problem } from './problem'
import { PortalDemo } from './portal-demo'
import { Features } from './features'
import { HowItWorks } from './how-it-works'
import { Pricing } from './pricing'
import { FounderNote } from './founder-note'
import { Faq } from './faq'
import { FinalCta } from './final-cta'
import { Footer } from './footer'
import { MobileCta } from './mobile-cta'
import { page } from './styles'

interface LandingPageProps {
  isLoggedIn: boolean
  signupHref: string
}

/** Marketing page (`/`). Light paper page, one flat ink stage for the product; light-only, on the DESIGN.md tokens. */
export function LandingPage({ isLoggedIn, signupHref }: LandingPageProps) {
  return (
    <div className={cn(page, 'min-h-screen font-sans selection:bg-accent/20')}>
      <Nav isLoggedIn={isLoggedIn} signupHref={signupHref} />

      <main className="space-y-24 pb-28 sm:space-y-32 sm:pb-36">
        <Hero isLoggedIn={isLoggedIn} signupHref={signupHref} />
        <Problem />
        <HowItWorks />
        <PortalDemo signupHref={signupHref} />
        <Features />
        <Pricing signupHref={signupHref} />
        <FounderNote />
        <Faq />
        <FinalCta isLoggedIn={isLoggedIn} signupHref={signupHref} />
      </main>

      <Footer />
      <MobileCta href={signupHref} label={isLoggedIn ? 'Go to dashboard' : 'Start free'} />
    </div>
  )
}
