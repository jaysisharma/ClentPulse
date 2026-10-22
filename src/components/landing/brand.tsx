import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

/** Logo + wordmark, same treatment as the login page. */
export function Brand({ className, inverted }: { className?: string; inverted?: boolean }) {
  return (
    <Link href="/" className={cn('inline-flex min-h-11 items-center gap-2.5', className)}>
      <Image src="/logo.png" alt="" width={32} height={32} className="h-8 w-8 object-contain" priority />
      <span className={cn('text-xl font-light tracking-tight', inverted ? 'text-white' : 'text-slate-900 dark:text-white')}>Frevio</span>
    </Link>
  )
}
