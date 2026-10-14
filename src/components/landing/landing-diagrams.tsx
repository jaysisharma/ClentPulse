'use client'

import React from 'react'

interface DiagramProps {
  className?: string
}

// 1. Workflow Pipeline Vector Diagram (5 Connected Stages)
export function WorkflowPipelineDiagram({ className = 'w-full h-auto' }: DiagramProps) {
  return (
    <svg
      viewBox="0 0 780 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Frevio Project Delivery Pipeline"
    >
      <defs>
        <linearGradient id="pipe-line-grad" x1="0" y1="0" x2="780" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="node-active-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>

      {/* Main Connecting Track */}
      <line x1="70" y1="50" x2="710" y2="50" stroke="url(#pipe-line-grad)" strokeWidth="2" strokeDasharray="4 4" />

      {/* Stage 1: Setup */}
      <g transform="translate(40, 20)">
        <rect x="0" y="0" width="60" height="60" rx="16" fill="#0e1017" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
        <circle cx="30" cy="30" r="14" fill="#1e2230" />
        <path d="M25 30h10M30 25v10" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" />
        <text x="30" y="85" textAnchor="middle" fill="#f1f5f9" fontSize="12" fontWeight="500" fontFamily="sans-serif">01. Setup</text>
        <text x="30" y="102" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="sans-serif">60s project</text>
      </g>

      {/* Stage 2: Milestones */}
      <g transform="translate(200, 20)">
        <rect x="0" y="0" width="60" height="60" rx="16" fill="#0e1017" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
        <circle cx="30" cy="30" r="14" fill="#1e2230" />
        <path d="M23 26h14M23 30h10M23 34h6" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" />
        <text x="30" y="85" textAnchor="middle" fill="#f1f5f9" fontSize="12" fontWeight="500" fontFamily="sans-serif">02. Scope</text>
        <text x="30" y="102" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="sans-serif">Milestones</text>
      </g>

      {/* Stage 3: Passcode Access */}
      <g transform="translate(360, 20)">
        <rect x="0" y="0" width="60" height="60" rx="16" fill="#131522" stroke="rgba(139,92,246,0.4)" strokeWidth="1.5" />
        <circle cx="30" cy="30" r="14" fill="url(#node-active-grad)" />
        <rect x="25" y="27" width="10" height="8" rx="2" fill="#ffffff" />
        <path d="M27 27v-3a3 3 0 0 1 6 0v3" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
        <text x="30" y="85" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="600" fontFamily="sans-serif">03. Share</text>
        <text x="30" y="102" textAnchor="middle" fill="#a5b4fc" fontSize="10" fontFamily="sans-serif">No login link</text>
      </g>

      {/* Stage 4: Approvals */}
      <g transform="translate(520, 20)">
        <rect x="0" y="0" width="60" height="60" rx="16" fill="#0e1017" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
        <circle cx="30" cy="30" r="14" fill="#1e2230" />
        <path d="M24 30l4 4 8-8" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <text x="30" y="85" textAnchor="middle" fill="#f1f5f9" fontSize="12" fontWeight="500" fontFamily="sans-serif">04. Approve</text>
        <text x="30" y="102" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="sans-serif">1-click sign-off</text>
      </g>

      {/* Stage 5: Payment */}
      <g transform="translate(680, 20)">
        <rect x="0" y="0" width="60" height="60" rx="16" fill="#0e1017" stroke="rgba(52,211,153,0.3)" strokeWidth="1.5" />
        <circle cx="30" cy="30" r="14" fill="#064e3b" />
        <rect x="22" y="24" width="16" height="12" rx="3" stroke="#34d399" strokeWidth="1.5" />
        <line x1="22" y1="28" x2="38" y2="28" stroke="#34d399" strokeWidth="1.5" />
        <text x="30" y="85" textAnchor="middle" fill="#f1f5f9" fontSize="12" fontWeight="500" fontFamily="sans-serif">05. Settle</text>
        <text x="30" y="102" textAnchor="middle" fill="#34d399" fontSize="10" fontFamily="sans-serif">Stripe payout</text>
      </g>
    </svg>
  )
}

// 2. Client Portal Device Frame SVG (Browser + Mobile view)
export function ClientPortalMockupSVG({ className = 'w-full h-auto' }: DiagramProps) {
  return (
    <svg
      viewBox="0 0 680 440"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Client Portal Interactive Mockup"
    >
      <defs>
        <linearGradient id="bar-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="card-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#141724" />
          <stop offset="100%" stopColor="#0d0f17" />
        </linearGradient>
      </defs>

      {/* Outer Browser Window */}
      <rect x="2" y="2" width="676" height="436" rx="16" fill="#0a0c12" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
      
      {/* Window Title Bar */}
      <path d="M2 18 C2 9.16 9.16 2 18 2 H662 C670.84 2 678 9.16 678 18 V46 H2 Z" fill="#0f1118" stroke="rgba(255,255,255,0.06)" />
      <circle cx="24" cy="24" r="5" fill="#f43f5e" fillOpacity="0.8" />
      <circle cx="40" cy="24" r="5" fill="#eab308" fillOpacity="0.8" />
      <circle cx="56" cy="24" r="5" fill="#22c55e" fillOpacity="0.8" />
      
      {/* URL Pill */}
      <rect x="180" y="14" width="320" height="22" rx="6" fill="#181b26" stroke="rgba(255,255,255,0.08)" />
      <text x="340" y="29" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="monospace">frevio.cloud/p/acme-brand-system</text>

      {/* Lock Icon in URL bar */}
      <rect x="195" y="21" width="8" height="6" rx="1" fill="#10b981" />
      <path d="M197 21v-2a2 2 0 0 1 4 0v2" stroke="#10b981" strokeWidth="1" />

      {/* Portal Header */}
      <g transform="translate(36, 70)">
        <text x="0" y="16" fill="#818cf8" fontSize="11" fontWeight="600" fontFamily="monospace" letterSpacing="0.1em">ACME STUDIO CLIENT PORTAL</text>
        <text x="0" y="44" fill="#ffffff" fontSize="22" fontWeight="600" fontFamily="sans-serif">Brand System &amp; Web Platform</text>
        
        {/* Status Pill */}
        <rect x="470" y="20" width="138" height="28" rx="14" fill="rgba(16,185,129,0.12)" stroke="rgba(16,185,129,0.3)" />
        <circle cx="486" cy="34" r="3.5" fill="#34d399" />
        <text x="498" y="38" fill="#34d399" fontSize="11" fontWeight="600" fontFamily="sans-serif">75% Complete</text>
      </g>

      {/* Milestone Progress Bar */}
      <g transform="translate(36, 150)">
        <text x="0" y="0" fill="#94a3b8" fontSize="12" fontFamily="sans-serif">Milestones: 3 of 4 delivered</text>
        <text x="608" y="0" textAnchor="end" fill="#f1f5f9" fontSize="12" fontWeight="600" fontFamily="monospace">Target: Nov 15</text>
        
        <rect x="0" y="10" width="608" height="8" rx="4" fill="#1a1e2d" />
        <rect x="0" y="10" width="456" height="8" rx="4" fill="url(#bar-grad)" />
      </g>

      {/* Deliverable Review Card */}
      <g transform="translate(36, 195)">
        <rect x="0" y="0" width="608" height="96" rx="12" fill="url(#card-grad)" stroke="rgba(139,92,246,0.3)" strokeWidth="1.5" />
        
        {/* Icon */}
        <rect x="18" y="20" width="40" height="40" rx="10" fill="#202438" stroke="rgba(129,140,248,0.3)" />
        <path d="M33 34h10M33 40h7M33 46h4" stroke="#a5b4fc" strokeWidth="1.5" strokeLinecap="round" />

        <text x="74" y="38" fill="#ffffff" fontSize="14" fontWeight="600" fontFamily="sans-serif">Checkout &amp; UI Specifications v2.4</text>
        <text x="74" y="56" fill="#94a3b8" fontSize="12" fontFamily="sans-serif">Figma specs, design tokens, and prototype links · Sprint 3</text>

        {/* Approval Button */}
        <rect x="470" y="32" width="120" height="34" rx="8" fill="#4f46e5" />
        <text x="530" y="53" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="600" fontFamily="sans-serif">✓ Approved</text>
      </g>

      {/* Invoice Card */}
      <g transform="translate(36, 310)">
        <rect x="0" y="0" width="608" height="80" rx="12" fill="#0d1017" stroke="rgba(255,255,255,0.08)" />
        
        <text x="20" y="34" fill="#94a3b8" fontSize="11" fontFamily="monospace" letterSpacing="0.08em">INVOICE #INV-2026-084</text>
        <text x="20" y="58" fill="#ffffff" fontSize="15" fontWeight="600" fontFamily="sans-serif">Milestone 3 Settlement</text>

        <text x="440" y="47" textAnchor="end" fill="#ffffff" fontSize="20" fontWeight="700" fontFamily="monospace">$3,675.00</text>
        
        {/* Pay Button */}
        <rect x="470" y="24" width="120" height="34" rx="8" fill="#ffffff" />
        <text x="530" y="45" textAnchor="middle" fill="#0a0c12" fontSize="12" fontWeight="700" fontFamily="sans-serif">Pay via Stripe →</text>
      </g>
    </svg>
  )
}
