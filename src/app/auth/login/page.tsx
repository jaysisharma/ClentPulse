'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient, setRememberMe as persistRememberChoice } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  MailCheck,
  ArrowLeft,
  RotateCw,
  Eye,
  EyeOff,
  Activity,
  Loader2,
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export default function LoginPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  // When set, we show a dedicated "check your email" screen instead of the form
  const [sent, setSent] = useState<null | { email: string; kind: 'signup' | 'reset' }>(null)
  const [resending, setResending] = useState(false)
  const [resendIn, setResendIn] = useState(0)
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => () => { if (cooldownRef.current) clearInterval(cooldownRef.current) }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const initialMode = params.get('mode')
    if (initialMode === 'signup' || initialMode === 'login' || initialMode === 'reset') {
      setMode(initialMode)
    }
  }, [])

  const supabase = createClient()

  function startCooldown(seconds: number) {
    setResendIn(seconds)
    if (cooldownRef.current) clearInterval(cooldownRef.current)
    cooldownRef.current = setInterval(() => {
      setResendIn(s => {
        if (s <= 1) { if (cooldownRef.current) clearInterval(cooldownRef.current); return 0 }
        return s - 1
      })
    }, 1000)
  }

  function switchMode(next: 'login' | 'signup' | 'reset') {
    setMode(next)
    setError('')
    setSent(null)
    setConfirm('')
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (mode === 'reset') {
      setLoading(true)
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
      })
      setLoading(false)
      if (error) { setError(error.message); return }
      setSent({ email, kind: 'reset' })
      startCooldown(30)
      return
    }

    if (mode === 'login') {
      setLoading(true)
      persistRememberChoice(rememberMe)
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else if (data.user) {
        const role = data.user.user_metadata?.role as string | undefined
        if (role === 'client') {
          window.location.href = '/client/dashboard'
          return
        }
        const { data: profile } = await supabase
          .from('users')
          .select('id, onboarded')
          .eq('id', data.user.id)
          .maybeSingle()
        if (!profile) {
          window.location.href = '/client/dashboard'
        } else {
          window.location.href = profile.onboarded ? '/dashboard' : '/onboarding'
        }
      }
      setLoading(false)
    } else {
      // signup
      if (password !== confirm) {
        setError('Passwords do not match.')
        return
      }
      setLoading(true)
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName.trim() || undefined },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      setLoading(false)
      if (error) { setError(error.message); return }
      setSent({ email, kind: 'signup' })
      startCooldown(30)
    }
  }

  async function handleResend() {
    if (!sent || resending || resendIn > 0) return
    setResending(true)
    setError('')
    const { error } =
      sent.kind === 'signup'
        ? await supabase.auth.resend({
          type: 'signup',
          email: sent.email,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        })
        : await supabase.auth.resetPasswordForEmail(sent.email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
        })
    setResending(false)
    if (error) { setError(error.message); return }
    startCooldown(30)
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  const title =
    mode === 'login' ? 'Welcome back'
      : mode === 'signup' ? 'Create your account'
        : 'Reset your password'

  const subtitle =
    mode === 'login' ? 'Sign in to continue to your Frevio workspace.'
      : mode === 'signup' ? 'Free to get started — no credit card required.'
        : "Enter your email and we'll send you a reset link."

  const inputClass =
    'w-full px-4 py-3 text-sm rounded-xl border bg-white dark:bg-slate-900 ' +
    'border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white ' +
    'placeholder:text-slate-400 dark:placeholder:text-slate-500 ' +
    'hover:border-slate-300 dark:hover:border-slate-700 ' +
    'focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent ' +
    'transition-all duration-200'

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950 font-sans">

      {/* ── LEFT: BRAND PANEL ───────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 xl:p-16 bg-slate-950 text-white">
        {/* logo */}
        <Link href="/" className="inline-flex items-center gap-3 w-fit">
          <img src="/logo.svg" alt="Frevio Logo" className="w-10 h-10" />
          <span className="text-2xl font-bold tracking-tight">Frevio</span>
        </Link>

        {/* headline */}
        <div className="max-w-md space-y-5">
          <h1 className="text-4xl xl:text-5xl font-bold tracking-tight leading-[1.1]">
            Run every client from one place.
          </h1>
          <p className="text-base leading-relaxed text-slate-400">
            Send branded updates, invoices, and contracts — then let Frevio
            flag exactly what needs your attention.
          </p>
        </div>

        {/* footer */}
        <p className="text-sm text-slate-500">
          The client OS for freelancers.
        </p>
      </div>

      {/* ── RIGHT: FORM PANEL ───────────────────────────────────────── */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-6 py-12 sm:px-12 relative">
        <div className="absolute top-6 right-6 z-50">
          <ThemeToggle />
        </div>

        {/* mobile logo */}
        <div className="mb-8 lg:hidden">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <img src="/logo.svg" alt="Frevio Logo" className="w-9 h-9" />
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Frevio</span>
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto">
          {sent ? (
            /* ── CHECK YOUR INBOX ─────────────────────────────── */
            <div className="space-y-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
                <MailCheck className="h-7 w-7 text-accent" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Check your inbox
                </h1>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  {sent.kind === 'signup'
                    ? 'We sent a verification link to '
                    : 'We sent a password reset link to '}
                  <span className="font-semibold text-slate-800 dark:text-slate-200 break-all">{sent.email}</span>.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {sent.kind === 'signup'
                  ? 'Click the activation link inside the email to finish setting up your account, then sign in.'
                  : 'Click the reset link inside the email to choose a new password.'}
              </div>

              {error && (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-400">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3 border-t border-slate-200 dark:border-slate-800 pt-5">
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  Didn&apos;t receive it? Check your spam folder.
                </span>
                <button
                  onClick={handleResend}
                  disabled={resending || resendIn > 0}
                  className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:text-slate-400 dark:disabled:text-slate-600"
                >
                  {resending ? (
                    <><RotateCw className="h-4 w-4 animate-spin" /> Sending…</>
                  ) : resendIn > 0 ? (
                    `Resend in ${resendIn}s`
                  ) : (
                    'Resend email'
                  )}
                </button>
              </div>

              <button
                onClick={() => switchMode('login')}
                className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-800 dark:hover:text-slate-300"
              >
                <ArrowLeft className="h-4 w-4" /> Back to sign in
              </button>
            </div>
          ) : (
            /* ── FORM ─────────────────────────────────────────── */
            <div className="space-y-7">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {title}
                </h1>
                <p className="text-slate-500 dark:text-slate-400">{subtitle}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {mode === 'signup' && (
                  <div className="space-y-1.5">
                    <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Full name
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Jordan Rivera"
                      autoComplete="name"
                      className={inputClass}
                      required
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {mode === 'signup' ? 'Work email' : 'Email'}
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    autoComplete="email"
                    className={inputClass}
                    required
                  />
                </div>

                {mode !== 'reset' && (
                  <div className={mode === 'signup' ? 'grid grid-cols-2 gap-3' : ''}>
                    <div className="space-y-1.5">
                      <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="••••••••"
                          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                          className={inputClass + ' pr-11'}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-md p-1 text-slate-400 transition-colors hover:text-slate-700 dark:hover:text-slate-300"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    {mode === 'signup' && (
                      <div className="space-y-1.5">
                        <label htmlFor="confirm" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                          Confirm
                        </label>
                        <input
                          id="confirm"
                          type={showPassword ? 'text' : 'password'}
                          value={confirm}
                          onChange={e => setConfirm(e.target.value)}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          className={inputClass}
                          required
                        />
                      </div>
                    )}
                  </div>
                )}

                {mode === 'login' && (
                  <div className="flex items-center justify-between">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-400 select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                        className="rounded border-slate-300 dark:border-slate-700 text-accent focus:ring-accent dark:bg-slate-900"
                      />
                      Remember me
                    </label>
                    <button
                      type="button"
                      onClick={() => switchMode('reset')}
                      className="cursor-pointer text-sm font-semibold text-accent hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {error && (
                  <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-400">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-all duration-200 hover:bg-accent-hover hover:shadow-accent/30 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 dark:focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {mode === 'login' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset link'}
                </button>
              </form>

              {mode === 'signup' && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  By signing up you agree to our{' '}
                  <Link href="/terms" className="font-medium text-slate-700 underline underline-offset-2 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">Terms</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="font-medium text-slate-700 underline underline-offset-2 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">Privacy Policy</Link>.
                </p>
              )}

              {mode !== 'reset' && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                    </div>
                    <div className="relative flex justify-center text-xs font-medium uppercase tracking-wider">
                      <span className="bg-white dark:bg-slate-950 px-3 text-slate-400 dark:text-slate-500">or</span>
                    </div>
                  </div>

                  <button
                    onClick={handleGoogle}
                    type="button"
                    className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-accent/20"
                  >
                    <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </button>
                </>
              )}

              <div className="text-center text-sm text-slate-500 dark:text-slate-400">
                {mode === 'login' ? (
                  <>
                    Don&apos;t have an account?{' '}
                    <button type="button" onClick={() => switchMode('signup')} className="cursor-pointer font-semibold text-accent hover:underline">
                      Sign up
                    </button>
                  </>
                ) : mode === 'signup' ? (
                  <>
                    Already have an account?{' '}
                    <button type="button" onClick={() => switchMode('login')} className="cursor-pointer font-semibold text-accent hover:underline">
                      Sign in
                    </button>
                  </>
                ) : (
                  <button type="button" onClick={() => switchMode('login')} className="inline-flex cursor-pointer items-center gap-1.5 font-semibold text-accent hover:underline">
                    <ArrowLeft className="h-4 w-4" /> Back to sign in
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
