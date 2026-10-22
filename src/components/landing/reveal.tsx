'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

/** True once the element has scrolled into view (fires once). */
export function useInView<T extends Element>(threshold = 0.2) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || inView) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { threshold }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [inView, threshold])

  return [ref, inView] as const
}

/**
 * Fades content up on first view. Server HTML is always visible: content is
 * only hidden after hydration and only if it starts below the fold, so
 * crawlers, link previews and no-JS visitors never see blank sections.
 */
export function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const [ref, inView] = useInView<HTMLDivElement>(0.15)
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (el && el.getBoundingClientRect().top > window.innerHeight) setArmed(true)
  }, [ref])

  return (
    <div
      ref={ref}
      data-shown={armed ? inView : true}
      className={cn('reveal', className)}
      style={{ '--reveal-delay': `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  )
}
