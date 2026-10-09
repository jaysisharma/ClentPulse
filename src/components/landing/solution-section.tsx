'use client'

import Link from 'next/link'
import {
  CheckCircle2, Clock, Sparkles, ExternalLink,
  ShieldCheck, CreditCard, ArrowRight, ArrowUpRight
} from 'lucide-react'

interface Props {
  signupHref: string
}

export function SolutionSection({ signupHref }: Props) {
  return (
    <section
      id="solutions"
      className="py-20 md:py-28 bg-[#101113] border-t border-[#2A2D33] text-[#F5F5F3]"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#17191D] border border-[#2A2D33] text-xs font-mono text-[#9BCDBF] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9BCDBF]" />
            <span>The Frevio Solution</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-light tracking-[-0.03em] text-[#F5F5F3] leading-[1.15]">
            One workspace. <br />
            <span className="font-normal text-[#A7B8FF]">
              A better experience for every client.
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#A1A5AD] font-normal leading-relaxed max-w-xl mx-auto">
            Instead of spreading your projects across email, chat threads, and cloud drives, give each client one dedicated destination that answers their questions before they ask.
          </p>
        </div>

        {/* 3 Clear Capability Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Capability A: Keep every project clear */}
          <div className="rounded-2xl border border-[#2A2D33] bg-[#17191D] p-6 sm:p-7 flex flex-col justify-between hover:border-[#A7B8FF]/30 transition-colors">
            <div>
              <div className="text-xs font-mono text-[#9BCDBF] uppercase tracking-wider mb-2">
                01 · Visibility
              </div>
              <h3 className="text-lg font-medium text-[#F5F5F3] mb-2">
                Keep every project clear
              </h3>
              <p className="text-xs sm:text-sm text-[#A1A5AD] leading-relaxed mb-6">
                Clients see overall project health, active milestones, and what is currently being worked on without having to text you for updates.
              </p>
            </div>

            {/* Realistic UI Example A */}
            <div className="rounded-xl border border-[#2A2D33] bg-[#101113] p-4 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-[#A1A5AD] text-[11px]">
                <span>Brand Identity & Web</span>
                <span className="text-[#34D399]">Sprint 2 of 4</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-[#F5F5F3]">
                  <span>Discovery & Wireframes</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
                </div>
                <div className="flex justify-between text-xs text-[#A7B8FF]">
                  <span>Visual Design & UI</span>
                  <span className="text-[10px] bg-[#A7B8FF]/15 px-1.5 py-0.5 rounded text-[#A7B8FF]">Active</span>
                </div>
                <div className="flex justify-between text-xs text-[#A1A5AD]">
                  <span>Frontend Engineering</span>
                  <Clock className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Capability B: Share work and collect feedback */}
          <div className="rounded-2xl border border-[#2A2D33] bg-[#17191D] p-6 sm:p-7 flex flex-col justify-between hover:border-[#A7B8FF]/30 transition-colors">
            <div>
              <div className="text-xs font-mono text-[#A7B8FF] uppercase tracking-wider mb-2">
                02 · Approvals
              </div>
              <h3 className="text-lg font-medium text-[#F5F5F3] mb-2">
                Share work and collect feedback
              </h3>
              <p className="text-xs sm:text-sm text-[#A1A5AD] leading-relaxed mb-6">
                Deliverables are easy to access, review, and approve with 1 click. Create a crystal-clear paper trail for revisions and sign-offs.
              </p>
            </div>

            {/* Realistic UI Example B */}
            <div className="rounded-xl border border-[#2A2D33] bg-[#101113] p-4 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-[11px] text-[#A1A5AD]">
                <span className="text-[#A7B8FF]">Deliverable Sign-off</span>
                <span>Figma v2.1</span>
              </div>
              <div className="text-xs text-[#F5F5F3] font-sans font-medium">
                Landing Page Prototypes
              </div>
              <div className="pt-2 border-t border-[#2A2D33] flex items-center justify-between">
                <span className="text-[10px] text-[#A1A5AD]">Awaiting client</span>
                <span className="inline-flex items-center gap-1 text-[11px] bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/30 px-2 py-0.5 rounded">
                  <CheckCircle2 className="w-3 h-3" />
                  1-Click Approve
                </span>
              </div>
            </div>
          </div>

          {/* Capability C: Keep project administration organised */}
          <div className="rounded-2xl border border-[#2A2D33] bg-[#17191D] p-6 sm:p-7 flex flex-col justify-between hover:border-[#A7B8FF]/30 transition-colors">
            <div>
              <div className="text-xs font-mono text-[#9BCDBF] uppercase tracking-wider mb-2">
                03 · Administration
              </div>
              <h3 className="text-lg font-medium text-[#F5F5F3] mb-2">
                Keep project administration organised
              </h3>
              <p className="text-xs sm:text-sm text-[#A1A5AD] leading-relaxed mb-6">
                Centralize agreements, invoices, kickoff checklists, and scope change orders so payment and paperwork never stall progress.
              </p>
            </div>

            {/* Realistic UI Example C */}
            <div className="rounded-xl border border-[#2A2D33] bg-[#101113] p-4 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-[11px] text-[#A1A5AD]">
                <span>Invoicing & Scope</span>
                <span className="text-[#34D399]">Stripe Enabled</span>
              </div>
              <div className="flex items-center justify-between text-xs text-[#F5F5F3]">
                <span>Milestone 1 Deposit</span>
                <span className="text-[#34D399]">$3,500 Paid</span>
              </div>
              <div className="flex items-center justify-between text-xs text-[#A1A5AD]">
                <span>Change Order #01</span>
                <span className="text-[#FBBF24]">Due on approval</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
