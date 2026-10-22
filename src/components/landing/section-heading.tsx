import { cn } from '@/lib/utils'
import { eyebrow, heading, muted } from './styles'

interface SectionHeadingProps {
  label: string
  title: React.ReactNode
  sub?: React.ReactNode
  align?: 'left' | 'center'
  className?: string
}

export function SectionHeading({ label, title, sub, align = 'left', className }: SectionHeadingProps) {
  return (
    <div className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center', className)}>
      <span className={eyebrow}>{label}</span>
      <h2 className={cn(heading, 'mt-5 text-3xl leading-[1.1] sm:text-5xl')}>{title}</h2>
      {sub && <p className={cn('mt-4 text-base leading-relaxed sm:text-lg', muted)}>{sub}</p>}
    </div>
  )
}
