export type UserCraft = 'developer' | 'marketer' | 'designer' | 'consultant' | 'general'

export interface WorkspaceModules {
  marketing?: boolean
  developer?: boolean
  design?: boolean
  time_tracking?: boolean
  contracts_billing?: boolean
}

export interface User {
  id: string
  email: string
  name: string | null
  username: string | null
  logo_url: string | null
  accent_color: string
  stripe_customer_id: string | null
  plan: 'free' | 'pro'
  craft?: UserCraft | null
  enabled_modules?: WorkspaceModules | null
  created_at: string
}

export interface ProjectKpi {
  label: string
  value: string
  trend?: string
}

export interface Project {
  id: string
  user_id: string
  org_id?: string | null
  client_name: string
  client_email: string | null
  project_name: string
  slug: string
  color: string
  status: 'active' | 'paused' | 'completed'
  hourly_rate: number | null
  budget: number | null
  waiting_on_client?: boolean | null
  waiting_reason?: string | null
  deposit_required?: number | null
  deposit_paid?: boolean | null
  kpis?: ProjectKpi[] | null
  report_embed_url?: string | null
  report_embed_title?: string | null
  created_at: string
}

export interface Invoice {
  id: string
  user_id: string
  project_id: string | null
  client_name: string
  client_email: string | null
  items: Array<{ description: string; amount: number; hours?: number; rate?: number }>
  total: number
  status: 'draft' | 'sent' | 'paid' | 'canceled'
  currency?: string
  tax_rate?: number
  tax_id?: string | null
  is_deposit?: boolean
  paid_at?: string | null
  created_at: string
}

export interface Approval {
  id: string
  project_id: string
  title: string
  url: string | null
  preview_type?:
    | 'staging'
    | 'figma'
    | 'code_pr'
    | 'document'
    | 'asset_zip'
    | 'ad_creative'
    | 'copy_deck'
    | 'analytics_report'
    | 'landing_page'
  status: 'pending' | 'approved' | 'changes_requested'
  feedback: string | null
  created_at: string
}

export interface Update {
  id: string
  project_id: string
  bullets: string[]
  note: string | null
  video_url?: string | null
  sent_at: string | null
  created_at: string
  author_id?: string | null
  review_status?: 'draft' | 'review_ready' | 'approved' | 'published'
  approved_by?: string | null
  approved_at?: string | null
  author?: {
    name: string | null
    email: string | null
  } | null
}

export interface Milestone {
  id: string
  project_id: string
  user_id: string
  title: string
  due_date: string | null
  done: boolean
  created_at: string
}

export interface ChecklistItem {
  id: string
  project_id: string
  user_id: string
  title: string
  assigned_to: 'freelancer' | 'client'
  done: boolean
  done_at: string | null
  position: number
  created_at: string
}

export interface UpdateComment {
  id: string
  update_id: string
  project_id: string
  author_name: string
  body: string
  is_internal?: boolean
  user_id?: string | null
  created_at: string
}

export interface ActivityLog {
  id: string
  org_id: string
  project_id?: string | null
  user_id?: string | null
  action: string
  entity_type: string
  entity_id?: string | null
  details?: Record<string, any>
  created_at: string
  user?: {
    id: string
    name: string | null
    email: string | null
    logo_url?: string | null
  } | null
  project?: {
    id: string
    project_name: string
  } | null
}

export interface ProjectWithLatestUpdate extends Project {
  latest_update?: Update | null
}

export interface ProjectTeamMember {
  id: string
  project_id: string
  user_id: string
  role_title: string
  created_at: string
  user?: {
    id: string
    name: string | null
    email: string
    logo_url?: string | null
    last_heartbeat_at?: string | null
    active_focus_area?: string | null
  }
}

export interface Organization {
  id: string
  name: string
  slug: string
  logo_url?: string | null
  favicon_url?: string | null
  accent_color?: string
  white_label?: boolean
  custom_domain?: string | null
  billing_plan: 'free' | 'starter' | 'agency_pro' | 'enterprise'
  stripe_customer_id?: string | null
  created_by?: string | null
  created_at: string
}

export interface OrganizationMember {
  id: string
  org_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  joined_at: string
  user?: {
    id: string
    name: string | null
    email: string
    logo_url?: string | null
  }
}

export interface OrganizationInvite {
  id: string
  org_id: string
  email: string
  role: 'admin' | 'member'
  token: string
  invited_by: string
  status: 'pending' | 'accepted' | 'revoked'
  expires_at: string
  created_at: string
}

export interface Workspace {
  id: string // 'personal' or organization UUID
  type: 'personal' | 'agency'
  name: string
  slug?: string
  role?: 'owner' | 'admin' | 'member'
  logo_url?: string | null
  accent_color?: string
}

export interface IntegrationConnection {
  id: string
  user_id: string
  org_id: string | null
  provider: 'google' | 'github' | 'figma'
  provider_account_id: string
  provider_account_email: string | null
  token_expires_at: string | null
  scopes: string[]
  status: 'active' | 'expired' | 'revoked'
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface ProjectResource {
  id: string
  project_id: string
  integration_connection_id: string | null
  provider: 'google_drive' | 'google_calendar' | 'github' | 'figma'
  resource_type: 'file' | 'folder' | 'event' | 'repo' | 'figma_file' | 'pull_request'
  external_id: string
  external_url: string | null
  name: string
  thumbnail_url: string | null
  show_in_portal: boolean
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  integration_connections?: Pick<IntegrationConnection, 'status' | 'provider_account_email'> | null
}


