import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Review Document | Frevio',
  robots: {
    index: false,
    follow: false,
  },
}

export default function DocLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
