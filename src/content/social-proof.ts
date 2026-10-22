// Real quotes only. The landing page shows testimonials only when at least one
// entry exists here; until then the founder note stands in.

export type Testimonial = {
  quote: string
  name: string
  role: string // e.g. "Freelance product designer"
  company?: string
  avatar?: string // path under /public, e.g. "/people/ana.webp"
  link?: string // where the quote can be verified (LinkedIn post, X, etc.)
}

export type FounderNote = {
  body: string
  name: string
  title: string // e.g. "Founder, Frevio"
  avatar?: string
  email: string
}

export const testimonials: Testimonial[] = []

export const founderNote: FounderNote | null = {
  body: `Every freelancer knows the late-night “any updates?” message. It’s rarely because the client is difficult. They just can’t see what’s happening, so they ask, and you stop working to answer.

I built Frevio so that never has to happen. Your client gets one private link to see progress, approve work and pay, with no account to create. You keep working, they stay in the loop, and the deposit lands before you start.

If anything in Frevio gets in your way, email me at support@frevio.app. I read every message.`,
  name: 'Jaysi Sharma',
  title: 'Founder, Frevio',
  email: 'support@frevio.app',
}
