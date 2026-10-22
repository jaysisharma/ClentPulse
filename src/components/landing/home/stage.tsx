import { cn } from '@/lib/utils'

// Flat fills only — no gradients. White text passes AA on all three.
const TONES = {
  vivid: 'bg-[#4c1d95]', // violet-900, the main product stage
  dusk: 'bg-[#2e1065]', // violet-950, supporting panels
  plum: 'bg-[#2e1065]', // violet-950, text-heavy cards
} as const

/** Solid violet panel that product cards float on (overads-style "stage"). */
export function Stage({
  children,
  tone = 'vivid',
  className,
}: {
  children: React.ReactNode
  tone?: keyof typeof TONES
  className?: string
}) {
  return <div className={cn('relative overflow-hidden rounded-[28px]', TONES[tone], className)}>{children}</div>
}
