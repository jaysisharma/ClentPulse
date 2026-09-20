import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, code, newPassword } = await request.json().catch(() => ({}))
    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { error: 'Email, verification code, and new password are required.' },
        { status: 400 }
      )
    }

    const cleanEmail = email.trim().toLowerCase()
    const cleanCode = code.trim()

    if (cleanCode.length !== 6) {
      return NextResponse.json({ error: 'Verification code must be 6 digits.' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters.' }, { status: 400 })
    }

    const supabaseAdmin = createAdminClient()

    // 1. Fetch OTP record
    const { data: record, error: fetchError } = await supabaseAdmin
      .from('otp_codes')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle()

    if (fetchError) {
      console.error('[Reset Password] Fetch DB Error:', fetchError)
      return NextResponse.json({ error: 'Failed to verify reset code.' }, { status: 500 })
    }

    if (!record) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code. Please request a new one.' },
        { status: 400 }
      )
    }

    // 2. Validate expiration
    if (new Date() > new Date(record.expires_at)) {
      await supabaseAdmin.from('otp_codes').delete().eq('email', cleanEmail)
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // 3. Validate code match with failed attempts threshold
    if (record.code !== cleanCode) {
      const nextFailed = (record.failed_verifications || 0) + 1

      if (nextFailed >= 3) {
        await supabaseAdmin.from('otp_codes').delete().eq('email', cleanEmail)
        return NextResponse.json(
          { error: 'Too many incorrect attempts. This code has been invalidated. Please request a new one.' },
          { status: 400 }
        )
      }

      await supabaseAdmin
        .from('otp_codes')
        .update({ failed_verifications: nextFailed })
        .eq('email', cleanEmail)

      const remaining = 3 - nextFailed
      return NextResponse.json(
        { error: `Invalid verification code. You have ${remaining} ${remaining === 1 ? 'attempt' : 'attempts'} remaining.` },
        { status: 400 }
      )
    }

    // 4. Resolve user ID from public.users or auth.admin.listUsers
    const { data: userRecord } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle()

    let userId = userRecord?.id

    if (!userId) {
      const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()
      if (!listError && users) {
        const found = users.find(u => u.email?.toLowerCase() === cleanEmail)
        if (found) userId = found.id
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'User account could not be found.' }, { status: 404 })
    }

    // 5. Update the user password in Supabase Auth
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
    })

    if (updateError) {
      console.error('[Reset Password] Supabase Update Password Error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    // 6. Delete the OTP code record & clear any previous rate limits
    await Promise.all([
      supabaseAdmin.from('otp_codes').delete().eq('email', cleanEmail),
      supabaseAdmin.from('login_attempts').delete().eq('email', cleanEmail)
    ])

    // 7. Auto-sign user in and return session
    try {
      const clientSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false, autoRefreshToken: false } }
      )

      const { data: signInData, error: signInError } = await clientSupabase.auth.signInWithPassword({
        email: cleanEmail,
        password: newPassword
      })

      if (!signInError && signInData?.session) {
        return NextResponse.json({
          success: true,
          session: signInData.session,
          message: 'Password reset successfully.'
        })
      }
    } catch (sessionErr) {
      console.warn('[Reset Password] Auto-signin skipped:', sessionErr)
    }

    return NextResponse.json({
      success: true,
      session: null,
      message: 'Password reset successfully. You may now sign in.'
    })
  } catch (err: any) {
    console.error('[Reset Password] Exception:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
