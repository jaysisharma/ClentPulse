import { createAdminClient } from '@/lib/supabase/admin'
import { AdminDashboard } from './admin-dashboard'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ tab?: string }>
}

export default async function AdminPage({ searchParams }: PageProps) {
  const adminClient = createAdminClient()
  const resolvedParams = await searchParams
  const activeTab = resolvedParams.tab || 'overview'

  // 1. Fetch all users, including their created projects array (to display project counts)
  const { data: usersData, error: usersError } = await adminClient
    .from('users')
    .select('id, email, name, plan, promo_pro, onboarded, created_at, stripe_customer_id, projects(id)')
    .order('created_at', { ascending: false })

  if (usersError) {
    console.error('[Admin Page] Fetch Users Error:', usersError)
  }

  // 2. Fetch page visits logs (up to 2000 logs)
  const { data: visitsData, error: visitsError } = await adminClient
    .from('page_visits')
    .select('id, ip_address, user_agent, path, referrer, user_id, utm_source, utm_medium, utm_campaign, country, city, created_at')
    .order('created_at', { ascending: false })
    .limit(2000)

  if (visitsError) {
    console.error('[Admin Page] Fetch Visits Error:', visitsError)
  }

  // Fetch product events
  const { data: eventsData, error: eventsError } = await adminClient
    .from('product_events')
    .select('id, user_id, event_type, metadata, created_at')
    .order('created_at', { ascending: false })

  if (eventsError) {
    console.error('[Admin Page] Fetch Events Error:', eventsError)
  }

  // Fetch support and feedback requests
  const { data: feedbackData, error: feedbackError } = await adminClient
    .from('freelancer_feedback')
    .select('id, user_id, category, subject, comment, rating, votes, status, created_at')
    .order('created_at', { ascending: false })

  if (feedbackError) {
    console.error('[Admin Page] Fetch Feedback Error:', feedbackError)
  }

  // 3. Fetch launch promo aggregate state
  const { data: promoData, error: promoError } = await adminClient
    .from('launch_promo')
    .select('claimed, cap')
    .eq('id', 1)
    .maybeSingle()

  if (promoError) {
    console.error('[Admin Page] Fetch Promo Counter Error:', promoError)
  }

  // 4. Fetch Stripe Analytics
  let stripeStats = null
  const stripeKey = process.env.STRIPE_SECRET_KEY
  
  if (stripeKey && !stripeKey.startsWith('sk_test_your')) {
    try {
      const stripe = new Stripe(stripeKey, { apiVersion: '2026-05-27.dahlia' as const })
      
      const [subscriptions, charges] = await Promise.all([
        stripe.subscriptions.list({ status: 'active', limit: 100 }),
        stripe.charges.list({ limit: 15 })
      ])

      let mrr = 0
      subscriptions.data.forEach(sub => {
        const item = sub.items.data[0]
        if (item && item.plan) {
          const amount = (item.plan.amount || 0) * (item.quantity || 1)
          const interval = item.plan.interval // 'month' or 'year'
          let monthlyContrib = amount / 100
          if (interval === 'year') {
            monthlyContrib = monthlyContrib / 12
          }
          mrr += monthlyContrib
        }
      })

      const payments = charges.data.map(ch => ({
        id: ch.id,
        amount: ch.amount / 100,
        currency: ch.currency,
        customer_name: ch.billing_details?.name || null,
        customer_email: ch.billing_details?.email || null,
        status: ch.status,
        created_at: new Date(ch.created * 1000).toISOString(),
        description: ch.description || 'Frevio Subscription'
      }))

      stripeStats = {
        stripeConfigured: true,
        mrr,
        activePaidCount: subscriptions.data.length,
        payments
      }
    } catch (err) {
      console.error('[Admin Page] Stripe data sync failed:', err)
      stripeStats = { stripeConfigured: false, mrr: 0, activePaidCount: 0, payments: [], error: 'Failed to connect to Stripe API.' }
    }
  } else {
    stripeStats = { stripeConfigured: false, mrr: 0, activePaidCount: 0, payments: [] }
  }

  const users = (usersData || []).map(u => ({
    ...u,
    projects: (u.projects || []) as { id: string }[]
  }))

  const visits = visitsData || []
  const promo = promoData || { claimed: 0, cap: 50 }

  return (
    <AdminDashboard
      initialUsers={users}
      initialVisits={visits}
      initialPromo={promo}
      activeTab={activeTab}
      stripeStats={stripeStats}
      initialEvents={eventsData || []}
      initialFeedback={feedbackData || []}
      serverTime={new Date().toISOString()}
    />
  )
}
