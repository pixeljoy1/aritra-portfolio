// Placeholders: see OPEN_ITEMS.md. Do not invent values.
export const SITE = {
  name: 'Aritra Mitra',
  domain: '[DOMAIN]',
  email: 'aritramitra49@gmail.com',
  github: '[GITHUB_URL]',
  linkedin: '',
  role: 'Game + Immersive Designer',
  programme: 'BDes Immersive Digital Environments · O.P. Jindal Global University · Class of 2028',
};

export const NAV = [
  { label: 'Work', href: '/work/' },
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
