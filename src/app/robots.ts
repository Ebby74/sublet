import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/inquiry', '/auth/login', '/auth/register'],
      disallow: ['/api/', '/dashboard/', '/properties/', '/tenants/', '/leases/', '/payments/', '/reports/', '/settings/', '/notifications/', '/prospects/', '/import/'],
    },
    sitemap: 'https://amrhomesolutions.com/sitemap.xml',
  };
}
