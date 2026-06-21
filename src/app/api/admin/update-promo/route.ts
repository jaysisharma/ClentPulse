import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // 1. Resolve standard client to check current user session
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Query permissions
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 3. Extract parameters
    const body = await request.json().catch(() => ({}))
    const { cap } = body

    if (typeof cap !== 'number' || cap < 0) {
      return NextResponse.json({ error: 'Cap must be a non-negative number' }, { status: 400 })
    }

    // 4. Perform update using admin service-role client
    const admin = createAdminClient()
    const { error: updateError } = await admin
      .from('launch_promo')
      .update({ cap })
      .eq('id', 1)

    if (updateError) {
      console.error('[Update Promo API] DB Error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[Update Promo API] Unexpected Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
