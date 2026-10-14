import { cn } from '@/lib/utils'

export function Logo({ className, alt = 'Frevio' }: { className?: string; alt?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={alt}
      className={cn('w-7 h-7 flex-shrink-0', className)}
    >
      <defs>
        <linearGradient id="frevio-logo-main" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="60%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id="frevio-logo-mid" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00f2fe" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <filter id="frevio-logo-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="-1" dy="1.5" stdDeviation="2" floodColor="#000000" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Main Body Stem & Top Arm */}
      <path
        d="M 28 82 V 28 C 28 20, 34 14, 42 14 H 70 C 74 14, 77 17, 77 21 C 77 25, 74 28, 70 28 H 42 V 82 C 42 86, 39 89, 35 89 C 31 89, 28 86, 28 82 Z"
        fill="url(#frevio-logo-main)"
      />

      {/* Middle Arm Layer */}
      <rect
        x="35"
        y="46"
        width="28"
        height="14"
        rx="7"
        fill="url(#frevio-logo-mid)"
        filter="url(#frevio-logo-shadow)"
      />
    </svg>
  )
}

