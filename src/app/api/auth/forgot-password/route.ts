import { createAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { email } = await request.json().catch(() => ({}))
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()
    const supabaseAdmin = createAdminClient()

    // 1. Verify that the user exists
    const { data: userRecord } = await supabaseAdmin
      .from('users')
      .select('id, name, email')
      .eq('email', cleanEmail)
      .maybeSingle()

    let userExists = !!userRecord

    if (!userExists) {
      const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()
      if (!listError && users) {
        userExists = users.some(u => u.email?.toLowerCase() === cleanEmail)
      }
    }

    if (!userExists) {
      return NextResponse.json(
        { error: 'No account found with this email address.' },
        { status: 404 }
      )
    }

    const now = new Date()
    const fiveMinutes = 5 * 60 * 1000

    // 2. Enforce rate limiting using otp_codes
    const { data: existing } = await supabaseAdmin
      .from('otp_codes')
      .select('created_at, window_start, attempts_count')
      .eq('email', cleanEmail)
      .maybeSingle()

    let attemptsCount = 1
    let windowStart = now.toISOString()

    if (existing) {
      // Cooldown check: 60 seconds between requests
      const timeSinceCreation = now.getTime() - new Date(existing.created_at).getTime()
      if (timeSinceCreation < 60000) {
        const waitTime = Math.ceil((60000 - timeSinceCreation) / 1000)
        return NextResponse.json(
          { error: `Please wait ${waitTime} seconds before requesting another reset code.` },
          { status: 429 }
        )
      }

      // 5-minute window check: max 3 attempts
      const timeSinceWindowStart = now.getTime() - new Date(existing.window_start).getTime()
      if (timeSinceWindowStart < fiveMinutes) {
        if (existing.attempts_count >= 3) {
          const waitTimeSeconds = Math.ceil((fiveMinutes - timeSinceWindowStart) / 1000)
          const waitTimeMinutes = Math.ceil(waitTimeSeconds / 60)
          return NextResponse.json(
            { error: `Too many password reset requests. Please wait ${waitTimeMinutes} minutes before trying again.` },
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

    // 3. Generate a secure 6-digit verification code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000).toISOString() // 10 minutes validity

    // 4. Store code in otp_codes
    const { error: dbError } = await supabaseAdmin
      .from('otp_codes')
      .upsert({
        email: cleanEmail,
        code: otpCode,
        created_at: now.toISOString(),
        expires_at: expiresAt,
        attempts_count: attemptsCount,
        window_start: windowStart,
        failed_verifications: 0,
        temp_password: 'RESET_PASSWORD',
        temp_name: userRecord?.name || null
      }, { onConflict: 'email' })

    if (dbError) {
      console.error('[Forgot Password] DB Error:', dbError)
      return NextResponse.json({ error: 'Failed to generate password reset code.' }, { status: 500 })
    }

    // 5. Send password reset email via Resend
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Frevio <login@frevio.cloud>'

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 40px auto; padding: 32px; border: 1px solid #1e293b; border-radius: 16px; background-color: #0c0d12; color: #f8fafc;">
        <div style="margin-bottom: 24px; text-align: left;">
          <span style="display: inline-block; width: 10px; height: 10px; background-color: #f43f5e; border-radius: 50%; margin-right: 8px;"></span>
          <span style="font-size: 16px; font-weight: 700; letter-spacing: -0.02em; color: #ffffff;">Frevio</span>
        </div>
        <h1 style="font-size: 20px; font-weight: 600; color: #ffffff; margin-top: 0; margin-bottom: 12px; letter-spacing: -0.02em;">Password Reset Code</h1>
        <p style="font-size: 14px; line-height: 22px; color: #94a3b8; margin-top: 0; margin-bottom: 24px;">
          We received a request to reset the password for your Frevio account. Enter the 6-digit verification code below to establish your new credentials:
        </p>
        <div style="background-color: #161822; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 18px; text-align: center; margin-bottom: 24px;">
          <span style="font-family: monospace; font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #ffffff;">${otpCode}</span>
        </div>
        <p style="font-size: 12px; line-height: 18px; color: #64748b; margin-top: 0; margin-bottom: 24px;">
          This code will expire in <strong>10 minutes</strong>. If you did not make this request, you can safely ignore this email — your existing password remains active and secure.
        </p>
        <div style="border-top: 1px solid rgba(255,255,255,0.06); padding-top: 16px;">
          <p style="font-size: 11px; color: #475569; margin: 0;">Frevio Studio Management System</p>
        </div>
      </div>
    `

    const { error: emailError } = await resend.emails.send({
      from: fromEmail,
      to: [cleanEmail],
      subject: `Your Frevio Password Reset Code: ${otpCode}`,
      html
    })

    if (emailError) {
      console.error('[Forgot Password] Resend Error:', emailError)
      return NextResponse.json({ error: 'Failed to deliver reset email. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, email: cleanEmail })
  } catch (err: any) {
    console.error('[Forgot Password] Exception:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
