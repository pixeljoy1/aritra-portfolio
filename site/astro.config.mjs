import { defineConfig } from 'astro/config';

// Until the custom domain is live the site is served at https://<user>.github.io/<repo>/.
// With the custom domain set SITE_BASE='/' and SITE_URL to the domain (see OPEN_ITEMS #1).
export default defineConfig({
  output: 'static',
  site: process.env.SITE_URL || 'https://pixeljoy1.github.io',
  base: process.env.SITE_BASE || '/aritra-portfolio',
  trailingSlash: 'always',
  build: { format: 'directory' },
});
