import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { slug, passcode } = await request.json()
    if (!slug || !passcode) {
      return NextResponse.json({ error: 'Missing slug or passcode' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: projectRows } = await supabase
      .rpc('get_project_by_slug', { p_slug: slug })

    const project = projectRows?.[0] ?? null
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (project.passcode && project.passcode !== passcode) {
      return NextResponse.json({ error: 'Incorrect passcode' }, { status: 401 })
    }

    const cookieStore = await cookies()
    cookieStore.set(`client_project_passcode_${slug}`, passcode, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error verifying passcode:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
