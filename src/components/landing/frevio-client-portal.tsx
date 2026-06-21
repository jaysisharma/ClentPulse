import { Lock, FileText, Check, ArrowRight, ShieldCheck, Download } from 'lucide-react'

const ACCENT = '#6C4CFD'

// Static CSS mockup of the client's passcode-protected portal.
export function FrevioClientPortal({ className = '' }: { className?: string }) {
  return (
    <div className={`grid gap-6 md:grid-cols-2 ${className}`}>
      
      {/* MOCKUP 1: The Passcode Gate (Left Panel) */}
      <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#0B0B12] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.7)]">
        {/* browser window chrome */}
        <div className="flex items-center gap-2 border-b border-white/5 bg-white/[0.02] px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          <div className="ml-3 rounded bg-white/[0.04] px-2 py-0.5 text-[9px] font-medium text-white/40">
            frevio.cloud/p/acme-corp
          </div>
        </div>

        {/* passcode content */}
        <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6C4CFD]/15 text-[#6C4CFD]">
            <Lock className="h-5 w-5" style={{ color: ACCENT }} />
          </div>
          
          <h3 className="mt-4 text-base font-bold text-slate-200">Passcode Required</h3>
          <p className="mt-1 max-w-[220px] text-xs text-slate-400">
            This client portal is encrypted. Enter your 6-digit access code to view updates.
          </p>

          {/* fake passcode inputs */}
          <div className="mt-6 flex gap-2">
            {[1, 2, 3, 4].map((v, i) => (
              <span key={i} className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.02] font-bold text-slate-200">
                ●
              </span>
            ))}
            <span className="flex h-10 w-10 animate-pulse items-center justify-center rounded-lg border-2 border-[#6C4CFD] bg-white/[0.04] font-bold text-slate-100">
              |
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/5 bg-white/[0.01] text-slate-600">
              
            </span>
          </div>

          <button 
            className="mt-6 flex items-center justify-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-semibold text-white shadow-md transition-opacity hover:opacity-90"
            style={{ background: ACCENT }}
          >
            Unlock Portal <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* MOCKUP 2: The Portal Dashboard (Right Panel) */}
      <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#0B0B12] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.7)]">
        {/* browser window chrome */}
        <div className="flex items-center gap-2 border-b border-white/5 bg-white/[0.02] px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          <div className="ml-3 rounded bg-white/[0.04] px-2 py-0.5 text-[9px] font-medium text-white/40">
            frevio.cloud/p/acme-corp · Active
          </div>
        </div>

        {/* portal content */}
        <div className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-200">Acme Redesign</h3>
              <p className="text-[10px] text-slate-400">by Jordan Studio</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-medium text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="h-3 w-3" /> Secure Portal
            </span>
          </div>

          {/* Progress */}
          <div className="mt-4 rounded-xl bg-white/[0.02] border border-white/5 p-3">
            <div className="flex justify-between text-[11px] font-semibold text-slate-300">
              <span>Overall Progress</span>
              <span>72%</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full" style={{ width: '72%', background: ACCENT }} />
            </div>
          </div>

          {/* Outstanding Invoice Card */}
          <div className="mt-4 rounded-xl border border-rose-950/60 bg-rose-950/10 p-3.5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-rose-400">Invoice Pending</span>
                <h4 className="mt-0.5 text-xs font-bold text-slate-200">Milestone 2: Design Assets</h4>
                <p className="text-[10px] text-slate-400">Due: June 25 · $1,250.00</p>
              </div>
              <button 
                className="rounded-lg px-3 py-1.5 text-[10px] font-bold text-white transition-colors"
                style={{ background: ACCENT }}
              >
                Pay Stripe
              </button>
            </div>
          </div>

          {/* Update Card */}
          <div className="mt-4 border-l-2 pl-3" style={{ borderColor: ACCENT }}>
            <span className="text-[9px] font-semibold text-slate-400">Latest Update · Today</span>
            <h5 className="text-xs font-semibold text-slate-300 font-bold">Homepage redesigned &amp; mobile menu fixed</h5>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
              Rebuilt the hero image grid and mobile navigation. Please review the updated layout.
            </p>
            
            {/* assets attached */}
            <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] p-2">
              <FileText className="h-3.5 w-3.5 text-slate-500" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] font-medium text-slate-300">Homepage-Mockups.pdf</p>
                <p className="text-[8px] text-slate-500">3.4 MB</p>
              </div>
              <button className="rounded p-1 text-slate-400 hover:bg-white/5 hover:text-slate-200">
                <Download className="h-3 w-3" />
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
