import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateToken } from '@/lib/extension-auth'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: tokens, error } = await supabase
    .from('api_tokens')
    .select('id, token_preview, name, last_used_at, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ tokens: tokens || [] })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let name = 'VS Code Extension'
  try {
    const body = await request.json()
    if (body.name && typeof body.name === 'string') {
      name = body.name.trim()
    }
  } catch {
    // Empty body is fine, use default name
  }

  const { token, hash, preview } = generateToken()

  const { data, error } = await supabase
    .from('api_tokens')
    .insert({
      user_id: user.id,
      token_hash: hash,
      token_preview: preview,
      name,
    })
    .select('id, token_preview, name, created_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Return raw token ONCE so user can copy it
  return NextResponse.json({
    token,
    tokenPreview: preview,
    id: data.id,
    name: data.name,
    createdAt: data.created_at,
  })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  let query = supabase.from('api_tokens').delete().eq('user_id', user.id)
  if (id) {
    query = query.eq('id', id)
  }

  const { error } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
