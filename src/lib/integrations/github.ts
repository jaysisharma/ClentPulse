/**
 * GitHub API helpers — repos, pull requests, commits.
 * All calls server-side using the user's decrypted access token.
 */

export interface GitHubUser {
  id: number
  login: string
  name: string | null
  email: string | null
  avatar_url: string
}

export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  private: boolean
  description: string | null
  html_url: string
  default_branch: string
  language: string | null
  updated_at: string
  open_issues_count: number
}

export interface GitHubPR {
  id: number
  number: number
  title: string
  html_url: string
  state: 'open' | 'closed'
  draft: boolean
  merged_at: string | null
  created_at: string
  updated_at: string
  user: { login: string; avatar_url: string } | null
  head: { ref: string; sha: string }
  base: { ref: string }
  labels: Array<{ name: string; color: string }>
}

export interface GitHubCommit {
  sha: string
  html_url: string
  commit: {
    message: string
    author: { name: string; date: string } | null
  }
  author: { login: string; avatar_url: string } | null
}

const GITHUB_API = 'https://api.github.com'

async function ghFetch<T>(path: string, accessToken: string): Promise<T> {
  const res = await fetch(`${GITHUB_API}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.message || `GitHub API error: ${res.status}`)
  }
  return res.json()
}

export async function getGitHubUser(accessToken: string): Promise<GitHubUser> {
  return ghFetch<GitHubUser>('/user', accessToken)
}

/**
 * Lists repositories the authenticated user can access.
 */
export async function listRepos(
  accessToken: string,
  options: { sort?: 'updated' | 'pushed'; perPage?: number; page?: number } = {}
): Promise<GitHubRepo[]> {
  const params = new URLSearchParams({
    sort: options.sort ?? 'updated',
    per_page: String(options.perPage ?? 30),
    page: String(options.page ?? 1),
    affiliation: 'owner,collaborator,organization_member',
  })
  return ghFetch<GitHubRepo[]>(`/user/repos?${params}`, accessToken)
}

/**
 * Lists pull requests for a repository.
 */
export async function listPullRequests(
  accessToken: string,
  owner: string,
  repo: string,
  options: { state?: 'open' | 'closed' | 'all'; perPage?: number } = {}
): Promise<GitHubPR[]> {
  const params = new URLSearchParams({
    state: options.state ?? 'open',
    per_page: String(options.perPage ?? 10),
    sort: 'updated',
    direction: 'desc',
  })
  return ghFetch<GitHubPR[]>(`/repos/${owner}/${repo}/pulls?${params}`, accessToken)
}

/**
 * Lists recent commits on the default branch.
 */
export async function listCommits(
  accessToken: string,
  owner: string,
  repo: string,
  options: { perPage?: number } = {}
): Promise<GitHubCommit[]> {
  const params = new URLSearchParams({ per_page: String(options.perPage ?? 5) })
  return ghFetch<GitHubCommit[]>(`/repos/${owner}/${repo}/commits?${params}`, accessToken)
}

/**
 * Returns a human-readable summary of a PR for the client-facing portal.
 * Avoids exposing raw technical fields.
 */
export function summarizePR(pr: GitHubPR): {
  title: string
  status: 'open' | 'merged' | 'closed'
  url: string
  updatedAt: string
  number: number
  author: string | null
} {
  const status = pr.merged_at ? 'merged' : pr.state === 'closed' ? 'closed' : 'open'
  return {
    title: pr.title,
    status,
    url: pr.html_url,
    updatedAt: pr.updated_at,
    number: pr.number,
    author: pr.user?.login ?? null,
  }
}
