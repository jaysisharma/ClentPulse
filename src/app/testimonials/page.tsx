import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { Star } from 'lucide-react'
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

  const pending   = (testimonials ?? []).filter(t => !t.approved)
  const approved  = (testimonials ?? []).filter(t => t.approved)

  function Stars({ n }: { n: number }) {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star key={i} className={`w-3.5 h-3.5 ${i <= n ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
        ))}
      </div>
    )
  }

  return (
    <AppLayout>
      <div className="animate-fade-in">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Testimonials</h1>
          <p className="text-slate-500 text-sm mt-1">Client feedback collected at project completion.</p>
        </div>

        {!testimonials?.length ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-200 p-14 text-center text-sm text-slate-400">
            No testimonials yet. Share the feedback link from a completed project to collect reviews.
          </div>
        ) : (
          <div className="space-y-8">
            {pending.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-slate-700 mb-3">Pending review <span className="font-normal text-slate-400">({pending.length})</span></h2>
                <div className="space-y-3">
                  {pending.map(t => (
                    <div key={t.id} className="bg-white rounded-xl border border-amber-200 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-slate-900">{t.client_name}</span>
                            <Stars n={t.rating} />
                          </div>
                          <p className="text-sm text-slate-500 italic mb-1">{t.projects?.project_name}</p>
                          <p className="text-sm text-slate-700">{t.content}</p>
                        </div>
                        <TestimonialActions id={t.id} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {approved.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-slate-700 mb-3">Approved <span className="font-normal text-slate-400">({approved.length})</span></h2>
                <div className="space-y-3">
                  {approved.map(t => (
                    <div key={t.id} className="bg-white rounded-xl border border-slate-200 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-slate-900">{t.client_name}</span>
                            <Stars n={t.rating} />
                            <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Published</span>
                          </div>
                          <p className="text-sm text-slate-500 italic mb-1">{t.projects?.project_name}</p>
                          <p className="text-sm text-slate-700">{t.content}</p>
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
    </AppLayout>
  )
}
