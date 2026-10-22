'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { primaryBtn } from './styles'

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
        'fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/90 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md transition-transform duration-300 md:hidden',
        show ? 'translate-y-0' : 'translate-y-full'
      )}
    >
      <Link href={href} tabIndex={show ? 0 : -1} className={cn(primaryBtn, 'w-full')}>
        {label}
      </Link>
    </div>
  )
}
