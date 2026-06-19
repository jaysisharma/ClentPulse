'use client'

import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'

interface NavbarProps {
  isLoggedIn: boolean
}

export function Navbar({ isLoggedIn }: NavbarProps) {
  return (
    <div className="sticky top-4 z-50 px-4 max-w-6xl mx-auto w-full select-none">
      <nav className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/75 dark:bg-slate-900/75 backdrop-blur-md shadow-sm px-6 h-16 flex items-center justify-between transition-all">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Frevio Logo" className="w-8 h-8 rounded-lg object-cover" />
          <span className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">Frevio</span>
        </div>

        {/* Centered Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <a href="#features" className="hover:text-slate-950 dark:hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-slate-950 dark:hover:text-white transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-slate-950 dark:hover:text-white transition-colors">FAQ</a>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isLoggedIn ? (
            <Link href="/dashboard" className="bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl hover:bg-indigo-700 hover:shadow-md transition-all">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/auth/login" className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
                Sign in
              </Link>
              <Link href="/auth/login?mode=signup" className="bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl hover:bg-indigo-700 hover:shadow-md transition-all">
                Start free
              </Link>
            </>
          )}
        </div>
      </nav>
    </div>
  )
}
