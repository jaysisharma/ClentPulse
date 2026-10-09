'use client'

import React, { useRef, useState, useCallback } from 'react'

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  spotlightColor?: string
}

/**
 * 21st.dev / Motion Primitives Spotlight Card.
 * Tracks mouse position to cast a radial luminous highlight across the card's surface.
 */
export function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(94, 106, 210, 0.16)',
  ...props
}: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return
    const rect = divRef.current.getBoundingClientRect()
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }, [])

  const handleMouseEnter = useCallback(() => {
    setOpacity(1)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setOpacity(0)
  }, [])

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0E1013] transition-all duration-300 hover:border-white/[0.18] shadow-[0_4px_24px_rgba(0,0,0,0.5)] ${className}`}
      {...props}
    >
      {/* Top 1px subtle glass highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.15] to-transparent" />

      {/* Spotlight overlay */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 70%)`,
        }}
      />
      {children}
    </div>
  )
}
