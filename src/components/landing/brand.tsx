import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { cn } from '@/lib/utils'

/** Logo + wordmark. `inverted` for ember panels and the footer. */
export function Brand({ className, inverted }: { className?: string; inverted?: boolean }) {
  return (
    <Link href="/" className={cn('inline-flex min-h-11 items-center gap-1.5', className)}>
      <Logo alt="" className={cn('h-8 w-8', inverted && 'text-white')} />
      <span className={cn('text-xl font-light tracking-[-0.03em]', inverted ? 'text-white' : 'text-ink')}>Frevio</span>
    </Link>
  )
}
