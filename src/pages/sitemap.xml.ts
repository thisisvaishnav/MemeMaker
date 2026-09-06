import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const pages = ['', 'about', 'contact', 'edit', 'privacy', 'templates', 'terms'];
  const urls = pages
    .map((page) => `  <url>\n    <loc>https://mememaker.com/${page ? page + '/' : ''}</loc>\n    <changefreq>daily</changefreq>\n    <priority>${page === '' ? '1.0' : '0.8'}</priority>\n  </url>`)
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
};
