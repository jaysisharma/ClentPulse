import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isValidProvider, getConnectionStatus } from '@/lib/integrations/oauth'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params

  if (!isValidProvider(provider)) {
    return NextResponse.json({ error: `Unknown provider: ${provider}` }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const status = await getConnectionStatus(supabase, user.id, provider)
  return NextResponse.json(status)
}
