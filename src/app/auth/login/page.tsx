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

type AuthMode = 'login' | 'signup' | 'forgot'

export default function LoginPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [code, setCode] = useState('')
  const [mode, setMode] = useState<AuthMode>('login')
  const [codeSent, setCodeSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [resending, setResending] = useState(false)
  const [resendIn, setResendIn] = useState(0)
  const [sent, setSent] = useState<null | { email: string; kind: 'login' | 'signup' }>(null)
  
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => () => { if (cooldownRef.current) clearInterval(cooldownRef.current) }, [])

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search)
      const currentMode = params.get('mode')
      if (currentMode === 'signup' || currentMode === 'login' || currentMode === 'forgot') {
        setMode(currentMode as AuthMode)
      } else {
        setMode('login')
      }
    }
    handlePopState()
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
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

  function switchMode(next: AuthMode) {
    setError('')
    setSuccessMsg('')
    setMode(next)
    setCodeSent(false)
    setCode('')
    setPassword('')
    setConfirmPassword('')

    const url = new URL(window.location.href)
    if (next === 'login') {
      url.searchParams.delete('mode')
    } else {
      url.searchParams.set('mode', next)
    }
    window.history.pushState({}, '', url.toString())
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (mode === 'forgot' && !codeSent) {
      // ── FORGOT PASSWORD STAGE 1: Request Reset Code ───────────────────
      if (!email.trim()) {
        setError('Please enter your email address.')
        return
      }
      setLoading(true)
      try {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim() })
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Failed to send password reset code.')
          setLoading(false)
          return
        }
        setSent({ email: email.trim(), kind: 'login' })
        setCodeSent(true)
        startCooldown(60)
      } catch (err) {
        setError('An error occurred. Please try again.')
      } finally {
        setLoading(false)
      }
    } else if (mode === 'forgot' && codeSent) {
      // ── FORGOT PASSWORD STAGE 2: Verify Code & Set New Password ───────
      if (code.trim().length !== 6) {
        setError('Verification code must be 6 digits.')
        return
      }
      if (password.length < 6) {
        setError('New password must be at least 6 characters.')
        return
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.')
        return
      }

      setLoading(true)
      try {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            code: code.trim(),
            newPassword: password
          })
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Failed to reset password.')
          setLoading(false)
          return
        }

        // If session returned, log in automatically
        if (data.session) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token
          })
          if (!sessionError) {
            window.location.href = '/dashboard'
            return
          }
        }

        // Fallback: switch to login mode with success banner
        setSuccessMsg(data.message || 'Password reset successfully. Please sign in.')
        switchMode('login')
      } catch (err) {
        setError('Failed to reset password. Please try again.')
      } finally {
        setLoading(false)
      }
    } else if (mode === 'signup' && !codeSent) {
      // ── STAGE 1: SIGN UP - Send Verification Code ────────────────────────
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
        startCooldown(60)
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
          type: 'magiclink'
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
      if (mode === 'forgot') {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: sent.email })
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Failed to resend reset code.')
          setResending(false)
          return
        }
      } else {
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

  const title =
    mode === 'forgot'
      ? (codeSent ? 'Set New Password' : 'Reset Your Password')
      : mode === 'login'
      ? 'Welcome Back'
      : 'Get Started with Frevio'

  const subtitle =
    mode === 'forgot'
      ? (codeSent
          ? 'Enter the 6-digit verification code sent to your email and choose a new password.'
          : 'Enter your registered email to receive a 6-digit verification code.')
      : mode === 'login'
      ? 'Sign in to access your studio workspace and live client portals.'
      : 'Launch your client portal, automate approvals, and settle invoices.'

  const inputClass =
    'block w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors'

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#08090a] font-sans selection:bg-slate-200 dark:selection:bg-white/20">

      {/* ── LEFT: BRAND PANEL ───────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 xl:p-16 bg-[#08090a] border-r border-white/10 text-white relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none" />

        {/* logo */}
        <Link href="/" className="relative inline-flex items-center gap-3 w-fit group">
          <div className="w-10 h-10 rounded-2xl bg-white text-slate-950 flex items-center justify-center font-bold text-lg shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-0.5 animate-pulse" />
          </div>
          <span className="text-2xl font-light tracking-tight text-white group-hover:opacity-80 transition-opacity">
            Frevio
          </span>
        </Link>

        {/* headline & value props */}
        <div className="relative max-w-md space-y-6">
          <div className="space-y-3">
            <h1 className="text-3xl xl:text-4xl font-light tracking-tight leading-tight text-white">
              The client portal for modern freelancers and studios.
            </h1>
            <p className="text-sm text-slate-400 font-light">
              One link for milestones, contracts, and instant Stripe payments.
            </p>
          </div>

          {/* Clean proof pills */}
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-[10px]">✓</div>
              <span>Passcode-protected client dashboards</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-[10px]">✓</div>
              <span>1-click client sign-offs & milestone approvals</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-[10px]">✓</div>
              <span>Zero-fee direct Stripe invoice settlements</span>
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="relative flex items-center justify-between text-xs text-slate-500">
          <span>Trusted by top independent studios</span>
          <span>© {new Date().getFullYear()} Frevio</span>
        </div>
      </div>

      {/* ── RIGHT: FORM PANEL ───────────────────────────────────────── */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-6 py-12 sm:px-12 relative overflow-hidden">
        <div className="absolute top-6 right-6 z-50">
          <ThemeToggle />
        </div>

        {/* mobile logo */}
        <div className="mb-8 lg:hidden">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 flex items-center justify-center font-bold text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-0.5 animate-pulse" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">Frevio</span>
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="bg-white dark:bg-[#0c0d12]/90 rounded-3xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 backdrop-blur-md p-8 sm:p-10 shadow-xl dark:shadow-none">
            {codeSent ? (
              /* ── VERIFY CODE SCREEN (SIGNUP OR FORGOT PASSWORD) ───── */
              <div className="space-y-6">
                <div className="space-y-2 text-center">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100/70 dark:bg-white/[0.03] text-[10px] font-medium tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-1">
                    {mode === 'forgot' ? 'Password Recovery' : 'Security Verification'}
                  </div>
                  <h1 className="text-2xl font-light uppercase tracking-[-0.02em] text-slate-900 dark:text-white">
                    {mode === 'forgot' ? 'Set New Password' : 'Verify Your Email'}
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    We sent a 6-digit verification code to{' '}
                    <span className="font-semibold text-slate-800 dark:text-slate-200 break-all">{email}</span>.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="code" className="block text-[11px] font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      6-Digit Code
                    </label>
                    <input
                      id="code"
                      type="text"
                      maxLength={6}
                      pattern="\d{6}"
                      value={code}
                      onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-full tracking-[10px] text-center text-2xl font-mono py-3 px-3 border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50/60 dark:bg-white/[0.03] focus:outline-none focus:border-slate-400 dark:focus:border-white/30 text-slate-900 dark:text-white transition-colors"
                      required
                      autoFocus
                    />
                  </div>

                  {mode === 'forgot' && (
                    <>
                      <div className="space-y-1.5">
                        <label htmlFor="newPassword" className="block text-[11px] font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            id="newPassword"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            className={`${inputClass} pr-10`}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 focus:outline-none cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="confirmPassword" className="block text-[11px] font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
                          Confirm New Password
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
                    </>
                  )}

                  {error && (
                    <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-600 dark:text-rose-400">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || code.length !== 6}
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 py-3 text-xs font-semibold uppercase tracking-wider shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {mode === 'forgot' ? 'Reset Password & Sign In' : 'Verify & Create Account'}
                  </button>
                </form>

                <div className="flex flex-col gap-3 border-t border-slate-100 dark:border-white/5 pt-5 text-center">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    Did not receive the code? Please verify spam folders.
                  </span>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending || resendIn > 0}
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-100 dark:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {resending ? (
                      <><RotateCw className="h-3.5 w-3.5 animate-spin" /> Sending…</>
                    ) : resendIn > 0 ? (
                      `Resend code in ${resendIn}s`
                    ) : (
                      'Resend Code'
                    )}
                  </button>
                  <div className="flex items-center justify-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                    <button
                      type="button"
                      onClick={() => setCodeSent(false)}
                      className="hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors"
                    >
                      Change Email
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors"
                    >
                      Back to Sign In
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* ── MAIN INPUT FORM ──────────────────────────── */
              <div className="space-y-5">
                {/* Mode Segmented Tab Switcher */}
                {mode !== 'forgot' && (
                  <div className="p-1 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/10 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => switchMode('signup')}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        mode === 'signup'
                          ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      Sign Up
                    </button>
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        mode === 'login'
                          ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      Sign In
                    </button>
                  </div>
                )}

                <div className="space-y-1.5 text-center">
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                    {mode === 'forgot'
                      ? 'Reset your password'
                      : mode === 'login'
                      ? 'Welcome back'
                      : 'Create your account'}
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {mode === 'forgot'
                      ? 'Enter your email to receive a recovery code.'
                      : mode === 'login'
                      ? 'Sign in to access your studio workspace.'
                      : 'Get started with Frevio in seconds.'}
                  </p>
                </div>

                {successMsg && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2.5 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* ── 1. PRIMARY HERO ACTION: GOOGLE 1-CLICK AUTH ─────────────── */}
                {mode !== 'forgot' && (
                  <div className="space-y-3">
                    <button
                      onClick={handleGoogle}
                      type="button"
                      className="group relative flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-white/[0.05] hover:bg-slate-50 dark:hover:bg-white/[0.08] px-4 py-3 text-xs sm:text-sm font-semibold text-slate-800 dark:text-white shadow-xs hover:shadow-sm transition-all active:scale-[0.99]"
                    >
                      <svg className="h-4 w-4 sm:h-4.5 sm:w-4.5 flex-shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      <span>
                        {mode === 'signup' ? 'Sign up with Google' : 'Continue with Google'}
                      </span>
                    </button>

                    {/* Subtle Divider */}
                    <div className="relative py-1">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200/70 dark:border-white/10" />
                      </div>
                      <div className="relative flex justify-center text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        <span className="bg-white dark:bg-[#0c0d12] px-2.5">
                          or continue with email
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── 2. EMAIL FORM ───────────────────────────────────────────── */}
                <form onSubmit={handleSubmit} className="space-y-3">
                  {mode === 'signup' && (
                    <div className="space-y-1">
                      <label htmlFor="fullName" className="block text-[11px] font-medium text-slate-600 dark:text-slate-400">
                        Full Name
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

                  <div className="space-y-1">
                    <label htmlFor="email" className="block text-[11px] font-medium text-slate-600 dark:text-slate-400">
                      Email address
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

                  {mode !== 'forgot' && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label htmlFor="password" className="block text-[11px] font-medium text-slate-600 dark:text-slate-400">
                          Password
                        </label>
                        {mode === 'login' && (
                          <button
                            type="button"
                            onClick={() => switchMode('forgot')}
                            className="text-[11px] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer transition-colors"
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>
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
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 focus:outline-none cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-600 dark:text-rose-400">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 py-2.5 text-xs font-semibold tracking-wide shadow-xs transition-all disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {mode === 'forgot'
                      ? 'Send Reset Code'
                      : mode === 'login'
                      ? 'Sign In'
                      : 'Continue'}
                  </button>
                </form>

                {mode === 'signup' && (
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed text-center">
                    By signing up you agree to our{' '}
                    <Link href="/terms" className="underline hover:text-slate-700 dark:hover:text-slate-300">Terms</Link>
                    {' '}and{' '}
                    <Link href="/privacy" className="underline hover:text-slate-700 dark:hover:text-slate-300">Privacy Policy</Link>.
                  </p>
                )}

                <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-white/5">
                  {mode === 'forgot' ? (
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="cursor-pointer font-medium text-slate-900 dark:text-white hover:underline"
                    >
                      ← Back to sign in
                    </button>
                  ) : mode === 'login' ? (
                    <>
                      Don&apos;t have an account?{' '}
                      <button type="button" onClick={() => switchMode('signup')} className="cursor-pointer font-medium text-slate-900 dark:text-white hover:underline">
                        Sign up
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{' '}
                      <button type="button" onClick={() => switchMode('login')} className="cursor-pointer font-medium text-slate-900 dark:text-white hover:underline">
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
    </div>
  )
}
