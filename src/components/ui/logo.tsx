import { cn } from '@/lib/utils'

/**
 * Ink & Ember mark. The stem uses `currentColor` so it follows the text color
 * (ink on light, linen on dark); the middle bar is always the ember accent.
 */
export function Logo({ className, alt = 'Frevio' }: { className?: string; alt?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={alt}
      className={cn('w-7 h-7 flex-shrink-0 text-ink', className)}
    >
      {/* Main Body Stem & Top Arm */}
      <path
        d="M 28 82 V 28 C 28 20, 34 14, 42 14 H 70 C 74 14, 77 17, 77 21 C 77 25, 74 28, 70 28 H 42 V 82 C 42 86, 39 89, 35 89 C 31 89, 28 86, 28 82 Z"
        fill="currentColor"
      />

      {/* Middle Arm Layer */}
      <rect x="35" y="46" width="28" height="14" rx="7" fill="var(--color-accent)" />
    </svg>
  )
}
