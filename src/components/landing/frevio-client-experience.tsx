'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Lock, CheckCircle2, ArrowUpRight, MessageSquare,
  FileText, ExternalLink, Check, Sparkles, Smartphone, Laptop, ShieldCheck
} from 'lucide-react'

export function FrevioClientExperience() {
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop')
  const [commentSent, setCommentSent] = useState(false)
  const [commentText, setCommentText] = useState('')

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return
    setCommentSent(true)
    setTimeout(() => {
      setCommentText('')
      setCommentSent(false)
    }, 3000)
  }

  return (
    <section id="client-experience" className="py-16 md:py-24 px-4 sm:px-6 bg-[#08090a] border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-xs font-mono uppercase tracking-[0.16em] text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>The Client Experience</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal text-white tracking-[-0.03em] leading-[1.12]">
            Clients stay in the loop without creating an account.
          </h2>

          <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed max-w-2xl mx-auto">
            No signup friction. Clients enter a private 6-digit passcode to view milestones, inspect deliverables, and pay invoices.
          </p>
        </div>

        {/* ── Visual Comparison: Client Passcode Entry vs. Live Workspace ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left: The Frictionless Passcode Screen (Visual) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl border border-white/[0.1] bg-[#0d0e14] p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1.5 text-indigo-400">
                  <Lock className="w-3.5 h-3.5" />
                  Secure Client Entry
                </span>
                <span>Step 1 of 1</span>
              </div>

              {/* Passcode UI visual mockup */}
              <div className="text-center py-4 space-y-3">
                <div className="size-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
                  <Lock className="w-5 h-5" />
                </div>
                <h4 className="text-base font-medium text-white">Enter Project Passcode</h4>
                <p className="text-xs text-slate-400 max-w-[220px] mx-auto font-light">
                  Protected project link shared by your studio.
                </p>

                {/* 6-Digit PIN Visual */}
                <div className="flex justify-center gap-2 pt-2">
                  {['8', '4', '2', '9', '1', '6'].map((digit, i) => (
                    <div
                      key={i}
                      className="size-9 rounded-lg border border-indigo-500/40 bg-indigo-500/10 flex items-center justify-center text-sm font-mono text-white font-bold"
                    >
                      {digit}
                    </div>
                  ))}
                </div>
              </div>

              {/* Client Perks List */}
              <div className="pt-2 border-t border-white/[0.08] space-y-2 text-xs text-slate-300 font-light">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>No password to remember</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>No account creation form</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Works seamlessly on mobile &amp; desktop</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: The Complete Client Portal Experience */}
          <div className="lg:col-span-8">
            <div className="rounded-2xl border border-white/[0.12] bg-[#0c0d12] shadow-2xl overflow-hidden">
              
              {/* Window Bar with Device Mode Selector */}
              <div className="border-b border-white/[0.08] bg-[#08090d] px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="size-2.5 rounded-full bg-rose-500/70" />
                    <span className="size-2.5 rounded-full bg-amber-500/70" />
                    <span className="size-2.5 rounded-full bg-emerald-500/70" />
                  </div>
                  <span className="text-xs font-mono text-slate-400 ml-2">
                    frevio.cloud/p/acme-mobile-app
                  </span>
                </div>

                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  Client View · No Login Required
                </span>
              </div>

              {/* Client Portal Content View */}
              <div className="p-6 sm:p-7 space-y-6">
                
                {/* Project Overview Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/[0.06]">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400">
                      Acme Brand Engagement
                    </span>
                    <h3 className="text-xl font-normal text-white mt-0.5">
                      iOS &amp; Web Platform Redesign
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Sprint 3 Active · 75% Complete
                  </span>
                </div>

                {/* Milestone Deliverable Awaiting Sign-off */}
                <div className="rounded-xl border border-indigo-500/25 bg-indigo-500/[0.03] p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">Checkout Flow UI Prototype v2.4</div>
                        <div className="text-xs text-slate-400 font-mono">Ready for client sign-off</div>
                      </div>
                    </div>
                    <span className="hidden sm:inline-block px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono">
                      Action Required
                    </span>
                  </div>

                  {/* Actions for client */}
                  <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/[0.06]">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 text-xs font-semibold hover:bg-emerald-400 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>1-Click Approve Milestone</span>
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 rounded-lg border border-white/10 bg-white/[0.04] text-slate-300 text-xs font-medium hover:bg-white/[0.08] transition-colors cursor-pointer"
                    >
                      Request Revisions
                    </button>
                  </div>
                </div>

                {/* Interactive Feedback Form */}
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-2">
                  <form onSubmit={handleSendComment} className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Quick note to freelancer:</span>
                      <span className="text-slate-500">Live sync</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="e.g. Approved the color scheme! Ready to pay invoice."
                        className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 transition-colors"
                      />
                      <button
                        type="submit"
                        className="rounded-lg bg-white text-slate-950 px-3.5 py-2 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer flex-shrink-0"
                      >
                        Send
                      </button>
                    </div>
                    {commentSent && (
                      <p className="text-[11px] text-emerald-400 font-mono flex items-center gap-1 mt-1">
                        <Check className="w-3 h-3" /> Note sent straight to your freelancer&apos;s workspace!
                      </p>
                    )}
                  </form>
                </div>

              </div>

              {/* Footer */}
              <div className="px-6 py-3 bg-[#08090d] border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400 font-mono">
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-1 text-white hover:text-indigo-300 transition-colors"
                >
                  <span>Experience the full live demo</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
                <span>Zero friction</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
