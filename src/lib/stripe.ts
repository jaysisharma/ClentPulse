import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not configured in environment variables.')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2026-05-27.dahlia' as const,
  appInfo: {
    name: 'Frevio',
    version: '0.2.0',
    url: 'https://www.frevio.cloud',
  },
})
