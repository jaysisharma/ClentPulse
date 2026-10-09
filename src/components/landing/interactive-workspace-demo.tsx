'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Layout, Sparkles, CheckCircle2, Clock, Check,
  ExternalLink, CreditCard, Layers, MessageSquare,
  FileText, ShieldCheck, ArrowRight, Play
} from 'lucide-react'
import { HaikeiDotMatrix, HaikeiPolyMesh } from '@/components/ui/haikei-backgrounds'

export function InteractiveWorkspaceDemo() {
  type DemoTab = 'overview' | 'deliverables' | 'approvals' | 'invoices'
  const [activeTab, setActiveTab] = useState<DemoTab>('overview')
  const [approvedDeliverable, setApprovedDeliverable] = useState(false)

  const tabs: { id: DemoTab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Project overview', icon: Layout },
    { id: 'deliverables', label: 'Deliverables', icon: Sparkles },
    { id: 'approvals', label: 'Feedback & approvals', icon: CheckCircle2 },
    { id: 'invoices', label: 'Invoices & admin', icon: CreditCard },
  ]

  return (
    <section
      id="demo"
      className="relative py-20 md:py-28 bg-[#101113] border-t border-[#2A2D33] text-[#F5F5F3] overflow-hidden"
    >
      {/* Haikei Background Accents */}
      <HaikeiDotMatrix className="absolute inset-0 w-full h-full" opacity={0.06} />
      <HaikeiPolyMesh className="absolute top-0 right-0 w-full md:w-3/4 h-full" opacity={0.035} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#17191D] border border-[#2A2D33] text-xs font-mono text-indigo-400 mb-4">
            <Play className="w-3 h-3 text-indigo-400 fill-current" />
            <span>Interactive Client Experience</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-light tracking-[-0.03em] text-[#F5F5F3] leading-[1.15]">
            See what your clients see.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#A1A5AD] font-normal leading-relaxed max-w-xl mx-auto">
            Experience the actual client workspace interface without registering. Switch tabs to see how deliverables, sign-offs, and payments look to your clients.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center justify-center mb-8 overflow-x-auto pb-2">
          <div className="inline-flex items-center gap-1.5 p-1.5 rounded-full bg-[#17191D] border border-[#2A2D33]">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                      : 'text-[#A1A5AD] hover:text-[#F5F5F3] hover:bg-[#1E2126]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Interactive Workspace Container */}
        <div className="max-w-4xl mx-auto rounded-2xl border border-[#2A2D33] bg-[#17191D] shadow-2xl overflow-hidden text-left">
          
          {/* Top Browser Meta Bar */}
          <div className="flex items-center justify-between border-b border-[#2A2D33] bg-[#101113] px-4 py-3 select-none">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#2A2D33]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#2A2D33]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#2A2D33]" />
              <span className="ml-2 text-xs font-mono text-[#A1A5AD]">
                frevio.cloud/p/acme-billing-portal
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#34D399] bg-[#34D399]/10 border border-[#34D399]/20 px-2 py-0.5 rounded">
              Sample Client View
            </span>
          </div>

          {/* Project Header */}
          <div className="p-6 border-b border-[#2A2D33] bg-[#17191D] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono text-[#A1A5AD] mb-1">
                Client: Acme Fintech Corp · Jaysi Sharma Studio
              </div>
              <h3 className="text-xl font-semibold text-[#F5F5F3]">
                Customer Billing Portal & Onboarding Flow
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[11px] font-mono text-[#A1A5AD] uppercase">Status</div>
                <div className="text-xs font-semibold text-[#34D399]">Sprint 3 · In Progress</div>
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#34D399] animate-pulse" />
            </div>
          </div>

          {/* Interactive Tab Body */}
          <div className="p-6 sm:p-8 bg-[#101113] min-h-[340px]">
            
            {/* VIEW 1: Project Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-fade-in">
                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs font-mono text-[#A1A5AD] mb-2">
                    <span>Overall Milestone Progress</span>
                    <span className="text-indigo-400 font-semibold">75% Complete (3 of 4 Milestones)</span>
                  </div>
                  <div className="w-full bg-[#2A2D33] h-2.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full w-3/4 rounded-full" />
                  </div>
                </div>

                {/* Milestones list */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#17191D] border border-[#2A2D33] text-xs">
                    <div className="flex items-center gap-2.5 text-[#34D399]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-[#F5F5F3] font-medium">1. Architecture & UX Wireframes</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#34D399]">Completed Oct 1</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#17191D] border border-[#2A2D33] text-xs">
                    <div className="flex items-center gap-2.5 text-[#34D399]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-[#F5F5F3] font-medium">2. High-Fidelity UI Design System</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#34D399]">Completed Oct 7</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#17191D] border border-indigo-500/30 text-xs">
                    <div className="flex items-center gap-2.5 text-indigo-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-indigo-400 font-medium">3. Frontend Staging & Stripe Integration</span>
                    </div>
                    <span className="text-[11px] font-mono text-indigo-400">In Review · Due Oct 14</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#17191D]/50 border border-[#2A2D33] text-xs text-[#A1A5AD]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full border border-[#2A2D33]" />
                      <span>4. Production Deployment & Handover</span>
                    </div>
                    <span className="text-[11px] font-mono">Scheduled Oct 21</span>
                  </div>
                </div>

                {/* Kickoff checklist status */}
                <div className="p-3.5 rounded-xl bg-[#17191D] border border-[#2A2D33] flex items-center justify-between text-xs">
                  <span className="text-[#A1A5AD]">Client Kickoff Checklist: 4 of 4 completed</span>
                  <span className="text-[#34D399] font-mono text-[11px]">✓ All Assets Provided</span>
                </div>
              </div>
            )}

            {/* VIEW 2: Deliverables */}
            {activeTab === 'deliverables' && (
              <div className="space-y-4 animate-fade-in">
                
                {/* Deliverable 1 */}
                <div className="p-4 rounded-xl bg-[#17191D] border border-indigo-500/40 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Interactive Prototype · Figma</span>
                      </div>
                      <h4 className="text-sm font-medium text-[#F5F5F3]">
                        Customer Billing Portal v2.4 (Desktop & Mobile)
                      </h4>
                      <p className="text-xs text-[#A1A5AD] mt-0.5">
                        Includes credit card update flow, subscription management dialogs, and invoice receipts.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {approvedDeliverable ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-[#34D399] bg-[#34D399]/15 border border-[#34D399]/30 px-3 py-1.5 rounded-lg font-mono">
                          <Check className="w-3.5 h-3.5" />
                          Approved by Client
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setApprovedDeliverable(true)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-sm shadow-indigo-600/20"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve Deliverable</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Deliverable 2 */}
                <div className="p-4 rounded-xl bg-[#17191D] border border-[#2A2D33]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-mono text-purple-400 mb-1">
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Staging Environment</span>
                      </div>
                      <h4 className="text-sm font-medium text-[#F5F5F3]">
                        Vercel Preview Deployment (Build #148)
                      </h4>
                      <p className="text-xs text-[#A1A5AD] mt-0.5">
                        Live sandbox connected to Stripe test keys.
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-1.5 text-xs text-[#A1A5AD] font-mono px-3 py-1.5 rounded-lg bg-[#101113] border border-[#2A2D33]">
                      <ExternalLink className="w-3 h-3" />
                      View Preview
                    </span>
                  </div>
                </div>

                {/* Deliverable 3 */}
                <div className="p-4 rounded-xl bg-[#17191D] border border-[#2A2D33]">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-mono text-[#A1A5AD] mb-1">Brand Assets Package</div>
                      <h4 className="text-sm font-medium text-[#F5F5F3]">Vector Iconography & Brand Color Tokens</h4>
                    </div>
                    <span className="text-[11px] font-mono text-[#34D399] bg-[#34D399]/10 px-2.5 py-1 rounded">
                      Signed Off
                    </span>
                  </div>
                </div>

              </div>
            )}

            {/* VIEW 3: Feedback & Approvals */}
            {activeTab === 'approvals' && (
              <div className="space-y-4 animate-fade-in">
                
                {/* Client comment with response */}
                <div className="p-4 rounded-xl bg-[#17191D] border border-[#2A2D33] space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-indigo-400">Sarah Lin (Acme VP Product)</span>
                    <span className="text-[#A1A5AD]">Yesterday, 3:45 PM</span>
                  </div>
                  <p className="text-xs text-[#F5F5F3] leading-relaxed">
                    &ldquo;The subscription upgrade dialog is perfect. Could we add Apple Pay and Google Pay one-touch buttons to the checkout step?&rdquo;
                  </p>
                  <div className="p-2.5 rounded-lg bg-[#101113] border border-[#2A2D33] text-xs text-[#A1A5AD] flex items-center justify-between">
                    <span>Converted to Change Order #02 with price and timeline impact.</span>
                    <span className="text-[#34D399] font-mono text-[11px]">Protected via Shield</span>
                  </div>
                </div>

                {/* Change Order Card */}
                <div className="p-4 rounded-xl bg-[#17191D] border border-[#2A2D33] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-purple-400 mb-1">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Change Order #02 · Scope Creep Shield</span>
                    </div>
                    <h4 className="text-sm font-medium text-[#F5F5F3]">
                      Apple Pay & Google Pay Express Checkout
                    </h4>
                    <p className="text-xs text-[#A1A5AD] mt-0.5">
                      Estimated hours: 6h · Timeline adjustment: +2 business days
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-semibold text-[#34D399] font-mono">$750.00</div>
                    <span className="text-[10px] font-mono text-[#34D399] bg-[#34D399]/15 px-2 py-0.5 rounded">
                      Approved & Settled
                    </span>
                  </div>
                </div>

              </div>
            )}

            {/* VIEW 4: Invoices & Administration */}
            {activeTab === 'invoices' && (
              <div className="space-y-4 animate-fade-in">
                
                {/* Invoice 1: Paid */}
                <div className="p-4 rounded-xl bg-[#17191D] border border-[#2A2D33] flex items-center justify-between text-xs">
                  <div>
                    <div className="text-xs font-mono text-[#A1A5AD]">Invoice #INV-2026-01</div>
                    <div className="text-sm font-medium text-[#F5F5F3]">Kickoff & Deposit (50%)</div>
                    <div className="text-[11px] text-[#A1A5AD] font-mono mt-0.5">Paid via Stripe · Receipt sent</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-[#F5F5F3] font-mono">$4,000.00</div>
                    <span className="text-[11px] font-mono text-[#34D399] bg-[#34D399]/15 px-2 py-0.5 rounded">
                      Paid
                    </span>
                  </div>
                </div>

                {/* Invoice 2: Upcoming */}
                <div className="p-4 rounded-xl bg-[#17191D] border border-indigo-500/30 flex items-center justify-between text-xs">
                  <div>
                    <div className="text-xs font-mono text-indigo-400">Invoice #INV-2026-02</div>
                    <div className="text-sm font-medium text-[#F5F5F3]">Milestone 2 Sign-off Settlement</div>
                    <div className="text-[11px] text-[#A1A5AD] font-mono mt-0.5">Due upon Sprint 3 deliverable approval</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-[#F5F5F3] font-mono">$3,500.00</div>
                    <span className="text-[11px] font-mono text-indigo-400 bg-indigo-500/15 px-2 py-0.5 rounded">
                      Pay with Stripe
                    </span>
                  </div>
                </div>

                {/* Contract status */}
                <div className="p-3.5 rounded-xl bg-[#17191D] border border-[#2A2D33] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-[#34D399]">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[#F5F5F3]">Master Services Agreement (MSA)</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#A1A5AD]">E-Signed Sept 18</span>
                </div>

              </div>
            )}

          </div>

          {/* Bottom Bar: Explore full demo link */}
          <div className="p-4 bg-[#17191D] border-t border-[#2A2D33] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#A1A5AD]">
            <span>This demonstration reflects genuine Frevio client portal capabilities.</span>
            <Link
              href="/demo"
              className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
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
