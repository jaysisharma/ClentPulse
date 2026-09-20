'use client'

import { useState, useEffect, useRef } from 'react'
import { Star, Sparkles, CheckCircle2, Quote, ArrowUpRight, TrendingUp, Clock, ShieldCheck, DollarSign } from 'lucide-react'
import gsap from 'gsap'

type FilterType = 'all' | 'freelancer' | 'client'

interface Testimonial {
  id: string
  quote: string
  author: string
  role: string
  company: string
  initials: string
  avatarBg: string
  metric: string
  metricLabel: string
  metricIcon: any
  rating: number
  type: 'freelancer' | 'client'
  featured?: boolean
  highlight?: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    quote: "Clients stopped asking 'where are we on the redesign?' because they have a live link with real-time milestones. Saved me at least 6 unbillable hours every single week.",
    author: "Alex Rivera",
    role: "Senior Product Designer",
    company: "Studio Mono",
    initials: "AR",
    avatarBg: "from-indigo-500 to-purple-600",
    metric: "Saved 6h / week",
    metricLabel: "Unbillable time saved",
    metricIcon: Clock,
    rating: 5,
    type: "freelancer",
    featured: true,
    highlight: "Real-time client transparency without manual status emails."
  },
  {
    id: '2',
    quote: "As a client who manages 4 different contractors, Frevio is a breath of fresh air. I don't have to dig through 50 email threads to find deliverable links and invoice payments.",
    author: "Claire Sterling",
    role: "VP of Marketing",
    company: "VenturePulse",
    initials: "CS",
    avatarBg: "from-emerald-500 to-teal-600",
    metric: "Zero email chasing",
    metricLabel: "Unified contractor portal",
    metricIcon: ShieldCheck,
    rating: 5,
    type: "client",
    highlight: "All deliverables and receipts organized in one encrypted link."
  },
  {
    id: '3',
    quote: "The 1-click milestone invoice generator is magic. A milestone gets approved on Friday afternoon, and the Stripe invoice is settled by Friday evening.",
    author: "Marcus Vance",
    role: "Full-Stack Engineer",
    company: "Vance Code Lab",
    initials: "MV",
    avatarBg: "from-pink-500 to-rose-600",
    metric: "Paid in < 4 hours",
    metricLabel: "Average payout speed",
    metricIcon: ZapIcon,
    rating: 5,
    type: "freelancer",
    highlight: "Instant milestone settlement straight to Stripe account."
  },
  {
    id: '4',
    quote: "Our boutique agency switched from a bloated 15-tool CRM stack to Frevio. The custom CNAME domain and Executive Radar alone justify 10x the subscription.",
    author: "Devon Chen",
    role: "Managing Partner",
    company: "Hyperion Digital (6-person pod)",
    initials: "DC",
    avatarBg: "from-amber-500 to-orange-600",
    metric: "Replaced 3 tools",
    metricLabel: "Consolidated workflow",
    metricIcon: TrendingUp,
    rating: 5,
    type: "freelancer",
    highlight: "Replaced Harvest, Notion, and Loom into one seamless OS."
  },
  {
    id: '5',
    quote: "Approving contracts with 50% upfront deposit directly inside the portal made kickoff completely effortless. Best contractor onboarding I have experienced.",
    author: "Sophia Laurent",
    role: "Founder & CEO",
    company: "Artisan Brands",
    initials: "SL",
    avatarBg: "from-cyan-500 to-blue-600",
    metric: "$14.5k Upfront",
    metricLabel: "Frictionless deposit escrow",
    metricIcon: DollarSign,
    rating: 5,
    type: "client",
    highlight: "Fast e-sign and integrated Stripe card deposit."
  },
  {
    id: '6',
    quote: "The live VS Code extension streaming focus area to our client portal makes us look like a 50-person engineering powerhouse. Clients love the transparency.",
    author: "Liam O'Connor",
    role: "Lead Systems Architect",
    company: "Apex Interfaces",
    initials: "LO",
    avatarBg: "from-violet-500 to-indigo-600",
    metric: "100% Client Trust",
    metricLabel: "Zero status inquiries",
    metricIcon: CheckCircle2,
    rating: 5,
    type: "freelancer",
    highlight: "Automated telemetry replaces tedious weekly update drafting."
  }
]

function ZapIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function OveradsTestimonials() {
  const [filter, setFilter] = useState<FilterType>('all')
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)

  const filteredTestimonials = TESTIMONIALS.filter((t) => {
    if (filter === 'all') return true
    return t.type === filter
  })

  // GSAP Entrance & Scroll-Triggered Reveal
  useEffect(() => {
    if (typeof window === 'undefined') return
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      // Staggered reveal of header
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
        }
      )

      // Cards staggered reveal
      if (gridRef.current) {
        gsap.fromTo(
          gridRef.current.children,
          { opacity: 0, y: 40, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            stagger: 0.12,
            ease: 'power3.out',
            delay: 0.2,
          }
        )
      }

      // Stats ribbon reveal
      if (statsRef.current) {
        gsap.fromTo(
          statsRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            delay: 0.6,
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  // Filter change animation
  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter)

    if (gridRef.current) {
      gsap.fromTo(
        gridRef.current.children,
        { opacity: 0, scale: 0.95, y: 15 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.08,
          ease: 'power2.out',
        }
      )
    }
  }

  // Interactive Card Spotlight Hover
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    card.style.setProperty('--mouse-x', `${x}px`)
    card.style.setProperty('--mouse-y', `${y}px`)
  }

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      className="relative isolate py-28 px-4 sm:px-6 lg:px-8 bg-[#08090a] border-t border-white/5 overflow-hidden"
    >
      {/* ── Background Ambient Light Mesh ── */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[550px] w-[800px] rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.14)_0%,rgba(16,185,129,0.06)_40%,transparent_70%)] blur-3xl opacity-70" />
        <div
          className="absolute inset-0 opacity-15 [mask-image:radial-gradient(ellipse_75%_65%_at_50%_45%,#000_30%,transparent_85%)]"
          style={{
            backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto">
        
        {/* ── 1. Section Header & Segmented Filter Tabs ── */}
        <div ref={headerRef} className="text-center max-w-3xl mx-auto space-y-5 mb-16">
          
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-indigo-400">
            <span>Testimonials</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-light uppercase tracking-[-0.02em] text-white leading-[0.98]">
            Loved by specialists. Trusted by clients.
          </h2>

          <p className="text-sm sm:text-base text-slate-400 font-light leading-relaxed max-w-2xl mx-auto">
            See how solo engineers, senior designers, and independent studios eliminate client friction, get invoices settled faster, and run like 50-person powerhouses.
          </p>

          {/* Perspective Filter Tabs */}
          <div className="inline-flex items-center gap-1.5 p-1.5 rounded-full border border-white/10 bg-[#0e1017]/90 backdrop-blur-xl shadow-lg mt-4">
            <button
              type="button"
              onClick={() => handleFilterChange('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-white text-slate-950 shadow-md font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              All Perspectives ({TESTIMONIALS.length})
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange('freelancer')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                filter === 'freelancer'
                  ? 'bg-white text-slate-950 shadow-md font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Freelancers & Studios (4)
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange('client')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                filter === 'client'
                  ? 'bg-white text-slate-950 shadow-md font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Hiring Clients (2)
            </button>
          </div>

        </div>

        {/* ── 2. Testimonials Grid with Interactive Hover Glow ── */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch"
        >
          {filteredTestimonials.map((t) => {
            const Icon = t.metricIcon
            return (
              <div
                key={t.id}
                onMouseMove={handleCardMouseMove}
                className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0c0e14]/90 p-6 sm:p-7 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all duration-300 hover:border-white/25 hover:-translate-y-1 overflow-hidden"
              >
                {/* Localized Hover Cursor Spotlight */}
                <div
                  className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 -z-10"
                  style={{
                    background: `radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(99, 102, 241, 0.12), transparent 40%)`,
                  }}
                />

                <div>
                  {/* Top Row: Stars + Metric Badge */}
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="flex items-center gap-1">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 text-emerald-300 font-mono text-xs font-medium">
                      <Icon className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>{t.metric}</span>
                    </div>
                  </div>

                  {/* Main Quote */}
                  <div className="relative mb-6">
                    <Quote className="w-8 h-8 text-white/5 absolute -top-3 -left-2 -z-10" />
                    <p className="text-sm sm:text-base text-slate-200 font-normal leading-relaxed">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Author Information Strip */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Gradient Avatar */}
                    <div
                      className={`size-10 rounded-xl bg-gradient-to-tr ${t.avatarBg} flex items-center justify-center text-xs font-bold text-white font-mono shadow-md flex-shrink-0`}
                    >
                      {t.initials}
                    </div>

                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white truncate flex items-center gap-1.5">
                        <span className="truncate">{t.author}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      </div>
                      <div className="text-xs text-slate-400 truncate">
                        {t.role} · <span className="text-slate-300 font-medium">{t.company}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono capitalize px-2.5 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10 flex-shrink-0">
                    {t.type}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── 3. High-Trust Verified Proof Ribbon ── */}
        <div
          ref={statsRef}
          className="mt-16 pt-10 border-t border-white/10 flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-sm text-slate-300 text-center"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-lg font-bold text-white font-mono">4.9 / 5.0</span>
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-slate-400">Average Client Rating</span>
          </div>

          <span className="hidden sm:inline text-slate-600">·</span>

          <div className="flex items-center gap-2.5">
            <span className="text-lg font-bold text-emerald-400 font-mono">&gt; $2.4M</span>
            <span className="text-slate-400">Milestones Settled via Stripe</span>
          </div>

          <span className="hidden sm:inline text-slate-600">·</span>

          <div className="flex items-center gap-2.5">
            <span className="text-lg font-bold text-indigo-400 font-mono">99.8%</span>
            <span className="text-slate-400">On-Time Deliverable Sign-off</span>
          </div>
        </div>

      </div>
    </section>
  )
}
