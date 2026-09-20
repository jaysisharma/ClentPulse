import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://frevio.cloud'
  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/roadmap',
        '/terms',
        '/privacy',
        '/portfolio/',
        '/u/',
      ],
      disallow: [
        '/auth/',
        '/dashboard/',
        '/onboarding/',
        '/project/',
        '/clients/',
        '/invoices/',
        '/time/',
        '/earnings/',
        '/expenses/',
        '/settings/',
        '/p/',
        '/contract/',
        '/doc/',
        '/invoice/',
        '/testimonial/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
