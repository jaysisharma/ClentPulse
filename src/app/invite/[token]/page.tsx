'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { Building2, CheckCircle2, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AcceptInvitePage() {
  const params = useParams()
  const token = params?.token as string
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [invite, setInvite] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [accepting, setAccepting] = useState(false)

  useEffect(() => {
    async function init() {
      if (!token) return
      try {
        const [inviteRes, supabaseUser] = await Promise.all([
          fetch(`/api/invites/${token}`),
          createClient().auth.getUser(),
        ])

        setUser(supabaseUser.data.user)

        const data = await inviteRes.json()
        if (!inviteRes.ok) {
          throw new Error(data.error || 'Invalid or expired invitation')
        }
        setInvite(data.invite)
      } catch (err: any) {
        setError(err.message || 'Error loading invitation')
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [token])

  async function handleAccept() {
    setAccepting(true)
    setError(null)
    try {
      const res = await fetch(`/api/invites/${token}`, {
        method: 'POST',
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to accept invitation')
      }

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Error accepting invitation')
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#08090a] flex items-center justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#08090a] text-slate-900 dark:text-white flex items-center justify-center p-4 relative font-sans">
      <div className="max-w-md w-full bg-white dark:bg-[#0c0d12] border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-xl ring-1 ring-slate-950/5 dark:ring-white/5 text-center backdrop-blur-md">
        <div className="flex justify-center mb-6">
          <Logo className="w-10 h-10" />
        </div>

        {error ? (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Invitation Problem
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {error}
            </p>
            <Link
              href="/dashboard"
              className="inline-block mt-2 px-5 py-2 rounded-full text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
              <Building2 className="w-7 h-7" />
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-semibold">
                Agency Invitation
              </span>
              <h1 className="text-xl font-light tracking-tight text-slate-900 dark:text-white mt-1">
                Join <span className="font-semibold">{invite.organization.name}</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-light mt-2 leading-relaxed">
                You have been invited as a <span className="font-semibold text-slate-900 dark:text-white capitalize">{invite.role === 'admin' ? 'Project Manager' : 'Team Specialist'}</span> on Frevio.
              </p>
            </div>

            {user ? (
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleAccept}
                  disabled={accepting}
                  className="w-full py-3 rounded-full text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-md disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  {accepting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Joining Workspace…</span>
                    </>
                  ) : (
                    <>
                      <span>Accept & Open Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                  Signed in as {user.email}
                </p>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                <Link
                  href={`/auth/login?next=/invite/${token}`}
                  className="w-full py-3 rounded-full text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-md inline-flex items-center justify-center gap-2"
                >
                  <span>Sign in to Accept</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Invitation sent to <span className="font-mono">{invite.email}</span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
