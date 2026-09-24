'use client'

import {
  ChevronLeft,
  Phone,
  Video,
  Plus,
  Mic,
  Camera,
  CheckCheck,
  Clock,
  AlertTriangle,
} from 'lucide-react'
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
    <section id="problem" className="py-24 lg:py-32 px-5 sm:px-8 bg-[#FAFAFC] border-t border-slate-200/80 text-slate-900 overflow-hidden relative">
      
      {/* Background soft ambient gradient */}
      <div className="absolute top-1/3 right-1/4 w-[450px] h-[350px] bg-rose-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
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

            {/* Scattered Tools List with Authentic Brand Logos */}
            <div className="pt-2 space-y-3">
              <div className="text-xs font-mono uppercase tracking-[0.16em] text-slate-400 font-medium">
                Scattered across 6+ different channels
              </div>
              
              <div className="flex flex-wrap items-center gap-2.5">
                {/* WhatsApp */}
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] text-xs font-medium text-slate-800 hover:border-slate-300 hover:shadow-md transition-all">
                  <WhatsAppIcon className="w-4 h-4 flex-shrink-0" />
                  <span>WhatsApp</span>
                </div>

                {/* Gmail */}
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] text-xs font-medium text-slate-800 hover:border-slate-300 hover:shadow-md transition-all">
                  <GmailIcon className="w-4 h-4 flex-shrink-0" />
                  <span>Gmail</span>
                </div>

                {/* Google Drive */}
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] text-xs font-medium text-slate-800 hover:border-slate-300 hover:shadow-md transition-all">
                  <GoogleDriveIcon className="w-4 h-4 flex-shrink-0" />
                  <span>Google Drive</span>
                </div>

                {/* Figma */}
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] text-xs font-medium text-slate-800 hover:border-slate-300 hover:shadow-md transition-all">
                  <FigmaIcon className="w-3.5 h-4 flex-shrink-0" />
                  <span>Figma</span>
                </div>

                {/* Notion */}
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] text-xs font-medium text-slate-800 hover:border-slate-300 hover:shadow-md transition-all">
                  <NotionIcon className="w-4 h-4 flex-shrink-0 text-slate-900" />
                  <span>Notion</span>
                </div>

                {/* Spreadsheets */}
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] text-xs font-medium text-slate-800 hover:border-slate-300 hover:shadow-md transition-all">
                  <GoogleSheetsIcon className="w-4 h-4 flex-shrink-0" />
                  <span>Spreadsheets</span>
                </div>
              </div>
            </div>

            {/* Pain Point Highlight */}
            <div className="pt-2 flex items-center gap-3 text-xs text-slate-500 font-light">
              <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200/60 flex items-center justify-center text-rose-500 flex-shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <p>
                The average freelancer loses <strong className="text-slate-900 font-medium">6.5 hours every week</strong> answering status check-ins and re-sending links.
              </p>
            </div>

          </div>

          {/* Right Column: Hyper-Realistic iPhone 16 Pro WhatsApp Mockup */}
          <div className="lg:col-span-5 flex justify-center relative">
            
            {/* Ambient Shadow under the phone */}
            <div className="absolute -inset-2 bg-gradient-to-b from-slate-900/10 via-slate-900/5 to-slate-950/25 rounded-[56px] blur-2xl -z-10 transform scale-95 translate-y-4" />

            {/* Phone Hardware Shell (iPhone 16 Pro Titanium Chassis) */}
            <div className="w-full max-w-[340px] sm:max-w-[360px] bg-[#1a1d24] p-[10px] sm:p-[12px] rounded-[52px] shadow-[0_25px_70px_-15px_rgba(15,23,42,0.4),0_0_0_1px_rgba(255,255,255,0.12)] border border-[#2b313e] relative select-none">
              
              {/* Hardware Side Buttons */}
              {/* Volume Up / Down */}
              <div className="absolute -left-[3px] top-[115px] w-[3px] h-[26px] bg-[#2b313e] rounded-l-sm" />
              <div className="absolute -left-[3px] top-[152px] w-[3px] h-[48px] bg-[#2b313e] rounded-l-sm" />
              <div className="absolute -left-[3px] top-[208px] w-[3px] h-[48px] bg-[#2b313e] rounded-l-sm" />
              {/* Power / Lock Button */}
              <div className="absolute -right-[3px] top-[165px] w-[3px] h-[72px] bg-[#2b313e] rounded-r-sm" />

              {/* Dynamic Island Pill with Camera & Sensor */}
              <div className="absolute top-[18px] left-1/2 -translate-x-1/2 w-[100px] h-[26px] bg-black rounded-full z-30 flex items-center justify-between px-3 pointer-events-none shadow-sm">
                <div className="w-2.5 h-2.5 rounded-full bg-[#0a0f1d] border border-white/5 flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-[#1b253b]" />
                </div>
                <div className="w-2 h-2 rounded-full bg-[#052e16]/80 flex items-center justify-center">
                  <div className="w-0.5 h-0.5 rounded-full bg-emerald-400" />
                </div>
              </div>

              {/* Inside Screen Container (Dark Mode iOS WhatsApp) */}
              <div className="bg-[#0B141A] text-slate-100 rounded-[42px] overflow-hidden pt-3 pb-3 flex flex-col justify-between min-h-[580px] sm:min-h-[600px] relative border border-white/[0.04]">
                
                {/* 1. iOS Status Bar */}
                <div className="px-6 pt-1.5 pb-2 flex items-center justify-between text-[11px] font-semibold text-white/90 tracking-tight z-20">
                  <span className="font-sans font-medium text-xs">11:42</span>
                  <div className="flex items-center gap-1.5 text-white/80">
                    {/* Cellular Bars */}
                    <svg className="w-3.5 h-3 fill-current" viewBox="0 0 17 12">
                      <rect x="0" y="9" width="2.5" height="3" rx="0.5" />
                      <rect x="4" y="6" width="2.5" height="6" rx="0.5" />
                      <rect x="8" y="3" width="2.5" height="9" rx="0.5" />
                      <rect x="12" y="0" width="2.5" height="12" rx="0.5" />
                    </svg>
                    {/* WiFi */}
                    <svg className="w-3.5 h-3 fill-current" viewBox="0 0 16 12">
                      <path d="M8 10a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-4.2-2.5a5.9 5.9 0 0 1 8.4 0 .8.8 0 0 0 1.1-1.1 7.4 7.4 0 0 0-10.6 0 .8.8 0 0 0 1.1 1.1zm-3-3a10.2 10.2 0 0 1 14.4 0 .8.8 0 1 0 1.1-1.1 11.7 11.7 0 0 0-16.6 0 .8.8 0 0 0 1.1 1.1z" />
                    </svg>
                    {/* Battery */}
                    <div className="w-5 h-2.5 rounded-[4px] border border-white/60 p-0.5 flex items-center">
                      <div className="w-2.5 h-full bg-white rounded-[2px]" />
                    </div>
                  </div>
                </div>

                {/* 2. WhatsApp Authentic Navigation Bar */}
                <div className="bg-[#1F2C34] px-3 py-2.5 border-b border-[#2A3942] flex items-center justify-between shadow-sm">
                  
                  {/* Left: Back Arrow + Contact Profile */}
                  <div className="flex items-center gap-1.5">
                    <button type="button" className="text-[#53BDEB] hover:opacity-80 flex items-center -ml-1">
                      <ChevronLeft className="w-5 h-5 -mr-1" />
                      <span className="text-xs font-normal">3</span>
                    </button>

                    <div className="flex items-center gap-2 pl-0.5">
                      <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-inner">
                          MK
                        </div>
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#00A884] rounded-full border-2 border-[#1F2C34]" />
                      </div>
                      
                      <div className="leading-tight">
                        <div className="text-xs font-semibold text-white tracking-tight flex items-center gap-1">
                          <span>Mark (Client)</span>
                        </div>
                        <div className="text-[10px] text-[#00A884] font-medium">online</div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Audio Call, Video Call */}
                  <div className="flex items-center gap-3.5 text-[#53BDEB] pr-1">
                    <Video className="w-4 h-4 cursor-pointer hover:opacity-80" />
                    <Phone className="w-4 h-4 cursor-pointer hover:opacity-80" />
                  </div>

                </div>

                {/* 3. WhatsApp Messages Stream with Doodle Texture & Tails */}
                <div className="px-3 py-3 flex-1 flex flex-col justify-end space-y-2.5 bg-[#0B141A] relative">
                  
                  {/* Date separator pill */}
                  <div className="text-center my-1">
                    <span className="bg-[#182229] text-[10px] text-[#8696A0] px-3 py-1 rounded-lg font-medium shadow-sm border border-[#222E35]">
                      TODAY · 11:42 PM
                    </span>
                  </div>

                  {/* Bubble 1: Incoming from Client */}
                  <div className="self-start max-w-[85%]">
                    <div className="bg-[#202C33] text-[#E9EDEF] px-3 py-2 rounded-2xl rounded-tl-sm text-xs shadow-sm relative space-y-1">
                      <p className="leading-snug">Hey! Any updates on the website redesign?</p>
                      <div className="text-[9px] text-[#8696A0] text-right font-mono -mb-0.5">11:42 PM</div>
                    </div>
                  </div>

                  {/* Bubble 2: Incoming from Client */}
                  <div className="self-start max-w-[88%]">
                    <div className="bg-[#202C33] text-[#E9EDEF] px-3 py-2 rounded-2xl rounded-tl-sm text-xs shadow-sm relative space-y-1">
                      <p className="leading-snug">Also, can you share the latest Figma link? Can&apos;t find it in email thread.</p>
                      <div className="text-[9px] text-[#8696A0] text-right font-mono -mb-0.5">11:43 PM</div>
                    </div>
                  </div>

                  {/* Bubble 3: Incoming from Client */}
                  <div className="self-start max-w-[82%]">
                    <div className="bg-[#202C33] text-[#E9EDEF] px-3 py-2 rounded-2xl rounded-tl-sm text-xs shadow-sm relative space-y-1">
                      <p className="leading-snug">When do you think the next milestone will be ready?</p>
                      <div className="text-[9px] text-[#8696A0] text-right font-mono -mb-0.5">11:44 PM</div>
                    </div>
                  </div>

                  {/* Bubble 4: Urgent Invoice Question */}
                  <div className="self-start max-w-[80%]">
                    <div className="bg-[#202C33] text-[#E9EDEF] px-3 py-2 rounded-2xl rounded-tl-sm text-xs shadow-sm relative space-y-1 border border-amber-500/30">
                      <p className="leading-snug font-medium text-amber-200">And where should we pay the invoice?</p>
                      <div className="text-[9px] text-[#8696A0] text-right font-mono -mb-0.5">11:44 PM</div>
                    </div>
                  </div>

                  {/* Bubble 5: Stressed Freelancer Outgoing Reply */}
                  <div className="self-end max-w-[85%] pt-1">
                    <div className="bg-[#005C4B] text-[#E9EDEF] px-3 py-2 rounded-2xl rounded-tr-sm text-xs shadow-sm relative space-y-1">
                      <p className="leading-snug text-[11px]">
                        Looking for links now... digging through Drive and email threads 😅
                      </p>
                      <div className="flex items-center justify-end gap-1 text-[9px] text-emerald-200/90 font-mono -mb-0.5">
                        <span>11:46 PM</span>
                        <CheckCheck className="w-3.5 h-3.5 text-[#53BDEB]" />
                      </div>
                    </div>
                  </div>

                </div>

                {/* 4. WhatsApp Composer / Input Bar */}
                <div className="px-3 pt-2 pb-1 bg-[#1F2C34] border-t border-[#2A3942] flex items-center gap-2">
                  <button type="button" className="text-[#8696A0] hover:text-white p-1">
                    <Plus className="w-5 h-5" />
                  </button>

                  <div className="flex-1 bg-[#2A3942] rounded-full px-3.5 py-1.5 text-xs text-[#8696A0] flex items-center justify-between">
                    <span>Message</span>
                    <Camera className="w-3.5 h-3.5 text-[#8696A0]" />
                  </div>

                  <button type="button" className="w-7 h-7 rounded-full bg-[#00A884] flex items-center justify-center text-white shadow-sm hover:scale-105 transition-transform">
                    <Mic className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 5. iOS Home Indicator Bar */}
                <div className="pt-2 pb-1 flex justify-center">
                  <div className="w-28 h-1 bg-white/40 rounded-full" />
                </div>

              </div>

            </div>

            {/* Floating Editorial Badge (Linear / Stripe style) */}
            <div className="hidden sm:flex absolute -bottom-5 -left-6 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl px-4 py-2.5 shadow-[0_12px_30px_-5px_rgba(0,0,0,0.12)] items-center gap-2.5 z-30">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <div className="text-xs">
                <span className="font-semibold text-slate-900">11:42 PM Sunday ping</span>
                <span className="text-slate-500 block text-[10px]">4 apps opened to answer 1 client</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  )
}
