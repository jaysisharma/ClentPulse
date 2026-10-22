import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { absolute: 'Freelance Rate Calculator | Frevio' },
  description: 'Work out the hourly and day rate you need as a freelancer or agency, after taxes, software, hardware and time off. Free, no signup.',
  alternates: { canonical: '/calculator' },
  openGraph: {
    title: 'Freelance Rate Calculator | Frevio',
    description: 'Work out the hourly and day rate you need as a freelancer or agency, after taxes, software, hardware and time off. Free, no signup.',
    url: '/calculator',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Frevio' }],
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
