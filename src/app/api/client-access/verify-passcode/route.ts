import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { timingSafeCompare, createPasscodeTicket } from '@/lib/passcode-crypto'

export async function POST(request: Request) {
  try {
    const { slug, passcode } = await request.json()
    if (!slug || !passcode) {
      return NextResponse.json({ error: 'Missing slug or passcode' }, { status: 400 })
    }

    // Throttle guessing: 10 attempts per 10 minutes per IP and portal
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous'
    const rl = await rateLimit(`verify-passcode:${ip}:${slug}`, 10, 10 * 60_000)
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many attempts. Please try again in a few minutes.' }, { status: 429 })
    }

    // Service role: the RPC returns the passcode, so it must never be callable by anon
    const { data: projectRows } = await createAdminClient()
      .rpc('get_project_by_slug', { p_slug: slug })

    const project = projectRows?.[0] ?? null
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (project.passcode && !timingSafeCompare(project.passcode, String(passcode).trim())) {
      return NextResponse.json({ error: 'Incorrect passcode' }, { status: 401 })
    }

    // Generate cryptographic HMAC-signed session ticket (no plaintext in cookies)
    const signedTicket = createPasscodeTicket(project.id, slug)

    const cookieStore = await cookies()
    cookieStore.set(`client_project_passcode_${slug}`, signedTicket, {
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
