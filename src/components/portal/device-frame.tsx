'use client'

import { useEffect, useRef, useState } from 'react'

export type DeviceSize = { width: number; height: number }

// Phone/tablet mockup sizes in CSS px, bezel included, so the page inside gets
// a true device-width viewport (375 / 768 / 1024 wide).
export function deviceSize(mode: 'desktop' | 'tablet' | 'mobile', orientation: 'portrait' | 'landscape'): DeviceSize | null {
  if (mode === 'tablet') return orientation === 'portrait' ? { width: 788, height: 840 } : { width: 1044, height: 640 }
  if (mode === 'mobile') return orientation === 'portrait' ? { width: 393, height: 818 } : { width: 798, height: 393 }
  return null
}

// Renders the frame at its real size and scales it down visually when the
// space is smaller, instead of letting flexbox squash the viewport.
// fit="both" also fits the height (full screen); "width" lets the page scroll.
export function DeviceFrame({
  size,
  className,
  children,
  fit = 'width',
}: {
  size: DeviceSize | null
  className: string
  children: React.ReactNode
  fit?: 'width' | 'both'
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [available, setAvailable] = useState<{ width: number; height: number } | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) =>
      setAvailable({ width: entry.contentRect.width, height: entry.contentRect.height })
    )
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  if (!size) {
    return (
      <div ref={ref} className="w-full h-full">
        <div className={className}>{children}</div>
      </div>
    )
  }

  const scale = available
    ? Math.min(1, available.width / size.width, fit === 'both' ? available.height / size.height : 1)
    : 1

  return (
    <div ref={ref} className={fit === 'both' ? 'w-full h-full flex items-center justify-center' : 'w-full flex justify-center'}>
      <div className="relative flex-shrink-0" style={{ width: size.width * scale, height: size.height * scale }}>
        <div
          className={className}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: size.width,
            height: size.height,
            maxWidth: 'none',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
