'use client'

import { useEffect, useRef, useState } from 'react'

// Animated count-up for hero/money numbers. Eases from 0 to value on mount.
export function CountUp({
  value,
  prefix = '',
  suffix = '',
  duration = 900,
}: {
  value: number
  prefix?: string
  suffix?: string
  duration?: number
}) {
  const [display, setDisplay] = useState(0)
  const frame = useRef<number>(0)

  useEffect(() => {
    const start = performance.now()
    const tick = (t: number) => {
      const p = Math.min((t - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(value * eased)
      if (p < 1) frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame.current)
  }, [value, duration])

  return (
    <span className="tabular-nums">
      {prefix}{Math.round(display).toLocaleString('en-US')}{suffix}
    </span>
  )
}
