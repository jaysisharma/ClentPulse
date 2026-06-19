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

    // 3. Validate code match
    if (record.code !== cleanCode) {
      return NextResponse.json({ error: 'Invalid verification code.' }, { status: 400 })
    }

    // 4. Invalidate / delete the verified OTP code
    await supabaseAdmin.from('otp_codes').delete().eq('email', cleanEmail)

    // 5. Generate dynamic login link / token hash from Supabase Admin Auth
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: cleanEmail,
    })

    if (linkError) {
      console.error('[Verify OTP] Supabase Admin Link Generation Error:', linkError)
      return NextResponse.json({ error: linkError.message }, { status: 400 })
    }

    const hashedToken = linkData.properties?.hashed_token || linkData.properties?.token_hash

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
