import { cn } from '@/lib/utils'

interface SectionHeadingProps {
  label: string
  title: React.ReactNode
  /** Second half of the headline, set in muted ink. */
  muted?: React.ReactNode
  sub?: React.ReactNode
  align?: 'center' | 'left'
  /** Put the muted half on its own line. */
  stacked?: boolean
  className?: string
}

export function SectionHeading({ label, title, muted, sub, align = 'center', stacked, className }: SectionHeadingProps) {
  return (
    <div className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center', className)}>
      <p className="text-sm text-ink-muted">{label}</p>
      <h2 className="mt-3 text-balance text-[2.1rem] font-light leading-[1.08] tracking-[-0.03em] text-ink sm:text-5xl md:text-[3.4rem]">
        {title}
        {muted && (
          <>
            {stacked ? <br /> : ' '}
            <span className="text-ink-muted">{muted}</span>
          </>
        )}
      </h2>
      {sub && <p className={cn('mt-5 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg', align === 'center' && 'mx-auto')}>{sub}</p>}
    </div>
  )
}
