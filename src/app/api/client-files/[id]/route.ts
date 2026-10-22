import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { CLIENT_FILES_BUCKET } from '@/lib/client-files'
import { NextResponse } from 'next/server'

/**
 * DELETE /api/client-files/[id]
 * Studio only. RLS limits the delete to project owners and org owners/admins.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: deleted, error } = await supabase
    .from('client_files')
    .delete()
    .eq('id', id)
    .select('storage_path')
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!deleted) return NextResponse.json({ error: 'File not found' }, { status: 404 })

  await createAdminClient().storage.from(CLIENT_FILES_BUCKET).remove([deleted.storage_path])
  return NextResponse.json({ success: true })
}
