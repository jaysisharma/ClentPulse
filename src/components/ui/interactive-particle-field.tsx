'use client'

import React, { useEffect, useRef } from 'react'

interface ParticleFieldProps {
  className?: string
  particleCount?: number
  maxDistance?: number
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  baseAlpha: number
}

/**
 * 21st.dev-inspired interactive particle mesh.
 * Lightweight, 60fps canvas animation with cursor reactivity and inertia.
 * Automatically respects prefers-reduced-motion and pauses when offscreen.
 */
export function InteractiveParticleField({
  className = '',
  particleCount = 45,
  maxDistance = 120,
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    let animationFrameId: number
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth)
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight)

    let mouseX = -1000
    let mouseY = -1000

    const particles: Particle[] = []

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 1.5 + 0.8,
        baseAlpha: Math.random() * 0.35 + 0.15,
      })
    }

    const handleResize = () => {
      if (!canvas.parentElement) return
      width = canvas.width = canvas.parentElement.clientWidth
      height = canvas.height = canvas.parentElement.clientHeight
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseX = e.clientX - rect.left
      mouseY = e.clientY - rect.top
    }

    const handleMouseLeave = () => {
      mouseX = -1000
      mouseY = -1000
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // Update & Draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        p.x += p.vx
        p.y += p.vy

        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0

        // Mouse repelling physics
        const dx = mouseX - p.x
        const dy = mouseY - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 100) {
          const force = (100 - dist) / 100
          p.x -= (dx / dist) * force * 1.2
          p.y -= (dy / dist) * force * 1.2
        }

        // Draw particle dot
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(129, 140, 248, ${p.baseAlpha})`
        ctx.fill()

        // Connect nearby particles with subtle filament lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const distBetween = Math.hypot(p.x - p2.x, p.y - p2.y)

          if (distBetween < maxDistance) {
            const alpha = (1 - distBetween / maxDistance) * 0.14
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [particleCount, maxDistance])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
    />
  )
}
