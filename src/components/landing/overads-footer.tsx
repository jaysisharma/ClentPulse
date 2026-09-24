'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import {
  ArrowRight, ShieldCheck, Terminal, Zap, Radio, Check,
  ExternalLink, Sparkles, Mail, Lock, Heart
} from 'lucide-react'

export function OveradsFooter() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !email.includes('@')) return
    setLoading(true)
    
    // Simulate brief network dispatch / analytics capture
    setTimeout(() => {
      setLoading(false)
      setSubscribed(true)
    }, 600)
  }

  return (
    <footer className="relative bg-[#08090d] text-slate-400 font-sans border-t border-white/10 selection:bg-indigo-500/30 selection:text-white overflow-hidden">
      {/* Top subtle ambient glow lines */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" 
      />
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[250px] bg-indigo-500/10 blur-[140px] rounded-full" 
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-16 sm:pt-20 pb-12">
        {/* ── 1. Pre-Footer Highlights & Trust Strip ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-16 border-b border-white/10">
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Zero Password Friction</h4>
            <p className="text-xs text-slate-400 font-light mt-1.5 leading-relaxed">
              Clients access updates, live feeds, and approvals with 1-click tokenized access. No login barriers.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3.5">
              <Terminal className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Private Telemetry</h4>
            <p className="text-xs text-slate-400 font-light mt-1.5 leading-relaxed">
              Tracks only active work session durations and timestamps. Source code and files stay local.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3.5">
              <Zap className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Stripe Escrow & Gates</h4>
            <p className="text-xs text-slate-400 font-light mt-1.5 leading-relaxed">
              Lock project kickoff behind upfront deposits. Invoicing and multi-currency retainers routed instantly.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-3.5">
              <Radio className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Live Uptime SLA</h4>
            <p className="text-xs text-slate-400 font-light mt-1.5 leading-relaxed">
              Public client portals served across global edge nodes with 99.98% reliability and sub-second load times.
            </p>
          </div>
        </div>

        {/* ── 2. Main Directory & Newsletter ── */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8">
          
          {/* Brand & Newsletter Column (Spans 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <Link href="/" className="inline-flex items-center gap-2.5 group">
                <Logo className="w-6 h-6 text-white" />
                <span className="font-bold text-lg tracking-tight text-white font-mono">Frevio</span>
                <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 ml-1">
                  v2.0
                </span>
              </Link>
              <p className="text-xs text-slate-400 font-light mt-3 leading-relaxed max-w-sm">
                The client operating system engineered for high-performing freelancers, studios, and boutique agencies. Automate communication, share live presence, and get paid with zero stress.
              </p>
            </div>

            {/* Newsletter Subscription */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3 max-w-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>The Studio Dispatch</span>
              </div>
              <p className="text-[11px] text-slate-400 font-light leading-relaxed">
                Bi-weekly tactical teardowns on client retention, milestone pricing, and automation frameworks.
              </p>

              {subscribed ? (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
                  <Check className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>You&apos;re subscribed to The Studio Dispatch.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-2">
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="alex@studio.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-semibold py-2 px-3 text-xs transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
                  >
                    <span>{loading ? 'Subscribing…' : 'Join 1,400+ specialists'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </form>
              )}
            </div>

            {/* System Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-[11px] font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-500">99.99%</span>
            </div>
          </div>

          {/* Nav Column 1: Product */}
          <div className="space-y-3.5">
            <h5 className="text-[11px] font-mono uppercase tracking-[0.2em] font-semibold text-slate-200">
              Product
            </h5>
            <ul className="space-y-2.5 text-xs font-light">
              <li>
                <a href="#screens" className="hover:text-white transition-colors">Client Status Portals</a>
              </li>
              <li>
                <a href="#presence" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>Live Coding Heartbeat</span>
                  <span className="text-[9px] font-mono uppercase px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Live</span>
                </a>
              </li>
              <li>
                <a href="#workflows" className="hover:text-white transition-colors">Weekly Broadcasts</a>
              </li>
              <li>
                <a href="#screens" className="hover:text-white transition-colors">Performance KPI Strips</a>
              </li>
              <li>
                <a href="#approvals" className="hover:text-white transition-colors">Deliverable Sign-Offs</a>
              </li>
              <li>
                <a href="#invoices" className="hover:text-white transition-colors">Upfront Deposit Gates</a>
              </li>
              <li>
                <Link href="/settings" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>VS Code Extension</span>
                  <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Nav Column 2: Solutions / Craft */}
          <div className="space-y-3.5">
            <h5 className="text-[11px] font-mono uppercase tracking-[0.2em] font-semibold text-slate-200">
              Craft Personas
            </h5>
            <ul className="space-y-2.5 text-xs font-light">
              <li>
                <Link href="/onboarding" className="hover:text-white transition-colors">Software Developers</Link>
              </li>
              <li>
                <Link href="/onboarding" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>Digital Marketers</span>
                  <span className="text-[9px] font-mono uppercase px-1 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">New</span>
                </Link>
              </li>
              <li>
                <Link href="/onboarding" className="hover:text-white transition-colors">UI / UX Designers</Link>
              </li>
              <li>
                <Link href="/onboarding" className="hover:text-white transition-colors">Growth Consultants</Link>
              </li>
              <li>
                <Link href="/upgrade" className="hover:text-white transition-colors">Boutique Agencies</Link>
              </li>
              <li>
                <Link href="/settings" className="hover:text-white transition-colors text-slate-400 hover:text-slate-200">Workspace Modules</Link>
              </li>
            </ul>
          </div>

          {/* Nav Column 3: Resources */}
          <div className="space-y-3.5">
            <h5 className="text-[11px] font-mono uppercase tracking-[0.2em] font-semibold text-slate-200">
              Resources
            </h5>
            <ul className="space-y-2.5 text-xs font-light">
              <li>
                <a href="#pricing" className="hover:text-white transition-colors">Pricing & Plans</a>
              </li>
              <li>
                <a href="#comparison" className="hover:text-white transition-colors">Frevio vs Old Stack</a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">Frequently Answered</a>
              </li>
              <li>
                <Link href="/roadmap" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>Public Roadmap</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="hover:text-white transition-colors">Portfolio Showcase</Link>
              </li>
              <li>
                <Link href="/docs" className="hover:text-white transition-colors">Documentation</Link>
              </li>
            </ul>
          </div>

          {/* Nav Column 4: Legal & Trust */}
          <div className="space-y-3.5">
            <h5 className="text-[11px] font-mono uppercase tracking-[0.2em] font-semibold text-slate-200">
              Trust & Legal
            </h5>
            <ul className="space-y-2.5 text-xs font-light">
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              </li>
              <li>
                <a href="mailto:security@frevio.app" className="hover:text-white transition-colors">Security Architecture</a>
              </li>
              <li>
                <a href="mailto:support@frevio.app" className="hover:text-white transition-colors">Support Desk</a>
              </li>
              <li>
                <Link href="/settings" className="hover:text-white transition-colors">Referral Program</Link>
              </li>
            </ul>
          </div>

        </div>

        {/* ── 3. Bottom Bar & Colophon ── */}
        <div className="pt-8 mt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-center sm:text-left">
            <span>© {new Date().getFullYear()} Frevio Inc.</span>
            <span className="text-slate-700 hidden sm:inline">·</span>
            <span>The client operating system.</span>
            <span className="text-slate-700 hidden sm:inline">·</span>
            <span className="text-slate-400 font-sans">Crafted for specialists who ship.</span>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-3 text-slate-400">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Frevio on X (Twitter)"
              className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>

            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Frevio on GitHub"
              className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
            </a>

            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Frevio on LinkedIn"
              className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.62 1.62 0 0 0-1.62 1.62 1.62 1.62 0 0 0 1.62 1.62 1.62 1.62 0 0 0 1.62-1.62 1.62 1.62 0 0 0-1.62-1.62z"/>
              </svg>
            </a>

            <a
              href="https://discord.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Frevio Community on Discord"
              className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
