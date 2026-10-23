import { getCollection } from 'astro:content';
import { YEARS } from '../config';

// Lists every public page so search engines can index the site once it has its final domain.
export async function GET({ site }: { site: URL }) {
  const base = (site?.origin ?? '') + import.meta.env.BASE_URL.replace(/\/$/, '');
  const work = await getCollection('work');
  const paths = ['/', '/play/', '/work/', '/years/', '/resume/', '/about/', '/contact/',
    ...work.filter((w) => w.data.slug !== 'tiger-run').map((w) => `/work/${w.data.slug}/`),
    ...YEARS.map((y) => `/years/${y.slug}/`)];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map((p) => `  <url><loc>${base}${p}</loc></url>`).join('\n')}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
}
