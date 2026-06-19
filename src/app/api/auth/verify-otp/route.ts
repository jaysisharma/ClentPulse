import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json()
    if (!email || !code) {
      return NextResponse.json({ error: 'Email and verification code are required' }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()
    const cleanCode = code.trim()
    const supabaseAdmin = createAdminClient()

    // 1. Fetch OTP record
    const { data: record, error: fetchError } = await supabaseAdmin
      .from('otp_codes')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle()

    if (fetchError) {
      console.error('[Verify OTP] Fetch DB Error:', fetchError)
      return NextResponse.json({ error: 'Failed to verify code.' }, { status: 500 })
    }

    if (!record) {
      return NextResponse.json({ error: 'Invalid or expired verification code.' }, { status: 400 })
    }

    // 2. Validate expiration
    if (new Date() > new Date(record.expires_at)) {
      // Clean up expired record
      await supabaseAdmin.from('otp_codes').delete().eq('email', cleanEmail)
      return NextResponse.json({ error: 'Verification code has expired. Please request a new one.' }, { status: 400 })
    }

    // 3. Validate code match and rate-limit incorrect attempts
    if (record.code !== cleanCode) {
      const nextFailed = (record.failed_verifications || 0) + 1
      
      if (nextFailed >= 3) {
        // Delete the code so it is completely invalidated
        await supabaseAdmin.from('otp_codes').delete().eq('email', cleanEmail)
        return NextResponse.json(
          { error: 'Too many incorrect attempts. This code has been invalidated. Please request a new one.' },
          { status: 400 }
        )
      }

      // Update failed attempts count
      await supabaseAdmin
        .from('otp_codes')
        .update({ failed_verifications: nextFailed })
        .eq('email', cleanEmail)

      const attemptsRemaining = 3 - nextFailed
      return NextResponse.json(
        { error: `Invalid verification code. You have ${attemptsRemaining} attempts remaining.` },
        { status: 400 }
      )
    }

    // 4. If staging signup details are present, create the auth user
    if (record.temp_password) {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password: record.temp_password,
        user_metadata: { full_name: record.temp_name || '' },
        email_confirm: true
      })

      if (createError) {
        console.error('[Verify OTP] Supabase Admin Create User Error:', createError)
        return NextResponse.json({ error: createError.message }, { status: 400 })
      }
    }

    // 5. Invalidate / delete the verified OTP code
    await supabaseAdmin.from('otp_codes').delete().eq('email', cleanEmail)

    // 6. Generate dynamic login link / token hash from Supabase Admin Auth
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: cleanEmail,
    })

    if (linkError) {
      console.error('[Verify OTP] Supabase Admin Link Generation Error:', linkError)
      return NextResponse.json({ error: linkError.message }, { status: 400 })
    }

    const hashedToken = linkData.properties?.hashed_token

    if (!hashedToken) {
      console.error('[Verify OTP] Token hash missing from Supabase response', linkData)
      return NextResponse.json({ error: 'Auth token generation failed.' }, { status: 500 })
    }

    // 6. Return the verification token hash
    return NextResponse.json({ token_hash: hashedToken })
  } catch (err: any) {
    console.error('[Verify OTP] Exception:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
