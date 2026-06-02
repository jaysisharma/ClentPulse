'use client'

import { useState } from 'react'
import { Sidebar } from './sidebar'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'

export function AppLayout({
  children,
  user,
}: {
  children: React.ReactNode
  user?: { name: string | null; plan: 'free' | 'pro' }
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar wrapper — off-screen on mobile, always visible on lg+ */}
      <div className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 print:hidden ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onNavigate={() => setOpen(false)} user={user} />
      </div>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-20 print:hidden">
        <button
          onClick={() => setOpen(o => !o)}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <Link href="/dashboard" className="flex items-center gap-2">
          <img src="/logo.png" alt="ClientPulse" className="w-7 h-7 rounded-lg object-cover" />
          <span className="font-semibold text-slate-900 text-sm">ClientPulse</span>
        </Link>
        {/* spacer to keep logo centered */}
        <div className="w-9" />
      </div>

      {/* Main content */}
      <main className="flex-1 lg:ml-60 p-6 lg:p-8 pt-20 lg:pt-8 print:ml-0 print:p-0">
        {children}
      </main>
    </div>
  )
}
