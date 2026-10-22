import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { heading, muted, primaryBtn, section } from './styles'

/** Quiet centred close: big light headline, one button. */
export function FinalCta({ isLoggedIn, signupHref }: { isLoggedIn: boolean; signupHref: string }) {
  return (
    <section className={cn(section, 'text-center')}>
      <h2 className={cn(heading, 'mx-auto max-w-3xl text-4xl leading-[1.04] sm:text-5xl md:text-6xl')}>
        Send your first client link today.
      </h2>
      <p className={cn('mx-auto mt-6 max-w-md text-base leading-relaxed', muted)}>
        Create a project, share the link, and let your client review, approve and pay in one place.
      </p>
      <Link href={signupHref} className={cn(primaryBtn, 'mt-8')}>
        {isLoggedIn ? 'Open your workspace' : 'Start free'}
        <ArrowRight className="h-4 w-4" />
      </Link>
      <p className={cn('mt-4 text-xs', muted)}>Free for 2 active projects. No card required. Set up in under a minute.</p>
    </section>
  )
}
