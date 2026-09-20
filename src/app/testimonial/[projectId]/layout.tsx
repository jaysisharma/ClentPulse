import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Client Review | Frevio',
  robots: {
    index: false,
    follow: false,
  },
}

export default function TestimonialLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
