'use client'

import { Paperclip, Send, CheckCheck } from 'lucide-react'
import {
  WhatsAppIcon,
  GmailIcon,
  GoogleDriveIcon,
  FigmaIcon,
  NotionIcon,
  GoogleSheetsIcon,
} from '@/components/ui/brand-icons'

export function ProblemSection() {
  return (
    <section id="problem" className="py-24 lg:py-32 px-5 sm:px-8 bg-[#FAFAFC] border-t border-slate-200/80 text-slate-900 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Problem Copy & Scattered App Badges */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/60 text-rose-600 text-xs font-mono font-semibold uppercase tracking-[0.2em]">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span>The Problem</span>
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-normal tracking-[-0.03em] text-slate-950 leading-[1.08]">
              Your work isn&apos;t the problem. <br className="hidden sm:inline" />
              <span className="font-semibold text-slate-900">Client communication is.</span>
            </h2>

            <p className="text-base sm:text-lg text-slate-600 font-light leading-relaxed max-w-xl">
              Project updates, files, feedback, and invoices are scattered everywhere — WhatsApp, email, Drive, Figma, spreadsheets. You spend half your day answering &ldquo;any updates?&rdquo; instead of actually doing the work.
            </p>

            {/* Scattered Tools List with Real Brand Logos */}
            <div className="pt-2">
              <div className="text-xs font-mono uppercase tracking-[0.16em] text-slate-400 font-medium mb-3">
                Scattered across 6+ different channels
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                {/* WhatsApp */}
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-slate-200/80 shadow-sm text-xs font-medium text-slate-800 hover:border-slate-300 transition-colors">
                  <WhatsAppIcon className="w-4 h-4 flex-shrink-0" />
                  <span>WhatsApp</span>
                </div>

                {/* Gmail */}
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-slate-200/80 shadow-sm text-xs font-medium text-slate-800 hover:border-slate-300 transition-colors">
                  <GmailIcon className="w-4 h-4 flex-shrink-0" />
                  <span>Gmail</span>
                </div>

                {/* Google Drive */}
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-slate-200/80 shadow-sm text-xs font-medium text-slate-800 hover:border-slate-300 transition-colors">
                  <GoogleDriveIcon className="w-4 h-4 flex-shrink-0" />
                  <span>Google Drive</span>
                </div>

                {/* Figma */}
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-slate-200/80 shadow-sm text-xs font-medium text-slate-800 hover:border-slate-300 transition-colors">
                  <FigmaIcon className="w-3.5 h-4 flex-shrink-0" />
                  <span>Figma</span>
                </div>

                {/* Notion */}
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-slate-200/80 shadow-sm text-xs font-medium text-slate-800 hover:border-slate-300 transition-colors">
                  <NotionIcon className="w-4 h-4 flex-shrink-0 text-slate-900" />
                  <span>Notion</span>
                </div>

                {/* Spreadsheets */}
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-slate-200/80 shadow-sm text-xs font-medium text-slate-800 hover:border-slate-300 transition-colors">
                  <GoogleSheetsIcon className="w-4 h-4 flex-shrink-0" />
                  <span>Spreadsheets</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Realistic iPhone Chat Thread Mockup */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[340px] sm:max-w-[360px] bg-slate-950 p-3 sm:p-3.5 rounded-[44px] shadow-[0_25px_60px_-15px_rgba(15,23,42,0.35)] border-4 border-slate-800/80 ring-1 ring-white/10 relative">
              
              {/* iPhone Dynamic Island */}
              <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-20 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-[#111] mr-3" />
                <div className="w-2 h-2 rounded-full bg-[#052e16]/80" />
              </div>

              {/* Screen Content */}
              <div className="bg-[#121b22] text-slate-100 rounded-[34px] overflow-hidden pt-7 pb-4 px-3 sm:px-4 flex flex-col justify-between min-h-[500px]">
                
                {/* Chat Top Bar */}
                <div className="pt-2 pb-3 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center font-bold text-white text-xs">
                        MK
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#121b22]" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">Mark · Client</div>
                      <div className="text-[10px] text-slate-400">Active 2m ago</div>
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                    11:42 PM
                  </div>
                </div>

                {/* Chat Messages Bubble Stream */}
                <div className="py-4 space-y-3 flex-1 flex flex-col justify-end">
                  
                  {/* Timestamp separator */}
                  <div className="text-center my-1">
                    <span className="bg-[#1f2c34] text-[10px] text-slate-400 px-2.5 py-0.5 rounded-md font-mono">
                      TODAY · 11:42 PM
                    </span>
                  </div>

                  {/* Message 1 */}
                  <div className="bg-[#202c33] text-slate-100 p-3 rounded-2xl rounded-tl-sm text-xs max-w-[88%] shadow-sm space-y-1">
                    <p className="leading-snug">Hey! Any updates on the website redesign?</p>
                    <div className="text-[9px] text-slate-400 text-right">11:42 PM</div>
                  </div>

                  {/* Message 2 */}
                  <div className="bg-[#202c33] text-slate-100 p-3 rounded-2xl rounded-tl-sm text-xs max-w-[92%] shadow-sm space-y-1">
                    <p className="leading-snug">Also, can you share the latest Figma link? Can&apos;t find it in email thread.</p>
                    <div className="text-[9px] text-slate-400 text-right">11:43 PM</div>
                  </div>

                  {/* Message 3 */}
                  <div className="bg-[#202c33] text-slate-100 p-3 rounded-2xl rounded-tl-sm text-xs max-w-[85%] shadow-sm space-y-1">
                    <p className="leading-snug">When do you think the next milestone will be ready?</p>
                    <div className="text-[9px] text-slate-400 text-right">11:44 PM</div>
                  </div>

                  {/* Message 4 */}
                  <div className="bg-[#202c33] text-slate-100 p-3 rounded-2xl rounded-tl-sm text-xs max-w-[80%] shadow-sm space-y-1 border border-amber-500/20">
                    <p className="leading-snug font-medium text-amber-200">And where should we pay the invoice?</p>
                    <div className="text-[9px] text-slate-400 text-right">11:45 PM</div>
                  </div>

                  {/* Freelancer Stressed Reply Preview */}
                  <div className="bg-[#005c4b] text-white p-2.5 rounded-2xl rounded-tr-sm text-xs max-w-[80%] self-end shadow-sm space-y-1 mt-1">
                    <p className="leading-snug text-[11px]">Pulling together links and invoice now...</p>
                    <div className="flex items-center justify-end gap-1 text-[9px] text-emerald-200">
                      <span>11:46 PM</span>
                      <CheckCheck className="w-3 h-3 text-emerald-300" />
                    </div>
                  </div>

                </div>

                {/* Input Bar */}
                <div className="pt-2 border-t border-white/10 flex items-center gap-2">
                  <div className="flex-1 bg-[#2a3942] rounded-full px-3 py-1.5 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Type a message...</span>
                    <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#00a884] flex items-center justify-center text-white">
                    <Send className="w-3 h-3" />
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
