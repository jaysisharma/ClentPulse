import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Lock } from 'lucide-react'
import { NewProjectForm } from './new-project-form'
import { FREE_PROJECT_LIMIT as FREE_LIMIT, checkAndSyncPromoPlan } from '@/lib/plans'

export default async function NewProjectPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: profile }, { count }] = await Promise.all([
    supabase.from('users').select('id, plan, promo_pro, created_at').eq('id', user.id).single(),
    supabase.from('projects').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  const syncedPlan = await checkAndSyncPromoPlan(profile, supabase)
  const isPro = syncedPlan === 'pro'
  const used = count ?? 0
  const atLimit = !isPro && used >= FREE_LIMIT

  return (
    <AppLayout>
      <div className="animate-fade-in max-w-xl pb-10">
        <Link href="/project" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to projects
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">New project</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Set up a client project to start tracking updates, time, and invoices.</p>
        </div>

        {/* Free-plan usage — shown up front, not as a post-submit error */}
        {!isPro && (
          <div className={`rounded-xl border px-4 py-3 mb-5 text-sm flex items-center justify-between gap-3 ${
            atLimit ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
          }`}>
            <span className="font-medium">{used} of {FREE_LIMIT} free projects used</span>
            <Link href="/upgrade" className="font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 flex-shrink-0">
              Upgrade <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {atLimit ? (
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/60 shadow-sm py-14 px-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <Lock className="w-5 h-5 text-amber-500" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-4">You&apos;ve hit the free limit</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
              The free plan covers {FREE_LIMIT} projects. Upgrade to Pro for unlimited projects, then come back to create this one.
            </p>
            <Link href="/upgrade" className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold px-4 py-2.5 hover:bg-indigo-700 hover:shadow-md transition-all">
              Upgrade to Pro <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <NewProjectForm />
        )}
      </div>
    </AppLayout>
  )
}
