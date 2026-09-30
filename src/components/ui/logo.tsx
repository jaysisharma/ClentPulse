import { cn } from '@/lib/utils'

export function Logo({ className, alt = 'Frevio' }: { className?: string; alt?: string }) {
  return (
    <img
      src="/logo.png"
      alt={alt}
      className={cn('w-7 h-7 flex-shrink-0 object-contain', className)}
    />
  )
}

