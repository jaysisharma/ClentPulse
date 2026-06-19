import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()
    const supabaseAdmin = createAdminClient()

    const now = new Date()
    const fiveMinutes = 5 * 60 * 1000

    // 1. Check manual login attempts rate limiting
    const { data: existing } = await supabaseAdmin
      .from('login_attempts')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle()

    let attemptsCount = 1
    let windowStart = now.toISOString()

    if (existing) {
      const timeSinceWindowStart = now.getTime() - new Date(existing.window_start).getTime()
      
      if (timeSinceWindowStart < fiveMinutes) {
        if (existing.attempts_count >= 2) {
          const waitTimeSeconds = Math.ceil((fiveMinutes - timeSinceWindowStart) / 1000)
          const waitTimeMinutes = Math.ceil(waitTimeSeconds / 60)
          return NextResponse.json(
            { error: `Too many login attempts. Please wait ${waitTimeMinutes} minutes before trying again.` },
            { status: 429 }
          )
        }
        attemptsCount = existing.attempts_count + 1
        windowStart = existing.window_start
      } else {
        attemptsCount = 1
        windowStart = now.toISOString()
      }
    }

    // 2. Track/Upsert this attempt
    const { error: trackError } = await supabaseAdmin
      .from('login_attempts')
      .upsert({
        email: cleanEmail,
        attempts_count: attemptsCount,
        window_start: windowStart
      }, { onConflict: 'email' })

    if (trackError) {
      console.error('[Login API] Storing attempt failed:', trackError)
      // Continue authenticating even if tracking fails, but log it.
    }

    // 3. Attempt password sign-in using a standard non-admin client
    const clientSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    )

    const { data, error: authError } = await clientSupabase.auth.signInWithPassword({
      email: cleanEmail,
      password
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // 4. Success! Clear/reset login attempts for this email
    await supabaseAdmin.from('login_attempts').delete().eq('email', cleanEmail)

    // 5. Return session details so client can set the session
    return NextResponse.json({ session: data.session })
  } catch (err: any) {
    console.error('[Login API] Exception:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
