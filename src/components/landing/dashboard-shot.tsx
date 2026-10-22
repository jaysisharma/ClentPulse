import Image from 'next/image'
import { cn } from '@/lib/utils'
import { heading, muted, section } from './styles'

/** Real screenshot of the freelancer dashboard: your side of the client link. */
export function DashboardShot() {
  return (
    <section className={section}>
      <div className="grid gap-4 md:grid-cols-[1fr_1fr] md:items-end md:gap-16">
        <h2 className={cn(heading, 'text-3xl leading-[1.1] md:text-4xl')}>Your side of the link.</h2>
        <p className={cn('max-w-md text-base leading-relaxed', muted)}>
          Every project, who owes you money and which client hasn&rsquo;t heard from you this week. This is the actual
          Frevio dashboard, not a mockup.
        </p>
      </div>

      {/* Phones get a 2x crop of the stats and "needs attention" list; the full screen is unreadable that small. */}
      <div className="mt-10 aspect-[4/5] overflow-hidden rounded-[20px] border border-line bg-ink md:aspect-auto">
        <Image
          src="/images/frevio-dashboard.webp"
          alt="The Frevio dashboard: outstanding money, this month's income, hours this week, active projects, projects that need an update, and recent activity."
          width={2880}
          height={1800}
          sizes="(min-width: 1152px) 1088px, (min-width: 768px) calc(100vw - 64px), 200vw"
          className="h-full w-full object-cover object-[30%_0%] md:h-auto md:object-contain"
        />
      </div>
    </section>
  )
}
