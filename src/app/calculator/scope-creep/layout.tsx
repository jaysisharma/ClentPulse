import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { absolute: 'Scope Creep & Change Order Estimator | Frevio' },
  description: 'Estimate what extra client requests really cost and turn them into a change order. Free scope creep calculator for freelancers and agencies.',
  alternates: { canonical: '/calculator/scope-creep' },
  openGraph: {
    title: 'Scope Creep & Change Order Estimator | Frevio',
    description: 'Estimate what extra client requests really cost and turn them into a change order. Free scope creep calculator for freelancers and agencies.',
    url: '/calculator/scope-creep',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Frevio' }],
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
