import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { NewProjectForm } from './new-project-form'
import React from 'react'

// The page (`./page`) is an async server component that gates on the free-project
// limit and then renders <NewProjectForm/>. The form holds all interactive
// behaviour, so that's what we exercise here. The free-limit gate lives in the
// server page and is not reachable from the form.

// Mock router
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: vi.fn()
  }),
  usePathname: () => '/project/new'
}))

// Mock next/link to render standard anchors
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => {
    return <a href={href} {...props}>{children}</a>
  }
}))

// Mock Supabase client
const mockGetUser = vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } })
const mockInsert = vi.fn()

const mockSupabase = {
  auth: {
    getUser: mockGetUser
  },
  from: vi.fn((table: string) => {
    if (table === 'projects') {
      return { insert: mockInsert }
    }
    return {} as any
  })
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

// Mock clipboard
const mockWriteText = vi.fn()
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: mockWriteText
  },
  writable: true
})

describe('NewProjectForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true })
    }) as any
  })

  it('renders all form inputs and initial states correctly', () => {
    render(<NewProjectForm />)

    expect(screen.getByPlaceholderText('Acme Corporation')).toBeDefined()
    expect(screen.getByPlaceholderText('client@acme.com')).toBeDefined()
    expect(screen.getByPlaceholderText('Min. 6 characters')).toBeDefined()
    expect(screen.getByPlaceholderText('Website Redesign')).toBeDefined()
    expect(screen.getByPlaceholderText('5000')).toBeDefined()
    expect(screen.getByPlaceholderText('150')).toBeDefined()
    expect(screen.getByRole('button', { name: /create project/i })).toBeDefined()
  })

  it('generates a password dynamically when generate button is clicked', () => {
    render(<NewProjectForm />)

    const clientNameInput = screen.getByPlaceholderText('Acme Corporation')
    fireEvent.change(clientNameInput, { target: { value: 'John Doe' } })

    const generateBtn = screen.getByTitle('Generate password')
    fireEvent.click(generateBtn)

    const passwordInput = screen.getByPlaceholderText('Min. 6 characters') as HTMLInputElement
    // Password is now 12 random alphanumeric characters (crypto.getRandomValues)
    expect(passwordInput.value).toMatch(/^[a-zA-Z0-9]{12}$/)
  })

  it('submits form successfully and displays shareable credentials success state', async () => {
    // Mock project creation successful insertion
    const mockSingleSelect = vi.fn().mockResolvedValue({ data: { id: 'proj-999' }, error: null })
    const mockSelectChain = vi.fn().mockReturnValue({ single: mockSingleSelect })
    mockInsert.mockReturnValue({ select: mockSelectChain })

    render(<NewProjectForm />)

    // Fill out all fields
    fireEvent.change(screen.getByPlaceholderText('Acme Corporation'), { target: { value: 'Globex' } })
    fireEvent.change(screen.getByPlaceholderText('client@acme.com'), { target: { value: 'globex@corp.com' } })
    fireEvent.change(screen.getByPlaceholderText('Min. 6 characters'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByPlaceholderText('Website Redesign'), { target: { value: 'Cloud Infrastructure' } })
    fireEvent.change(screen.getByPlaceholderText('5000'), { target: { value: '25000' } })
    fireEvent.change(screen.getByPlaceholderText('150'), { target: { value: '150' } })

    const createBtn = screen.getByRole('button', { name: /create project/i })
    fireEvent.click(createBtn)

    // Expect the api fetch to create the client account
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/create-client', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'globex@corp.com', password: 'password123' })
      }))
    })

    // Expect insertion to Supabase projects table
    expect(mockInsert).toHaveBeenCalledWith({
      user_id: 'user-123',
      client_name: 'Globex',
      client_email: 'globex@corp.com',
      project_name: 'Cloud Infrastructure',
      slug: expect.any(String),
      color: '#6366F1',
      status: 'active',
      budget: 25000,
      hourly_rate: 150
    })

    // Verifies transition to Success Screen UI
    await waitFor(() => {
      expect(screen.getByText('Project created')).toBeDefined()
      expect(screen.getByText('globex@corp.com')).toBeDefined()
      expect(screen.getByText('password123')).toBeDefined()
    })

    // Click Open Project and ensure route push
    const openBtn = screen.getByRole('button', { name: /open project/i })
    fireEvent.click(openBtn)
    expect(mockPush).toHaveBeenCalledWith('/project/proj-999')
  })

  it('allows copying login details to clipboard', async () => {
    const mockSingleSelect = vi.fn().mockResolvedValue({ data: { id: 'proj-999' }, error: null })
    const mockSelectChain = vi.fn().mockReturnValue({ single: mockSingleSelect })
    mockInsert.mockReturnValue({ select: mockSelectChain })

    render(<NewProjectForm />)

    fireEvent.change(screen.getByPlaceholderText('Acme Corporation'), { target: { value: 'Globex' } })
    fireEvent.change(screen.getByPlaceholderText('client@acme.com'), { target: { value: 'globex@corp.com' } })
    fireEvent.change(screen.getByPlaceholderText('Min. 6 characters'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByPlaceholderText('Website Redesign'), { target: { value: 'Cloud Infrastructure' } })

    fireEvent.click(screen.getByRole('button', { name: /create project/i }))

    await waitFor(() => {
      expect(screen.getByText('Project created')).toBeDefined()
    })

    // Trigger copy click on email
    const emailLabel = screen.getByText('Email')
    const emailContainer = emailLabel.parentElement!
    const emailCopyBtn = emailContainer.querySelector('button')!
    fireEvent.click(emailCopyBtn)

    expect(mockWriteText).toHaveBeenCalledWith('globex@corp.com')
  })
})
