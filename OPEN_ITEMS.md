# Open items (CONFIRM)

1. **Domain** and GitHub username/repo → `public/CNAME` (not yet created), `astro.config.mjs` `site`, `src/config.ts`, canonical tags. Blocks the QR.
2. ~~Contact email~~ (done: aritramitra49@gmail.com). Still open: GitHub URL, LinkedIn → `src/config.ts` (`[EMAIL]`, `[GITHUB_URL]`).
3. **Role line** (draft "Game + Immersive Designer") and About copy → `src/pages/about`.
4. **Tools list** to publish → case-study frontmatter, About, resume.
5. **Three best images per featured project** + Spatial Narrative text.
6. **Resume content** → create `src/content/resume.yaml`, generate `/resume/` and `public/resume.pdf` (not yet built; the download button currently 404s).
7. **Course titles and role** per project.
8. **Figma links**: confirm public before adding to `links`.
9. Year-1 `Graphics` and `DigitalSkills` contents.
10. **Analytics** yes/no.

## Engineering gaps
- **Tiger Run build is not in the repo.** The claude.ai artifact couldn't be copied from here. Save it as `games/tiger-run/index.html`, then do spec §9 (self-host Baloo 2, `tigerrun:best` storage key, ← HOME link, OG tags) and serve it under `/play/`. Baloo 2 woff2 files are already in `public/fonts/`.
- Sitemap, OG image (`/og/default.png`), `resume/archive/`, `scripts/*.sh` compress scripts, Lighthouse run: not done.
- `PORTFOLIO_SPEC.md` is a stub; paste the full spec in.

## Optional Phase 2 (ported ideas from JoyWeb2.1, not yet built)
Lightbox for case-study galleries (`previewer.js` pattern), pinned horizontal Work track on home, word-by-word contact CTA, Three.js 3-beat "approach" scene (needs Aritra's story; heavy for the 4G budget).

## Decisions (build 2)
- `/play/` temporarily links to the claude.ai artifact via a launch button (claude.ai blocks iframe embedding). Remove once the domain is live; supply the game HTML to embed it properly under /play/
- `/resume/` shows a placeholder window; drop the PDF at `public/resume.pdf` and it appears automatically.

## Deployment
- Live at https://pixeljoy1.github.io/aritra-portfolio/ (GitHub Pages via Actions, base path `/aritra-portfolio`).
- **Before printing the QR:** point the custom domain at Pages, add `site/public/CNAME`, and build with `SITE_BASE=/` and `SITE_URL=https://<DOMAIN>` (set as repo variables or edit `astro.config.mjs`). The github.io sub-path URL must not be printed.

## Drive artefacts (year-on-year previews)
- Pipeline ready: `python3 scripts/process_artefacts.py` reads a local copy of `JSAA_Work` from `assets/drive/` (git-ignored), writes shrunk PDFs + WebP previews to `site/public/artefacts/<year>/` and `site/src/data/artefacts.json`. Year pages and save-slot thumbnails fill in automatically.
- **Blocked on files:** the Drive connector can only return file contents as text/base64 inside the chat, which doesn't work for multi-MB decks. Download the `JSAA_Work` folder from Drive (SEM1..SEM5) into `assets/drive/`.
- PPTX previews use embedded images only (no LibreOffice/Ghostscript here). For a real PDF of a deck, export it from Drive (File > Download > PDF) next to the .pptx.
- Aritra still nominates the best slides per featured project.
