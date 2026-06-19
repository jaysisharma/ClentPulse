import { createAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()
    const supabaseAdmin = createAdminClient()

    // 1. Enforce manual rate limiting: check if a code was created in the last 60 seconds
    const { data: existing } = await supabaseAdmin
      .from('otp_codes')
      .select('created_at')
      .eq('email', cleanEmail)
      .maybeSingle()

    if (existing) {
      const timeSinceCreation = Date.now() - new Date(existing.created_at).getTime()
      if (timeSinceCreation < 60000) {
        const waitTime = Math.ceil((60000 - timeSinceCreation) / 1000)
        return NextResponse.json(
          { error: `Please wait ${waitTime} seconds before requesting another code.` },
          { status: 429 }
        )
      }
    }

    // 2. Generate a 6-digit verification code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes validity

    // 3. Upsert the code in public.otp_codes
    const { error: dbError } = await supabaseAdmin
      .from('otp_codes')
      .upsert({
        email: cleanEmail,
        code: otpCode,
        created_at: new Date().toISOString(),
        expires_at: expiresAt
      }, { onConflict: 'email' })

    if (dbError) {
      console.error('[Send OTP] DB Error:', dbError)
      return NextResponse.json({ error: 'Failed to generate verification code.' }, { status: 500 })
    }

    // 4. Send the OTP email using Resend
    // Use onboarding@resend.dev if a custom verified domain is not active in Resend dashboard
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Frevio <onboarding@resend.dev>'
    
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 40px auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <div style="margin-bottom: 24px; text-align: left;">
          <div style="display: inline-block; width: 32px; height: 32px; background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%); border-radius: 8px; vertical-align: middle;"></div>
          <span style="font-size: 20px; font-weight: 800; color: #0f172a; margin-left: 8px; vertical-align: middle;">Frevio</span>
        </div>
        <h1 style="font-size: 22px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 12px;">Confirm your login</h1>
        <p style="font-size: 15px; line-height: 24px; color: #475569; margin-top: 0; margin-bottom: 24px;">Enter the following 6-digit code on the sign-in screen to access your workspace. This code is valid for 5 minutes.</p>
        <div style="background-color: #f1f5f9; border-radius: 12px; padding: 16px; text-align: center; margin-bottom: 24px;">
          <span style="font-family: monospace; font-size: 32px; font-weight: 755; letter-spacing: 6px; color: #0f172a;">${otpCode}</span>
        </div>
        <p style="font-size: 12px; color: #94a3b8; line-height: 18px; margin: 0; border-top: 1px dashed #e2e8f0; padding-top: 20px;">If you didn't request this sign-in attempt, you can safely ignore this email.</p>
      </div>
    `

    const { error: emailError } = await resend.emails.send({
      from: fromEmail,
      to: [cleanEmail],
      subject: `Your Frevio Login Code: ${otpCode}`,
      html
    })

    if (emailError) {
      console.error('[Send OTP] Resend Email Error:', emailError)
      return NextResponse.json({ error: 'Failed to deliver authentication email.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[Send OTP] Request Exception:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
