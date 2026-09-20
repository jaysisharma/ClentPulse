import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Star, Briefcase, Quote, Mail, Code2, Globe, Play, ExternalLink } from 'lucide-react'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: owner } = await supabase
    .from('users')
    .select('name, portfolio_bio')
    .eq('id', id)
    .single()

  if (!owner?.name) {
    return {
      title: 'Portfolio | Frevio',
    }
  }

  return {
    title: `${owner.name} — Portfolio | Frevio`,
    description: owner.portfolio_bio || `View work, completed deliverables, and client endorsements for ${owner.name} on Frevio.`,
    openGraph: {
      title: `${owner.name} — Portfolio | Frevio`,
      description: owner.portfolio_bio || `View work, completed deliverables, and client endorsements for ${owner.name} on Frevio.`,
      type: 'profile'
    }
  }
}

interface PortfolioItem {
  id: string; title: string; description: string | null
  live_url: string | null; github_url: string | null; video_url: string | null
  screenshots: string[]; tags: string[]
}

function getEmbedUrl(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  const loom = url.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/)
  if (loom) return `https://www.loom.com/embed/${loom[1]}`
  return null
}

function SectionHeader({ accent, icon, label }: { accent: string; icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs" style={{ backgroundColor: accent }}>
        {icon}
      </div>
      <h2 className="text-xl font-light uppercase tracking-[-0.02em] text-slate-900 dark:text-white">{label}</h2>
    </div>
  )
}

export default async function PublicPortfolioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: owner }, { data: testimonials }, { data: projects }, { data: items }] = await Promise.all([
    supabase.from('users').select('name, logo_url, accent_color, portfolio_bio, email').eq('id', id).single(),
    supabase.from('testimonials').select('*, projects(project_name)').eq('user_id', id).eq('approved', true).order('created_at', { ascending: false }),
    supabase.from('projects').select('id, project_name, color, status').eq('user_id', id).eq('status', 'completed').order('created_at', { ascending: false }),
    supabase.from('portfolio_items').select('*').eq('user_id', id).order('created_at', { ascending: false }),
  ])

  if (!owner?.name) notFound()

  const accent    = owner.accent_color ?? '#6366F1'
  const avgRating = testimonials?.length
    ? (testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length)
    : null
  const initials  = (owner.name ?? 'F').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
  const hasWork   = (items?.length ?? 0) > 0

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#08090a] text-slate-900 dark:text-white font-sans relative overflow-hidden selection:bg-slate-200 dark:selection:bg-white/20">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div className="relative border-b border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-[#0c0d12]/60 backdrop-blur-xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-80 bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl pointer-events-none" />
        
        <div className="relative max-w-4xl mx-auto px-6 py-20 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] shadow-xs mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Verified Studio Portfolio
            </span>
          </div>

          {owner.logo_url ? (
            <img src={owner.logo_url} alt={owner.name} className="w-24 h-24 rounded-3xl object-contain bg-white dark:bg-[#0c0d12] border border-slate-200 dark:border-white/10 p-2 mb-6 shadow-xl ring-1 ring-slate-950/5 dark:ring-white/5" />
          ) : (
            <div className="w-24 h-24 rounded-3xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 flex items-center justify-center text-3xl font-bold mb-6 shadow-xl ring-1 ring-white/10">
              {initials}
            </div>
          )}

          <h1 className="text-3xl sm:text-5xl font-light uppercase tracking-[-0.03em] text-slate-900 dark:text-white mb-3">
            {owner.name}
          </h1>

          {owner.portfolio_bio && (
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
              {owner.portfolio_bio}
            </p>
          )}

          {/* Stats */}
          {((items?.length ?? 0) > 0 || (projects?.length ?? 0) > 0 || (testimonials?.length ?? 0) > 0) && (
            <div className="flex items-center gap-4 sm:gap-8 mt-8 flex-wrap justify-center">
              {(items?.length ?? 0) > 0 && (
                <div className="px-5 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] shadow-xs">
                  <div className="text-2xl font-light text-slate-900 dark:text-white tabular-nums">{items!.length}</div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-0.5">Showcase Items</div>
                </div>
              )}
              {(projects?.length ?? 0) > 0 && (
                <div className="px-5 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] shadow-xs">
                  <div className="text-2xl font-light text-slate-900 dark:text-white tabular-nums">{projects!.length}</div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-0.5">Completed Projects</div>
                </div>
              )}
              {avgRating !== null && (
                <div className="px-5 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] shadow-xs">
                  <div className="text-2xl font-light text-slate-900 dark:text-white tabular-nums flex items-center justify-center gap-1">
                    {avgRating.toFixed(1)} <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  </div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-0.5">Average Rating</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-20 relative">

        {/* Work showcase */}
        {hasWork && (
          <section>
            <SectionHeader accent={accent} label="Selected Work" icon={<Globe className="w-4 h-4" />} />
            <div className="space-y-12">
              {(items as PortfolioItem[]).map(item => {
                const embed = item.video_url ? getEmbedUrl(item.video_url) : null
                return (
                  <div key={item.id} className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 backdrop-blur-md overflow-hidden shadow-xs dark:shadow-none">

                    {/* Screenshot grid */}
                    {item.screenshots?.length > 0 && (
                      <div className={`grid gap-0.5 bg-slate-100 dark:bg-white/5 ${item.screenshots.length === 1 ? 'grid-cols-1' : item.screenshots.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                        {item.screenshots.slice(0, 3).map((src, i) => (
                          <div key={i} className="overflow-hidden aspect-video bg-slate-200 dark:bg-white/5">
                            <img src={src} alt={`${item.title} preview ${i + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="p-7 sm:p-8">
                      {/* Title + links */}
                      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap sm:flex-nowrap">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                          {item.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {item.tags.map(t => (
                                <span key={t} className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100/70 dark:bg-white/5 text-slate-600 dark:text-slate-300">
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        {/* Action links */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {item.github_url && (
                            <a
                              href={item.github_url} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shadow-xs"
                            >
                              <Code2 className="w-3.5 h-3.5" />GitHub
                            </a>
                          )}
                          {item.live_url && (
                            <a
                              href={item.live_url} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-white transition-opacity hover:opacity-90 shadow-xs"
                              style={{ backgroundColor: accent }}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />Live Site
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Case study */}
                      {item.description && (
                        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap mb-6">{item.description}</p>
                      )}

                      {/* Video embed */}
                      {embed && (
                        <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 aspect-video">
                          <iframe
                            src={embed}
                            className="w-full h-full"
                            title={`${item.title} demo`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      )}

                      {/* Video link fallback (non-embeddable URLs) */}
                      {item.video_url && !embed && (
                        <a
                          href={item.video_url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider transition-opacity hover:opacity-80"
                          style={{ color: accent }}
                        >
                          <Play className="w-4 h-4" />Watch Project Walkthrough
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Testimonials */}
        {(testimonials?.length ?? 0) > 0 && (
          <section>
            <SectionHeader accent={accent} label="Client Endorsements" icon={<Star className="w-4 h-4" />} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {testimonials!.map(t => (
                <div key={t.id} className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 backdrop-blur-md p-6 sm:p-7 flex flex-col shadow-xs dark:shadow-none">
                  <Quote className="w-6 h-6 text-slate-300 dark:text-white/20 mb-3 flex-shrink-0" />
                  <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed flex-1 mb-5">&quot;{t.content}&quot;</p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">{t.client_name}</div>
                      {t.projects?.project_name && <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{t.projects.project_name}</div>}
                    </div>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i <= t.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-800'}`} />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Completed projects (kept as a light list alongside the showcase) */}
        {!hasWork && (projects?.length ?? 0) > 0 && (
          <section>
            <SectionHeader accent={accent} label="Completed Deliverables" icon={<Briefcase className="w-4 h-4" />} />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {projects!.map(p => (
                <div key={p.id} className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 backdrop-blur-md p-5 flex items-center gap-3 shadow-xs dark:shadow-none">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color ?? accent }} />
                  <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{p.project_name}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {!hasWork && !(testimonials?.length) && !(projects?.length) && (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs font-mono">No showcase items published yet. Check back soon.</div>
        )}

        {/* Contact CTA */}
        {owner.email && (
          <section className="rounded-3xl p-10 text-center border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/90 ring-1 ring-slate-950/5 dark:ring-white/5 backdrop-blur-md shadow-xs dark:shadow-none">
            <h2 className="text-xl sm:text-2xl font-light uppercase tracking-[-0.02em] text-slate-900 dark:text-white mb-2">
              Interested in collaborating?
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mb-6 max-w-md mx-auto">
              Initiate a conversation regarding scope, timelines, or upcoming product milestones.
            </p>
            <a
              href={`mailto:${owner.email}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-xs uppercase tracking-wider text-white transition-opacity hover:opacity-90 shadow-sm"
              style={{ backgroundColor: accent }}
            >
              <Mail className="w-4 h-4" />Get In Touch
            </a>
          </section>
        )}
      </div>

      <footer className="border-t border-slate-200/80 dark:border-white/10 py-8 text-center text-xs text-slate-400 dark:text-slate-500">
        Published with <span className="font-semibold text-slate-600 dark:text-slate-300">Frevio</span>
      </footer>
    </div>
  )
}
