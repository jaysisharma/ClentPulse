import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(request: Request) {
  try {
    // 1. Authenticate user session
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Validate admin credentials
    const { data: profile, error: profileErr } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profileErr || !profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 3. Extract parameters
    const body = await request.json().catch(() => ({}))
    const { target, subject, fromEmail, htmlContent } = body

    if (!target || !subject || !fromEmail || !htmlContent) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey || resendApiKey.startsWith('re_your')) {
      return NextResponse.json({ error: 'Resend API key is not configured in environment settings.' }, { status: 500 })
    }

    // 4. Query target emails
    const admin = createAdminClient()
    let recipients: { email: string; name: string | null }[] = []

    if (target === 'all') {
      const { data } = await admin.from('users').select('email, name')
      recipients = data || []
    } else if (target === 'free') {
      const { data } = await admin.from('users').select('email, name').eq('plan', 'free')
      recipients = data || []
    } else if (target === 'pro') {
      const { data } = await admin.from('users').select('email, name').eq('plan', 'pro')
      recipients = data || []
    } else if (target === 'leads') {
      // Users who haven't completed onboarding OR don't have projects
      const { data: allUsers } = await admin.from('users').select('id, email, name, onboarded, projects(id)')
      recipients = (allUsers || [])
        .filter(u => !u.onboarded || !u.projects || u.projects.length === 0)
        .map(u => ({ email: u.email, name: u.name }))
    }

    if (recipients.length === 0) {
      return NextResponse.json({ success: true, sentCount: 0, msg: 'No users matched the criteria.' })
    }

    // 5. Send emails in parallel batches
    const resend = new Resend(resendApiKey)
    const sendPromises = recipients.map(recipient => {
      // Personalize content
      const personalizedHtml = htmlContent.replace(/{{name}}/g, recipient.name || 'there')
      
      return resend.emails.send({
        from: fromEmail,
        to: recipient.email,
        subject,
        html: personalizedHtml
      }).catch(err => {
        console.error(`[Broadcast] Error sending to ${recipient.email}:`, err)
        return { error: err }
      })
    })

    const results = await Promise.all(sendPromises)
    const successCount = results.filter(r => !(r as any).error).length
    const failureCount = results.length - successCount

    return NextResponse.json({
      success: true,
      sentCount: successCount,
      failCount: failureCount,
      totalCount: recipients.length
    })
  } catch (err: any) {
    console.error('[Broadcast API] Unexpected exception:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
