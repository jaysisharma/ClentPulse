import Link from 'next/link'
import { Logo } from '@/components/ui/logo'

export function OveradsFooter() {
  return (
    <footer className="border-t border-slate-200 dark:border-white/10 bg-[#FAFAFC] dark:bg-[#050608] text-slate-600 dark:text-slate-400 text-xs font-sans transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-16 lg:py-20">
        
        {/* Main Grid: Brand + 3 Compact Columns */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 lg:gap-14 pb-12 border-b border-slate-200 dark:border-white/10">
          
          {/* Brand Info (2 Cols) */}
          <div className="md:col-span-2 space-y-3.5">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Logo className="w-5 h-5 text-indigo-600 dark:text-white" />
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white font-mono">Frevio</span>
            </Link>

            <p className="text-xs text-slate-600 dark:text-slate-400 font-light leading-relaxed max-w-sm">
              The client operating system for modern studios, developers, and freelancers. Automate weekly updates, live presence, and milestone payments.
            </p>

            <div className="inline-flex items-center gap-2 pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">All systems operational</span>
            </div>
          </div>

          {/* Column 1: Product */}
          <div className="space-y-3">
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] font-semibold text-slate-900 dark:text-slate-200">
              Product
            </div>
            <ul className="space-y-2.5 font-light">
              <li><a href="#screens" className="hover:text-slate-950 dark:hover:text-white transition-colors">Client Portals</a></li>
              <li><a href="#workflows" className="hover:text-slate-950 dark:hover:text-white transition-colors">Weekly Broadcasts</a></li>
              <li><a href="#presence" className="hover:text-slate-950 dark:hover:text-white transition-colors">Live Presence</a></li>
              <li><a href="#approvals" className="hover:text-slate-950 dark:hover:text-white transition-colors">Approvals</a></li>
              <li><a href="#pricing" className="hover:text-slate-950 dark:hover:text-white transition-colors">Pricing & Plans</a></li>
            </ul>
          </div>

          {/* Column 2: Crafts */}
          <div className="space-y-3">
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] font-semibold text-slate-900 dark:text-slate-200">
              Solutions
            </div>
            <ul className="space-y-2.5 font-light">
              <li><Link href="/onboarding" className="hover:text-slate-950 dark:hover:text-white transition-colors">For Developers</Link></li>
              <li><Link href="/onboarding" className="hover:text-slate-950 dark:hover:text-white transition-colors">For Marketers</Link></li>
              <li><Link href="/onboarding" className="hover:text-slate-950 dark:hover:text-white transition-colors">For Designers</Link></li>
              <li><Link href="/onboarding" className="hover:text-slate-950 dark:hover:text-white transition-colors">For Consultants</Link></li>
              <li><Link href="/upgrade" className="hover:text-slate-950 dark:hover:text-white transition-colors">For Agencies</Link></li>
            </ul>
          </div>

          {/* Column 3: Trust & Company */}
          <div className="space-y-3">
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] font-semibold text-slate-900 dark:text-slate-200">
              Company
            </div>
            <ul className="space-y-2.5 font-light">
              <li><Link href="/privacy" className="hover:text-slate-950 dark:hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-slate-950 dark:hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/roadmap" className="hover:text-slate-950 dark:hover:text-white transition-colors">Roadmap</Link></li>
              <li><a href="mailto:support@frevio.app" className="hover:text-slate-950 dark:hover:text-white transition-colors">Support Desk</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Colophon */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div>
            © {new Date().getFullYear()} Frevio Inc. All rights reserved.
          </div>

          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-950 dark:hover:text-white transition-colors" aria-label="X (Twitter)">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-950 dark:hover:text-white transition-colors" aria-label="GitHub">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-950 dark:hover:text-white transition-colors" aria-label="LinkedIn">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.62 1.62 0 0 0-1.62 1.62 1.62 1.62 0 0 0 1.62 1.62 1.62 1.62 0 0 0 1.62-1.62 1.62 1.62 0 0 0-1.62-1.62z"/>
              </svg>
            </a>
          </div>
        </div>

      </div>
    </footer>
  )
}
