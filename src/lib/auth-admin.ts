import { SupabaseClient, User } from '@supabase/supabase-js'

/**
 * Checks if the given authenticated user has admin privileges.
 * Validates against:
 * 1. ADMIN_EMAILS environment variable (comma-separated list)
 * 2. users table `is_admin` column (users cannot change it — see protect_user_privileged_columns)
 *
 * Never trust user_metadata here: any signed-in user can set it via auth.updateUser().
 */
export async function isUserAdmin(
  supabase: SupabaseClient,
  user: User | null
): Promise<boolean> {
  if (!user) return false

  // 1. Check ADMIN_EMAILS environment variable
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)

  if (user.email && adminEmails.includes(user.email.toLowerCase())) {
    return true
  }

  // 2. Check users table in Supabase
  try {
    const { data: profile, error } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle()

    if (error || !profile) {
      return false
    }

    return Boolean(profile.is_admin)
  } catch {
    return false
  }
}
