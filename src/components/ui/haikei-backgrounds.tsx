import React from 'react'

/**
 * Haikei-inspired vector background assets.
 * Pure SVG, zero external network requests, ultra-lightweight, and fully responsive.
 */

interface SvgProps {
  className?: string
  opacity?: number
}

/**
 * 1. Layered Waves — Smooth organic waves with subtle depth and gradient stops.
 * Ideal for Hero headers and section transitions.
 */
export function HaikeiLayeredWaves({ className = '', opacity = 0.08 }: SvgProps) {
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
      viewBox="0 0 1440 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      style={{ opacity }}
    >
      <defs>
        <linearGradient id="haikei-wave-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A7B8FF" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#9BCDBF" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="haikei-wave-grad-2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#9BCDBF" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#A7B8FF" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      
      {/* Background Deep Wave Layer */}
      <path
        d="M0,192L48,208C96,224,192,256,288,245.3C384,235,480,181,576,176C672,171,768,213,864,224C960,235,1056,213,1152,192C1248,171,1344,149,1392,138.7L1440,128L1440,600L1392,600C1344,600,1248,600,1152,600C1056,600,960,600,864,600C768,600,672,600,576,600C480,600,384,600,288,600C192,600,96,600,48,600L0,600Z"
        fill="url(#haikei-wave-grad-1)"
      />

      {/* Mid Accent Wave Layer */}
      <path
        d="M0,288L48,272C96,256,192,224,288,229.3C384,235,480,277,576,288C672,299,768,277,864,250.7C960,224,1056,192,1152,197.3C1248,203,1344,245,1392,266.7L1440,288L1440,600L1392,600C1344,600,1248,600,1152,600C1056,600,960,600,864,600C768,600,672,600,576,600C480,600,384,600,288,600C192,600,96,600,48,600L0,600Z"
        fill="url(#haikei-wave-grad-2)"
      />
    </svg>
  )
}

/**
 * 2. Topography Lines — Elegant contour map lines inspired by modern generative maps.
 * Adds subtle engineered texture to feature and trust sections.
 */
export function HaikeiTopography({ className = '', opacity = 0.05 }: SvgProps) {
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
      viewBox="0 0 1000 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity }}
    >
      <path
        d="M-50,150 Q250,50 500,200 T1050,150"
        stroke="#A7B8FF"
        strokeWidth="1.2"
        strokeDasharray="4 6"
      />
      <path
        d="M-50,220 Q200,120 500,270 T1050,220"
        stroke="#A7B8FF"
        strokeWidth="1.2"
      />
      <path
        d="M-50,290 Q220,190 500,340 T1050,290"
        stroke="#9BCDBF"
        strokeWidth="1.2"
        strokeDasharray="8 8"
      />
      <path
        d="M-50,360 Q240,260 500,410 T1050,360"
        stroke="#A7B8FF"
        strokeWidth="1.2"
      />
      <path
        d="M-50,430 Q260,330 500,480 T1050,430"
        stroke="#9BCDBF"
        strokeWidth="1.2"
        strokeDasharray="2 6"
      />
    </svg>
  )
}

/**
 * 3. Dot Matrix Grid — Micro particle matrix with radial mask.
 * Adds tactile mathematical precision behind UI previews and interactive tabs.
 */
export function HaikeiDotMatrix({ className = '', opacity = 0.08 }: SvgProps) {
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity }}
    >
      <defs>
        <pattern id="haikei-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#A7B8FF" />
        </pattern>
        <radialGradient id="haikei-dots-fade" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="1" />
          <stop offset="85%" stopColor="#fff" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id="haikei-dots-mask">
          <rect width="100%" height="100%" fill="url(#haikei-dots-fade)" />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill="url(#haikei-dots)" mask="url(#haikei-dots-mask)" />
    </svg>
  )
}

/**
 * 4. Geometric Mesh Polygon — Low-poly facets and angled structural vectors.
 * Adds subtle architectural depth behind cards and pricing grids.
 */
export function HaikeiPolyMesh({ className = '', opacity = 0.04 }: SvgProps) {
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
      viewBox="0 0 1200 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      style={{ opacity }}
    >
      <path
        d="M0,0 L300,180 L600,60 L900,220 L1200,80 L1200,600 L0,600 Z"
        stroke="#A7B8FF"
        strokeWidth="1"
      />
      <path
        d="M300,180 L600,340 L900,220"
        stroke="#9BCDBF"
        strokeWidth="1"
        strokeDasharray="4 4"
      />
      <path
        d="M0,240 L300,180 L350,480 L600,340 L850,520 L900,220 L1200,380"
        stroke="#A7B8FF"
        strokeWidth="1"
      />
      <circle cx="300" cy="180" r="3" fill="#A7B8FF" />
      <circle cx="600" cy="340" r="3" fill="#9BCDBF" />
      <circle cx="900" cy="220" r="3" fill="#A7B8FF" />
    </svg>
  )
}

/**
 * 5. Organic Blob Aura — Smooth generative blob for ambient background illumination.
 */
export function HaikeiBlobAura({ className = '', opacity = 0.12 }: SvgProps) {
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
      viewBox="0 0 800 800"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity }}
    >
      <defs>
        <filter id="haikei-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="90" />
        </filter>
        <linearGradient id="haikei-blob-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A7B8FF" />
          <stop offset="50%" stopColor="#7E95F7" />
          <stop offset="100%" stopColor="#9BCDBF" />
        </linearGradient>
      </defs>
      <path
        d="M400,120 C540,110 680,210 690,360 C700,510 580,630 430,650 C280,670 140,590 120,440 C100,290 260,130 400,120 Z"
        fill="url(#haikei-blob-grad)"
        filter="url(#haikei-blur)"
      />
    </svg>
  )
}
