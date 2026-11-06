import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@supabase/supabase-js'
import { rateLimit } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'

// Brute-force protection:
// - per IP: caps credential stuffing from one source across many accounts
// - per email: only FAILED attempts count, and the cap is high enough that a
//   stranger can't lock someone out with a couple of bad guesses
const IP_LIMIT = 30
const IP_WINDOW_MS = 10 * 60_000
const MAX_FAILURES = 10
const FAILURE_WINDOW_MS = 15 * 60_000

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous'
    const rl = await rateLimit(`login:${ip}`, IP_LIMIT, IP_WINDOW_MS)
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many login attempts. Please try again in a few minutes.' }, { status: 429 })
    }

    const cleanEmail = email.trim().toLowerCase()
    const supabaseAdmin = createAdminClient()
    const now = Date.now()

    // 1. Refuse while this email is over its failure limit
    const { data: existing } = await supabaseAdmin
      .from('login_attempts')
      .select('attempts_count, window_start')
      .eq('email', cleanEmail)
      .maybeSingle()

    const windowActive = existing && now - new Date(existing.window_start).getTime() < FAILURE_WINDOW_MS
    if (windowActive && existing.attempts_count >= MAX_FAILURES) {
      const waitMinutes = Math.ceil((FAILURE_WINDOW_MS - (now - new Date(existing.window_start).getTime())) / 60_000)
      return NextResponse.json(
        { error: `Too many failed attempts. Try again in ${waitMinutes} minute${waitMinutes === 1 ? '' : 's'}, or reset your password.` },
        { status: 429 }
      )
    }

    // 2. Attempt password sign-in using a standard non-admin client
    const clientSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    )

    const { data, error: authError } = await clientSupabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    })

    if (authError) {
      // 3. Record the failure (a new window starts once the old one has expired)
      const { error: trackError } = await supabaseAdmin
        .from('login_attempts')
        .upsert({
          email: cleanEmail,
          attempts_count: windowActive ? existing.attempts_count + 1 : 1,
          window_start: windowActive ? existing.window_start : new Date(now).toISOString(),
        }, { onConflict: 'email' })
      if (trackError) console.error('[Login API] Storing failed attempt failed:', trackError)

      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // 4. Success clears the failure count
    if (existing) await supabaseAdmin.from('login_attempts').delete().eq('email', cleanEmail)

    return NextResponse.json({ session: data.session })
  } catch (err: any) {
    console.error('[Login API] Exception:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
