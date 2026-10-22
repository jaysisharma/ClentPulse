import { cn } from '@/lib/utils'
import { eyebrow, heading, muted } from './styles'

interface SectionHeadingProps {
  label: string
  title: React.ReactNode
  sub?: React.ReactNode
  align?: 'left' | 'center'
  size?: 'md' | 'lg'
  className?: string
}

export function SectionHeading({ label, title, sub, align = 'left', size = 'md', className }: SectionHeadingProps) {
  return (
    <div className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center', className)}>
      <p className={eyebrow}>{label}</p>
      <h2
        className={cn(
          heading,
          'mt-3',
          size === 'lg' ? 'text-4xl leading-[1.04] sm:text-5xl md:text-6xl' : 'text-3xl leading-[1.1] md:text-4xl'
        )}
      >
        {title}
      </h2>
      {sub && <p className={cn('mt-4 text-base leading-relaxed', muted, align === 'center' && 'mx-auto max-w-md')}>{sub}</p>}
    </div>
  )
}
