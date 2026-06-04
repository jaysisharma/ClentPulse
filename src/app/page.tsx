import Link from 'next/link'
import { ArrowRight, Sparkles, ShieldCheck, Clock, Folder, FileText, Users, TrendingUp, Plus, Search, Bell, Moon, Sun } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { FeaturesTabs } from '@/components/landing/features-tabs'
import { FAQAccordion } from '@/components/landing/faq-accordion'
import { DashboardMockup } from '@/components/landing/dashboard-mockup'
import { PricingSection } from '@/components/landing/pricing-section'
import { ThemeToggle } from '@/components/theme-toggle'

const steps = [
  { 
    number: '01', 
    title: 'Initialize Project', 
    desc: 'Input client details, optional budget tracking parameters, and assign your unique brand accent color.',
    badge: 'Quick Setup'
  },
  { 
    number: '02', 
    title: 'Log Weekly Accomplishments', 
    desc: 'Jot down three high-impact progress bullets and add any warm context notes for the client in less than 2 minutes.',
    badge: 'Saves Hours'
  },
  { 
    number: '03', 
    title: 'Dispatch Instant Status Pages', 
    desc: 'Automatically generate beautifully branded HTML updates that send instantly to client email channels.',
    badge: 'Clients Love It'
  },
]



export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 relative overflow-hidden font-sans pb-12 transition-colors">
      
      {/* Background Radial Glow Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/60 via-white to-white dark:from-indigo-950/30 dark:via-slate-950 dark:to-slate-950 pointer-events-none z-0" />

      {/* Floating Glassmorphic Navigation Header */}
      <div className="sticky top-4 z-50 px-4 max-w-6xl mx-auto w-full select-none">
        <nav className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/75 dark:bg-slate-900/75 backdrop-blur-md shadow-sm px-6 h-16 flex items-center justify-between transition-all">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="ClientPulse Logo" className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">ClientPulse</span>
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
                <Link href="/auth/login" className="bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl hover:bg-indigo-700 hover:shadow-md transition-all">
                  Start free
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6 relative z-10 text-center max-w-6xl mx-auto space-y-8 w-full">
        <div className="max-w-3xl mx-auto space-y-8 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>For Modern Agencies & Freelancers</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight max-w-3xl mx-auto">
            Stop writing status emails.<br />
            Send updates <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">in one click.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto font-medium">
            ClientPulse automatically compiles and ships beautifully branded project status dashboards to clients weekly. Keep projects aligned, track budgets, and win hours back.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href={isLoggedIn ? '/dashboard' : '/auth/login'} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 text-white text-sm font-bold uppercase tracking-wider px-8 py-3.5 rounded-xl hover:bg-indigo-700 hover:shadow-md transition-all">
              {isLoggedIn ? 'Go to dashboard' : 'Create free account'}
              <ArrowRight className="w-4 h-4" />
            </Link>
            {!isLoggedIn && (
              <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">No credit card required</span>
            )}
          </div>
        </div>

        {/* Dashboard Live CSS Mockup */}
        <DashboardMockup />
      </section>

      {/* How it works Section */}
      <section className="py-24 px-6 bg-slate-50 dark:bg-slate-900/40 relative border-y border-slate-100 dark:border-slate-800/80 transition-colors">
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 px-3.5 py-1 rounded-full">Streamlined Workflow</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">How ClientPulse operates</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-sm font-medium">Three simple steps to fully automated client updates and invoicing.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:-translate-y-1.5 hover:shadow-lg hover:border-slate-300/85 transition-all duration-300 ease-out flex flex-col justify-between group cursor-default">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl font-black text-indigo-50/80 dark:text-slate-850 group-hover:text-indigo-200/60 dark:group-hover:text-indigo-850/80 group-hover:scale-110 transform origin-left transition-all duration-300 select-none font-mono">{s.number}</span>
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 group-hover:bg-indigo-600 group-hover:text-white px-2 py-0.5 rounded-md uppercase tracking-wider transition-colors duration-305">{s.badge}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">{s.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-24 px-6 bg-white dark:bg-slate-950 transition-colors" id="features">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 px-3.5 py-1 rounded-full">Interactive Demo</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Experience ClientPulse Live</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto font-medium">Test our core features right now. Click the tabs below to play around with our interactive simulator.</p>
          </div>
          <FeaturesTabs />
        </div>
      </section>

      {/* Showcase Feature Section */}
      <section className="py-24 px-6 bg-slate-50 dark:bg-slate-900/40 border-y border-slate-100 dark:border-slate-800/80 transition-colors">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <div className="space-y-6">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 px-3.5 py-1 rounded-full">Branded Presentation</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Beautiful automated HTML client updates
              </h2>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Every weekly update compiles your progress notes, tracked hours, and outstanding deliverables into a stunning email layout matching your project accent brand colors. 
              </p>
              
              <div className="space-y-3 pt-2">
                {[
                  'Clean HTML rendering aligned to your custom color',
                  'Dynamic budget indicators tracking project metrics',
                  'One-click interactive client feedback approval triggers',
                  'Device responsive layout designed for mobile clients',
                ].map(f => (
                  <div key={f} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-350 font-medium">
                    <ShieldCheck className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated HTML Email Wrapper Card */}
            <div className="bg-slate-900/5 dark:bg-slate-900/30 rounded-3xl p-4 border border-slate-200/60 dark:border-slate-800/60 shadow-inner animate-scroll-reveal group">
              <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800/80">
                {/* Simulated Email Bar */}
                <div className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 px-5 py-3.5 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                  <div><span className="font-semibold">Subject:</span> <span className="font-bold text-slate-800 dark:text-slate-200">Website Redesign Status update</span></div>
                  <div><span className="font-semibold">To:</span> client@acme-corp.com</div>
                </div>

                {/* Email Interior */}
                <div className="p-6 space-y-6">
                  {/* Branded Banner */}
                  <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl px-5 py-4 text-white shadow-sm">
                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-85">Weekly Status Report</div>
                    <h3 className="text-base font-extrabold">Acme Website Redesign</h3>
                  </div>

                  {/* Body Text */}
                  <div className="space-y-4 text-sm text-slate-600 dark:text-slate-350 leading-relaxed">
                    <p className="font-medium">Hi Acme Team,</p>
                    <p>Here are the project milestones achieved during the past week:</p>

                    <div className="space-y-3 pl-1">
                      {[
                        'Finished responsive layout grids on the landing page',
                        'Wired up database schema configurations on Supabase',
                        'Integrated Stripe billing and payment checkout portals',
                      ].map(b => (
                        <div key={b} className="flex items-start gap-2.5">
                          <span className="w-5 h-5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-300">✓</span>
                          <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{b}</span>
                        </div>
                      ))}
                    </div>

                    {/* Sim CTA */}
                    <div className="pt-4 text-center">
                      <span className="inline-block bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-xl shadow-md cursor-not-allowed group-hover:bg-indigo-700 group-hover:scale-105 group-hover:shadow-lg transition-all duration-300">
                        View client portal page
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* FAQ Section */}
      <section className="py-24 px-6 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800/80 transition-colors" id="faq">
        <div className="max-w-4xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 px-3.5 py-1 rounded-full">Common Inquiries</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Frequently asked questions</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto font-medium">Everything you need to know about secure client portals and automated status pages.</p>
          </div>
          <FAQAccordion />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-12 px-6 bg-slate-950 text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="ClientPulse Logo" className="w-6 h-6 rounded object-cover" />
            <span className="font-bold text-slate-200 text-sm tracking-tight">ClientPulse</span>
          </div>
          <div className="flex items-center gap-8 text-xs font-semibold uppercase tracking-wider">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <span className="text-slate-700 select-none">|</span>
            <p className="text-slate-600 font-medium lowercase tracking-normal">© 2026 ClientPulse. All rights reserved.</p>
          </div>
        </div>
      </footer>
      
    </div>
  )
}
