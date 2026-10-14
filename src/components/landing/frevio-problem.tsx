'use client'

import { AlertCircle, CheckCircle2, MessageSquare, Mail, Folder, CreditCard } from 'lucide-react'

export function FrevioProblem() {
  return (
    <section id="problem" className="py-20 md:py-28 px-4 sm:px-6 bg-[#08090a] border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Tag */}
        <div className="mb-4">
          <span className="text-xs font-mono uppercase tracking-[0.16em] text-indigo-400">
            The reality of client work
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left: Editorial Headline & Narrative */}
          <div className="lg:col-span-5 space-y-5">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal text-white tracking-[-0.03em] leading-[1.12]">
              Client work gets messy when it’s everywhere.
            </h2>
            <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed">
              Updates live in messaging apps. Feedback arrives through email. Files sit in separate folders. Invoices are disconnected from project progress. Clients end up asking what is happening, while freelancers spend time chasing information.
            </p>
            <p className="text-sm text-slate-400 font-light leading-relaxed">
              When communication is scattered, scope creeps silently, deliverables get lost in long comment chains, and both sides end up frustrated.
            </p>
          </div>

          {/* Right: Authentic Contrast Editorial Board */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* The Fragmented Reality */}
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.03] p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-rose-400">
                <span className="flex items-center gap-1.5 font-semibold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  The Fragmented Stack
                </span>
                <span>4+ apps open</span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300 font-mono">
                <div className="p-3 rounded-lg bg-black/40 border border-white/[0.06] flex items-start gap-3">
                  <MessageSquare className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 font-sans">WhatsApp / Slack:</span>
                    <p className="text-slate-200 font-sans mt-0.5">&ldquo;Hey, just checking in — where are we on the checkout page design?&rdquo;</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-black/40 border border-white/[0.06] flex items-start gap-3">
                  <Mail className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 font-sans">Email thread (Reply #14):</span>
                    <p className="text-slate-200 font-sans mt-0.5">&ldquo;Looks great! Can we also change the header and add three new case studies?&rdquo;</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-black/40 border border-white/[0.06] flex items-start gap-3">
                  <Folder className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 font-sans">Google Drive / Dropbox:</span>
                    <p className="text-slate-200 font-sans mt-0.5">&ldquo;Can you resend the latest link? The one from last Tuesday isn&apos;t opening.&rdquo;</p>
                  </div>
                </div>
              </div>
            </div>

            {/* The Frevio Workspace */}
            <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/[0.04] p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-indigo-400">
                <span className="flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                  The Frevio Way
                </span>
                <span>1 organized workspace</span>
              </div>

              <p className="text-sm text-slate-200 font-light leading-relaxed">
                One permanent, passcode-protected project link where clients check milestones, review progress updates, sign off on deliverables, and pay invoices. No scattered notifications. No repeated questions.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  )
}
