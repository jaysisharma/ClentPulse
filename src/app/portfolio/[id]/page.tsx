import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Star, Briefcase, Quote, Mail, Code2, Globe, Play, ExternalLink } from 'lucide-react'

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
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${accent}20` }}>
        <span style={{ color: accent }}>{icon}</span>
      </div>
      <h2 className="text-xl font-bold text-slate-900">{label}</h2>
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
    <div className="min-h-screen bg-slate-50">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ backgroundColor: accent }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '28px 28px' }}
        />
        <div className="relative max-w-4xl mx-auto px-6 py-20 flex flex-col items-center text-center">
          {owner.logo_url ? (
            <img src={owner.logo_url} alt={owner.name} className="w-24 h-24 rounded-2xl object-contain bg-white/10 p-2 mb-6 shadow-xl" />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-white/20 flex items-center justify-center text-white text-3xl font-bold mb-6 shadow-xl">
              {initials}
            </div>
          )}
          <h1 className="text-4xl font-bold text-white mb-3">{owner.name}</h1>
          {owner.portfolio_bio && (
            <p className="text-lg text-white/80 max-w-xl leading-relaxed">{owner.portfolio_bio}</p>
          )}
          {/* Stats */}
          {((items?.length ?? 0) > 0 || (projects?.length ?? 0) > 0 || (testimonials?.length ?? 0) > 0) && (
            <div className="flex items-center gap-8 mt-8 flex-wrap justify-center">
              {(items?.length ?? 0) > 0 && (
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{items!.length}</div>
                  <div className="text-sm text-white/70 mt-0.5">work item{items!.length !== 1 ? 's' : ''}</div>
                </div>
              )}
              {(projects?.length ?? 0) > 0 && (
                <>
                  <div className="w-px h-10 bg-white/20" />
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">{projects!.length}</div>
                    <div className="text-sm text-white/70 mt-0.5">project{projects!.length !== 1 ? 's' : ''} completed</div>
                  </div>
                </>
              )}
              {avgRating !== null && (
                <>
                  <div className="w-px h-10 bg-white/20" />
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">{avgRating.toFixed(1)}</div>
                    <div className="text-sm text-white/70 mt-0.5">avg. rating</div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-20">

        {/* Work showcase */}
        {hasWork && (
          <section>
            <SectionHeader accent={accent} label="Work" icon={<Globe className="w-4 h-4" />} />
            <div className="space-y-12">
              {(items as PortfolioItem[]).map(item => {
                const embed = item.video_url ? getEmbedUrl(item.video_url) : null
                return (
                  <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">

                    {/* Screenshot grid */}
                    {item.screenshots?.length > 0 && (
                      <div className={`grid gap-0.5 ${item.screenshots.length === 1 ? 'grid-cols-1' : item.screenshots.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                        {item.screenshots.slice(0, 3).map((src, i) => (
                          <div key={i} className={`overflow-hidden bg-slate-100 ${item.screenshots.length === 1 ? 'aspect-video' : 'aspect-video'}`}>
                            <img src={src} alt={`${item.title} screenshot ${i + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="p-7">
                      {/* Title + links */}
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                          {item.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {item.tags.map(t => (
                                <span key={t} className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${accent}15`, color: accent }}>
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
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                              <Code2 className="w-3.5 h-3.5" />GitHub
                            </a>
                          )}
                          {item.live_url && (
                            <a
                              href={item.live_url} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
                              style={{ backgroundColor: accent }}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />Live site
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Case study */}
                      {item.description && (
                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap mb-6">{item.description}</p>
                      )}

                      {/* Video embed */}
                      {embed && (
                        <div className="rounded-xl overflow-hidden border border-slate-200 aspect-video">
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
                          className="inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-80"
                          style={{ color: accent }}
                        >
                          <Play className="w-4 h-4" />Watch demo video
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
            <SectionHeader accent={accent} label="What clients say" icon={<Star className="w-4 h-4" />} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {testimonials!.map(t => (
                <div key={t.id} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col">
                  <Quote className="w-6 h-6 text-slate-200 mb-3 flex-shrink-0" />
                  <p className="text-slate-700 text-sm leading-relaxed flex-1 mb-4">&quot;{t.content}&quot;</p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">{t.client_name}</div>
                      {t.projects?.project_name && <div className="text-xs text-slate-400 mt-0.5">{t.projects.project_name}</div>}
                    </div>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i <= t.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
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
            <SectionHeader accent={accent} label="Completed projects" icon={<Briefcase className="w-4 h-4" />} />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {projects!.map(p => (
                <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: p.color ?? accent }} />
                  <span className="text-sm font-medium text-slate-800 truncate">{p.project_name}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {!hasWork && !(testimonials?.length) && !(projects?.length) && (
          <div className="text-center py-12 text-slate-400 text-sm">Nothing to show yet — check back soon.</div>
        )}

        {/* Contact CTA */}
        {owner.email && (
          <section className="rounded-2xl p-10 text-center" style={{ backgroundColor: `${accent}10`, border: `1px solid ${accent}25` }}>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Interested in working together?</h2>
            <p className="text-slate-500 text-sm mb-6">Reach out and let&apos;s talk about your project.</p>
            <a
              href={`mailto:${owner.email}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: accent }}
            >
              <Mail className="w-4 h-4" />Get in touch
            </a>
          </section>
        )}
      </div>

      <div className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        Built with <span className="font-medium text-slate-500">Frevio</span>
      </div>
    </div>
  )
}
