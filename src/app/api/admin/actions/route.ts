import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

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

    // 3. Extract action fields
    const body = await request.json().catch(() => ({}))
    const { actionType, targetUserId, value } = body

    if (!actionType || !targetUserId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    const admin = createAdminClient()

    if (actionType === 'update_plan') {
      const plan = value === 'pro' ? 'pro' : 'free'
      const { error } = await admin
        .from('users')
        .update({ plan, promo_pro: value === 'pro' })
        .eq('id', targetUserId)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, msg: `User plan updated to ${plan}.` })
    }

    if (actionType === 'reset_claims') {
      // Set promo claiming claims count back to 0
      const { error } = await admin
        .from('launch_promo')
        .update({ claimed: 0 })
        .eq('id', 1)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ success: true, msg: 'Claims count reset to 0.' })
    }

    if (actionType === 'delete_account') {
      const { error } = await admin.auth.admin.deleteUser(targetUserId)
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ success: true, msg: 'User auth account deleted.' })
    }

    return NextResponse.json({ error: 'Invalid action type' }, { status: 400 })
  } catch (err: any) {
    console.error('[Admin Actions API] Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
