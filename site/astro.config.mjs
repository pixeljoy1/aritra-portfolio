import { defineConfig } from 'astro/config';
import fs from 'node:fs';
import path from 'node:path';

// Dev only: serve public/<dir>/index.html (the Tiger Run game) for directory URLs, as GitHub Pages does.
const publicIndex = () => ({
  name: 'public-dir-index',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const url = (req.url || '').split('?')[0];
      const f = path.join(process.cwd(), 'public', url, 'index.html');
      if (url.endsWith('/') && url.length > 1 && fs.existsSync(f)) { res.setHeader('Content-Type', 'text/html'); res.end(fs.readFileSync(f)); return; }
      next();
    });
  },
});

// Until the custom domain is live the site is served at https://<user>.github.io/<repo>/.
// With the custom domain set SITE_BASE='/' and SITE_URL to the domain (see OPEN_ITEMS #1).
export default defineConfig({
  output: 'static',
  site: process.env.SITE_URL || 'https://pixeljoy1.github.io',
  // `npm run dev` serves at the root (http://localhost:4321/); builds use the GitHub Pages sub-path.
  base: process.env.SITE_BASE || (process.argv.includes('dev') ? '/' : '/aritra-portfolio'),
  trailingSlash: 'always',
  build: { format: 'directory' },
  vite: { plugins: [publicIndex()] },
});
