'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  CheckCircle2, Clock, Check, Sparkles,
  Layers, ShieldCheck, ArrowRight, ExternalLink
} from 'lucide-react'

type TabType = 'overview' | 'deliverables' | 'approvals' | 'invoices'

export function InteractiveSandbox() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [approvedDeliverable, setApprovedDeliverable] = useState(false)

  const tabs = [
    { id: 'overview' as TabType, label: '01 Milestone Progress' },
    { id: 'deliverables' as TabType, label: '02 Deliverable Sign-off' },
    { id: 'approvals' as TabType, label: '03 Scope Creep Shield' },
    { id: 'invoices' as TabType, label: '04 Stripe Settlements' },
  ]

  return (
    <section
      id="sandbox"
      className="py-20 md:py-32 bg-[#08090A] border-t border-white/[0.08] text-[#F3F4F6] relative overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-[#5E6AD2]/10 to-[#38BDF8]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header (No chips) */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#5E6AD2] mb-3 font-semibold">
            03 / Live Simulator
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-[-0.035em] text-white leading-[1.12]">
            See what your clients see.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#8A8F98] font-normal leading-relaxed max-w-xl mx-auto">
            Test the live client workspace interface without registering. Switch tabs to see how deliverables, sign-offs, and payments look to your clients.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center justify-center mb-8 overflow-x-auto pb-2">
          <div className="inline-flex items-center gap-1 p-1 rounded-full bg-[#0E1013] border border-white/[0.08]">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-full text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#5E6AD2] text-white shadow-[0_0_16px_rgba(94,106,210,0.4)] font-semibold'
                      : 'text-[#8A8F98] hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Interactive Sandbox Container */}
        <div className="max-w-4xl mx-auto rounded-2xl sm:rounded-3xl border border-white/[0.1] bg-[#0E1013] shadow-[0_25px_80px_rgba(0,0,0,0.7)] overflow-hidden text-left">
          {/* Browser Chrome */}
          <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#0A0C0E] px-4 py-3 select-none">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
              <span className="ml-2 text-xs font-mono text-[#8A8F98] hidden sm:inline">
                frevio.com/p/acme-brand
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-[#10B981]">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span>Simulated Client Portal</span>
            </div>
          </div>

          {/* Tab Body */}
          <div className="p-6 sm:p-8 bg-[#0E1013] min-h-[340px]">
            
            {/* VIEW 1: Milestone Progress */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-mono text-[#8A8F98] mb-2">
                    <span>Overall Milestone Progress</span>
                    <span className="text-[#5E6AD2] font-semibold">75% Complete (3 of 4 Milestones)</span>
                  </div>
                  <div className="w-full bg-white/[0.08] h-2.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-[#5E6AD2] to-[#38BDF8] h-full w-3/4 rounded-full" />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#121418] border border-white/[0.08] text-xs">
                    <div className="flex items-center gap-2.5 text-[#10B981]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-white font-medium">1. Architecture & UX Wireframes</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#10B981]">Completed Oct 1</span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#121418] border border-white/[0.08] text-xs">
                    <div className="flex items-center gap-2.5 text-[#10B981]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-white font-medium">2. High-Fidelity UI Design System</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#10B981]">Completed Oct 7</span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#121418] border border-[#5E6AD2]/40 text-xs">
                    <div className="flex items-center gap-2.5 text-[#5E6AD2]">
                      <Clock className="w-4 h-4" />
                      <span className="text-white font-medium">3. Frontend Staging & Stripe Integration</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#5E6AD2]">In Review · Due Oct 14</span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#121418]/50 border border-white/[0.06] text-xs text-[#8A8F98]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full border border-white/20" />
                      <span>4. Production Deployment & Handover</span>
                    </div>
                    <span className="text-[11px] font-mono">Scheduled Oct 21</span>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 2: Deliverable Sign-off */}
            {activeTab === 'deliverables' && (
              <div className="space-y-4">
                <div className="p-5 rounded-xl bg-[#121418] border border-[#5E6AD2]/40 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-mono text-[#5E6AD2] mb-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Interactive Prototype · Figma</span>
                      </div>
                      <h4 className="text-sm font-semibold text-white">
                        Customer Billing Portal v2.4 (Desktop & Mobile)
                      </h4>
                      <p className="text-xs text-[#8A8F98] mt-0.5">
                        Includes credit card update flow, subscription management dialogs, and invoice receipts.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {approvedDeliverable ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-[#10B981] bg-[#10B981]/15 border border-[#10B981]/40 px-3.5 py-1.5 rounded-lg font-mono">
                          <Check className="w-3.5 h-3.5" />
                          Approved by Client
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setApprovedDeliverable(true)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#5E6AD2] hover:bg-[#6875E3] px-3.5 py-1.5 rounded-lg transition-all cursor-pointer shadow-[0_0_12px_rgba(94,106,210,0.35)]"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve Deliverable</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-[#121418] border border-white/[0.08]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-mono text-[#38BDF8] mb-1">
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Staging Environment</span>
                      </div>
                      <h4 className="text-sm font-semibold text-white">
                        Vercel Preview Deployment (Build #148)
                      </h4>
                      <p className="text-xs text-[#8A8F98] mt-0.5">
                        Live sandbox connected to Stripe test keys.
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-1.5 text-xs text-[#8A8F98] font-mono px-3 py-1.5 rounded-lg bg-black/40 border border-white/[0.08]">
                      <ExternalLink className="w-3 h-3" />
                      View Preview
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 3: Scope Creep Shield */}
            {activeTab === 'approvals' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#121418] border border-white/[0.08] space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#5E6AD2]">Sarah Lin (Acme VP Product)</span>
                    <span className="text-[#8A8F98]">Yesterday, 3:45 PM</span>
                  </div>
                  <p className="text-xs text-white leading-relaxed">
                    &ldquo;The subscription upgrade dialog is perfect. Could we add Apple Pay and Google Pay one-touch buttons to the checkout step?&rdquo;
                  </p>
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.06] text-xs text-[#8A8F98] flex items-center justify-between">
                    <span>Converted to Change Order #02 with price & timeline impact.</span>
                    <span className="text-[#10B981] font-mono text-[11px]">Protected via Shield</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#121418] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-[#38BDF8] mb-1">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Change Order #02 · Scope Creep Shield</span>
                    </div>
                    <h4 className="text-sm font-medium text-white">
                      Apple Pay & Google Pay Express Checkout
                    </h4>
                    <p className="text-xs text-[#8A8F98] mt-0.5">
                      Estimated hours: 6h · Timeline adjustment: +2 business days
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-semibold text-[#10B981] font-mono">$750.00</div>
                    <span className="text-[10px] font-mono text-[#10B981]">
                      ✓ Approved & Settled
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 4: Stripe Settlements */}
            {activeTab === 'invoices' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#121418] border border-white/[0.08] flex items-center justify-between text-xs">
                  <div>
                    <div className="text-xs font-mono text-[#8A8F98]">Invoice #INV-2026-01</div>
                    <div className="text-sm font-medium text-white">Kickoff & Deposit (50%)</div>
                    <div className="text-[11px] text-[#8A8F98] font-mono mt-0.5">Paid via Stripe · Receipt sent</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-white font-mono">$4,000.00</div>
                    <span className="text-[11px] font-mono text-[#10B981]">
                      ✓ Settled
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#121418] border border-[#5E6AD2]/30 flex items-center justify-between text-xs">
                  <div>
                    <div className="text-xs font-mono text-[#5E6AD2]">Invoice #INV-2026-02</div>
                    <div className="text-sm font-medium text-white">Milestone 2 Sign-off Settlement</div>
                    <div className="text-[11px] text-[#8A8F98] font-mono mt-0.5">Due upon Sprint 3 deliverable approval</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-white font-mono">$3,500.00</div>
                    <span className="text-[11px] font-mono text-[#5E6AD2]">
                      Stripe Ready
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#121418] border border-white/[0.08] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-[#10B981]">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-white">Master Services Agreement (MSA)</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#8A8F98]">E-Signed Sept 18</span>
                </div>
              </div>
            )}

          </div>

          {/* Bottom Demo Bar */}
          <div className="p-4 bg-[#0A0C0E] border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8A8F98]">
            <span>This interactive sandbox reflects genuine Frevio client portal capabilities.</span>
            <Link
              href="/demo"
              className="inline-flex items-center gap-1.5 text-xs text-[#5E6AD2] hover:text-[#6875E3] font-medium transition-colors"
            >
              <span>Open full interactive demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  )
}
