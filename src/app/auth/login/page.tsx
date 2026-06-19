'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  ArrowLeft,
  RotateCw,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { LaunchPromoBanner } from '@/components/launch-promo-banner'

export default function LoginPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [code, setCode] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [codeSent, setCodeSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resending, setResending] = useState(false)
  const [resendIn, setResendIn] = useState(0)
  const [sent, setSent] = useState<null | { email: string; kind: 'login' | 'signup' }>(null)
  
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => () => { if (cooldownRef.current) clearInterval(cooldownRef.current) }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const initialMode = params.get('mode')
    if (initialMode === 'signup' || initialMode === 'login') {
      setMode(initialMode)
    }
  }, [])

  const supabase = createClient()

  function startCooldown(seconds: number) {
    setResendIn(seconds)
    if (cooldownRef.current) clearInterval(cooldownRef.current)
    cooldownRef.current = setInterval(() => {
      setResendIn(s => {
        if (s <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current)
          return 0
        }
        return s - 1
      })
    }, 1000)
  }

  function switchMode(next: 'login' | 'signup') {
    setError('')
    setMode(next)
    setCodeSent(false)
    setCode('')
    setPassword('')
    setConfirmPassword('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (mode === 'signup' && !codeSent) {
      // ── STAGE 1: SIGN UP - Send Verification Code ────────────────────────
      if (password !== confirmPassword) {
        setError('Passwords do not match.')
        return
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.')
        return
      }

      setLoading(true)
      try {
        const res = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, fullName: fullName.trim() })
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Failed to send verification code.')
          setLoading(false)
          return
        }
        setSent({ email, kind: 'signup' })
        setCodeSent(true)
        startCooldown(60) // Enforce local 60-second UI rate limiting
      } catch (err) {
        setError('An error occurred. Please try again.')
      } finally {
        setLoading(false)
      }
    } else if (mode === 'signup' && codeSent) {
      // ── STAGE 2: SIGN UP - Verify Verification Code & Create Account ─────
      if (code.trim().length !== 6) {
        setError('Verification code must be 6 digits.')
        return
      }
      setLoading(true)
      try {
        // 1. Call server API to register user and generate token hash
        const res = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code: code.trim() })
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Invalid or expired verification code.')
          setLoading(false)
          return
        }

        const token_hash = data.token_hash

        // 2. Log user in client-side using Supabase verifyOtp
        const { error: authError } = await supabase.auth.verifyOtp({
          token_hash,
          type: 'email'
        })

        if (authError) {
          setError(authError.message)
          setLoading(false)
          return
        }

        // 3. Redirect to onboarding
        window.location.href = '/onboarding'
      } catch (err) {
        setError('Failed to authenticate. Please try again.')
      } finally {
        setLoading(false)
      }
    } else {
      // ── STAGE 3: SIGN IN - Password-based direct login with rate limit ─────
      setLoading(true)
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Invalid credentials.')
          setLoading(false)
          return
        }

        const { session } = data

        // 1. Set session client-side
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token
        })

        if (sessionError) {
          setError(sessionError.message)
          setLoading(false)
          return
        }

        // 2. Redirect based on role and profile status
        const role = session.user?.user_metadata?.role as string | undefined
        if (role === 'client') {
          window.location.href = '/client/dashboard'
          return
        }

        const { data: profile } = await supabase
          .from('users')
          .select('id, onboarded')
          .eq('id', session.user.id)
          .maybeSingle()

        if (!profile) {
          window.location.href = '/onboarding'
        } else {
          window.location.href = profile.onboarded ? '/dashboard' : '/onboarding'
        }
      } catch (err) {
        setError('Failed to sign in. Please check your credentials.')
      } finally {
        setLoading(false)
      }
    }
  }

  async function handleResend() {
    if (!sent || resending || resendIn > 0) return
    setResending(true)
    setError('')
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: sent.email, password, fullName })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to resend code.')
        setResending(false)
        return
      }
      startCooldown(60)
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setResending(false)
    }
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  const title = mode === 'login' ? 'Sign in to Frevio' : 'Create your account'
  const subtitle =
    mode === 'login'
      ? 'Enter your email and password to log in.'
      : 'Enter your name, email, and password to request a verification code.'

  const inputClass =
    'block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 dark:text-white focus:border-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 ' +
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
          Professional client portals & invoicing.
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
          {codeSent ? (
            /* ── VERIFY CODE SCREEN ───────────────────────────── */
            <div className="space-y-7">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Verify your email
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  We sent a 6-digit code to{' '}
                  <span className="font-semibold text-slate-800 dark:text-slate-250 break-all">{email}</span>.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label htmlFor="code" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    6-digit code
                  </label>
                  <input
                    id="code"
                    type="text"
                    maxLength={6}
                    pattern="\d{6}"
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full tracking-[8px] text-center text-2xl font-bold py-3 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-accent focus:bg-white text-slate-900 dark:text-white"
                    required
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-400">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-all duration-200 hover:bg-accent-hover hover:shadow-accent/30 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 dark:focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Verify & Create Account
                </button>
              </form>

              <div className="flex flex-col gap-3 border-t border-slate-200 dark:border-slate-800 pt-5 text-center">
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  Didn&apos;t receive the code? Check your spam folder.
                </span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending || resendIn > 0}
                  className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:text-slate-400 dark:disabled:text-slate-600"
                >
                  {resending ? (
                    <><RotateCw className="h-4 w-4 animate-spin" /> Sending…</>
                  ) : resendIn > 0 ? (
                    `Resend code in ${resendIn}s`
                  ) : (
                    'Resend code'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setCodeSent(false)}
                  className="text-xs font-semibold text-accent hover:underline cursor-pointer"
                >
                  Change email address
                </button>
              </div>
            </div>
          ) : (
            /* ── MAIN INPUT FORM ──────────────────────────── */
            <div className="space-y-7">
              <div className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {title}
                </h1>
                {mode === 'signup' && <LaunchPromoBanner />}
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
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      className={`${inputClass} pr-10`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {mode === 'signup' && (
                  <div className="space-y-1.5">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Confirm password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className={inputClass}
                      required
                    />
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
                  {mode === 'login' ? 'Sign In' : 'Send verification code'}
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

              <div className="text-center text-sm text-slate-500 dark:text-slate-400">
                {mode === 'login' ? (
                  <>
                    Don&apos;t have an account?{' '}
                    <button type="button" onClick={() => switchMode('signup')} className="cursor-pointer font-semibold text-accent hover:underline">
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button type="button" onClick={() => switchMode('login')} className="cursor-pointer font-semibold text-accent hover:underline">
                      Sign in
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
