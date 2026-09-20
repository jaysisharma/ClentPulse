import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { isUserAdmin } from '../auth-admin'
import { User } from '@supabase/supabase-js'

describe('isUserAdmin helper', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('returns false for null or undefined user', async () => {
    const mockSupabase = {} as any
    expect(await isUserAdmin(mockSupabase, null)).toBe(false)
  })

  it('returns true when user email matches ADMIN_EMAILS environment variable', async () => {
    process.env.ADMIN_EMAILS = 'founder@frevio.app,admin@frevio.app'
    const mockUser = {
      id: 'user-1',
      email: 'founder@frevio.app',
      user_metadata: {},
    } as unknown as User
    const mockSupabase = {} as any

    expect(await isUserAdmin(mockSupabase, mockUser)).toBe(true)
  })

  it('returns true when user has user_metadata.is_admin = true', async () => {
    const mockUser = {
      id: 'user-2',
      email: 'someuser@example.com',
      user_metadata: { is_admin: true },
    } as unknown as User
    const mockSupabase = {} as any

    expect(await isUserAdmin(mockSupabase, mockUser)).toBe(true)
  })

  it('returns true when users table in DB has is_admin = true', async () => {
    const mockUser = {
      id: 'user-3',
      email: 'dbadmin@example.com',
      user_metadata: {},
    } as unknown as User

    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { is_admin: true },
              error: null,
            }),
          }),
        }),
      }),
    } as any

    expect(await isUserAdmin(mockSupabase, mockUser)).toBe(true)
  })

  it('returns false when user is not admin in env, metadata, or db', async () => {
    process.env.ADMIN_EMAILS = 'otheradmin@frevio.app'
    const mockUser = {
      id: 'user-4',
      email: 'regular@example.com',
      user_metadata: { is_admin: false },
    } as unknown as User

    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { is_admin: false },
              error: null,
            }),
          }),
        }),
      }),
    } as any

    expect(await isUserAdmin(mockSupabase, mockUser)).toBe(false)
  })
})
