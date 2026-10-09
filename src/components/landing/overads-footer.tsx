'use client'

import Link from 'next/link'
import { Logo } from '@/components/ui/logo'

export function OveradsFooter() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#08090A] text-[#8A8F98] text-xs font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        
        {/* Main Grid: Brand info + 3 organized link groups */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 lg:gap-14 pb-12 border-b border-white/[0.08]">
          
          {/* Brand Info (2 columns) */}
          <div className="md:col-span-2 space-y-3.5">
            <Link href="/" className="inline-flex items-center gap-2.5 text-white">
              <Logo className="w-5 h-5 text-[#5E6AD2]" />
              <span className="font-semibold text-base tracking-tight text-white">Frevio</span>
            </Link>

            <p className="text-xs text-[#8A8F98] font-normal leading-relaxed max-w-sm">
              The client workspace that makes freelancers look professional and keeps every project moving. One convenient place for progress, deliverable reviews, and Stripe settlements.
            </p>

            <div className="inline-flex items-center gap-2 pt-1">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-[11px] font-mono text-[#8A8F98]">All systems operational</span>
            </div>
          </div>

          {/* Group 1: Product */}
          <div className="space-y-3">
            <div className="text-[11px] font-mono uppercase tracking-[0.16em] font-semibold text-white">
              Product
            </div>
            <ul className="space-y-2 font-normal text-xs">
              <li><a href="#overview" className="hover:text-white transition-colors">Overview</a></li>
              <li><a href="#sandbox" className="hover:text-white transition-colors">Interactive Demo</a></li>
              <li><a href="#solutions" className="hover:text-white transition-colors">Capabilities</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing & Plans</a></li>
              <li><Link href="/demo" className="hover:text-white transition-colors">Client Portal Preview</Link></li>
            </ul>
          </div>

          {/* Group 2: Solutions */}
          <div className="space-y-3">
            <div className="text-[11px] font-mono uppercase tracking-[0.16em] font-semibold text-white">
              Solutions
            </div>
            <ul className="space-y-2 font-normal text-xs">
              <li><a href="#solutions" className="hover:text-white transition-colors">For Product Designers</a></li>
              <li><a href="#solutions" className="hover:text-white transition-colors">For Engineers</a></li>
              <li><a href="#solutions" className="hover:text-white transition-colors">For Brand Strategists</a></li>
              <li><a href="#solutions" className="hover:text-white transition-colors">For Boutique Studios</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Custom Domain Scale</a></li>
            </ul>
          </div>

          {/* Group 3: Legal & Resources */}
          <div className="space-y-3">
            <div className="text-[11px] font-mono uppercase tracking-[0.16em] font-semibold text-white">
              Legal & Support
            </div>
            <ul className="space-y-2 font-normal text-xs">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/roadmap" className="hover:text-white transition-colors">Public Roadmap</Link></li>
              <li><a href="mailto:hello@frevio.com" className="hover:text-white transition-colors">Contact Support</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Colophon */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#8A8F98]/70">
          <div>
            © {new Date().getFullYear()} Frevio. Built for independent professionals.
          </div>
          <div>
            Zero-friction client portals · Powered by Stripe & PostgreSQL
          </div>
        </div>

      </div>
    </footer>
  )
}
