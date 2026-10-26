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

## Photos (2026-10-23)
- About: round portrait at the Jindal School of Art & Architecture sign (`assets/photos/portrait.jpg`, cropped so the sign reads).
- Year 1 "Starting point · May 2024": two VR-lab photos (`vr-lab-*.jpg`). The May 2024 date comes from the photos' camera metadata. **Confirm** the date, that the person in the headset is OK to show (if it is a classmate, get consent), and the caption wording.
- Masking is CSS (square WebP crops, `border-radius: 50%`); crops are defined in `scripts/stage2_publish.py` (PHOTOS).

## Doom and Quake report (2026-10-23)
- Promoted to a featured case study (`/work/doom-and-quake/`, 5th on the home page) from `SEM3/ImmersiveTechnologies/Immersive Environments Presentation.pptx`; text summarised from its slides 1-8, images pulled from the deck (centre-cropped Doom | Quake pair + three screenshots). Screenshots are © id Software and shown small with a credit line; the Carmack/Romero photo and id logo were left out.
- The 8.8 MB .pptx itself is not published (over the 4 MB budget); no PDF export because this Mac has no LibreOffice. Export a PDF from Drive/PowerPoint if a "full deck" link is wanted.
- Consider adding this report to the résumé (it is the visual origin of the site's style).
- Origin banner: the report's Introduction slide, cropped to its text-only part (the Carmack/Romero photo and id logo are cut out). Shown on About and first in the report's gallery; all link to `/work/doom-and-quake/`. Source: `assets/photos/intro-slide.webp`, crop in `scripts/stage2_publish.py`.

## Hidden level (2026-10-23, revised)
- The footer is the original design again (Aritra autoruns the strip, hops the pipes, reaches the flag). **Clicking the strip silently opens the hidden game**: there is no hint, label or button on purpose, so it stays an easter egg (a side effect: it is not keyboard- or screen-reader-discoverable).
- The game (`site/src/scripts/level.ts`, modal in `site/src/components/BrickFooter.astro`): get Aritra his internship. Faster, snappier movement (top speed 140, instant turns, jump buffer and ledge grace), a plain dark background, coins, bricks and ? blocks, a mushroom ("SKILL UP!"), cacti and chomping plants, a flag, then the wizard's tower: the wizard hands Aritra an internship scroll and a quiet "LEVEL CLEAR" strip appears under the canvas with a Say hello link and Play again (no wizard text or big card: the scene itself tells the story). Timer 120 s, so a run never lasts more than 2 minutes; a clean run takes about 25 to 60 s.
- Verified in a test build: the autopilot clears it with all lives; mushroom, brick bump and shrink-on-hit were checked by script. Not verified by hand: how it feels on a real keyboard or phone, and sound. Tune MAXV, JUMP_V, GRAV, TIME_LIMIT at the top of level.ts.
- All art is original pixel art in the site palette (no Nintendo assets).

## Live projects experience (2026-10-23)
- New section on `/work/` ("Live projects experience", anchor `#live`) and a case study `/work/live-project-ux-research/` (Y1, S2, January 2025), also linked from the Year 1 page. Source: the study report and protocol in Drive ("REBIT- Report_v 1.0" and the deck/report versions).
- **Anonymised on purpose:** the client, the portal, the agency, locations, participant details, all numbers (sample size, percentages, scores) and verbatim quotes are left out. Never add the project code names or file names that include the client to the site. Screens and charts from the deck must not be published.
- Aritra's roles (note-taker, observer, test participant) come from him; the description of what each role involved and "what I took away" are drafted and need his review. The scenario list, session structure and finding themes come from the report.
- The report's Background section was empty in the source; the Drive files themselves are not published.
- (Live project, update) The case study now has four in-context figures (session flow, tracker structure, research-ops loop, SUS worked example) and a "Where I made a difference" list. **They are diagrams built from real text, not images from the Drive folder:** that folder holds only decks, report versions and the SUS workbook (no standalone photos), and the decks' screens show the client's product and real participants, so none were published. The tracker rows and the SUS example answers are made up and labelled as such. Never publish the SUS workbook, the session tracker or recordings: they contain participant names, e-mails and scores.
- The ops duties (recording, logging, processing, tabulating) come from Aritra via the project owner; the "difference" bullets are drafted from the workbook's structure (tracker columns, auto-scoring formulas, daily debrief column). Aritra should confirm each.
- (Live project, update) The live UX research project is now a featured card (3rd on Home) tagged UX RESEARCH + UX + SYSTEMS + LIVE PROJECT, with an original illustration as its thumbnail (no client material). `/work/` has a search box (matches title, summary, course, tools, tags, year) plus filters including UX RESEARCH and LIVE PROJECTS (selecting it shows the "Live projects experience" note; `/work/#live` and `/work/?q=usability` deep-link). SoleSync also carries the UX RESEARCH tag. A sitemap (`/sitemap.xml`) and a robots.txt that points to it were added for search engines; they only matter once the final domain is live (robots.txt must sit at the domain root).
- (Live project photos) Four cropped photos are in the case study (participant x2, facilitating, the session room). Everyone other than Aritra is pixelated; screens, whiteboards and badge print are blocked out; originals stay in git-ignored `assets/drive/REBIT_UX_LIVEPROJECT_JAN2024/` and must never be committed. **Aritra's identification** (green hoodie = participant day, maroon hoodie = facilitating) came from the project owner. A fifth photo ("at the laptop") is parked in `scripts/stage2_publish.py`: its whiteboard heading and lanyard print were still readable after the last blur; re-add it only after re-exporting and checking. Confirm participant/colleague consent for the blurred appearances with the project owner.
- (Game update) Added poisonous bouncing turtles (5; touching one costs a life, or a hit while big shrinks him; stomping one from above kills it for +100), the flag now rises from the bottom to the top of the pole once he reaches it, and a confirmation dialog ("CONGRATULATIONS! ARITRA GOT THE INTERNSHIP!") appears in the scene (top-left) at the end. Cacti and plants behave as before: a hit costs a life (big hero shrinks first). Autopilot test: clears the level with all lives, stomping 3 of 5 turtles. Not played by hand.
- (2026-10-24 fixes) Game: bouncing turtles removed (too hard); autopilot still clears the level with all lives. Tiger Run on phones: the frame was forced wider than the screen by an aspect-ratio plus min-height; it is now a fixed responsive height (about the full screen height on phones, 640 px on desktop), and the game's overlays tighten on short or narrow screens. SoleSync: images now come from the deck files at native resolution and high quality (budget raised to ~560 KB per image for these): the Stage 2 deck's generated screens (all 3 iterations), the UI and USP screens and the process diagram embedded in `SystemDesign_Final.pdf`, and a 2x render of its concept slide. `scripts/stage2_publish.py` only reads the confidential REBIT photos when run with `--photos`.
- (Game, 2026-10-26) Pipe plants redesigned in the classic style (red head with white spots, white lips and teeth, stem with two leaves) and made dangerous: they rise taller than a jump over the pipe can clear, stay out for their whole bite (no early retreat), and only refuse to come out while Aritra stands beside the pipe; touching the head costs a life. One bouncing duck (green shell, white flapping wing, yellow head) hops in an open stretch: touching it costs a life, stomping it scores 100. Autopilot (which waits for plants to sink) clears the level with all lives; 11 of 20 blind crossings over a pipe were killed by the plant.
- (Game, 2026-10-26 b) Jump raised to about 74 px so Aritra can land on top of both brick rows (the second tier); a cactus that sat exactly where you drop off the upper bricks was moved two tiles on. Three ordinary-looking bricks are hidden multi-coin easter eggs (in the first block row, the upper brick row and the last block row): each bump pays a coin and more points than the last (100, 200, 300 ... up to 1,000), ten bumps each, then they go dark. Pipe-plant head redrawn as a round red head with white spots whose jaws open upward in a V with white lips. Autopilot still clears with all lives; a blind pipe crossing is killed by the plant about half the time.
- (Game) The bouncing duck now takes two stomps, as in the classic games: the first knocks it into its shell (+100), which keeps bouncing and sliding and still hurts if you run into it; a second stomp finishes it (+200). Script test over 40 approach attempts: 26 finished it in two stomps, 4 were hit by the bouncing shell, 9 by the duck.
