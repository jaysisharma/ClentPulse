import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ buildId: string }> }
) {
  const { buildId } = await params
  const supabase = await createClient()

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
