import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ buildId: string }> }
) {
  const { buildId } = await params
  const supabase = await createClient()

  // Count one download per visitor per build per hour, so the number can't be
  // inflated by replaying the request
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous'
  const rl = await rateLimit(`build-download:${ip}:${buildId}`, 1, 60 * 60_000)
  if (!rl.success) {
    return NextResponse.json({ success: true, counted: false })
  }

  // First try the RPC increment
  const { data: rpcCount, error: rpcError } = await supabase
    .rpc('increment_app_build_download', { p_build_id: buildId })

  if (!rpcError && typeof rpcCount === 'number') {
    return NextResponse.json({ success: true, count: rpcCount })
  }

  // Fallback direct read + update
  const { data: build } = await supabase
    .from('app_builds')
    .select('download_count')
    .eq('id', buildId)
    .single()

  if (build) {
    const nextCount = (build.download_count || 0) + 1
    await supabase
      .from('app_builds')
      .update({ download_count: nextCount })
      .eq('id', buildId)

    return NextResponse.json({ success: true, count: nextCount })
  }

  return NextResponse.json({ success: false }, { status: 404 })
}
