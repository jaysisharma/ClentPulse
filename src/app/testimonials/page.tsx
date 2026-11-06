import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AppLayout } from '@/components/layout/app-layout'
import { DarkShell } from '@/components/layout/dark-shell'
import { Star, MessageSquareQuote, CheckCircle2, Clock } from 'lucide-react'
import { TestimonialActions } from './testimonial-actions'

export default async function TestimonialsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: testimonials, error } = await supabase
    .from('testimonials')
    .select('*, projects(project_name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Failed to load testimonials: ${error.message}`)

  const allTestimonials = testimonials ?? []
  const pending   = allTestimonials.filter(t => !t.approved)
  const approved  = allTestimonials.filter(t => t.approved)
  const avgRating = allTestimonials.length
    ? (allTestimonials.reduce((s, t) => s + (t.rating || 0), 0) / allTestimonials.length).toFixed(1)
    : '0.0'

  function Stars({ n }: { n: number }) {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <Star key={i} className={`w-3.5 h-3.5 ${i <= n ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}`} />
        ))}
      </div>
    )
  }

  return (
    <AppLayout>
      <DarkShell>
        <div className="relative z-10 animate-fade-in space-y-8 pb-10">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-accent dark:text-indigo-400">
                Client Reviews & Testimonials
              </span>
            </div>
            <h1 className="text-2xl sm:text-[27px] font-extrabold tracking-[-0.02em] text-slate-900 dark:text-white">
              Testimonials
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Client reviews, satisfaction ratings, and verified endorsements collected upon deliverable sign-off.
            </p>
          </div>

          {/* KPI strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-md border border-[#eaecf2] dark:border-white/[0.08] bg-white dark:bg-[#12141c]/90 p-5 shadow-xs dark:shadow-none backdrop-blur-md">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total reviews</span>
                <div className="w-7 h-7 rounded-md bg-slate-100 dark:bg-white/5 border border-[#eaecf2] dark:border-white/[0.08] flex items-center justify-center text-slate-600 dark:text-slate-300">
                  <MessageSquareQuote className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-[27px] font-extrabold tabular-nums text-slate-900 dark:text-white tracking-tight">{allTestimonials.length}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">all time collected</div>
            </div>

            <div className="rounded-md border border-[#eaecf2] dark:border-white/[0.08] bg-white dark:bg-[#12141c]/90 p-5 shadow-xs dark:shadow-none backdrop-blur-md">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Average rating</span>
                <div className="w-7 h-7 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                </div>
              </div>
              <div className="text-2xl sm:text-[27px] font-extrabold tabular-nums text-slate-900 dark:text-white tracking-tight">{avgRating} <span className="text-sm text-slate-400 dark:text-slate-500">/ 5</span></div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">overall client score</div>
            </div>

            <div className="rounded-md border border-[#eaecf2] dark:border-white/[0.08] bg-white dark:bg-[#12141c]/90 p-5 shadow-xs dark:shadow-none backdrop-blur-md">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Pending review</span>
                <div className="w-7 h-7 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-[27px] font-extrabold tabular-nums text-slate-900 dark:text-white tracking-tight">{pending.length}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">awaiting publication</div>
            </div>

            <div className="rounded-md border border-[#eaecf2] dark:border-white/[0.08] bg-white dark:bg-[#12141c]/90 p-5 shadow-xs dark:shadow-none backdrop-blur-md">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Published</span>
                <div className="w-7 h-7 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-[27px] font-extrabold tabular-nums text-slate-900 dark:text-white tracking-tight">{approved.length}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">visible on portfolio</div>
            </div>
          </div>

          {!allTestimonials.length ? (
            <div className="rounded-md border border-dashed border-[#eaecf2] dark:border-white/[0.08] bg-white/60 dark:bg-[#12141c]/60 p-16 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 border border-[#eaecf2] dark:border-white/[0.08] flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-slate-400 dark:text-slate-400" />
              </div>
              <h3 className="text-lg text-slate-900 dark:text-white mb-1">No testimonials yet</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs max-w-md mx-auto leading-relaxed">
                When you complete milestones or finish a project, your client can submit a verified review directly through their portal. You can approve reviews here to showcase them on your public portfolio.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <Link
                  href="/project"
                  className="bg-accent hover:bg-accent-hover rounded-md text-white font-semibold px-4 py-2 text-xs transition-all shadow-xs"
                >
                  View projects
                </Link>
                <Link
                  href="/portfolio"
                  className="rounded-md border border-[#eaecf2] dark:border-white/[0.08] bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 font-semibold px-4 py-2 text-xs hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
                >
                  Portfolio showroom
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {pending.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                      Pending Validation
                    </span>
                    <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5">
                      {pending.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {pending.map(t => (
                      <div
                        key={t.id}
                        className="rounded-md border border-amber-500/20 bg-white dark:bg-[#12141c]/95 p-5 ring-1 ring-amber-500/10 shadow-xs dark:shadow-none backdrop-blur-md hover:border-amber-500/30 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1.5">
                              <span className="font-medium text-slate-900 dark:text-white text-sm">{t.client_name}</span>
                              <Stars n={t.rating} />
                            </div>
                            {t.projects?.project_name && (
                              <p className="text-xs text-slate-500 font-mono mb-2">
                                Project: {t.projects.project_name}
                              </p>
                            )}
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                              &ldquo;{t.content}&rdquo;
                            </p>
                          </div>
                          <TestimonialActions id={t.id} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {approved.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-accent dark:text-indigo-400">
                      Verified & Published
                    </span>
                    <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/5 border border-[#eaecf2] dark:border-white/[0.08] rounded-full px-2 py-0.5">
                      {approved.length}
                    </span>
                  </div>
                  <div className="rounded-md border border-[#eaecf2] dark:border-white/[0.08] bg-white dark:bg-[#12141c]/90 divide-y divide-[#f1f3f7] dark:divide-white/[0.05] overflow-hidden shadow-xs dark:shadow-none backdrop-blur-md">
                    {approved.map(t => (
                      <div key={t.id} className="p-5 hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                              <span className="font-medium text-slate-900 dark:text-white text-sm">{t.client_name}</span>
                              <Stars n={t.rating} />
                              <span className="inline-flex items-center text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                Published
                              </span>
                            </div>
                            {t.projects?.project_name && (
                              <p className="text-xs text-slate-500 font-mono mb-2">
                                Project: {t.projects.project_name}
                              </p>
                            )}
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                              &ldquo;{t.content}&rdquo;
                            </p>
                          </div>
                          <TestimonialActions id={t.id} approved />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DarkShell>
    </AppLayout>
  )
}
