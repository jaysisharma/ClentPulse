'use client'

import { useState, useEffect } from 'react'
import { Check, Play, Square, Timer, FileText, Send } from 'lucide-react'

type TabId = 'updates' | 'time' | 'invoices'

export function FeaturesTabs() {
  const [activeTab, setActiveTab] = useState<TabId>('updates')
  
  // Time Tracker state
  const [timerRunning, setTimerRunning] = useState(false)
  const [timeStr, setTimeStr] = useState('00:00:00')
  
  // Smart Invoicing state
  const [invoiceItems] = useState([
    { desc: 'Figma UI/UX Mockups Design', price: 1800 },
    { desc: 'React & Next.js Frontend Integration', price: 2400 },
  ])
  const [invoiceStatus, setInvoiceStatus] = useState<'sent' | 'paid'>('sent')

  // Live timer simulation effect
  useEffect(() => {
    if (!timerRunning) return
    const started = Date.now()
    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - started) / 1000)
      const h = Math.floor(diff / 3600)
      const m = Math.floor((diff % 3600) / 60)
      const s = diff % 60
      const pad = (n: number) => String(n).padStart(2, '0')
      setTimeStr(`${pad(h)}:${pad(m)}:${pad(s)}`)
    }, 1000)
    return () => clearInterval(interval)
  }, [timerRunning])

  const subtotal = invoiceItems.reduce((sum, item) => sum + item.price, 0)

  return (
    <div className="space-y-8 bg-slate-50 border border-slate-200/80 rounded-3xl p-6 shadow-sm">
      
      {/* Dynamic Tabs Headers */}
      <div className="flex border-b border-slate-200 overflow-x-auto select-none gap-2">
        {[
          { id: 'updates', label: 'Status Updates', icon: Send },
          { id: 'time', label: 'Time Tracking', icon: Timer },
          { id: 'invoices', label: 'Smart Invoices', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabId)}
              className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                active
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab View Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[360px]">
        
        {/* Left Side: Editorial Context */}
        <div className="space-y-4">
          {activeTab === 'updates' && (
            <>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded uppercase tracking-wider">Communication</span>
              <h3 className="text-xl font-bold text-slate-900 leading-tight">No more manual status emails</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                Draft 3 accomplishments and any blockers. ClientPulse converts them into a beautiful, styled status portal and forwards it to your client's inbox immediately.
              </p>
              <div className="space-y-2 pt-2 text-slate-600 text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-600" /> Automatically tracks weekly metrics
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-600" /> Interactive 👍/👎 approval feedback triggers
                </div>
              </div>
            </>
          )}

          {activeTab === 'time' && (
            <>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded uppercase tracking-wider">Task Logger</span>
              <h3 className="text-xl font-bold text-slate-900 leading-tight">Time tracking built for freelancers</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                Log billable hours manually or spin up a background active timer. Logged times immediately link to project budgets and unpaid invoices, so nothing slips through the cracks.
              </p>
              <div className="space-y-2 pt-2 text-slate-600 text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-600" /> Ticking background timers logged instantly
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-600" /> Budget alarm signals when caps are exceeded
                </div>
              </div>
            </>
          )}

          {activeTab === 'invoices' && (
            <>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded uppercase tracking-wider">Financial Hub</span>
              <h3 className="text-xl font-bold text-slate-900 leading-tight">Smart invoices that get paid faster</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                Draft professional invoices with multi-line items. Clients pay directly via our secure Stripe checkout links, triggering email receipts and updating your dashboard earnings.
              </p>
              <div className="space-y-2 pt-2 text-slate-600 text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-600" /> Integrated Stripe payment checkouts
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-600" /> Professional print-ready downloadable PDFs
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Side: Interactive Mockup Simulation */}
        <div className="bg-slate-900 text-white rounded-2xl overflow-hidden border border-slate-800 shadow-xl min-h-[320px] flex flex-col">
          
          {/* Header Bar */}
          <div className="bg-slate-800/80 px-4 py-2 flex items-center justify-between text-xs text-slate-400 border-b border-slate-900 select-none">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            </div>
            <span className="font-mono text-[9px] text-slate-500">interactive_mockup.js</span>
          </div>

          {/* Body Content */}
          <div className="bg-slate-950 p-6 flex-grow flex flex-col justify-center">
            
            {/* Updates Tab Simulation */}
            {activeTab === 'updates' && (
              <div className="space-y-4">
                <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Status Checklist</span>
                    <span className="text-[10px] text-slate-500">Review Items</span>
                  </div>
                  <div className="space-y-2 text-xs text-slate-300">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5" />
                      <span className="line-through text-slate-500">Shipped responsive navigation layouts</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5" />
                      <span className="line-through text-slate-500">Wired database updates with Supabase RLS</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input type="checkbox" className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5" />
                      <span>Configure automated email send queues</span>
                    </label>
                  </div>
                </div>
                <div className="text-center text-[10px] text-slate-500 font-semibold bg-slate-900/40 p-2.5 rounded-lg border border-dashed border-slate-800/60">
                  Clients approve or request alterations in one click.
                </div>
              </div>
            )}

            {/* Time Tab Simulation */}
            {activeTab === 'time' && (
              <div className="space-y-5 text-center">
                <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 uppercase font-bold tracking-wider text-[10px]">
                      <span className={`w-2 h-2 rounded-full ${timerRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                      {timerRunning ? 'Timer Active' : 'Tracker Idle'}
                    </span>
                    <span className="font-mono text-slate-500">Workspace Portal</span>
                  </div>
                  <div className="text-4xl font-mono font-bold text-white tracking-tight">{timeStr}</div>
                  <div className="flex justify-center gap-3">
                    {!timerRunning ? (
                      <button
                        onClick={() => setTimerRunning(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                      >
                        <Play className="w-3.5 h-3.5" /> Start Session
                      </button>
                    ) : (
                      <button
                        onClick={() => { setTimerRunning(false); setTimeStr('00:00:00') }}
                        className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                      >
                        <Square className="w-3.5 h-3.5" /> Stop & Log
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Invoices Tab Simulation */}
            {activeTab === 'invoices' && (
              <div className="space-y-4">
                <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-4 space-y-3 relative overflow-hidden">
                  {/* Fake Stamp */}
                  {invoiceStatus === 'paid' && (
                    <div className="absolute top-2 right-2 border-2 border-emerald-500 text-emerald-500 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded rotate-12 bg-slate-950/90 z-20 animate-fade-in">
                      PAID ✓
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800">
                    <span className="font-bold text-slate-300">INV-2026-X04</span>
                    <button 
                      onClick={() => setInvoiceStatus(invoiceStatus === 'sent' ? 'paid' : 'sent')}
                      className="text-[10px] font-bold uppercase tracking-wider bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-slate-400 hover:text-white hover:border-slate-500 transition-all"
                    >
                      Toggle Stamp
                    </button>
                  </div>
                  
                  <div className="space-y-1.5 text-xs">
                    {invoiceItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-slate-400">
                        <span className="truncate pr-2">{item.desc}</span>
                        <span className="font-bold text-slate-300">${item.price}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-400">Total Invoice Sum</span>
                    <span className="text-white text-sm">${subtotal}</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  )
}
