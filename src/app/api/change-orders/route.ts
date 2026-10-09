import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      projectId,
      title,
      description,
      amount,
      currency = 'USD',
      estimatedHours,
      timelineDays = 0,
      requiresPayment = true,
      sourceFeedbackId,
    } = body

    if (!projectId || !title?.trim()) {
      return NextResponse.json({ error: 'Project ID and title are required' }, { status: 400 })
    }

    // Verify user owns the project or has admin rights
    const { data: project, error: projError } = await supabase
      .from('projects')
      .select('id, user_id, org_id')
      .eq('id', projectId)
      .single()

    if (projError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (project.user_id !== user.id) {
      // Check org membership
      if (project.org_id) {
        const { data: member } = await supabase
          .from('organization_members')
          .select('role')
          .eq('org_id', project.org_id)
          .eq('user_id', user.id)
          .maybeSingle()
        if (!member || !['owner', 'admin'].includes(member.role)) {
          return NextResponse.json({ error: 'Unauthorized to create change orders for this project' }, { status: 403 })
        }
      } else {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const parsedAmount = Math.max(0, Number(amount) || 0)
    const parsedHours = estimatedHours ? Number(estimatedHours) : null
    const parsedTimelineDays = Math.max(0, Number(timelineDays) || 0)

    const { data: changeOrder, error: insertError } = await supabase
      .from('change_orders')
      .insert({
        project_id: projectId,
        user_id: user.id,
        title: title.trim(),
        description: description?.trim() || null,
        amount: parsedAmount,
        currency: currency.toUpperCase(),
        estimated_hours: parsedHours,
        timeline_days: parsedTimelineDays,
        requires_payment: Boolean(requiresPayment),
        source_feedback_id: sourceFeedbackId || null,
        status: 'pending',
      })
      .select('*')
      .single()

    if (insertError) {
      console.error('[Change Orders] Insert error:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, changeOrder })
  } catch (err: any) {
    console.error('[Change Orders] Unexpected error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
