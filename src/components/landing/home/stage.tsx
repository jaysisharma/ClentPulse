import { cn } from '@/lib/utils'

/**
 * Flat graphite panel that product cards float on (overads-style "stage").
 * No gradients, no brand color: the product UI is the color. Cards inside get
 * a lifted surface by re-scoping the surface tokens.
 */
export function Stage({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn('relative overflow-hidden rounded-[20px] bg-[#1c1c1f] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.06)]', className)}
      style={{ '--surface': '#26262a', '--sunken': '#1c1c1f' } as React.CSSProperties}
    >
      {children}
    </div>
  )
}
