import { redirect } from 'next/navigation'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')?.trim()

  if (!slug) {
    redirect('/client/portal')
  }

  // Sanitize slug
  const cleanSlug = slug.replace(/^https?:\/\/[^\/]+\/p\//i, '').replace(/^\/p\//i, '').replace(/^\//, '')
  redirect(`/p/${cleanSlug}`)
}
