import Link from 'next/link'
import { Check, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { FeaturesTabs } from '@/components/landing/features-tabs'
import { FAQAccordion } from '@/components/landing/faq-accordion'

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

const freeFeatures = ['1 Active project', 'Public status hub page', 'Manual copy-paste plain email text']
const proFeatures = [
  'Unlimited projects',
  'Automated email sending via Resend',
  'Accent color branding integrations',
  'Active background timers tracking',
  'Dynamic budget progress widgets',
  'Contract signature tracking',
  'Premium priority support'
]

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user

  return (
    <div className="min-h-screen bg-white relative overflow-hidden font-sans pb-12">
      
      {/* Background Radial Glow Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/60 via-white to-white pointer-events-none z-0" />

      {/* Floating Glassmorphic Navigation Header */}
      <div className="sticky top-4 z-50 px-4 max-w-6xl mx-auto w-full select-none">
        <nav className="rounded-2xl border border-slate-200/60 bg-white/75 backdrop-blur-md shadow-sm px-6 h-16 flex items-center justify-between transition-all">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="ClientPulse Logo" className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-bold text-slate-900 text-lg tracking-tight">ClientPulse</span>
          </div>
          
          {/* Centered Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-slate-500">
            <a href="#features" className="hover:text-slate-950 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-slate-950 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-slate-950 transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <Link href="/dashboard" className="bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl hover:bg-indigo-700 hover:shadow-md transition-all">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 transition-all">
                  Sign in
                </Link>
                <Link href="/auth/login" className="bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl hover:bg-indigo-700 hover:shadow-md transition-all">
                  Start free trial
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6 relative z-10 text-center max-w-4xl mx-auto space-y-8">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Engineered For Modern Agencies & Freelancers</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight max-w-3xl mx-auto">
          Stop writing status emails.<br />
          Send updates <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">in one click.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto font-medium">
          ClientPulse automatically compiles and ships beautifully branded project status dashboards to clients weekly. Keep projects aligned, track budgets, and win hours back.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href={isLoggedIn ? '/dashboard' : '/auth/login'} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 text-white text-sm font-bold uppercase tracking-wider px-8 py-3.5 rounded-xl hover:bg-indigo-700 hover:shadow-md transition-all">
            {isLoggedIn ? 'Go to dashboard' : 'Create free account'}
            <ArrowRight className="w-4 h-4" />
          </Link>
          {!isLoggedIn && (
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">No credit card required</span>
          )}
        </div>

        {/* Dashboard Live CSS Mockup */}
        <div className="pt-12 max-w-5xl mx-auto">
          <div className="bg-slate-900 text-white rounded-2xl overflow-hidden border border-slate-800 shadow-2xl p-1 md:p-2 bg-gradient-to-b from-slate-800 to-slate-950">
            {/* Header bar */}
            <div className="bg-slate-800/80 px-4 py-2 flex items-center justify-between text-xs text-slate-400 rounded-t-xl border-b border-slate-900">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              </div>
              <div className="font-mono text-[9px] bg-slate-950 px-3 py-1 rounded text-slate-500 select-none">
                clientpulse.com/dashboard
              </div>
            </div>
            
            {/* App Body Preview */}
            <div className="bg-slate-950 p-4 md:p-6 text-left space-y-6">
              <div className="flex items-center justify-between border-b border-slate-900 pb-4">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="ClientPulse Logo" className="w-6 h-6 rounded object-cover" />
                  <span className="font-bold text-sm text-slate-200">ClientPulse Dashboard</span>
                </div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-950 px-2 py-0.5 rounded">Pro Features Active</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-4 space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Unpaid Invoices</div>
                  <div className="text-2xl font-black text-white">$4,850</div>
                  <div className="text-[10px] text-emerald-400 font-semibold">✓ 3 Client invoices active</div>
                </div>
                <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-4 space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Time Tracked (Weekly)</div>
                  <div className="text-2xl font-black text-white">34h 12m</div>
                  <div className="text-[10px] text-indigo-400 font-semibold">✓ Budget target on track</div>
                </div>
                <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-4 space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Monthly Goal progress</div>
                  <div className="text-2xl font-black text-white">78% Complete</div>
                  <div className="w-full bg-slate-950 rounded-full h-1 mt-2">
                    <div className="bg-indigo-500 h-1 rounded-full" style={{ width: '78%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-24 px-6 bg-slate-50 relative border-y border-slate-100">
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-3.5 py-1 rounded-full">Streamlined Workflow</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">How ClientPulse operates</h2>
            <p className="text-slate-500 max-w-md mx-auto text-sm font-medium">Three simple steps to fully automated client updates and invoicing.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl font-black text-indigo-50/80 group-hover:text-indigo-100 transition-colors select-none font-mono">{s.number}</span>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-wider">{s.badge}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{s.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed font-medium">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-24 px-6 bg-white" id="features">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-3.5 py-1 rounded-full">Interactive Demo</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Experience ClientPulse Live</h2>
            <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium">Test our core features right now. Click the tabs below to play around with our interactive simulator.</p>
          </div>
          <FeaturesTabs />
        </div>
      </section>

      {/* Showcase Feature Section */}
      <section className="py-24 px-6 bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <div className="space-y-6">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-3.5 py-1 rounded-full">Branded Presentation</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                Beautiful automated HTML client updates
              </h2>
              <p className="text-slate-500 leading-relaxed font-medium">
                Every weekly update compiles your progress notes, tracked hours, and outstanding deliverables into a stunning email layout matching your project accent brand colors. 
              </p>
              
              <div className="space-y-3 pt-2">
                {[
                  'Clean HTML rendering aligned to your custom color',
                  'Dynamic budget indicators tracking project metrics',
                  'One-click interactive client feedback approval triggers',
                  'Device responsive layout designed for mobile clients',
                ].map(f => (
                  <div key={f} className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                    <ShieldCheck className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated HTML Email Wrapper Card */}
            <div className="bg-slate-900/5 rounded-3xl p-4 border border-slate-200/60 shadow-inner">
              <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-slate-200">
                {/* Simulated Email Bar */}
                <div className="bg-slate-50 border-b border-slate-100 px-5 py-3.5 text-xs text-slate-500 space-y-1">
                  <div><span className="font-semibold">Subject:</span> <span className="font-bold text-slate-800">Website Redesign Status update</span></div>
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
                  <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
                    <p className="font-medium">Hi Acme Team,</p>
                    <p>Here are the project milestones achieved during the past week:</p>

                    <div className="space-y-3 pl-1">
                      {[
                        'Finished responsive layout grids on the landing page',
                        'Wired up database schema configurations on Supabase',
                        'Integrated Stripe billing and payment checkout portals',
                      ].map(b => (
                        <div key={b} className="flex items-start gap-2.5">
                          <span className="w-5 h-5 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5">✓</span>
                          <span className="text-xs text-slate-700 font-medium">{b}</span>
                        </div>
                      ))}
                    </div>

                    {/* Sim CTA */}
                    <div className="pt-4 text-center">
                      <span className="inline-block bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-xl shadow-md cursor-not-allowed">
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
      <section className="py-24 px-6 bg-white" id="pricing">
        <div className="max-w-4xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-3.5 py-1 rounded-full">Fair Pricing</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Fair pricing, scale when ready</h2>
            <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium">Get started completely free. Upgrade anytime as your roster grows.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Free Tier */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Free Plan</h3>
                  <div className="text-4xl font-black text-slate-900 mt-2">$0</div>
                  <div className="text-xs text-slate-400 font-medium mt-1">Forever free tier</div>
                </div>
                <div className="w-full h-px bg-slate-100" />
                <ul className="space-y-3">
                  {freeFeatures.map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                      <Check className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-8">
                <Link href="/auth/login" className="block text-center bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold uppercase tracking-wider py-3 rounded-xl transition-all">
                  Get started free
                </Link>
              </div>
            </div>

            {/* Pro Tier */}
            <div className="bg-indigo-600 text-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between relative overflow-hidden group">
              {/* Decorative Glow */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />
              
              <div className="space-y-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-indigo-200 uppercase tracking-wider">Pro Plan</h3>
                    <div className="text-4xl font-black text-white mt-2">$12</div>
                    <div className="text-xs text-indigo-200 font-medium mt-1">per month billing</div>
                  </div>
                  <span className="text-[9px] font-bold text-indigo-600 bg-white px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">Popular Choice</span>
                </div>
                <div className="w-full h-px bg-indigo-500/40" />
                <ul className="space-y-3">
                  {proFeatures.map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm text-indigo-50 font-medium">
                      <Check className="w-4 h-4 text-indigo-200 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-8 relative z-10">
                <Link href="/auth/login" className="block text-center bg-white hover:bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider py-3 rounded-xl shadow-md transition-all">
                  Start free pro trial
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6 bg-slate-50 border-t border-slate-100" id="faq">
        <div className="max-w-4xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-3.5 py-1 rounded-full">Common Inquiries</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Frequently asked questions</h2>
            <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium">Everything you need to know about secure client portals and automated status pages.</p>
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
