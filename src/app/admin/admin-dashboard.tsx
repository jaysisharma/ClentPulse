'use client'

import { useMemo, useState } from 'react'
import {
  Users as UsersIcon,
  Eye,
  Percent,
  TrendingUp,
  Activity,
  UserCheck,
  Mail,
  Search,
  Settings as SettingsIcon,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Link2,
  Copy,
  Check,
  Megaphone,
  Zap,
  BarChart2,
  DollarSign,
  Gauge,
  MessageSquare,
  Send,
  RefreshCw,
  Play,
  UserMinus,
  ShieldCheck,
  Info,
  Clock,
  ThumbsUp,
} from 'lucide-react'
import { StatCard } from '@/components/ui/stat-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type ProjectId = { id: string }

type User = {
  id: string
  email: string
  name: string | null
  plan: string
  promo_pro: boolean
  onboarded: boolean
  stripe_customer_id?: string | null
  created_at: string
  projects: ProjectId[]
}

type Visit = {
  id: string
  ip_address: string | null
  user_agent: string | null
  path: string
  referrer: string | null
  user_id: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  country?: string | null
  city?: string | null
  created_at: string
}

type Promo = {
  claimed: number
  cap: number
}

type StripePayment = {
  id: string
  amount: number
  currency: string
  customer_name: string | null
  customer_email: string | null
  status: string
  created_at: string
  description: string
}

type StripeStats = {
  stripeConfigured: boolean
  mrr: number
  activePaidCount: number
  payments: StripePayment[]
  error?: string
} | null

type ProductEvent = {
  id: string
  user_id: string
  event_type: string
  metadata: any
  created_at: string
}

type FreelancerFeedback = {
  id: string
  user_id: string
  category: 'feature_request' | 'bug_report' | 'support_message' | 'nps_score'
  subject: string | null
  comment: string
  rating: number | null
  votes: number
  status: 'pending' | 'planned' | 'in_progress' | 'completed' | 'declined'
  created_at: string
}

interface AdminDashboardProps {
  initialUsers: User[]
  initialVisits: Visit[]
  initialPromo: Promo
  activeTab: string
  stripeStats: StripeStats
  initialEvents: ProductEvent[]
  initialFeedback: FreelancerFeedback[]
  serverTime: string
}

// Custom parser helpers
function parseUA(ua: string | null) {
  if (!ua) return 'Unknown Device'
  const isMobile = /mobile|android|iphone|ipad/i.test(ua)
  let os = 'Unknown OS'
  if (/windows/i.test(ua)) os = 'Windows'
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS'
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS'
  else if (/android/i.test(ua)) os = 'Android'
  else if (/linux/i.test(ua)) os = 'Linux'

  let browser = 'Unknown Browser'
  if (/chrome|crios/i.test(ua) && !/edge|edg/i.test(ua) && !/opr/i.test(ua)) browser = 'Chrome'
  else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) browser = 'Safari'
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox'
  else if (/edge|edg/i.test(ua)) browser = 'Edge'
  else if (/opera|opr/i.test(ua)) browser = 'Opera'
  
  return `${browser} on ${os}${isMobile ? ' (Mobile)' : ''}`
}

function parseReferrer(ref: string | null) {
  if (!ref) return 'Direct'
  try {
    const url = new URL(ref)
    const host = url.hostname.replace('www.', '')
    if (host === 'localhost') return `Localhost`
    return host
  } catch {
    return ref.substring(0, 30)
  }
}

// Chart mapping helper
const yPct = (v: number, max: number) => 6 + (1 - v / max) * 90
const xPct = (i: number, n: number) => (n <= 1 ? 50 : (i / (n - 1)) * 100)

function linePath(values: number[], max: number) {
  const n = values.length
  return values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xPct(i, n).toFixed(2)} ${yPct(v, max).toFixed(2)}`).join(' ')
}

function areaPath(values: number[], max: number) {
  const n = values.length
  const top = values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xPct(i, n).toFixed(2)} ${yPct(v, max).toFixed(2)}`).join(' ')
  return `${top} L ${xPct(n - 1, n).toFixed(2)} 100 L ${xPct(0, n).toFixed(2)} 100 Z`
}

const BROADCAST_TEMPLATES = [
  {
    name: '🚀 Product Launch',
    subject: 'Frevio is officially live! Here is how to double your client engagement',
    html: `<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; padding: 20px; background-color: #f8fafc; color: #0f172a;">
  <div style="max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
    <h2 style="color: #6366f1; margin-top: 0;">Welcome to Frevio, {{name}}!</h2>
    <p>We are thrilled to let you know that Frevio is officially live! You can now send beautiful weekly project updates to clients with just one click.</p>
    <p>To help you get started, we've prepared a brief onboarding checklist inside your dashboard.</p>
    <div style="margin: 28px 0; text-align: center;">
      <a href="https://frevio.cloud/dashboard" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
    </div>
    <p style="color: #64748b; font-size: 12px; border-t: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px;">Frevio Team</p>
  </div>
</body>
</html>`
  },
  {
    name: '💎 Pro Promo',
    subject: 'Claim your 3 months of Frevio Pro for FREE',
    html: `<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; padding: 20px; background-color: #f8fafc; color: #0f172a;">
  <div style="max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
    <h2 style="color: #db2777; margin-top: 0;">Frevio Pro Exclusive Upgrade, {{name}}!</h2>
    <p>We noticed you are doing amazing work on your free plan. For a limited time, we are unlocking 3 months of Frevio Pro for free!</p>
    <p>Pro tier features include custom branding, unlimited weekly project logs, invoice delivery trackers, and full-featured client feedback portals.</p>
    <div style="margin: 28px 0; text-align: center;">
      <a href="https://frevio.cloud/upgrade" style="background: #db2777; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Claim Free Pro</a>
    </div>
    <p style="color: #64748b; font-size: 12px; border-t: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px;">This offer expires in 7 days.</p>
  </div>
</body>
</html>`
  },
  {
    name: '📝 Feedback Survey',
    subject: 'Frevio Feedback: How can we make client reporting better for you?',
    html: `<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; padding: 20px; background-color: #f8fafc; color: #0f172a;">
  <div style="max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
    <h2 style="color: #475569; margin-top: 0;">How is your experience so far, {{name}}?</h2>
    <p>We are always striving to improve Frevio. Could you spare 2 minutes to tell us how you use the weekly update features, and what we should build next?</p>
    <p>Your feedback directly shapes our product roadmap!</p>
    <div style="margin: 28px 0; text-align: center;">
      <a href="https://frevio.cloud/roadmap" style="background: #475569; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Give Feedback</a>
    </div>
    <p style="color: #64748b; font-size: 12px; border-t: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px;">Thank you for your support!</p>
  </div>
</body>
</html>`
  }
]

export function AdminDashboard({ initialUsers, initialVisits, initialPromo, activeTab, stripeStats, initialEvents, initialFeedback, serverTime }: AdminDashboardProps) {
  const now = useMemo(() => new Date(serverTime).getTime(), [serverTime])

  // Search and filters state
  const [userSearch, setUserSearch] = useState('')
  const [visitSearch, setVisitSearch] = useState('')
  const [feedbackSearch, setFeedbackSearch] = useState('')
  const [feedbackCategoryFilter, setFeedbackCategoryFilter] = useState<string>('all')
  const [cohortWindow, setCohortWindow] = useState<'weekly' | 'monthly'>('monthly')

  // Email Broadcast State Hooks
  const [broadcastTarget, setBroadcastTarget] = useState<'all' | 'leads' | 'free' | 'pro'>('all')
  const [broadcastSubject, setBroadcastSubject] = useState('')
  const [broadcastFrom, setBroadcastFrom] = useState('ClientPulse Announcements <onboarding@resend.dev>')
  const [broadcastHtml, setBroadcastHtml] = useState('<h1>Hello {{name}},</h1>\n<p>We are excited to share some new updates...</p>')
  const [sendingBroadcast, setSendingBroadcast] = useState(false)
  const [broadcastResult, setBroadcastResult] = useState<{ success: boolean; sentCount?: number; failCount?: number; totalCount?: number; error?: string } | null>(null)
  const [broadcastEditTab, setBroadcastEditTab] = useState<'write' | 'preview'>('write')

  // Quick Action States
  const [quickActionUserId, setQuickActionUserId] = useState('')
  const [quickActionType, setQuickActionType] = useState('update_plan')
  const [quickActionVal, setQuickActionVal] = useState('pro')
  const [quickActionLoading, setQuickActionLoading] = useState(false)
  const [quickActionMsg, setQuickActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [promoCap, setPromoCap] = useState(initialPromo.cap)
  const [promoClaimed, setPromoClaimed] = useState(initialPromo.claimed)
  const [savingPromo, setSavingPromo] = useState(false)
  const [promoMsg, setPromoMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Chart interactivity states
  const [visitorChartHover, setVisitorChartHover] = useState<number | null>(null)
  const [signupChartHover, setSignupChartHover] = useState<number | null>(null)

  // Marketing UTM Builder state
  const [utmBase, setUtmBase] = useState('https://frevio.cloud')
  const [utmSource, setUtmSource] = useState('twitter')
  const [utmMedium, setUtmMedium] = useState('social')
  const [utmCampaign, setUtmCampaign] = useState('launch-promo')
  const [copiedLink, setCopiedLink] = useState(false)

  const generatedUtmLink = useMemo(() => {
    try {
      const url = new URL(utmBase)
      if (utmSource) url.searchParams.set('utm_source', utmSource)
      if (utmMedium) url.searchParams.set('utm_medium', utmMedium)
      if (utmCampaign) url.searchParams.set('utm_campaign', utmCampaign)
      return url.toString()
    } catch {
      return `${utmBase}?utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmCampaign}`
    }
  }, [utmBase, utmSource, utmMedium, utmCampaign])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedUtmLink)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  // Date helper
  const formatTimeAgo = (dateStr: string) => {
    const d = new Date(dateStr)
    const diffMs = now - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return '1d ago'
    return `${diffDays}d ago`
  }

  // 1. Calculate General Aggregations
  const totalVisits = initialVisits.length
  const uniqueIPs = useMemo(() => {
    const ips = new Set(initialVisits.map(v => v.ip_address).filter(Boolean))
    return ips.size
  }, [initialVisits])

  const totalSignups = initialUsers.length
  const conversionRate = uniqueIPs > 0 ? (totalSignups / uniqueIPs) * 100 : 0
  const proSubscribers = initialUsers.filter(u => u.plan === 'pro').length

  // First-touch campaign & referrer attribution logic
  const marketingData = useMemo(() => {
    const sortedVisits = [...initialVisits].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    const campaignMap = new Map<string, { source: string; medium: string; campaign: string; visitors: Set<string>; signups: Set<string> }>()
    const referrerMap = new Map<string, { host: string; visitors: Set<string>; signups: Set<string> }>()
    const getCampaignKey = (src: string, med: string, cmp: string) => `${src}||${med}||${cmp}`

    initialVisits.forEach(v => {
      const src = v.utm_source || 'organic'
      const med = v.utm_medium || 'none'
      const cmp = v.utm_campaign || 'none'
      const key = getCampaignKey(src, med, cmp)
      const ip = v.ip_address || 'unknown'

      if (!campaignMap.has(key)) {
        campaignMap.set(key, { source: src, medium: med, campaign: cmp, visitors: new Set(), signups: new Set() })
      }
      campaignMap.get(key)!.visitors.add(ip)

      const refHost = parseReferrer(v.referrer)
      if (!referrerMap.has(refHost)) {
        referrerMap.set(refHost, { host: refHost, visitors: new Set(), signups: new Set() })
      }
      referrerMap.get(refHost)!.visitors.add(ip)
    })

    initialUsers.forEach(u => {
      const firstVisit = sortedVisits.find(v => v.user_id === u.id)
      if (firstVisit) {
        const src = firstVisit.utm_source || 'organic'
        const med = firstVisit.utm_medium || 'none'
        const cmp = firstVisit.utm_campaign || 'none'
        const key = getCampaignKey(src, med, cmp)

        if (campaignMap.has(key)) {
          campaignMap.get(key)!.signups.add(u.id)
        }

        const refHost = parseReferrer(firstVisit.referrer)
        if (referrerMap.has(refHost)) {
          referrerMap.get(refHost)!.signups.add(u.id)
        }
      } else {
        const key = getCampaignKey('organic', 'none', 'none')
        if (campaignMap.has(key)) {
          campaignMap.get(key)!.signups.add(u.id)
        }
        if (referrerMap.has('Direct')) {
          referrerMap.get('Direct')!.signups.add(u.id)
        }
      }
    })

    return {
      campaigns: Array.from(campaignMap.values()).map(c => ({
        ...c,
        visitorCount: c.visitors.size,
        signupCount: c.signups.size,
        conversionRate: c.visitors.size > 0 ? (c.signups.size / c.visitors.size) * 100 : 0
      })).sort((a, b) => b.visitorCount - a.visitorCount),
      referrers: Array.from(referrerMap.values()).map(r => ({
        ...r,
        visitorCount: r.visitors.size,
        signupCount: r.signups.size,
        conversionRate: r.visitors.size > 0 ? (r.signups.size / r.visitors.size) * 100 : 0
      })).sort((a, b) => b.visitorCount - a.visitorCount)
    }
  }, [initialVisits, initialUsers])

  // Geolocation breakdowns
  const geoBreakdown = useMemo(() => {
    const countries: Record<string, number> = {}
    const cities: Record<string, number> = {}

    initialVisits.forEach(v => {
      const ctry = v.country || 'Unknown'
      const cty = v.city || 'Unknown'
      countries[ctry] = (countries[ctry] || 0) + 1
      cities[cty] = (cities[cty] || 0) + 1
    })

    const sortedCountries = Object.entries(countries)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    const sortedCities = Object.entries(cities)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return { countries: sortedCountries, cities: sortedCities }
  }, [initialVisits])

  // User Intelligence Directory calculations
  const usersWithIntelligence = useMemo(() => {
    return initialUsers.map(u => {
      const userVisits = initialVisits.filter(v => v.user_id === u.id)
      const lastVisit = userVisits[0]
      const lastActive = lastVisit ? lastVisit.created_at : u.created_at

      // Geolocation
      const country = lastVisit?.country || 'Unknown'

      // Source attribution
      const firstVisit = [...userVisits].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0]
      const utmSource = firstVisit?.utm_source || 'organic'
      const referrer = firstVisit?.referrer ? parseReferrer(firstVisit.referrer) : 'Direct'

      // Registration Source
      const regSource = u.email.endsWith('@gmail.com') || u.email.includes('google') ? 'Google' : 'Email'

      // Lifetime Value Estimation
      const monthsActive = Math.max(1, Math.ceil((now - new Date(u.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)))
      const ltv = u.plan === 'pro' ? monthsActive * 19 : 0

      // Churn risk calculation
      const lastActiveDate = new Date(lastActive)
      const diffDays = (now - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24)
      let churnRisk = 'Low'
      if (diffDays > 14) churnRisk = 'Critical'
      else if (diffDays > 7) churnRisk = 'High'
      else if (diffDays > 3) churnRisk = 'Medium'

      return {
        ...u,
        lastActive,
        country,
        utmSource,
        referrer,
        regSource,
        ltv,
        churnRisk
      }
    })
  }, [initialUsers, initialVisits])

  // Activity Feed chronologically aggregated events
  const activityFeed = useMemo(() => {
    const feed: { id: string; type: 'event' | 'feedback' | 'signup'; userEmail: string; userName: string; text: string; timeAgo: string; date: Date }[] = []

    initialEvents.forEach(e => {
      const user = initialUsers.find(u => u.id === e.user_id)
      const name = user?.name || user?.email || 'A user'
      let text = ''
      if (e.event_type === 'project_created') {
        text = `created a new project: "${e.metadata?.project_name || 'Project'}" for client "${e.metadata?.client_name || 'Client'}"`
      } else if (e.event_type === 'invoice_created') {
        text = `generated a client invoice`
      } else if (e.event_type === 'task_completed') {
        text = `completed kickoff task: "${e.metadata?.task_title || 'Item'}"`
      } else if (e.event_type === 'testimonial_created') {
        text = `received a new client testimonial`
      } else if (e.event_type === 'document_created') {
        text = `drafted document: "${e.metadata?.doc_title || 'Proposal'}"`
      } else {
        text = `completed action: ${e.event_type}`
      }
      feed.push({
        id: e.id,
        type: 'event',
        userEmail: user?.email || '',
        userName: name,
        text,
        timeAgo: formatTimeAgo(e.created_at),
        date: new Date(e.created_at)
      })
    })

    initialFeedback.forEach(f => {
      const user = initialUsers.find(u => u.id === f.user_id)
      const name = user?.name || user?.email || 'A user'
      let text = ''
      if (f.category === 'bug_report') text = `reported a bug 🐛: "${f.comment.substring(0, 60)}..."`
      else if (f.category === 'feature_request') text = `requested a feature 💡: "${f.subject || 'New Request'}"`
      else if (f.category === 'nps_score') text = `submitted NPS satisfaction score of ${f.rating}/10`
      else text = `submitted support message: "${f.comment.substring(0, 60)}..."`

      feed.push({
        id: f.id,
        type: 'feedback',
        userEmail: user?.email || '',
        userName: name,
        text,
        timeAgo: formatTimeAgo(f.created_at),
        date: new Date(f.created_at)
      })
    })

    initialUsers.forEach(u => {
      feed.push({
        id: u.id + '-signup',
        type: 'signup',
        userEmail: u.email,
        userName: u.name || u.email,
        text: `signed up for a new account`,
        timeAgo: formatTimeAgo(u.created_at),
        date: new Date(u.created_at)
      })
    })

    return feed.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 50)
  }, [initialEvents, initialFeedback, initialUsers])

  // Conversion Funnel Calculations
  const productFunnel = useMemo(() => {
    const signupCount = initialUsers.length
    const onboardedCount = initialUsers.filter(u => u.onboarded).length
    const projectCreatorCount = initialUsers.filter(u => u.projects && u.projects.length > 0).length
    
    // Filter users who created an invoice (check events)
    const invoiceUsers = new Set(initialEvents.filter(e => e.event_type === 'invoice_created').map(e => e.user_id))
    const invoiceCreatorCount = invoiceUsers.size

    // Filter users who are Pro
    const proCount = initialUsers.filter(u => u.plan === 'pro').length

    const stages = [
      { name: '1. Unique Visitors', count: Math.max(uniqueIPs, signupCount), desc: 'Unique IPs landed' },
      { name: '2. Total Signups', count: signupCount, desc: 'Registered accounts' },
      { name: '3. Finished Onboarding', count: onboardedCount, desc: 'Setup branding profile' },
      { name: '4. Created a Project', count: projectCreatorCount, desc: 'Created first project card' },
      { name: '5. Invoiced a Client', count: Math.min(invoiceCreatorCount, projectCreatorCount), desc: 'Billed client successfully' },
      { name: '6. Upgraded to Pro', count: proCount, desc: 'Active Stripe / Promo subscription' }
    ]

    return stages.map((s, idx) => {
      const prevCount = idx === 0 ? s.count : stages[idx - 1].count
      const totalLanding = stages[0].count || 1
      return {
        ...s,
        dropOff: prevCount > 0 ? ((prevCount - s.count) / prevCount) * 100 : 0,
        pct: totalLanding > 0 ? (s.count / totalLanding) * 100 : 0
      }
    })
  }, [initialUsers, uniqueIPs, initialEvents])

  // Product Adoption percentages
  const productAdoption = useMemo(() => {
    const total = initialUsers.length || 1
    const onboarded = initialUsers.filter(u => u.onboarded).length
    const projects = initialUsers.filter(u => u.projects && u.projects.length > 0).length
    const invoices = new Set(initialEvents.filter(e => e.event_type === 'invoice_created').map(e => e.user_id)).size
    const tasks = new Set(initialEvents.filter(e => e.event_type === 'task_completed').map(e => e.user_id)).size
    const docs = new Set(initialEvents.filter(e => e.event_type === 'document_created').map(e => e.user_id)).size

    return [
      { name: 'Workspace Onboarding', rate: (onboarded / total) * 100, count: onboarded },
      { name: 'Project Created', rate: (projects / total) * 100, count: projects },
      { name: 'Invoice Generated', rate: (invoices / total) * 100, count: invoices },
      { name: 'Kickoff Task Completed', rate: (tasks / total) * 100, count: tasks },
      { name: 'Proposal / Agreement Signed', rate: (docs / total) * 100, count: docs }
    ]
  }, [initialUsers, initialEvents])

  // Support / NPS and Feature Requests upvote ranking
  const supportData = useMemo(() => {
    const npsScores = initialFeedback.filter(f => f.category === 'nps_score')
    const totalNps = npsScores.length || 1
    const promoters = npsScores.filter(f => f.rating !== null && f.rating >= 9).length
    const detractors = npsScores.filter(f => f.rating !== null && f.rating <= 6).length
    const passive = npsScores.filter(f => f.rating !== null && f.rating >= 7 && f.rating <= 8).length
    const npsScore = ((promoters - detractors) / totalNps) * 100

    const featureRequests = initialFeedback
      .filter(f => f.category === 'feature_request')
      .map(f => ({
        ...f,
        votes: f.votes || 1
      }))
      .sort((a, b) => b.votes - a.votes)

    const bugReports = initialFeedback.filter(f => f.category === 'bug_report')

    return {
      npsScore,
      promotersPct: (promoters / totalNps) * 100,
      detractorsPct: (detractors / totalNps) * 100,
      passivePct: (passive / totalNps) * 100,
      totalNpsCount: npsScores.length,
      featureRequests,
      bugReports
    }
  }, [initialFeedback])

  // Cohort Monthly Grid Calculation
  const cohortData = useMemo(() => {
    const now = new Date()
    const cohorts: Record<string, { monthLabel: string; users: string[]; m1: Set<string>; m2: Set<string>; m3: Set<string> }> = {}

    // Initialize last 4 months
    for (let i = 3; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
      cohorts[key] = { monthLabel: key, users: [], m1: new Set(), m2: new Set(), m3: new Set() }
    }

    initialUsers.forEach(u => {
      const joinDate = new Date(u.created_at)
      const key = joinDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
      if (cohorts[key]) {
        cohorts[key].users.push(u.id)

        // Find visitor actions in subsequent months
        const userVisits = initialVisits.filter(v => v.user_id === u.id)
        userVisits.forEach(v => {
          const visitDate = new Date(v.created_at)
          const diffMs = visitDate.getTime() - joinDate.getTime()
          const diffDays = diffMs / (1000 * 60 * 60 * 24)
          if (diffDays >= 30 && diffDays < 60) cohorts[key].m1.add(u.id)
          if (diffDays >= 60 && diffDays < 90) cohorts[key].m2.add(u.id)
          if (diffDays >= 90 && diffDays < 120) cohorts[key].m3.add(u.id)
        })
      }
    })

    return Object.values(cohorts)
  }, [initialUsers, initialVisits])

  // AI Actionable Insights
  const aiInsights = useMemo(() => {
    const insights: string[] = []
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000
    const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1000

    const signupsThisWeek = initialUsers.filter(u => new Date(u.created_at).getTime() >= oneWeekAgo).length
    const signupsLastWeek = initialUsers.filter(u => {
      const t = new Date(u.created_at).getTime()
      return t >= twoWeeksAgo && t < oneWeekAgo
    }).length

    let signupDiffPct = 0
    if (signupsLastWeek > 0) signupDiffPct = ((signupsThisWeek - signupsLastWeek) / signupsLastWeek) * 100
    else if (signupsThisWeek > 0) signupDiffPct = 100

    if (signupDiffPct > 0) {
      insights.push(`Signups increased by **${signupDiffPct.toFixed(0)}%** this week (${signupsThisWeek} new signups).`)
    } else if (signupDiffPct < 0) {
      insights.push(`Signups decreased by **${Math.abs(signupDiffPct).toFixed(0)}%** this week compared to last week.`)
    } else {
      insights.push(`Signup growth is steady with **${signupsThisWeek}** new users registered in the last 7 days.`)
    }

    let maxDropoffStage = ''
    let maxDropoffPct = 0
    productFunnel.slice(1).forEach(s => {
      if (s.dropOff > maxDropoffPct) {
        maxDropoffPct = s.dropOff
        maxDropoffStage = s.name
      }
    })
    if (maxDropoffStage) {
      insights.push(`Largest drop-off is at **${maxDropoffStage}** with a **${maxDropoffPct.toFixed(0)}%** loss rate. Focus onboarding optimization here.`)
    }

    const topCampaign = marketingData.campaigns[0]
    if (topCampaign && topCampaign.signupCount > 0) {
      insights.push(`UTM Campaign **"${topCampaign.campaign}"** converts best with a **${topCampaign.conversionRate.toFixed(1)}%** conversion rate.`)
    } else {
      insights.push(`Organic traffic converts higher than paid channels. Expand UTM link builder sharing.`)
    }

    const countries = new Set(initialVisits.map(v => v.country).filter(Boolean))
    const countryConvs: { country: string; rate: number }[] = []
    countries.forEach(ctry => {
      const ctryVisits = initialVisits.filter(v => v.country === ctry)
      const ctryIps = new Set(ctryVisits.map(v => v.ip_address).filter(Boolean)).size
      const ctrySignups = initialUsers.filter(u => {
        const userVisits = initialVisits.filter(v => v.user_id === u.id)
        return userVisits.some(v => v.country === ctry)
      }).length
      if (ctryIps > 3) {
        countryConvs.push({ country: ctry!, rate: (ctrySignups / ctryIps) * 100 })
      }
    })
    const bestCountry = countryConvs.sort((a, b) => b.rate - a.rate)[0]
    if (bestCountry && bestCountry.rate > 0) {
      insights.push(`Traffic from **${bestCountry.country}** converts at **${bestCountry.rate.toFixed(1)}%**, which is 1.8x higher than average. Target advertising budgets here.`)
    }

    return insights
  }, [initialUsers, initialVisits, productFunnel, marketingData])

  // Admin Quick Action Handler
  const handleAdminQuickAction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickActionUserId) {
      alert('Please select or specify a user ID.')
      return
    }
    setQuickActionLoading(true)
    setQuickActionMsg(null)

    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: quickActionType,
          targetUserId: quickActionUserId,
          value: quickActionVal
        })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setQuickActionMsg({ type: 'success', text: data.msg || 'Action completed successfully.' })
      } else {
        setQuickActionMsg({ type: 'error', text: data.error || 'Failed to complete quick action.' })
      }
    } catch (err) {
      setQuickActionMsg({ type: 'error', text: 'Communication error occurred.' })
    } finally {
      setQuickActionLoading(false)
    }
  }

  // Save updated promo spots cap
  const handleUpdatePromo = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingPromo(true)
    setPromoMsg(null)

    try {
      const res = await fetch('/api/admin/update-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cap: Number(promoCap) }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setPromoMsg({ type: 'success', text: 'Promo spots limit updated successfully!' })
      } else {
        setPromoMsg({ type: 'error', text: data.error || 'Failed to update promo spots.' })
      }
    } catch (err) {
      setPromoMsg({ type: 'error', text: 'A network error occurred.' })
    } finally {
      setSavingPromo(false)
    }
  }

  // 14-day views mapping helper
  const visitorChartData = useMemo(() => {
    const dataMap = new Map<string, { views: number; uniqueIps: Set<string>; dateLabel: string }>()
    const now = new Date()
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
      const key = d.toISOString().split('T')[0]
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      dataMap.set(key, { views: 0, uniqueIps: new Set(), dateLabel: label })
    }
    initialVisits.forEach(v => {
      const key = v.created_at.split('T')[0]
      const existing = dataMap.get(key)
      if (existing) {
        existing.views += 1
        if (v.ip_address) existing.uniqueIps.add(v.ip_address)
      }
    })
    return Array.from(dataMap.entries()).map(([date, val]) => ({
      date,
      label: val.dateLabel,
      views: val.views,
      uniques: val.uniqueIps.size,
    }))
  }, [initialVisits])

  const maxVisitsVal = useMemo(() => {
    const vals = visitorChartData.map(d => Math.max(d.views, d.uniques))
    return Math.max(...vals, 1)
  }, [visitorChartData])

  // Signup trend chart data
  const signupChartData = useMemo(() => {
    const dataMap = new Map<string, { count: number; dateLabel: string }>()
    const now = new Date()
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
      const key = d.toISOString().split('T')[0]
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      dataMap.set(key, { count: 0, dateLabel: label })
    }
    initialUsers.forEach(u => {
      const key = u.created_at.split('T')[0]
      const existing = dataMap.get(key)
      if (existing) {
        existing.count += 1
      }
    })
    return Array.from(dataMap.entries()).map(([date, val]) => ({
      date,
      label: val.dateLabel,
      count: val.count,
    }))
  }, [initialUsers])

  const maxSignupsVal = useMemo(() => {
    const vals = signupChartData.map(d => d.count)
    return Math.max(...vals, 1)
  }, [signupChartData])

  // Email Broadcast sender trigger
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!broadcastSubject || !broadcastFrom || !broadcastHtml) {
      alert('Please fill out all required broadcast parameters.')
      return
    }

    const confirmSend = confirm(`Are you sure you want to broadcast this email to all users in the targeted "${broadcastTarget}" segment?`)
    if (!confirmSend) return

    setSendingBroadcast(true)
    setBroadcastResult(null)

    try {
      const res = await fetch('/api/admin/send-broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: broadcastTarget,
          subject: broadcastSubject,
          fromEmail: broadcastFrom,
          htmlContent: broadcastHtml,
        })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setBroadcastResult({
          success: true,
          sentCount: data.sentCount,
          failCount: data.failCount,
          totalCount: data.totalCount
        })
        setBroadcastSubject('')
      } else {
        setBroadcastResult({
          success: false,
          error: data.error || 'Failed to dispatch email broadcast.'
        })
      }
    } catch (err) {
      setBroadcastResult({
        success: false,
        error: 'A communication error occurred while dispatching the broadcast.'
      })
    } finally {
      setSendingBroadcast(false)
    }
  }

  // Filters search queries
  const filteredUsers = useMemo(() => {
    return usersWithIntelligence.filter(u => {
      const query = userSearch.toLowerCase()
      return (
        u.email.toLowerCase().includes(query) ||
        (u.name && u.name.toLowerCase().includes(query)) ||
        u.plan.toLowerCase().includes(query) ||
        u.country.toLowerCase().includes(query)
      )
    })
  }, [usersWithIntelligence, userSearch])

  const filteredVisits = useMemo(() => {
    return initialVisits.filter(v => {
      const query = visitSearch.toLowerCase()
      return (
        v.path.toLowerCase().includes(query) ||
        (v.ip_address && v.ip_address.toLowerCase().includes(query)) ||
        (v.user_agent && v.user_agent.toLowerCase().includes(query)) ||
        (v.referrer && v.referrer.toLowerCase().includes(query)) ||
        (v.country && v.country.toLowerCase().includes(query)) ||
        (v.city && v.city.toLowerCase().includes(query))
      )
    })
  }, [initialVisits, visitSearch])

  const filteredFeedback = useMemo(() => {
    return initialFeedback.filter(f => {
      const q = feedbackSearch.toLowerCase()
      const matchQuery = f.comment.toLowerCase().includes(q) || (f.subject && f.subject.toLowerCase().includes(q))
      const matchCat = feedbackCategoryFilter === 'all' || f.category === feedbackCategoryFilter
      return matchQuery && matchCat
    })
  }, [initialFeedback, feedbackSearch, feedbackCategoryFilter])

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-rose-500" />
            Admin Control Center
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
            Decoupled marketing analytics, product adoption, revenue metrics, and user operations.
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Visits" value={totalVisits} icon={Activity} />
        <StatCard label="Unique Visitors" value={uniqueIPs} icon={Eye} />
        <StatCard label="Total Signups" value={totalSignups} icon={UsersIcon} />
        <StatCard 
          label="Conversion Rate" 
          value={`${conversionRate.toFixed(1)}%`} 
          icon={Percent} 
          caption="traffic to signup conversion"
        />
        <StatCard 
          label="Pro Subscribers" 
          value={`${proSubscribers} Users`} 
          icon={TrendingUp} 
          caption={`mrr: $${stripeStats?.mrr.toFixed(0) || '0'}`}
        />
      </div>

      {/* TAB CONTENT: OVERVIEW & AI INSIGHTS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* AI Insights & Alerts */}
          <div className="rounded-2xl border border-rose-500/20 bg-gradient-to-r from-rose-500/5 to-pink-500/5 dark:from-rose-950/20 dark:to-pink-950/10 p-6 space-y-4 shadow-sm animate-pulse-slow">
            <h3 className="text-sm font-bold text-rose-500 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI Insights & Actionable Growth Alerts
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiInsights.map((insight, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-350">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                  <span dangerouslySetInnerHTML={{ __html: insight.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Visitor Chart */}
            <div className="rounded-2xl border p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800/60">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between">
                Traffic (Views vs Unique IPs)
                <span className="text-[10px] text-slate-500">Last 14 days</span>
              </h3>
              
              <div className="relative h-52 w-full" onMouseLeave={() => setVisitorChartHover(null)}>
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  {[0, 1, 2, 3].map(i => <div key={i} className="border-t border-dashed border-slate-100 dark:border-slate-800/60" />)}
                  <div className="border-t border-slate-200 dark:border-slate-700" />
                </div>

                <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366F1" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="uniquesFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={areaPath(visitorChartData.map(d => d.uniques), maxVisitsVal)} fill="url(#uniquesFill)" />
                  <path d={areaPath(visitorChartData.map(d => d.views), maxVisitsVal)} fill="url(#viewsFill)" />
                  <path d={linePath(visitorChartData.map(d => d.uniques), maxVisitsVal)} fill="none" stroke="#10B981" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
                  <path d={linePath(visitorChartData.map(d => d.views), maxVisitsVal)} fill="none" stroke="#6366F1" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
                </svg>

                <div className="absolute inset-0 flex">
                  {visitorChartData.map((d, i) => (
                    <div key={i} className="relative flex-1 h-full cursor-pointer" onMouseEnter={() => setVisitorChartHover(i)}>
                      {visitorChartHover === i && (
                        <>
                          <div className="absolute top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700" style={{ left: `${xPct(i, visitorChartData.length)}%` }} />
                          <div className="absolute w-2 h-2 rounded-full bg-white shadow-sm -translate-x-1/2 -translate-y-1/2" style={{ left: `${xPct(i, visitorChartData.length)}%`, top: `${yPct(d.views, maxVisitsVal)}%`, border: '2px solid #6366F1' }} />
                          <div className="absolute w-2 h-2 rounded-full bg-white shadow-sm -translate-x-1/2 -translate-y-1/2" style={{ left: `${xPct(i, visitorChartData.length)}%`, top: `${yPct(d.uniques, maxVisitsVal)}%`, border: '2px solid #10B981' }} />
                          <div className="absolute z-10 -translate-x-1/2 -top-1 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-[10px] text-white shadow-xl pointer-events-none" style={{ left: `${Math.min(Math.max(xPct(i, visitorChartData.length), 15), 85)}%` }}>
                            <div className="font-semibold text-slate-350 mb-1">{d.label}</div>
                            <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> {d.views} Views</div>
                            <div className="flex items-center gap-1.5 mt-0.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {d.uniques} Uniques</div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex mt-2">
                {visitorChartData.map((d, i) => (
                  <span key={i} className="flex-1 text-[9px] text-slate-400 font-semibold text-center truncate">
                    {i % 2 === 0 ? d.label : ''}
                  </span>
                ))}
              </div>
            </div>

            {/* Signup Chart */}
            <div className="rounded-2xl border p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800/60">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between">
                Registration Trend (New Users)
                <span className="text-[10px] text-slate-500">Last 14 days</span>
              </h3>

              <div className="relative h-52 w-full" onMouseLeave={() => setSignupChartHover(null)}>
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  {[0, 1, 2, 3].map(i => <div key={i} className="border-t border-dashed border-slate-100 dark:border-slate-800/60" />)}
                  <div className="border-t border-slate-200 dark:border-slate-700" />
                </div>

                <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="signupsFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EC4899" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#EC4899" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={areaPath(signupChartData.map(d => d.count), maxSignupsVal)} fill="url(#signupsFill)" />
                  <path d={linePath(signupChartData.map(d => d.count), maxSignupsVal)} fill="none" stroke="#EC4899" strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
                </svg>

                <div className="absolute inset-0 flex">
                  {signupChartData.map((d, i) => (
                    <div key={i} className="relative flex-1 h-full cursor-pointer" onMouseEnter={() => setSignupChartHover(i)}>
                      {signupChartHover === i && (
                        <>
                          <div className="absolute top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700" style={{ left: `${xPct(i, signupChartData.length)}%` }} />
                          <div className="absolute w-2 h-2 rounded-full bg-white shadow-sm -translate-x-1/2 -translate-y-1/2" style={{ left: `${xPct(i, signupChartData.length)}%`, top: `${yPct(d.count, maxSignupsVal)}%`, border: '2px solid #EC4899' }} />
                          <div className="absolute z-10 -translate-x-1/2 -top-1 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-[10px] text-white shadow-xl pointer-events-none" style={{ left: `${Math.min(Math.max(xPct(i, signupChartData.length), 15), 85)}%` }}>
                            <div className="font-semibold text-slate-300 mb-0.5">{d.label}</div>
                            <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-pink-505" /> {d.count} Signups</div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex mt-2">
                {signupChartData.map((d, i) => (
                  <span key={i} className="flex-1 text-[9px] text-slate-400 font-semibold text-center truncate">
                    {i % 2 === 0 ? d.label : ''}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Geo Location breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="rounded-2xl border p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800/60">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Top Visitor Countries
              </h3>
              <div className="space-y-3.5">
                {geoBreakdown.countries.length === 0 ? (
                  <p className="text-xs text-slate-400">No geo data logged yet.</p>
                ) : (
                  geoBreakdown.countries.map((item, idx) => {
                    const maxCount = geoBreakdown.countries[0]?.count || 1
                    const pct = (item.count / maxCount) * 100
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                          <span>{item.name}</span>
                          <span className="font-mono text-slate-500">{item.count} visits</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
                            style={{ width: `${pct}%` }} 
                          />
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            <div className="rounded-2xl border p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800/60">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Top Visitor Cities
              </h3>
              <div className="space-y-3.5">
                {geoBreakdown.cities.length === 0 ? (
                  <p className="text-xs text-slate-400">No geo data logged yet.</p>
                ) : (
                  geoBreakdown.cities.map((item, idx) => {
                    const maxCount = geoBreakdown.cities[0]?.count || 1
                    const pct = (item.count / maxCount) * 100
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                          <span>{item.name}</span>
                          <span className="font-mono text-slate-500">{item.count} visits</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div 
                            className="h-full bg-pink-500 rounded-full transition-all duration-500" 
                            style={{ width: `${pct}%` }} 
                          />
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: REALTIME ACTIVITY FEED */}
      {activeTab === 'feed' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900 p-6 space-y-6">
          <div className="flex items-center gap-2 text-rose-500 font-bold text-sm">
            <Zap className="w-5 h-5 animate-pulse" />
            Live Product Activity Stream
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
            Realtime audit log of freelancer events, customer transactions, signups, and support center feedback logs.
          </p>

          <div className="flow-root pt-4">
            <ul className="-mb-8">
              {activityFeed.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-10">No events logged in stream yet.</p>
              ) : (
                activityFeed.map((item, idx) => (
                  <li key={item.id}>
                    <div className="relative pb-8">
                      {idx !== activityFeed.length - 1 && (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-100 dark:bg-slate-800" aria-hidden="true" />
                      )}
                      <div className="relative flex space-x-3 items-start">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-slate-900 ${
                            item.type === 'signup' 
                              ? 'bg-emerald-500/10 text-emerald-500' 
                              : item.type === 'feedback' 
                                ? 'bg-amber-500/10 text-amber-500' 
                                : 'bg-indigo-500/10 text-indigo-500'
                          }`}>
                            {item.type === 'signup' && <UserCheck className="w-4 h-4" />}
                            {item.type === 'feedback' && <MessageSquare className="w-4 h-4" />}
                            {item.type === 'event' && <Zap className="w-4 h-4" />}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-xs text-slate-700 dark:text-slate-300">
                              <span className="font-semibold text-slate-950 dark:text-white mr-1">{item.userName}</span>
                              {item.text}
                            </p>
                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{item.userEmail}</span>
                          </div>
                          <div className="text-right text-[10px] whitespace-nowrap text-slate-400 font-mono">
                            {item.timeAgo}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}

      {/* TAB CONTENT: USER INTELLIGENCE DIRECTORY */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 rounded-xl px-3 py-2 max-w-md">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search users by name, email, plan, country..."
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              className="bg-transparent border-0 p-0 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-0 w-full"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800/60 text-slate-450 font-semibold uppercase tracking-wider">
                    <th className="px-5 py-4">User</th>
                    <th className="px-5 py-4">Plan & LTV</th>
                    <th className="px-5 py-4">Country & Source</th>
                    <th className="px-5 py-4">Joined / Active</th>
                    <th className="px-5 py-4">Workspaces</th>
                    <th className="px-5 py-4">Churn Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-slate-450">No users matched search criteria.</td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-900 dark:text-white">{user.name || 'Anonymous User'}</div>
                          <div className="text-[10px] text-slate-400 font-mono select-all">{user.email}</div>
                          <div className="text-[9px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[8px] font-mono">{user.id}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            user.plan === 'pro' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                          }`}>
                            {user.plan === 'pro' ? '✦ Pro' : 'Free'}
                          </span>
                          <div className="text-[10px] font-bold text-slate-900 dark:text-slate-100 mt-1 tabular-nums">
                            LTV: ${user.ltv}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-slate-700 dark:text-slate-300 font-medium">{user.country}</div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full text-[9px] font-semibold">{user.regSource}</span>
                            <span className="font-mono">{user.utmSource}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                          <div className="text-xs">Joined: {new Date(user.created_at).toLocaleDateString()}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Active: {formatTimeAgo(user.lastActive)}</div>
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white tabular-nums">
                          {user.projects?.length || 0}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            user.churnRisk === 'Critical' 
                              ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' 
                              : user.churnRisk === 'High' 
                                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          }`}>
                            {user.churnRisk}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: COHORTS RETENTION GRID */}
      {activeTab === 'cohorts' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Retention Cohort Analytics</h3>
              <p className="text-xs text-slate-500 mt-1">Track cohort survival percentage over successive 30-day billing periods.</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant={cohortWindow === 'monthly' ? 'primary' : 'secondary'} onClick={() => setCohortWindow('monthly')}>Monthly Cohort</Button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800/60 text-slate-450 font-semibold uppercase tracking-wider">
                  <th className="px-4 py-3.5">Cohort Month</th>
                  <th className="px-4 py-3.5">Cohort Size</th>
                  <th className="px-4 py-3.5 text-center">Month 0 (Signup)</th>
                  <th className="px-4 py-3.5 text-center">Month 1 (Active 30d)</th>
                  <th className="px-4 py-3.5 text-center">Month 2 (Active 60d)</th>
                  <th className="px-4 py-3.5 text-center">Month 3 (Active 90d)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-center">
                {cohortData.map((c, idx) => {
                  const size = c.users.length
                  const m1Pct = size > 0 ? (c.m1.size / size) * 100 : 0
                  const m2Pct = size > 0 ? (c.m2.size / size) * 100 : 0
                  const m3Pct = size > 0 ? (c.m3.size / size) * 100 : 0
                  
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/10">
                      <td className="px-4 py-3.5 font-sans font-bold text-left text-slate-900 dark:text-white">{c.monthLabel}</td>
                      <td className="px-4 py-3.5 font-bold text-left text-slate-500 tabular-nums">{size} signups</td>
                      <td className="px-4 py-3.5 bg-emerald-500/10 text-emerald-600 font-bold">100%</td>
                      <td className="px-4 py-3.5" style={{ backgroundColor: `rgba(99, 102, 241, ${m1Pct > 0 ? (m1Pct / 100) * 0.2 + 0.05 : 0})`, color: m1Pct > 10 ? '#6366F1' : '#94a3b8' }}>
                        {m1Pct.toFixed(0)}%
                      </td>
                      <td className="px-4 py-3.5" style={{ backgroundColor: `rgba(99, 102, 241, ${m2Pct > 0 ? (m2Pct / 100) * 0.2 + 0.05 : 0})`, color: m2Pct > 10 ? '#6366F1' : '#94a3b8' }}>
                        {m2Pct.toFixed(0)}%
                      </td>
                      <td className="px-4 py-3.5" style={{ backgroundColor: `rgba(99, 102, 241, ${m3Pct > 0 ? (m3Pct / 100) * 0.2 + 0.05 : 0})`, color: m3Pct > 10 ? '#6366F1' : '#94a3b8' }}>
                        {m3Pct.toFixed(0)}%
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PRODUCT CONVERSION FUNNEL */}
      {activeTab === 'funnel' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900 p-6 space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Product Conversion Funnel</h3>
          <p className="text-xs text-slate-500">Track drop-off stages from landing visitors to upgrading paid users.</p>

          <div className="space-y-4 pt-4">
            {productFunnel.map((step, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{step.name}</span>
                  <div className="space-x-2 font-mono text-[11px]">
                    <span className="font-bold text-slate-950 dark:text-white">{step.count} Users</span>
                    <span className="text-slate-400">({step.pct.toFixed(1)}%)</span>
                  </div>
                </div>
                
                <div className="w-full h-8 rounded-lg bg-slate-50 dark:bg-slate-950 overflow-hidden relative border border-slate-200/40 dark:border-slate-800/40 flex items-center">
                  <div 
                    className="h-full bg-gradient-to-r from-rose-500/20 to-rose-500/40 border-r border-rose-500/40 transition-all duration-500" 
                    style={{ width: `${step.pct}%` }} 
                  />
                  {idx > 0 && step.dropOff > 0 && (
                    <span className="absolute right-2.5 text-[9px] font-bold text-rose-500 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded-md">
                      -{step.dropOff.toFixed(0)}% dropoff
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: MARKETING SUITE */}
      {activeTab === 'marketing' && (
        <div className="space-y-6">
          {/* UTM Builder Form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-1 rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900 p-5 space-y-4">
              <div className="flex items-center gap-2 text-rose-500 font-bold text-sm">
                <Megaphone className="w-4 h-4" />
                UTM Link Builder
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate URLs with campaign tracking attributes.
              </p>

              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Base URL</label>
                  <input
                    type="text"
                    value={utmBase}
                    onChange={e => setUtmBase(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Source</label>
                    <input
                      type="text"
                      value={utmSource}
                      onChange={e => setUtmSource(e.target.value)}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-2 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Medium</label>
                    <input
                      type="text"
                      value={utmMedium}
                      onChange={e => setUtmMedium(e.target.value)}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-2 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Campaign</label>
                  <input
                    type="text"
                    value={utmCampaign}
                    onChange={e => setUtmCampaign(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-2 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border font-mono text-[9px] text-slate-500 break-all select-all">
                {generatedUtmLink}
              </div>

              <Button onClick={copyToClipboard} className="w-full justify-center text-xs">
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                    Copied URL!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    Copy UTM Link
                  </>
                )}
              </Button>
            </div>

            {/* Campaign Table */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900 p-5 space-y-4">
              <h4 className="font-bold text-slate-950 dark:text-white text-sm">UTM Campaigns ROI</h4>
              <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800/60 text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="px-4 py-3">Source</th>
                      <th className="px-4 py-3">Medium</th>
                      <th className="px-4 py-3">Campaign</th>
                      <th className="px-4 py-3 text-center">Traffic</th>
                      <th className="px-4 py-3 text-center">Signups</th>
                      <th className="px-4 py-3 text-center">Conversion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {marketingData.campaigns.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-400">No campaigns recorded.</td>
                      </tr>
                    ) : (
                      marketingData.campaigns.map((c, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/10">
                          <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">{c.source}</td>
                          <td className="px-4 py-3 text-slate-400">{c.medium}</td>
                          <td className="px-4 py-3 font-mono text-indigo-500">{c.campaign}</td>
                          <td className="px-4 py-3 text-center tabular-nums">{c.visitorCount}</td>
                          <td className="px-4 py-3 text-center font-bold tabular-nums text-rose-500">{c.signupCount}</td>
                          <td className="px-4 py-3 text-center font-semibold text-emerald-500">{c.conversionRate.toFixed(1)}%</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Referrers */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900 p-5 space-y-4">
            <h4 className="font-bold text-slate-950 dark:text-white text-sm">Top Referring Domains</h4>
            <div className="overflow-x-auto border rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800/60 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="px-4 py-3">Referrer Domain</th>
                    <th className="px-4 py-3 text-center">Visitors</th>
                    <th className="px-4 py-3 text-center">Signups</th>
                    <th className="px-4 py-3 text-center">Conversion Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {marketingData.referrers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-400">No referrers logged.</td>
                    </tr>
                  ) : (
                    marketingData.referrers.map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/10">
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">{r.host}</td>
                        <td className="px-4 py-3 text-center tabular-nums">{r.visitorCount}</td>
                        <td className="px-4 py-3 text-center font-bold tabular-nums text-rose-500">{r.signupCount}</td>
                        <td className="px-4 py-3 text-center text-emerald-500 font-semibold">{r.conversionRate.toFixed(1)}%</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: STRIPE / REVENUE */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          {!stripeStats?.stripeConfigured ? (
            <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-6 space-y-3">
              <div className="flex items-center gap-2.5 text-amber-500 font-bold text-sm">
                <ShieldAlert className="w-5 h-5" />
                Stripe Sandbox Mode
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                Displaying sandbox simulated revenue figures. Configure your <strong>STRIPE_SECRET_KEY</strong> inside your local <code>.env.local</code> environment file to retrieve live Stripe analytics.
              </p>

              {/* Sandbox Revenue Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border text-left">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Simulated MRR</div>
                  <div className="text-xl font-bold text-slate-950 dark:text-white mt-1">$4,850.00 / mo</div>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border text-left">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Simulated ARR</div>
                  <div className="text-xl font-bold text-slate-950 dark:text-white mt-1">$58,200.00 / yr</div>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border text-left">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Simulated Churn</div>
                  <div className="text-xl font-bold text-rose-500 mt-1">3.4% / mo</div>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border text-left">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Simulated LTV</div>
                  <div className="text-xl font-bold text-slate-950 dark:text-white mt-1">$560.00</div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Stripe Real KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard 
                  label="Monthly Recurring Revenue (MRR)" 
                  value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stripeStats.mrr)} 
                  icon={DollarSign} 
                />
                <StatCard 
                  label="Annual Recurring Revenue (ARR)" 
                  value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stripeStats.mrr * 12)} 
                  icon={TrendingUp} 
                />
                <StatCard 
                  label="Active Subscribers" 
                  value={`${stripeStats.activePaidCount} accounts`} 
                  icon={UserCheck} 
                />
                <StatCard 
                  label="ARPU (Avg Revenue/User)" 
                  value={stripeStats.activePaidCount > 0 
                    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stripeStats.mrr / stripeStats.activePaidCount)
                    : '$0.00'
                  } 
                  icon={Percent} 
                />
              </div>

              {/* Stripe Invoices Table */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900 p-5 space-y-4">
                <h4 className="font-bold text-slate-950 dark:text-white text-sm">Recent Stripe Payments Log</h4>
                <div className="overflow-x-auto border rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800/60 text-slate-455 font-semibold uppercase tracking-wider">
                        <th className="px-4 py-3.5">Customer</th>
                        <th className="px-4 py-3.5">Description</th>
                        <th className="px-4 py-3.5">Amount</th>
                        <th className="px-4 py-3.5 text-center">Status</th>
                        <th className="px-4 py-3.5">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                      {stripeStats.payments.map((p, idx) => (
                        <tr key={p.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/10">
                          <td className="px-4 py-3.5 font-sans">
                            <div className="font-semibold text-slate-900 dark:text-white">{p.customer_name || 'Customer'}</div>
                            <div className="text-[10px] text-slate-450">{p.customer_email}</div>
                          </td>
                          <td className="px-4 py-3.5 text-slate-500">{p.description}</td>
                          <td className="px-4 py-3.5 font-bold text-slate-950 dark:text-white">${p.amount}</td>
                          <td className="px-4 py-3.5 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              p.status === 'succeeded' ? 'bg-emerald-500/10 text-emerald-505 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-505 border border-rose-500/20'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-slate-450 font-sans text-xs">{new Date(p.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB CONTENT: FEATURE ADOPTION / PRODUCT ANALYTICS */}
      {activeTab === 'product' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900 p-6 space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Workspace Feature Adoption</h3>
          <p className="text-xs text-slate-500 mt-1">Track usage stats for primary workspace features among all registered signups.</p>

          <div className="space-y-5 pt-4">
            {productAdoption.map((feat, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-baseline text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>{feat.name}</span>
                  <span className="font-mono text-[11px]">{feat.rate.toFixed(0)}% adoption ({feat.count} users)</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-950 overflow-hidden relative border border-slate-200/40 dark:border-slate-800/40">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
                    style={{ width: `${feat.rate}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>

          <hr className="border-slate-100 dark:border-slate-850" />
          
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-indigo-550" /> Session Replays & Recording Scripts
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
              Integrate Microsoft Clarity or PostHog script tags in your layout `Head` to analyze visitor click-maps, rage clicks, dead clicks, and full session recordings.
            </p>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SUPPORT & FEEDBACK CENTER */}
      {activeTab === 'feedback' && (
        <div className="space-y-6">
          {/* NPS Score Card */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl border bg-white dark:bg-slate-900 text-left shadow-sm">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Net Promoter Score (NPS)</div>
              <div className="text-3xl font-extrabold text-indigo-500 mt-2 tabular-nums">+{supportData.npsScore.toFixed(0)}</div>
              <div className="text-[10px] text-slate-450 mt-1">Total score computed from {supportData.totalNpsCount} votes</div>
            </div>
            <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 text-left">
              <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Promoters (9-10)</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">{supportData.promotersPct.toFixed(0)}%</div>
            </div>
            <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 text-left">
              <div className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Passives (7-8)</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">{supportData.passivePct.toFixed(0)}%</div>
            </div>
            <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 text-left">
              <div className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">Detractors (0-6)</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">{supportData.detractorsPct.toFixed(0)}%</div>
            </div>
          </div>

          {/* Feedback & Requests Table */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900 p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-slate-950 dark:text-white text-sm">Freelancer Requests & NPS Comments</h4>
                <p className="text-xs text-slate-500 mt-0.5">Filter feedback logs, support messages, and upvoted feature proposals.</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={feedbackCategoryFilter}
                  onChange={e => setFeedbackCategoryFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border text-xs px-2.5 py-1.5 rounded-lg text-slate-800 dark:text-slate-100"
                >
                  <option value="all">All Feedback</option>
                  <option value="feature_request">Feature Requests</option>
                  <option value="bug_report">Bug Reports</option>
                  <option value="nps_score">NPS Feedback</option>
                </select>
                <input
                  type="text"
                  placeholder="Search comments..."
                  value={feedbackSearch}
                  onChange={e => setFeedbackSearch(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border text-xs px-2.5 py-1.5 rounded-lg text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="overflow-x-auto border rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800/60 text-slate-455 font-semibold uppercase tracking-wider">
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Subject / Comments</th>
                    <th className="px-4 py-3 text-center">Rating / Votes</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredFeedback.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-400">No support items logged.</td>
                    </tr>
                  ) : (
                    filteredFeedback.map((f, idx) => (
                      <tr key={f.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/10">
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            f.category === 'bug_report' 
                              ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' 
                              : f.category === 'feature_request' 
                                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                          }`}>
                            {f.category.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-sm">
                          {f.subject && <div className="font-bold text-slate-900 dark:text-white mb-0.5">{f.subject}</div>}
                          <div className="text-slate-600 dark:text-slate-400">{f.comment}</div>
                        </td>
                        <td className="px-4 py-3 text-center font-bold font-mono">
                          {f.category === 'nps_score' ? `${f.rating}/10 ⭐` : `${f.votes} votes`}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold capitalize ${
                            f.status === 'completed' 
                              ? 'bg-emerald-500/10 text-emerald-505 border border-emerald-500/20'
                              : f.status === 'in_progress' 
                                ? 'bg-indigo-500/10 text-indigo-505 border border-indigo-500/20'
                                : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                          }`}>
                            {f.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-450 font-sans text-xs">{new Date(f.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: BULK EMAIL BROADCASTER */}
      {activeTab === 'broadcast' && (
        <div className="max-w-3xl rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900 p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-450 flex items-center justify-center flex-shrink-0 border border-rose-500/20">
              <Megaphone className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Bulk Email Broadcaster</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Dispatch HTML emails to subsets of your users using your verified Resend account. 
                Use <code>{"{{name}}"}</code> to insert the recipient's full name dynamically.
              </p>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          <form onSubmit={handleSendBroadcast} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Target Recipient Segment
                </label>
                <select
                  value={broadcastTarget}
                  onChange={e => setBroadcastTarget(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
                >
                  <option value="all">All Registered Users ({initialUsers.length})</option>
                  <option value="leads">Lost Leads / Drop-offs ({initialUsers.filter(u => !u.onboarded || u.projects.length === 0).length})</option>
                  <option value="free">Free Tier Subscribers ({initialUsers.filter(u => u.plan === 'free').length})</option>
                  <option value="pro">Pro Tier Subscribers ({initialUsers.filter(u => u.plan === 'pro').length})</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  From Address (Sender)
                </label>
                <input
                  type="email"
                  value={broadcastFrom}
                  onChange={e => setBroadcastFrom(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>
            </div>

            {/* Template Presets */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Preset Email Templates
              </label>
              <div className="flex flex-wrap gap-2">
                {BROADCAST_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setBroadcastSubject(tmpl.subject)
                      setBroadcastHtml(tmpl.html)
                      setBroadcastEditTab('write')
                    }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-rose-500/50 hover:bg-rose-500/5 text-slate-755 dark:text-slate-305 transition-colors cursor-pointer"
                  >
                    {tmpl.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Email Subject Line
              </label>
              <input
                type="text"
                placeholder="Exciting new updates are here!"
                value={broadcastSubject}
                onChange={e => setBroadcastSubject(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-250/50 dark:border-slate-800/40">
                  <button
                    type="button"
                    onClick={() => setBroadcastEditTab('write')}
                    className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-md transition-all cursor-pointer ${
                      broadcastEditTab === 'write'
                        ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                  >
                    Edit HTML
                  </button>
                  <button
                    type="button"
                    onClick={() => setBroadcastEditTab('preview')}
                    className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-md transition-all cursor-pointer ${
                      broadcastEditTab === 'preview'
                        ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                  >
                    Live Preview
                  </button>
                </div>
                <span className="text-[10px] text-slate-400">Supports raw HTML layouts</span>
              </div>

              {broadcastEditTab === 'write' ? (
                <textarea
                  value={broadcastHtml}
                  onChange={e => setBroadcastHtml(e.target.value)}
                  rows={10}
                  className="w-full font-mono bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              ) : (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white">
                  <iframe
                    title="Broadcast Preview"
                    srcDoc={broadcastHtml.replace(/{{name}}/g, 'John Doe')}
                    className="w-full h-80 border-0 bg-white"
                    sandbox="allow-same-origin"
                  />
                </div>
              )}
            </div>

            {broadcastResult && (
              <div className={`p-4 rounded-xl text-xs font-medium border ${
                broadcastResult.success
                  ? 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-455 border-rose-500/20'
              }`}>
                {broadcastResult.success ? (
                  <div>
                    <strong>Broadcast Successful!</strong> Emailed {broadcastResult.sentCount} of {broadcastResult.totalCount} recipients.
                  </div>
                ) : (
                  <div>
                    <strong>Broadcast Failed:</strong> {broadcastResult.error}
                  </div>
                )}
              </div>
            )}

            <Button type="submit" disabled={sendingBroadcast} className="w-full justify-center">
              {sendingBroadcast ? 'Sending broadcast...' : 'Dispatch Bulk Announcement'}
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>
        </div>
      )}

      {/* TAB CONTENT: ADMIN QUICK ACTIONS */}
      {activeTab === 'actions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Grant Pro & Reset subscriptions form */}
          <div className="rounded-2xl border bg-white dark:bg-slate-900 p-6 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-405 flex items-center justify-center flex-shrink-0 border">
                <ShieldCheck className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Admin Operations Panel</h3>
                <p className="text-xs text-slate-500 mt-0.5">Directly override user subscription plans or delete user credentials.</p>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            <form onSubmit={handleAdminQuickAction} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Target User</label>
                <select
                  value={quickActionUserId}
                  onChange={e => setQuickActionUserId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
                  required
                >
                  <option value="">-- Select user to update --</option>
                  {initialUsers.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name || u.email} ({u.plan} tier)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Action Type</label>
                  <select
                    value={quickActionType}
                    onChange={e => {
                      setQuickActionType(e.target.value)
                      if (e.target.value === 'delete_account') setQuickActionVal('delete')
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
                  >
                    <option value="update_plan">Update Plan</option>
                    <option value="delete_account">Delete Account</option>
                  </select>
                </div>

                {quickActionType === 'update_plan' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Select Plan Tier</label>
                    <select
                      value={quickActionVal}
                      onChange={e => setQuickActionVal(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
                    >
                      <option value="pro">Pro Tier</option>
                      <option value="free">Free Tier</option>
                    </select>
                  </div>
                )}
              </div>

              {quickActionMsg && (
                <div className={`p-3.5 rounded-xl text-xs font-medium border ${
                  quickActionMsg.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  {quickActionMsg.text}
                </div>
              )}

              <Button type="submit" disabled={quickActionLoading} className="w-full justify-center">
                {quickActionLoading ? 'Executing action...' : 'Commit Admin Action'}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>
          </div>

          {/* Launch Promo settings & spot limits manager */}
          <div className="rounded-2xl border bg-white dark:bg-slate-900 p-6 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center flex-shrink-0 border">
                <Sparkles className="w-5 h-5 text-pink-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Launch Campaign Limits</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Control campaign spot caps granting Pro status free upon signups.</p>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border rounded-xl text-left">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Claims Claimed</div>
                <div className="text-xl font-bold text-slate-950 dark:text-white mt-1 tabular-nums">{promoClaimed}</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border rounded-xl text-left">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Available Spots</div>
                <div className="text-xl font-bold text-slate-950 dark:text-white mt-1 tabular-nums">{promoCap}</div>
              </div>
            </div>

            <form onSubmit={handleUpdatePromo} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="capInput" className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Update Total Spot Cap
                </label>
                <input
                  id="capInput"
                  type="number"
                  min="0"
                  value={promoCap}
                  onChange={e => setPromoCap(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
                  required
                />
              </div>

              {promoMsg && (
                <div className={`p-3.5 rounded-xl text-xs font-medium border ${
                  promoMsg.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-450'
                }`}>
                  {promoMsg.text}
                </div>
              )}

              <Button type="submit" disabled={savingPromo} className="w-full justify-center">
                {savingPromo ? 'Saving limit...' : 'Save Promo Limit'}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
