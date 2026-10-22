import { cn } from '@/lib/utils'

const TONES = {
  // Violet into magenta, the main product stage.
  vivid:
    'radial-gradient(110% 90% at 0% 100%, #6d28d9 0%, transparent 55%), radial-gradient(80% 70% at 100% 0%, #be185d 0%, transparent 55%), radial-gradient(90% 90% at 75% 110%, #2e1065 0%, transparent 60%), #0d0a16',
  // Darker, for supporting panels.
  dusk:
    'radial-gradient(90% 80% at 100% 100%, #5b21b6 0%, transparent 60%), radial-gradient(80% 80% at 0% 0%, #3b0d26 0%, transparent 60%), #0c0a10',
  // Deep violet with a dark magenta edge; dark enough for white body text everywhere.
  plum:
    'radial-gradient(120% 100% at 0% 0%, #2e1065 0%, transparent 60%), radial-gradient(90% 90% at 100% 100%, #831843 0%, transparent 60%), #0e0a12',
} as const

/** Gradient panel that product cards float on (overads-style "stage"). */
export function Stage({
  children,
  tone = 'vivid',
  className,
}: {
  children: React.ReactNode
  tone?: keyof typeof TONES
  className?: string
}) {
  return (
    <div className={cn('relative overflow-hidden rounded-[28px]', className)} style={{ background: TONES[tone] }}>
      <div aria-hidden="true" className="bg-grain pointer-events-none absolute inset-0 opacity-60 mix-blend-overlay" />
      <div className="relative">{children}</div>
    </div>
  )
}
