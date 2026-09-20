import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Lock } from 'lucide-react'
import { NewProjectForm } from './new-project-form'
import { FREE_PROJECT_LIMIT as FREE_LIMIT, checkAndSyncPromoPlan, isPaidPlan } from '@/lib/plans'

import { DarkShell } from '@/components/layout/dark-shell'

export default async function NewProjectPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: profile }, { count }] = await Promise.all([
    supabase.from('users').select('id, plan, promo_pro, created_at').eq('id', user.id).single(),
    supabase.from('projects').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  const syncedPlan = await checkAndSyncPromoPlan(profile, supabase)
  const isPaid = isPaidPlan(syncedPlan)
  const used = count ?? 0
  const atLimit = !isPaid && used >= FREE_LIMIT

  return (
    <AppLayout>
      <DarkShell>
        <div className="relative z-10 animate-fade-in max-w-xl pb-12">
          <Link href="/project" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to projects
          </Link>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Project Initialization
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-light uppercase tracking-[-0.03em] text-slate-900 dark:text-white">
              New project
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-light mt-1">
              Set up a client project to track deliverable updates, coding activity, and invoices.
            </p>
          </div>

          {/* Free-plan usage — shown up front, not as a post-submit error */}
          {!isPaid && (
            <div className={`rounded-2xl border px-4 py-3 mb-6 text-xs flex items-center justify-between gap-3 ${
              atLimit
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300'
                : 'bg-white dark:bg-[#0c0d12]/90 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 ring-1 ring-slate-950/5 dark:ring-white/5'
            }`}>
              <span className="font-medium font-mono">{used} of {FREE_LIMIT} free projects used</span>
              <Link href="/upgrade" className="font-semibold text-slate-900 dark:text-white hover:underline inline-flex items-center gap-1 flex-shrink-0">
                Upgrade <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {atLimit ? (
            <div className="rounded-2xl bg-white dark:bg-[#0c0d12]/90 border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-none py-14 px-6 flex flex-col items-center text-center backdrop-blur-md">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-light uppercase tracking-tight text-slate-900 dark:text-white mt-4">You&apos;ve hit the free limit</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-sm font-light">
                The free plan covers {FREE_LIMIT} active projects. Upgrade to Pro for unlimited projects, then come back to create this one.
              </p>
              <Link href="/upgrade" className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-xs font-semibold px-4 py-2 shadow-xs transition-all">
                Upgrade to Pro <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <NewProjectForm />
          )}
        </div>
      </DarkShell>
    </AppLayout>
  )
}
