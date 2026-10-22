import { Bricolage_Grotesque, Onest } from 'next/font/google'
import { cn } from '@/lib/utils'
import { Nav } from './nav'
import { Hero } from './hero'
import { BeforeAfter } from './before-after'
import { PortalDemo } from './portal-demo'
import { Features } from './features'
import { HowItWorks } from './how-it-works'
import { Comparison } from './comparison'
import { Pricing } from './pricing'
import { Faq } from './faq'
import { FounderNote } from './founder-note'
import { FinalCta } from './final-cta'
import { Footer } from './footer'
import { MobileCta } from './mobile-cta'

// Two typefaces: Bricolage Grotesque (optical sizes) for headings, Onest for text.
const display = Bricolage_Grotesque({ subsets: ['latin'], axes: ['opsz'], variable: '--font-display-face', display: 'swap' })
const body = Onest({ subsets: ['latin'], variable: '--font-body-face', display: 'swap' })

interface HomeLandingProps {
  isLoggedIn: boolean
  signupHref: string
}

/**
 * Marketing page (`/`). Dark-only via `.theme-dark` (see DESIGN.md).
 * Layout: a rounded "sheet" floating on a black frame, solid violet stages for
 * product UI, footer with a giant wordmark on the frame.
 */
export function HomeLanding({ isLoggedIn, signupHref }: HomeLandingProps) {
  return (
    <div
      className={cn(
        display.variable,
        body.variable,
        'theme-dark min-h-screen bg-black font-[family-name:var(--font-body-face)] text-ink selection:bg-accent/30',
        '[&_h1]:font-[family-name:var(--font-display-face)] [&_h2]:font-[family-name:var(--font-display-face)]'
      )}
    >
      <div className="p-1.5 sm:p-3">
        <div className="relative overflow-clip rounded-[22px] bg-sunken sm:rounded-[32px]">
          <Nav isLoggedIn={isLoggedIn} signupHref={signupHref} />

          <main className="space-y-28 pb-28 sm:space-y-40 sm:pb-36">
            <Hero isLoggedIn={isLoggedIn} signupHref={signupHref} />
            <BeforeAfter />
            <PortalDemo signupHref={signupHref} />
            <Features />
            <HowItWorks />
            <Comparison />
            <Pricing signupHref={signupHref} />
            <FounderNote />
            <Faq />
            <FinalCta isLoggedIn={isLoggedIn} signupHref={signupHref} />
          </main>
        </div>
      </div>

      <Footer />
      <MobileCta href={signupHref} label={isLoggedIn ? 'Go to dashboard' : 'Start free'} />
    </div>
  )
}
