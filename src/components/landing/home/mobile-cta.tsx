'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

/** Pinned "Start free" bar on phones, shown once the hero CTA has scrolled away. */
export function MobileCta({ href, label }: { href: string; label: string }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const hero = document.getElementById('hero-cta')
    if (!hero) return
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting && e.boundingClientRect.top < 0))
    io.observe(hero)
    return () => io.disconnect()
  }, [])

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/90 p-3 backdrop-blur-xl transition-transform duration-300 md:hidden',
        'pb-[max(0.75rem,env(safe-area-inset-bottom))]',
        show ? 'translate-y-0' : 'translate-y-full'
      )}
    >
      <Link
        href={href}
        tabIndex={show ? 0 : -1}
        className="flex w-full items-center justify-center rounded-full bg-ink py-3 text-sm font-semibold text-canvas"
      >
        {label}
      </Link>
    </div>
  )
}
