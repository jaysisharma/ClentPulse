export interface User {
  id: string
  email: string
  name: string | null
  username: string | null
  logo_url: string | null
  accent_color: string
  stripe_customer_id: string | null
  plan: 'free' | 'pro'
  created_at: string
}

export interface Project {
  id: string
  user_id: string
  client_name: string
  client_email: string | null
  project_name: string
  slug: string
  color: string
  status: 'active' | 'paused' | 'completed'
  hourly_rate: number | null
  budget: number | null
  created_at: string
}

export interface Update {
  id: string
  project_id: string
  bullets: string[]
  note: string | null
  sent_at: string | null
  created_at: string
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
  created_at: string
}

export interface ProjectWithLatestUpdate extends Project {
  latest_update?: Update | null
}
