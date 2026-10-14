'use client'

import Link from 'next/link'
import { Logo } from '@/components/ui/logo'

export function FrevioFooter() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#07080a] py-14 px-4 sm:px-6 text-xs text-slate-400">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Brand identity */}
        <div className="flex items-center gap-2.5">
          <Logo className="w-5 h-5" />
          <span className="font-semibold text-white text-sm tracking-tight font-sans">
            Frevio
          </span>
          <span className="text-slate-700">/</span>
          <span className="text-slate-400 font-light text-xs">
            A clearer way to manage client work
          </span>
        </div>

        {/* Footer Navigation Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-slate-300 font-normal text-xs">
          <a href="#problem" className="hover:text-white transition-colors">Problem</a>
          <a href="#solution" className="hover:text-white transition-colors">Solution</a>
          <a href="#workflow" className="hover:text-white transition-colors">Workflow</a>
          <a href="#client-experience" className="hover:text-white transition-colors">Client Portal</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          <Link href="/demo" className="hover:text-white transition-colors">Live Demo</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
        </div>

        {/* System Status & Copyright */}
        <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>All systems operational</span>
          <span className="text-slate-700">·</span>
          <span>© {new Date().getFullYear()} Frevio</span>
        </div>

      </div>
    </footer>
  )
}
