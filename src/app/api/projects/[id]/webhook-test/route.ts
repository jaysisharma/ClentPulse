import { NextResponse } from 'next/server'
import { getProjectAccess } from '@/lib/project-access'
import { createAdminClient } from '@/lib/supabase/admin'
import { dispatchWebhook } from '@/lib/webhooks'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params
    const access = await getProjectAccess(projectId)
    if (!access || !access.isWorkspaceMember) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    let webhookUrl = body.webhookUrl

    if (!webhookUrl) {
      const admin = createAdminClient()
      const { data: project } = await admin
        .from('projects')
        .select('webhook_url')
        .eq('id', projectId)
        .single()
      webhookUrl = project?.webhook_url
    }

    if (!webhookUrl || !webhookUrl.startsWith('http')) {
      return NextResponse.json({ error: 'Please enter a valid Slack or Discord webhook URL.' }, { status: 400 })
    }

    const result = await dispatchWebhook(webhookUrl, {
      title: '⚡ Frevio Webhook Connected',
      message: `Your Slack/Discord webhook integration is successfully connected for ${access.project.project_name}! You will receive live alerts for client approvals, comments, and invoice settlements.`,
      projectName: access.project.project_name,
      type: 'general',
      fields: [
        { name: 'Environment', value: 'Production Webhook' },
        { name: 'Status', value: 'Active & Verified' },
      ],
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to dispatch webhook to URL.' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[Webhook Test Error]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

