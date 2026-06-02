import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ProjectsClientGrid } from './projects-client-grid'
import React from 'react'

// Mock next/link to render standard anchors
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => {
    return <a href={href} {...props}>{children}</a>
  }
}))

// Mock data representing various project states
const mockProjects = [
  {
    id: '1',
    project_name: 'Website Redesign',
    client_name: 'Acme Corp',
    color: '#3b82f6',
    status: 'active',
    budget: '5000',
    hourly_rate: 50,
    created_at: new Date(Date.now() - 10 * 86_400_000).toISOString(), // 10 days ago
    updates: [
      { id: 'u1', created_at: new Date(Date.now() - 2 * 86_400_000).toISOString(), sent_at: new Date(Date.now() - 2 * 86_400_000).toISOString() } // updated 2 days ago (not overdue)
    ],
    approvals: [],
    contracts: [],
    milestones: []
  },
  {
    id: '2',
    project_name: 'Mobile App',
    client_name: 'Beta LLC',
    color: '#ef4444',
    status: 'active',
    budget: '12000',
    hourly_rate: 75,
    created_at: new Date(Date.now() - 20 * 86_400_000).toISOString(), // 20 days ago
    updates: [
      { id: 'u2', created_at: new Date(Date.now() - 12 * 86_400_000).toISOString(), sent_at: new Date(Date.now() - 12 * 86_400_000).toISOString() } // updated 12 days ago (overdue!)
    ],
    approvals: [],
    contracts: [],
    milestones: [
      { id: 'm1', done: true },
      { id: 'm2', done: false }
    ]
  },
  {
    id: '3',
    project_name: 'SEO Audit',
    client_name: 'Gamma Inc',
    color: '#10b981',
    status: 'completed',
    budget: null,
    hourly_rate: null,
    created_at: new Date(Date.now() - 30 * 86_400_000).toISOString(),
    updates: [],
    approvals: [],
    contracts: [],
    milestones: []
  },
  {
    id: '4',
    project_name: 'Logo Design',
    client_name: 'Delta Co',
    color: '#f59e0b',
    status: 'paused',
    budget: '1500',
    hourly_rate: null,
    created_at: new Date(Date.now() - 5 * 86_400_000).toISOString(),
    updates: [],
    approvals: [
      { id: 'a1', status: 'pending' } // Pending approval -> needs attention
    ],
    contracts: [
      { id: 'c1', signed_at: null } // Unsigned contract -> needs attention
    ],
    milestones: []
  }
]

describe('ProjectsClientGrid Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all projects initially', () => {
    render(<ProjectsClientGrid projects={mockProjects} />)

    expect(screen.getByText('Website Redesign')).toBeDefined()
    expect(screen.getByText('Mobile App')).toBeDefined()
    expect(screen.getByText('SEO Audit')).toBeDefined()
    expect(screen.getByText('Logo Design')).toBeDefined()
    expect(screen.getByText('Acme Corp')).toBeDefined()
    expect(screen.getByText('Beta LLC')).toBeDefined()
    expect(screen.getByText('Gamma Inc')).toBeDefined()
    expect(screen.getByText('Delta Co')).toBeDefined()
  })

  it('filters projects by search query (project name)', () => {
    render(<ProjectsClientGrid projects={mockProjects} />)

    const searchInput = screen.getByPlaceholderText('Search projects or clients...')
    fireEvent.change(searchInput, { target: { value: 'Website' } })

    expect(screen.getByText('Website Redesign')).toBeDefined()
    expect(screen.queryByText('Mobile App')).toBeNull()
    expect(screen.queryByText('SEO Audit')).toBeNull()
  })

  it('filters projects by search query (client name)', () => {
    render(<ProjectsClientGrid projects={mockProjects} />)

    const searchInput = screen.getByPlaceholderText('Search projects or clients...')
    fireEvent.change(searchInput, { target: { value: 'Beta' } })

    expect(screen.getByText('Mobile App')).toBeDefined()
    expect(screen.queryByText('Website Redesign')).toBeNull()
  })

  it('filters projects by status tab', () => {
    render(<ProjectsClientGrid projects={mockProjects} />)

    // Click "Active" tab
    const activeTab = screen.getByRole('button', { name: /active/i })
    fireEvent.click(activeTab)

    expect(screen.getByText('Website Redesign')).toBeDefined()
    expect(screen.getByText('Mobile App')).toBeDefined()
    expect(screen.queryByText('SEO Audit')).toBeNull()
    expect(screen.queryByText('Logo Design')).toBeNull()

    // Click "Completed" tab
    const completedTab = screen.getByRole('button', { name: /completed/i })
    fireEvent.click(completedTab)

    expect(screen.getByText('SEO Audit')).toBeDefined()
    expect(screen.queryByText('Website Redesign')).toBeNull()
    expect(screen.queryByText('Mobile App')).toBeNull()
  })

  it('identifies and displays overdue active projects correctly', () => {
    render(<ProjectsClientGrid projects={mockProjects} />)

    // Mobile App has update 12 days ago, which is > 7 days ago.
    // It should render "No update in 12 days"
    expect(screen.getByText(/No update in 12 days/i)).toBeDefined()

    // Website Redesign has update 2 days ago, which is < 7 days ago.
    // It should render "Last update" date or not overdue warning
    expect(screen.queryByText(/No update in 2 days/i)).toBeNull()
  })

  it('filters by "Needs attention" correctly', () => {
    render(<ProjectsClientGrid projects={mockProjects} />)

    // Verify "Needs attention" button exists and displays correct count
    // Attention projects: Mobile App (overdue), Logo Design (pending approval + unsigned contract)
    // Count = 2
    const attentionButton = screen.getByRole('button', { name: /Needs attention/i })
    expect(attentionButton).toBeDefined()
    expect(attentionButton.textContent).toContain('2')

    // Toggle Needs Attention filter
    fireEvent.click(attentionButton)

    // Mobile App and Logo Design should be visible
    expect(screen.getByText('Mobile App')).toBeDefined()
    expect(screen.getByText('Logo Design')).toBeDefined()

    // Website Redesign and SEO Audit should not be visible
    expect(screen.queryByText('Website Redesign')).toBeNull()
    expect(screen.queryByText('SEO Audit')).toBeNull()
  })

  it('renders milestone progress bar correctly', () => {
    render(<ProjectsClientGrid projects={mockProjects} />)

    // Mobile App has 2 milestones, 1 completed
    expect(screen.getByText('Milestones')).toBeDefined()
    expect(screen.getByText('1/2')).toBeDefined()
  })

  it('renders budget with correct formatting', () => {
    render(<ProjectsClientGrid projects={mockProjects} />)

    // Website Redesign budget = 5000 -> formatted as $5,000
    expect(screen.getByText('$5,000')).toBeDefined()
  })

  it('displays correct empty state message when no results match search', () => {
    render(<ProjectsClientGrid projects={mockProjects} />)

    const searchInput = screen.getByPlaceholderText('Search projects or clients...')
    fireEvent.change(searchInput, { target: { value: 'NonExistentProject' } })

    expect(screen.getByText('No projects match your filters.')).toBeDefined()
  })
})
