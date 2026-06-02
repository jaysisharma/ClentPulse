import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'

export default async function UsernameRedirectPage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()

  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('username', username.toLowerCase())
    .single()

  if (!user) notFound()
  redirect(`/portfolio/${user.id}`)
}
