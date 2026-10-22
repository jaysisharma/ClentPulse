import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { section } from './styles'

const POINTS = ['Free for 2 active projects', 'No card required', 'Set up in under a minute']

/** Always-dark panel, the same treatment as the login page's brand panel. */
export function FinalCta({ isLoggedIn, signupHref }: { isLoggedIn: boolean; signupHref: string }) {
  return (
    <section className={section}>
      <div className="rounded-3xl border border-white/10 bg-[#08090a] px-6 py-16 text-white sm:px-14 sm:py-20 dark:bg-[#0c0d12]">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div>
            <h2 className="text-balance text-4xl font-light leading-[1.08] tracking-tight sm:text-5xl">
              Send your first client link today.
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-slate-400">
              Create a project, share the link, and let your client review, approve and pay in one place.
            </p>
          </div>
          <div className="space-y-6 lg:justify-self-end">
            <ul className="space-y-2.5">
              {POINTS.map((p) => (
                <li key={p} className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
            <Link
              href={signupHref}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08090a] sm:w-auto"
            >
              {isLoggedIn ? 'Open your workspace' : 'Start free'}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
