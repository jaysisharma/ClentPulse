import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { absolute: 'Free Online Invoice Generator | Frevio' },
  description: 'Create a professional invoice in your browser and download it as a PDF. Line items, tax/VAT and multiple currencies. Free, no signup.',
  alternates: { canonical: '/calculator/invoice-generator' },
  openGraph: {
    title: 'Free Online Invoice Generator | Frevio',
    description: 'Create a professional invoice in your browser and download it as a PDF. Line items, tax/VAT and multiple currencies. Free, no signup.',
    url: '/calculator/invoice-generator',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Frevio' }],
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
