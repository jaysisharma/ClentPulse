'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Lock, CheckCircle2, ArrowUpRight, MessageSquare,
  FileText, ExternalLink, Check, Sparkles
} from 'lucide-react'

export function FrevioClientExperience() {
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
    <section id="client-experience" className="py-20 md:py-28 px-4 sm:px-6 bg-[#0a0b10] border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-14 sm:mb-16 space-y-4">
          <div className="text-xs font-mono uppercase tracking-[0.16em] text-indigo-400">
            The client experience
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal text-white tracking-[-0.03em] leading-[1.12]">
            Keep clients in the loop without the back and forth.
          </h2>
          <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed">
            Give clients a clear place to see progress, review deliverables, share feedback, and follow the next steps — without creating another account.
          </p>
        </div>

        {/* ── Two Column Architecture: Breakdown on Left, Faithful Portal Preview on Right ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left: What Freelancer Controls vs What Client Sees */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="rounded-2xl border border-white/[0.08] bg-[#0d0e14] p-6 space-y-4">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                What the freelancer controls
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300 font-light">
                <li className="flex items-start gap-2.5">
                  <span className="text-indigo-400 font-mono text-xs">✓</span>
                  <span>Internal project admin, private notes, and cost tracking</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-indigo-400 font-mono text-xs">✓</span>
                  <span>Drafting and scheduling weekly progress updates</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-indigo-400 font-mono text-xs">✓</span>
                  <span>Custom studio logo and accent branding</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-indigo-400 font-mono text-xs">✓</span>
                  <span>Setting milestone payment terms and Stripe invoices</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/[0.03] p-6 space-y-4">
              <div className="text-xs font-mono uppercase tracking-wider text-indigo-300 font-semibold">
                What the client sees
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300 font-light">
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-mono text-xs">✓</span>
                  <span>Read-only roadmap with real-time milestone percentage</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-mono text-xs">✓</span>
                  <span>Formatted weekly updates with preview links and files</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-mono text-xs">✓</span>
                  <span>1-click deliverable sign-offs with revision requests</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-mono text-xs">✓</span>
                  <span>Direct online payments through secure Stripe Checkout</span>
                </li>
              </ul>
            </div>

            <div className="pt-2">
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 text-sm font-medium text-white hover:text-indigo-300 transition-colors"
              >
                Launch interactive client portal demo <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

          </div>

          {/* Right: Client Portal Mockup with Feedback Input */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-white/[0.12] bg-[#0c0d12] shadow-2xl overflow-hidden">
              
              {/* Portal Header */}
              <div className="border-b border-white/[0.08] bg-[#08090d] px-5 py-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Client Portal
                  </span>
                  <div className="text-sm font-medium text-white">
                    Acme Mobile App Redesign
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                    <span className="size-1.5 rounded-full bg-emerald-400" />
                    75% Complete
                  </span>
                </div>
              </div>

              {/* Portal Content */}
              <div className="p-6 space-y-6">
                
                {/* Milestone Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-400 font-mono">
                    <span>Milestones: 3 of 4 delivered</span>
                    <span className="text-white">Target: Nov 15</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: '75%' }} />
                  </div>
                </div>

                {/* Latest Update */}
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Sprint 3 Recap</span>
                    <span className="font-mono text-slate-400 text-[11px]">Oct 12</span>
                  </div>
                  <p className="text-slate-300 font-light leading-relaxed">
                    Staging checkout build deployed. Product catalog responsive across mobile and tablet. Ready for final review of UI specifications.
                  </p>
                </div>

                {/* Deliverable Review Card */}
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400 flex-shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-white">Final UI Specifications v2.4</div>
                      <div className="text-[10px] text-slate-400 font-mono">Figma specs &amp; prototype tokens</div>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                    Approved
                  </span>
                </div>

                {/* Interactive Feedback / Note Form */}
                <div className="pt-2">
                  <form onSubmit={handleSendComment} className="space-y-2">
                    <label className="text-[11px] font-mono text-slate-400 block">
                      Client feedback &amp; questions (try it):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="e.g. Looks good! When is the staging demo?"
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
                        <Check className="w-3 h-3" /> Note delivered directly to the project dashboard!
                      </p>
                    )}
                  </form>
                </div>

              </div>

              {/* Footnote */}
              <div className="px-6 py-2.5 bg-[#08090d] border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Passcode protected</span>
                <span>frevio.cloud/p/acme</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
