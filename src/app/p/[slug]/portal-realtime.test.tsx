import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import React from 'react'
import { PortalRealtimeSubscriber } from './portal-realtime'
import { ClientViewingBadge } from '@/components/project/client-viewing-badge'

const { mockRouterRefresh } = vi.hoisted(() => ({
  mockRouterRefresh: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRouterRefresh,
  }),
}))

let channelCallbacks: Record<string, any> = {}
let presenceStateMock: Record<string, any> = {}
const mockTrack = vi.fn().mockResolvedValue(undefined)
const mockUntrack = vi.fn().mockResolvedValue(undefined)

const mockChannel = {
  on: vi.fn(function (this: any, type: string, optsOrEvent: any, cb?: any) {
    const callback = cb || optsOrEvent
    const key = type === 'postgres_changes' ? `postgres_${optsOrEvent.table}` : `${type}_${optsOrEvent.event || 'all'}`
    channelCallbacks[key] = callback
    return this
  }),
  subscribe: vi.fn(function (this: any, cb?: (status: string) => void) {
    if (cb) cb('SUBSCRIBED')
    return this
  }),
  track: mockTrack,
  untrack: mockUntrack,
  presenceState: vi.fn(() => presenceStateMock),
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    channel: vi.fn(() => mockChannel),
    removeChannel: vi.fn(),
  }),
}))

describe('PortalRealtimeSubscriber', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    channelCallbacks = {}
    presenceStateMock = {}
  })

  it('subscribes to realtime events and tracks client presence on mount', async () => {
    render(<PortalRealtimeSubscriber projectId="proj-123" clientName="Acme Corp" />)

    expect(screen.getByText('Live synced')).toBeDefined()
    expect(mockTrack).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'client',
        clientName: 'Acme Corp',
      })
    )
  })

  it('triggers router refresh when a database change is broadcasted', async () => {
    render(<PortalRealtimeSubscriber projectId="proj-123" clientName="Acme Corp" />)

    // Trigger an update on the 'updates' table
    expect(channelCallbacks['postgres_updates']).toBeDefined()
    act(() => {
      channelCallbacks['postgres_updates']({ new: { id: 'u1' } })
    })

    await waitFor(() => {
      expect(mockRouterRefresh).toHaveBeenCalled()
    }, { timeout: 2000 })
  })
})

describe('ClientViewingBadge', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    channelCallbacks = {}
    presenceStateMock = {}
  })

  it('renders nothing when no client is present', () => {
    const { container } = render(<ClientViewingBadge projectId="proj-123" clientName="Acme Corp" />)
    expect(container.firstChild).toBeNull()
  })

  it('displays client viewing badge when presence sync indicates client is active', async () => {
    presenceStateMock = {
      user1: [{ role: 'client' }],
    }

    render(<ClientViewingBadge projectId="proj-123" clientName="Acme Corp" />)

    // Simulate presence sync wrapped in act
    act(() => {
      if (channelCallbacks['presence_sync']) {
        channelCallbacks['presence_sync']()
      }
    })

    await waitFor(() => {
      expect(screen.getByText('Acme Corp viewing portal')).toBeDefined()
    })
  })
})
