// Placeholders: see OPEN_ITEMS.md. Do not invent values.
export const SITE = {
  name: 'Aritra Mitra',
  domain: '[DOMAIN]',
  email: 'aritramitra49@gmail.com',
  github: 'https://github.com/pixeljoy1/aritra-portfolio',
  instagram: 'https://www.instagram.com/wildscapeexplorers/',
  instagramFeatured: 'https://www.instagram.com/p/C4FfmW4rrDJ/',
  linkedin: 'https://www.linkedin.com/in/aritra-mitra-065788303/',
  role: 'Game + Immersive Designer',
  programme: 'BDes Immersive Digital Environments · O.P. Jindal Global University · Class of 2028',
};

export const NAV = [
  { label: 'Work', href: '/work/' },
  { label: 'Portals', href: '/experiences/' },
  { label: 'Years', href: '/years/' },
  { label: 'Play', href: '/play/' },
  { label: 'Resume', href: '/resume/' },
  { label: 'About', href: '/about/' },
];

export const YEARS = [
  { slug: '2024-25', n: 1, label: '2024–25', semesters: ['S1', 'S2'], name: 'Foundations' },
  { slug: '2025-26', n: 2, label: '2025–26', semesters: ['S3', 'S4'], name: 'Environments + Systems' },
  { slug: '2026-27', n: 3, label: '2026–27', semesters: ['S5', 'S6'], name: 'Current year' },
];

// Base-aware URL helper (site is served from a sub-path on github.io until the custom domain is live).
export const u = (path: string) => import.meta.env.BASE_URL.replace(/\/$/, '') + path;

// Tiger Run's card goes straight to the game page; every other project opens its case study.
export const workUrl = (slug: string) => u(slug === 'tiger-run' ? '/play/' : `/work/${slug}/`);

// Human labels for tags and filters.
export const TAG_LABELS: Record<string, string> = {
  'game-environment': 'GAME + ENVIRONMENT', 'ux-systems': 'UX + SYSTEMS', 'ux-research': 'UX RESEARCH',
  'motion-lighting': 'MOTION + LIGHTING', foundations: 'FOUNDATIONS', 'research-writing': 'RESEARCH + WRITING', live: 'LIVE PROJECT',
};
