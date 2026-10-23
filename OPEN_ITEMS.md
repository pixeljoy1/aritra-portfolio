# Open items (CONFIRM)

1. **Domain** and GitHub username/repo → `public/CNAME` (not yet created), `astro.config.mjs` `site`, `src/config.ts`, canonical tags. Blocks the QR.
2. ~~Contact email~~ (done: aritramitra49@gmail.com). Still open: GitHub URL (LinkedIn is set) → `src/config.ts` (`[EMAIL]`, `[GITHUB_URL]`).
3. **Role line** (draft "Game + Immersive Designer") and About copy → `src/pages/about`.
4. **Tools list** to publish → case-study frontmatter, About, resume.
5. **Three best images per featured project** + Spatial Narrative text.
6. ~~Resume content~~ done (2026-10, PDF in `site/public/resume.pdf`, archive copy in `resume/archive/2026-10.pdf`, text in `site/src/data/resume.json`). When the PDF changes: replace the PDF, re-render `site/public/img/resume-preview.webp`, update resume.json. **The PDF prints the github.io portfolio URL; regenerate it once the custom domain is live.** Old line: → create `src/content/resume.yaml`, generate `/resume/` and `public/resume.pdf` (not yet built; the download button currently 404s).
7. **Course titles and role** per project.
8. **Figma links**: confirm public before adding to `links`.
9. Year-1 `Graphics` and `DigitalSkills` contents.
10. **Analytics** yes/no.

## Engineering gaps
- ~~Tiger Run build~~ done: source in `games/tiger-run/index.html`, served (copy) at `/play/game/` and embedded by iframe on `/play/`. Baloo 2 self-hosted, storage key `tigerrun:best`, ← HOME link added. Still to do: share image (OG), `canonical` once the domain exists, test on real iOS Safari and Android. When editing the game, edit `games/tiger-run/index.html` then copy it to `site/public/play/game/index.html`.
- Sitemap, OG image (`/og/default.png`), `resume/archive/`, `scripts/*.sh` compress scripts, Lighthouse run: not done.
- `PORTFOLIO_SPEC.md` is a stub; paste the full spec in.

## Optional Phase 2 (ported ideas from JoyWeb2.1, not yet built)
Lightbox for case-study galleries (`previewer.js` pattern), pinned horizontal Work track on home, word-by-word contact CTA, Three.js 3-beat "approach" scene (needs Aritra's story; heavy for the 4G budget).

## Decisions (build 2)
- The claude.ai artifact link is no longer used anywhere on the site (spec §1.5).
- `/resume/` shows a placeholder window; drop the PDF at `public/resume.pdf` and it appears automatically.

## Deployment
- Live at https://pixeljoy1.github.io/aritra-portfolio/ (GitHub Pages via Actions, base path `/aritra-portfolio`).
- **Before printing the QR:** point the custom domain at Pages, add `site/public/CNAME`, and build with `SITE_BASE=/` and `SITE_URL=https://<DOMAIN>` (set as repo variables or edit `astro.config.mjs`). The github.io sub-path URL must not be printed.

## Drive artefacts (year-on-year previews)
- Pipeline ready: `python3 scripts/process_artefacts.py` reads a local copy of `JSAA_Work` from `assets/drive/` (git-ignored), writes shrunk PDFs + WebP previews to `site/public/artefacts/<year>/` and `site/src/data/artefacts.json`. Year pages and save-slot thumbnails fill in automatically.
- **Blocked on files:** the Drive connector can only return file contents as text/base64 inside the chat, which doesn't work for multi-MB decks. Download the `JSAA_Work` folder from Drive (SEM1..SEM5) into `assets/drive/`.
- PPTX previews use embedded images only (no LibreOffice/Ghostscript here). For a real PDF of a deck, export it from Drive (File > Download > PDF) next to the .pptx.
- Aritra still nominates the best slides per featured project.

## Drive artefacts: published (build 3)
- `scripts/stage1_candidates.py` (contact sheets) and `scripts/stage2_publish.py` (optimised export). Site only references `site/public/img|video`, never `assets/`. public/ is ~4.4 MB (WebP <=140 KB each, four 6 s clips <=320 KB).
- **Deliberately left out:** Lighting S3 portrait photos (identifiable classmates; need consent or crops), Doom/Quake game screenshots (third-party), brand logos, the Lamborghini ad and Ronaldo cover (third-party), `.tm/.blend/.mb` sources, full videos (upload to YouTube unlisted if wanted), the 205 MB jury deck.
- Two shrunk PDFs published (`scripts/shrink_pdfs.py`): Spatial Narrative (1.9 MB, 12 pp) and SystemDesign_Final (1.1 MB, 17 pp, covers Mobile Work Station, Attendance Portal, SoleSync). Text kept.
- Image choices were made by eye from contact sheets: Aritra should confirm the picks and alt text; run stage 2 again after editing the `SET`/`ART` lists.
- New case studies need Aritra's copy: `house`, `stuff-and-space`, `attendance-portal` (placeholders), plus SoleSync/Spatial one-liners.

## Tiger Run making-of (build 4)
- `/play/` now has a 6-step making-of. Only one concept image exists in the repo: the cropped illustration (the screenshot's prep-sheet strip showed a candidate/centre number and was cropped out; never publish those). **Needed from Aritra:** scans of Prep Sheet #2, pencil roughs and wire/layout sketches, plus the critique/next-steps text (step 06).
- The construction diagram is original, drawn from the game's own constants (camera 2.5, lanes 1.75, spawn 110, tiger 3.4, trunks 5.5).
- About page now has "Wildlife photography" (@wildscapeexplorers, featured post C4FfmW4rrDJ) and the "How this site was made" build note (coded with Claude; strategy, design and spec by Aritra). Footer links to both. Instagram links open in a new tab with noopener; no third-party embed (privacy, performance).

## Skills wording (confirmed by Aritra, 2026-10-23)
Blender and AutoCAD are **basic understanding only**: always list them as "Blender (basic)" and "AutoCAD (basic)", after the main tools. Updated in the resume PDF (patched in place; the print copy is `toPrint_/Aritra_Mitra_Resume_2026_v2.pdf`), `resume.json`, the House case study and the Year 1 page. Keep this wording in the About tools list and any future copy.

## Drafted copy for Aritra to review (2026-10-23)
All former "[PLACEHOLDER]" / "[CONFIRM]" text on the site was replaced with first-person drafts written from his résumé, decks, the game's code and the spec. They are plausible, not verified by him. Review and edit in: `About` (bio, tools), the six work files in `site/src/content/work/` (course, role, process, reflections), the three year summaries in `site/src/content/years/`, and `/play/` steps 02 and 06 (the "on paper first" and "what I would change" text). Claims were kept to intentions and facts in the build: no playtest results, metrics or awards were invented.
- Course titles: Tiger Run = "Personal project" (per résumé); others use the Drive folder / résumé names.
- GitHub links now point at the site's own repo (`pixeljoy1/aritra-portfolio`), not a personal Aritra account.
- Still needs the real thing: scans of Prep Sheet #2 and pencils (crop out any candidate/centre numbers).
