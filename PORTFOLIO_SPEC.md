# Aritra Mitra — Portfolio: Information Architecture + Design System

> **Hand-off spec for Claude Code.** Read this whole file before writing code.
> Put it in the repo root as `PORTFOLIO_SPEC.md` and add one line to `CLAUDE.md`:
> `Follow PORTFOLIO_SPEC.md for all structure, URLs, content and styling decisions.`
> Anything marked **(CONFIRM)** is an unanswered question. Do not invent values for it. Leave a clearly marked placeholder and list it in `OPEN_ITEMS.md`.

---

## 0. Project in one paragraph

A permanent, GitHub-hosted portfolio for **Aritra Mitra** (BDes, Immersive Digital Environments — **IDE**, O.P. Jindal Global University, expected graduation May 2028). A QR code printed on his visiting cards (first used at **IGDC, Chennai**) opens the **home page**. From home a visitor can **play Tiger Run**, **view/download the resume**, and **browse year-on-year work**. The QR is printed once and must work for years, so URL stability matters more than any other requirement.

**Audience:** game studios, XR/immersive studios, UX/product teams, internship recruiters, faculty. Most first visits come from a phone, standing in a conference hall.

---

## 1. Non-negotiable rules

1. **The QR points to the home URL only** (`https://<DOMAIN>/`). It never points at a game, a repo, a PDF or an artifact link. **(CONFIRM: final domain.)**
2. **Contract URLs never change** (see §4.1). If a page moves, leave a redirect forever.
3. **Static site on GitHub Pages**, custom domain via `CNAME`. No server, no database, no login.
4. **Year-on-year structure:** each academic year is a folder. Adding a year never edits an old year.
5. **Tiger Run lives under the same domain** at `/play/` (see §9). The claude.ai artifact link is a temporary fallback only and must not be printed or linked once the domain is live.
6. **Mobile first.** Design at 360 px width first. The home page must be usable on 4G within ~2 seconds.
7. **Honesty on research data.** The SoleSync survey and interviews are **simulated for coursework**. Every page that shows those numbers must say so, close to the numbers (see §6.2).
8. **No personal identifiers on the public site:** no student ID, no phone number, no home address, no date of birth. Contact = email + public profile links only.
9. **Never commit files over 50 MB.** Heavy media goes to video hosting or compressed exports (see §8).

---

## 2. Tech decisions

| Area | Decision | Notes |
|---|---|---|
| Framework | **Astro** (static output) with Markdown/MDX content collections | Good fit for year-on-year Markdown content. If Claude Code prefers plain HTML/11ty, that's acceptable as long as every URL in §4 is produced exactly. |
| Hosting | GitHub Pages + custom domain | `CNAME` file in `public/`. |
| Styling | Plain CSS with custom properties (tokens in §10). No UI framework | Keep the pixel-art identity crisp. |
| Fonts | **Self-host** Press Start 2P, Silkscreen, Atkinson Hyperlegible (all OFL, from Google Fonts) | Avoid third-party font requests; faster and private. |
| Images | WebP/AVIF with width/height attributes, `loading="lazy"` except hero | Source max 2400 px wide. |
| Video | Unlisted YouTube/Vimeo embeds with a poster image (click to load) | Not stored in git. |
| Analytics | Optional, privacy-friendly only (Plausible/GoatCounter). No cookie banner needed | **(CONFIRM)** |
| Game | Tiger Run is a self-contained static page under `/play/` | See §9. |

### 2.1 Repository layout

```
/
├─ PORTFOLIO_SPEC.md          # this file
├─ OPEN_ITEMS.md              # unanswered (CONFIRM) questions
├─ CLAUDE.md                  # points at PORTFOLIO_SPEC.md
├─ public/
│  ├─ CNAME                   # custom domain
│  ├─ robots.txt, favicon.svg, og/default.png
│  ├─ resume.pdf              # ALWAYS the latest resume (contract URL)
│  ├─ resume/archive/         # dated copies: 2026-10.pdf, ...
│  ├─ fonts/                  # self-hosted woff2
│  └─ play/                   # Tiger Run build (see §9)
├─ src/
│  ├─ styles/tokens.css, base.css, components.css
│  ├─ components/             # HUD, Panel, MenuList, LevelCard, BrickFooter, Sprite...
│  ├─ layouts/Base.astro, CaseStudy.astro
│  ├─ content/
│  │  ├─ work/                # one .md per case study (schema in §5.3)
│  │  ├─ years/               # one .md per year/semester summary
│  │  └─ pages/               # about, etc.
│  └─ pages/                  # routes in §4
├─ assets/                    # SOURCE media (not deployed), processed by scripts
└─ scripts/                   # compress-images.sh, compress-pdf.sh, compress-video.sh
```

---

## 3. About Aritra (facts you may use)

- **Name:** Aritra Mitra. **Programme:** Bachelor of Design, **Immersive Digital Environments (IDE)**, O.P. Jindal Global University. Class of **2028** (expected May 2028).
- **Positioning line (draft):** "Game + immersive designer." Keep it short. **(CONFIRM wording.)**
- **Tools evidenced in his files** (list only what he confirms): Maya, Blender, SketchUp, AutoCAD, Unreal Engine, Marmoset Toolbag, Substance-style node texturing, Figma, Google Stitch, Procreate. **(CONFIRM each.)**
- **Origin of Tiger Run:** a Grade 10 IGCSE illustration (drawn in Procreate on iPad) about wildlife conservation in India, a tiger running a poacher's gauntlet, later turned into a playable endless-runner proof of concept.
- **Contact:** `[EMAIL]` **(CONFIRM)**, GitHub `[USERNAME]` **(CONFIRM)**, LinkedIn `[URL]` **(CONFIRM, optional)**.

---

## 4. Information architecture

### 4.1 Sitemap and contract URLs

```
/                         HOME — game-style menu (QR lands here)         [CONTRACT]
├─ /play/                 Tiger Run (playable) + making-of               [CONTRACT]
├─ /work/                 All case studies, filterable                   [CONTRACT]
│  └─ /work/<slug>/       One case study (template §5.2)
├─ /years/                Year-by-year index                             [CONTRACT]
│  ├─ /years/2024-25/     Year 1 (Semesters 1–2)  "Foundations"
│  ├─ /years/2025-26/     Year 2 (Semesters 3–4)
│  └─ /years/2026-27/     Year 3 (Semester 5 →)   (add /2027-28/ later)
├─ /resume/               Resume (HTML view + download button)           [CONTRACT]
│  └─ /resume.pdf         Always-latest PDF                              [CONTRACT]
├─ /about/                Short bio, approach, how to hire/contact
├─ /contact/              Email + links
└─ /404                   "GAME OVER — CONTINUE?" page that links home
```

**Rules**
- Case-study slugs are lowercase-kebab and **permanent**: `tiger-run`, `solesync`, `spatial-narrative-environment`, `lighting-progression`, `stuff-and-space`, `attendance-portal`.
- Year URLs use `YYYY-YY` (e.g. `2026-27`).
- Any rename = keep the old path as a redirect page (`<meta http-equiv="refresh">` + canonical link) forever.

### 4.2 Navigation

- **Desktop:** a HUD top bar. Left: `PLAYER 1` + name (links home). Centre/right: `WORK · YEARS · PLAY · RESUME · ABOUT`. A decorative row of 3 hearts (aria-hidden).
- **Mobile:** HUD shows name + a `MENU` pill. The pill opens a full-screen menu listing the same items as large tappable rows (min 56 px tall) with the pink arrow cursor.
- **Footer:** the brick strip (§10.6), email, GitHub link, "© Aritra Mitra".
- **Continuity with the printed card:** the card's back lists three options. The home page uses **exactly the same labels and order**:
  1. `PLAY TIGER RUN` → `/play/`
  2. `VIEW RESUME` → `/resume/`
  3. `YEAR BY YEAR WORK` → `/years/`

### 4.3 Page specs

#### Home `/`
Purpose: in 5 seconds, say who he is and put three clear options on screen.
Blocks, in order:
1. HUD bar (§10.5).
2. **Title panel** (neon-mint frame): `ARITRA MITRA` (display font, pink), role line `GAME + IMMERSIVE DESIGNER`, programme line `BDES IMMERSIVE DIGITAL ENVIRONMENTS · O.P. JINDAL GLOBAL UNIVERSITY · CLASS OF 2028`.
3. **Three menu buttons** (the card's three options), full width on mobile.
4. **Featured work** — 4 `LevelCard`s (order in §6.1): Tiger Run, SoleSync, Spatial Narrative, Lighting Progression.
5. **Year-by-year strip** — three chips: `YEAR 1 · 2024–25`, `YEAR 2 · 2025–26`, `YEAR 3 · 2026–27`.
6. Contact line + footer.
Hero sprite and tree stand on the brick strip at the bottom of the first screen on desktop; on mobile show the hero only, small.

#### Play `/play/`
Purpose: the game, instantly playable, plus its story.
- Game frame (the "cartridge"): Tiger Run is full-bleed inside a framed panel; a `← HOME` link sits above it. Mobile = fullscreen button.
- Below: "Making of": the Grade 10 illustration → HUD/art direction → mechanics (survival, hunting for stamina, distance score, conservation rescues) → what I'd build next. Use the facts in §6.3 only.
- Controls card. Known limitations. Link to source on GitHub.

#### Work `/work/`
- Grid of `LevelCard`s, 1 column on mobile, 2 on tablet, 3 on desktop.
- Filter chips (client-side, no page reload): `ALL · GAME + ENVIRONMENT · UX + SYSTEMS · MOTION + LIGHTING`, plus a year filter.
- Each card: thumbnail, title, one-line outcome, tags, year/semester badge (`Y2 · S4`).
- **Featured** items are pinned first in the order of §6.1.

#### Case study `/work/<slug>/`
Template in §5.2. Always shows: course, semester, tools, role, what's real vs simulated.

#### Years `/years/` and `/years/<YYYY-YY>/`
- `/years/`: three large "save slots" (Year 1/2/3), each listing semesters, project count and 2–3 thumbnails. A greyed-out "Year 4 — coming" slot is allowed.
- `/years/<YYYY-YY>/`: a short year summary (what I learned, what changed), then each **semester → topic** group with links to case studies or archive items. Archive items (not full case studies) show title, course, one image, and a link to the file/video.
- The page ends with `NEXT YEAR →` / `← PREVIOUS YEAR`.
- **Mapping source of truth:** §7.

#### Resume `/resume/`
- Clean HTML version (print-friendly) with a prominent `DOWNLOAD PDF` button → `/resume.pdf`.
- "Last updated: <month year>" shown. Details in §11.

#### About `/about/`
- 120–180 words: who he is, how he works (research → prototype → critique → iterate), what he's looking for (internships in game design, immersive environments, UX). **(CONFIRM copy with Aritra.)**
- Programme facts, tools (confirmed only), a small `PLAYER STATS` panel (decorative, honest: tools + areas, no fake percentages).

#### Contact `/contact/`
- Email (mailto), GitHub, LinkedIn if provided. No form (no backend).

#### 404
- `GAME OVER`, `CONTINUE? ▶ HOME`.

---

## 5. Content model

### 5.1 Taxonomy
- **Discipline tags:** `game-environment`, `ux-systems`, `motion-lighting`, `foundations`, `research-writing`.
- **Year:** `2024-25`, `2025-26`, `2026-27`.
- **Semester:** `S1`…`S6`.
- **Status:** `featured` | `standard` | `archive`.

### 5.2 Case-study template (`/work/<slug>/`)
1. **Header:** title, one-sentence outcome, year/semester badge, course name, tools, role, duration. Hero image.
2. **At a glance (3 bullets):** the problem, what I did, what happened.
3. **Context:** brief or prompt, constraints.
4. **Process:** 3–6 steps, each with one image/diagram and 2–4 sentences. Show iterations and critique, not only finals.
5. **Outcome:** final visuals, what worked, measurable result if honest.
6. **Reflection:** what I'd change, what I learned.
7. **Evidence & honesty box:** what's real, what's simulated, what AI generated (if relevant).
8. **Links:** live demo, Figma, source, PDF deck.
9. **Next / previous case study.**

### 5.3 Frontmatter schema (`src/content/work/*.md`)
```yaml
title: "SoleSync"
slug: "solesync"                 # permanent
oneLiner: "Sneaker marketplace + at-home care service, designed from research to AI-assisted prototype."
year: "2026-27"                  # year of final work
semesters: ["S4", "S5"]
course: "User-Centred Design; Human-AI Design"   # confirm exact course titles
disciplines: ["ux-systems"]
status: "featured"               # featured | standard | archive
tools: ["Figma", "Google Stitch", "Markdown briefs"]
role: "Researcher and designer (solo)"           # confirm
hero: "/img/work/solesync/hero.webp"
gallery: ["..."]
links: { figma: "", deck: "", live: "", source: "" }
simulatedData: true              # renders the honesty banner
order: 2                         # featured ordering
```

---

## 6. Featured case studies (content briefs)

### 6.1 Featured order (homepage and `/work/`)
1. **Tiger Run** (game)
2. **SoleSync** (UX + systems, AI-assisted design)
3. **Spatial Narrative and Environment Design** (game/environment art)
4. **Lighting Progression** (photo study → Unreal)
Then: Stuff and Space, Attendance Portal, Texture/Material, Motion Graphics, Doom and Quake research, Foundations archive.

### 6.2 SoleSync (source: Drive `SEM4/UserCenteredDesign` and `SEM5/HumanAiDesign`)
**Files:** `SoleSync_UCD_Analysis.pptx`, `DesignPitch_AritraMitra.pptx` (Stage 1), `SoleSync_Stage2_AritraMitra.pptx` (Stage 2).
**Story (facts from his decks):**
- Problem: buying and caring for sneakers in India has a **trust gap** — "Is it real? Is it fair? Will I ruin it?"
- Concept: a fair-price verified shop + on-call at-home care + a "Sneaker Passport" (authenticity, price, care history).
- Stage 1: pitch, mixed-methods research (desk research, ecosystem audit, survey n = 120, 8 interviews), 5 patterns → 5 insights → 4 design principles (Prove it; Price with logic; Teach, then step back; Care is ownership).
- Stage 2: wrote a 17-section Markdown design brief, prompted Google Stitch, ran **3 iterations**, critiqued each against research, heuristics, cognitive load, accessibility, AI behaviour and content, then revised. Traceability table: 4 of 5 insights fully met, 1 partly (AI material scan still to add as step 1).
- UCD analysis deck: information architecture, journeys, task flows, interaction states, system logic, service blueprint; 30+ screen Figma prototype, 3 rounds of testing noted.
- Reflection: "Designing with AI, not through AI" — AI is fast, critique is the real design work.
**Best slides to reuse** (slide numbers in his decks): Stage 1: 3, 7, 18, 20, 25. Stage 2: 3, 9, 15, 18, 19–20. UCD deck: the IA slide and the service blueprint slide.
**Honesty banner (mandatory, text):** "Survey and interview data in this project were **simulated for coursework**. Market figures come from published sources." Show it above any chart or percentage and in the evidence box.
**Do not claim:** real users, real sales, a launched product, or measured results.
**Figma links in his decks (verify sharing before publishing):**
- SoleSync UI: `https://www.figma.com/design/NbAtIGIQgV4NuikdgAxVhM/SoleSync-%E2%80%93-Sneaker-App-UI-Workflow`

### 6.3 Tiger Run (source: live build, §9; plus `areas` notes)
**Facts:** endless-runner proof of concept adapted from Aritra's Grade 10 tiger/poaching illustration; wildlife-conservation theme set in India; Procreate-drawn art direction preserved (yellow pill HUD, forest green ground); core loops: **survival** (poachers, snares, traps), **hunting** (prey restores stamina), **distance score**, **conservation** (rescue cubs, restore habitat); mobile-friendly canvas game, saves best score locally.
**Case-study angles:** from illustration to game; HUD as brand; designing for one-thumb play; what was cut.
**Do not claim:** anything not in the build (e.g., multiplayer, levels) unless Aritra confirms.

### 6.4 Spatial Narrative and Environment Design (source: `SEM4/EnvironmentDesign`)
Sections in his PDF: Concept and Narrative → Final Modelling → Texturing Process → Final Renders (Marmoset-style `tbrender_Viewport` images). The PDF is image-only, so **narrative text must be written by Aritra (CONFIRM)**. Use his three best renders as hero + gallery.

### 6.5 Lighting Progression (source: `SEM3/LightingForImmersive`, `SEM5/AdvancedLighting`)
- S3: photo study of natural/artificial, interior/exterior lighting (front lit, side lit, backlit/silhouette, falloff, LED, signage, stadium lights) with learnings: natural light needs patience; artificial is controllable; direction changes mood.
- S5: Unreal Engine high-res screenshots (Sept 2026).
- Frame as a **growth story**: observe real light → recreate light in engine.

### 6.6 Other items (standard or archive)
- **Stuff and Space (S3):** Maya forest environment, moon asset with texture, whirlpool animation and fog particles; storyboard + moodboard.
- **Attendance Portal (S4):** app concept with 5-layer anti-cheating (expiring code, geofence, device binding, session window, anomaly detection), student/faculty/admin journeys, Figma links in deck (verify).
- **Material/Texture (S4):** node-based texture assignment (directional warp, noise/levels, blend, tile sampler, normals, gradient map).
- **Motion Graphics (S4):** `Assignment1_MotionGraphics.mp4`, `Assignment3_1.mp4`, Maya file.
- **Doom and Quake research (S3):** "Impact of Doom and Quake on PC gaming graphics" (pixel-arcade deck; **the visual source of this site's style**).
- **Foundations (Y1):** perspective drawing, School of Athens analysis, photo essay, gig-economy research decks, Kolkata, House modelling project (SketchUp/Blender/AutoCAD), Year-1 jury presentation.

---

## 7. Drive → year/semester/topic map (source of truth)

Drive root folder: **`JSAA_Work`** → `SEM1`…`SEM5`. Years follow the calendar: Aritra started in 2024.

| Year | Sem | Drive topic folder | Key files seen | Portfolio treatment |
|---|---|---|---|---|
| **2024-25** | S1 | `Graphics` | (not reviewed) | Foundations archive **(CONFIRM contents)** |
| | S1 | `PerspectiveDraw` | PROJECTION DRAWING Assignment 1 Module 1 (.pptx/.pdf) | Archive item |
| | S1 | `PoliticsofRep` | School of Athens.pptx (24 MB) | Archive item (research-writing) |
| | S1 | `FreshmenWriting` | AritraMitra_PhotoEssay (.pdf) | Archive item |
| | S1 | `DigitalSkills` | (not reviewed) | Archive **(CONFIRM)** |
| | S2 | `DigitalSkills2` | House project: SketchUp, Blender chair, texture images, `FinalAssignment_HouseVideoRender.mp4` (228 MB), `Digital Portfolio.pptx` (28 MB), final assignment docx | **Case study candidate: "House" (modelling → render)** |
| | S2 | `IDEForensic` | `JuryPresentationYear1Sem2_AritraMitra.pptx` (**205 MB**), images, video | Recompress; pick best slides (§8) |
| | S2 | `BuiltEnv` | Built Environments as Forms of Control; final exam docx | Archive (research-writing) |
| | S2 | `Freshman2` | Architecture as Pedagogy; AI – Contested Technology; Kolkata.pptx; end-term docs | Archive (research-writing) |
| | S2 | `WhatisResearch` | Gig-economy decks and essays (Future of Work, algorithms and employment, OTT creative workers) | Archive (research-writing) |
| **2025-26** | S3 | `LightingForImmersive` | LIGHTING FOR IMMERSIVE ENVIRONMENTS.pptx; larger version 28 MB | **Featured: Lighting Progression** |
| | S3 | Immersive Environments topic | Immersive Environments Presentation.pptx (Doom/Quake), Assignment 1 PDF, business operations report, sofa/coffee-table Maya files, spatial-audio PDF | Doom/Quake = standard; rest archive |
| | S3 | Stuff and Space topic | `AritraMitra_StuffandSpacePortfolio.pptx`, MOOOOON.blend, trees.mb, forest .skb | **Standard case study** |
| | S3 | Creative Programming topic | Assignment 1 (Painting), Assignment 2 (Interactive Game) docx | Archive; **link to Tiger Run lineage if relevant (CONFIRM)** |
| | S4 | `UserCenteredDesign` | UCD_Assignment1.pptx (17 MB), SoleSync_UCD_Analysis.pptx, Attendance_Portal_UCD.pptx, SystemDesign_Final.pdf | **Featured: SoleSync (part); Attendance Portal standard** |
| | S4 | `EnvironmentDesign` | Spatial Narrative and Environment Design (PDF, 31 MB), 6 renders | **Featured** |
| | S4 | `MaterialTextureDesign` | Assignment.pptx, Assignment 3 – Texture Creation.pptx | Standard |
| | S4 | `Motiongraphics` | Assignment1_MotionGraphics.mp4, Assignment2Maya.mb, Assignment3_1.mp4 | Reel page |
| **2026-27** | S5 | `HumanAiDesign` | DesignPitch_AritraMitra.pptx (SoleSync Stage 1), SoleSync_Stage2_AritraMitra.pptx | **Featured: SoleSync (part)** |
| | S5 | `AdvancedLighting` | HighresScreenshot (Unreal) PNGs | **Featured: Lighting (part)** |
| | S5 | "Use of Space" assignment | PanandTilt.MOV (205 MB), FixedFrame.MOV (336 MB) | Recompress to short clips (§8) |

> Only decks and PDFs were text-reviewed. Images and videos were **not** visually judged. Aritra must nominate his **three best images per featured project** **(CONFIRM)**.
> Other folders in the same Google account (identity documents, medical records, school undertakings) are **not part of this portfolio and must never be copied into the repo.**

---

## 8. Media and recompression plan

**Budgets:** page weight ≤ 1.5 MB on home, ≤ 3 MB on a case study (excluding lazy-loaded gallery). Single files in git ≤ 5 MB images, ≤ 10 MB PDFs. Nothing over 50 MB in git, ever.

| Source | Problem | What to do |
|---|---|---|
| `JuryPresentationYear1Sem2` (205 MB pptx) | Too large | 1) Export to PDF with LibreOffice. 2) Recompress with Ghostscript `/ebook`. 3) Aritra picks the **8–12 best slides**; export those as WebP images for the Year 1 page; offer the compressed PDF as "full jury deck". |
| Large PPTX (28 MB, 17 MB) | Heavy images inside | Same pipeline; web uses selected slides as images, not the deck. |
| `Spatial Narrative…pdf` (31 MB) | Heavy | Ghostscript `/ebook`; extract the hero pages as WebP. |
| `.mov`/`.mp4` (200–340 MB) | Heavy | Trim to the best 10–30 s, `ffmpeg` H.264 1080p CRF 23, `-movflags +faststart`; host unlisted on YouTube/Vimeo; store only a poster image in git. |
| `.mb/.blend/.skb/.dwg/.tm` (source files up to 570 MB) | Not web assets | **Do not publish.** Mention tools in the case study. Optionally offer a download on request. |
| Renders/screenshots PNG (1–4 MB each) | OK but heavy | `cwebp -q 82`, max 2400 px wide, also a 1200 px version. |

**Script sketches (put in `scripts/`):**
```bash
# PDF: shrink
gs -sDEVICE=pdfwrite -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -sOutputFile=out.pdf in.pdf
# PPTX -> PDF
soffice --headless --convert-to pdf in.pptx
# PDF page -> WebP
pdftoppm -r 150 -f 5 -l 5 -png in.pdf page && cwebp -q 82 page-05.png -o page-05.webp
# Video
ffmpeg -i in.mov -t 25 -vf "scale=-2:1080" -c:v libx264 -crf 23 -preset slow -an -movflags +faststart out.mp4
# Image
cwebp -q 82 -resize 2400 0 in.png -o out.webp
```
**Selection rule:** for each featured case study keep ≤ 10 images/slides. Choose frames that show **process and iteration**, not only finals. Every image gets alt text.

---

## 9. Consolidating Tiger Run under the portfolio domain

**Current state:** Tiger Run is a **single self-contained HTML file** (~51 KB): canvas game, `requestAnimationFrame` loop, Web Audio, `localStorage` for best score, and **Baloo 2** loaded from Google Fonts. Temporary location (claude.ai artifact):
`https://claude.ai/artifact/MTCsVbHae1SPDNdjzp1gVr`

**Plan**
1. Copy the file to `games/tiger-run/index.html` in the repo (source of truth) and build/copy to `public/play/index.html`.
2. **Self-host Baloo 2** (woff2) and point `@font-face` at `/fonts/`. Remove the Google Fonts request.
3. Namespace storage keys, e.g. `tigerrun:best`, so they never collide with the portfolio.
4. Add a small `← HOME` link (outside the canvas, top-left, safe-area aware) and `<link rel="canonical" href="https://<DOMAIN>/play/">`.
5. Add Open Graph tags + a share image (screenshot of gameplay).
6. Keep the game's own look inside `/play/` (**do not restyle it with the pixel-arcade tokens**). See §10.9 for how the two styles coexist.
7. Test: iOS Safari, Android Chrome, desktop; one-thumb play; no pinch-zoom; safe-area insets; sound only after first tap.
8. Once live, delete all printed/linked references to the artifact URL.

---

## 10. Stylization: the design system

### 10.1 Concept
**"Arcade save-screen."** The site behaves like a game's title/menu screen: a HUD at the top, a menu of choices, level cards for projects, save slots for years, a brick-and-grass ground at the bottom. It is derived from Aritra's own Doom/Quake deck (black ground, neon mint frames, hot-pink titles, indigo accents, pixel sprites) and matches his printed card exactly. It must look playful but **stay readable**: pixel fonts are for labels and headings only, never paragraphs.

### 10.2 Colour tokens
```css
:root {
  /* ground */
  --black:      #000000;   /* page background */
  --panel-bg:   #04120A;   /* very dark green tint for filled panels */
  /* neon */
  --mint:       #21EF80;   /* frames, links, success, primary accent */
  --mint-dark:  #12B862;   /* grass shading, hover shadows */
  --pink:       #FF63D8;   /* headings/titles, cursor arrow, hearts */
  --indigo:     #585EFF;   /* graphics ONLY (bricks, pills); not small text */
  --indigo-text:#7A7FFF;   /* indigo for text on black (passes AA) */
  --indigo-dark:#2E33B8;   /* brick mortar, borders on indigo */
  --yellow:     #FFD23F;   /* stars, coins, highlights */
  --white:      #FFFFFF;   /* body text */
  --muted:      #BDB6C8;   /* secondary text */
  /* Tiger Run palette (used ONLY in tiger-themed sections, see 10.9) */
  --tiger-orange:#FF9F1C; --tiger-stripe:#B34700; --tiger-cream:#FFE7C2;
  --run-pill:#F5C518; --run-ink:#171310; --run-blood:#B02A1E; --run-bone:#FFF6E2; --run-forest:#123024;
  /* focus */
  --focus: 3px solid var(--mint);
}
```
**Contrast (approx. on #000):** white 21:1, mint ~14:1, pink ~7.5:1, `--indigo-text` ~6:1, `--indigo` ~4.4:1 (**graphics only**). Never rely on colour alone to convey state.

### 10.3 Typography
| Role | Font | Use | Size |
|---|---|---|---|
| Display | **Press Start 2P** | Page titles, name, big numbers | 20–32 px mobile, up to 48 px desktop; line-height 1.2; max ~24 chars per line |
| UI label | **Silkscreen** (400/700) | Nav, chips, buttons, captions, HUD | 10–14 px, uppercase, letter-spacing 0.05–0.08em |
| Body | **Atkinson Hyperlegible** (400/700) | All paragraphs, case-study text, resume view | 18 px / 1.6 (min 16 px), max line length 68ch |

Fallbacks: `"Press Start 2P", monospace`; `"Silkscreen", monospace`; `"Atkinson Hyperlegible", system-ui, sans-serif`.
Rules: never set a paragraph in a pixel font; never set body below 16 px; pixel labels never below 10 px.

### 10.4 Spacing, shape, layout
- **Pixel unit `--u: 4px`**. Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64.
- Panels: 2 px solid border, **radius 6 px** (matches the deck's rounded neon frames). Buttons: radius 6 px, min height 48 px on touch.
- Content max width **1120 px**; page padding 16 px mobile / 32 px desktop. Breakpoints: 640, 960, 1280.
- Grid: 4 columns mobile, 8 tablet, 12 desktop; cards gap 16/24.
- Pixel art is always rendered with `image-rendering: pixelated` (raster) or as crisp-edged SVG rects.

### 10.5 Components
**HUD bar** — top of every page; sticky on desktop.
`PLAYER 1  ♥♥♥                         WORK · YEARS · PLAY · RESUME · ABOUT`
Silkscreen 10–12 px, indigo-text/white/mint. Hearts are decorative (`aria-hidden`).

**Panel** — black (or `--panel-bg`) fill, 2 px mint border, radius 6, padding 16–24. Variants: `pink` border for alerts/featured, `indigo` for info.

**Menu list** — rows with a **pink arrow cursor** sprite (5×5 pixel arrow, 2–3 px/pixel) to the left of white Silkscreen bold labels. Hover/focus: row gets mint 2 px outline, label turns mint, cursor blinks (see motion). Used for the three home options and the mobile menu.

**Button** — primary: mint fill, black text, 2 px black inner border, hard drop-shadow `0 4px 0 var(--mint-dark)`; pressed: translateY(4px), shadow 0. Secondary: transparent, mint border, mint text. Pill (`MENU`): indigo `#585EFF` fill, white bold text, radius 3.

**LevelCard** (project) — Panel containing: pixel label `LEVEL 02` (pink), title (display, mint), one-liner (body, white), tag chips (Silkscreen, indigo outline), meta `Y2 · S4` (indigo-text), thumbnail on top (16:9, 2 px border). Whole card is one link.

**SaveSlot** (year) — Panel titled `SLOT 1 · YEAR 1`, `2024–25`, semester list, project count, 2–3 mini thumbnails.

**Progress / health bar** — 12 px tall, 2 px border, mint fill; use for "year progress" or load states only.

**Chip** — Silkscreen 10–11 px uppercase, 2 px border (indigo), selected = mint fill/black text.

**Brick footer** — 24 px (8 rows × 3 px) strip: row 0 mint grass, row 1 dark mint, rows 2–7 indigo bricks with `--indigo-dark` mortar (brick width 6 units, alternate rows offset by 3). Repeats horizontally. Used at the bottom of the viewport on Home/404 and as the page footer.

**Sprites** — original pixel-art (no template assets). Draw as inline SVG, one `<path>` per colour, merged horizontal runs, `shape-rendering="crispEdges"`. Maps in Appendix A. Use sparingly: Home hero, 404, section dividers, loading.

**Honesty box** — Panel with pink border and label `DATA NOTE`. Required on SoleSync/any simulated-data page.

### 10.6 Page wireframes (mobile, schematic)
```
HOME                              CASE STUDY
┌─────────────────────────┐       ┌─────────────────────────┐
│ PLAYER 1 ♥♥♥     [MENU] │       │ ← WORK      Y2 · S4     │
│ ┌─────────────────────┐ │       │ SOLESYNC (display)      │
│ │ ARITRA MITRA        │ │       │ one-line outcome        │
│ │ GAME + IMMERSIVE…   │ │       │ [hero image]            │
│ └─────────────────────┘ │       │ AT A GLANCE ▸▸▸         │
│ ▸ PLAY TIGER RUN        │       │ ┌ DATA NOTE ──────────┐ │
│ ▸ VIEW RESUME           │       │ │ simulated for…      │ │
│ ▸ YEAR BY YEAR WORK     │       │ └─────────────────────┘ │
│ FEATURED                │       │ PROCESS 1..n (img+text) │
│ [LEVEL 01 Tiger Run]    │       │ OUTCOME · REFLECTION    │
│ [LEVEL 02 SoleSync]     │       │ LINKS · PREV / NEXT     │
│ …                       │       │ ▓▓▓ brick footer ▓▓▓    │
│ ▓▓▓ brick strip ▓▓▓     │       └─────────────────────────┘
└─────────────────────────┘
```

### 10.7 Motion
- Pixel feel: use `steps()` timing, e.g. `animation: blink 1s steps(2) infinite` for `PRESS START` and the cursor arrow.
- Page transitions: none or a 150 ms fade. No parallax, no long loaders.
- Hover: hard shadow shift (no soft blur).
- **Respect `prefers-reduced-motion: reduce`**: disable blinking and transitions entirely.

### 10.8 Accessibility (required)
- WCAG 2.2 AA minimum. Visible focus ring (`--focus`) on every interactive element; skip-to-content link; logical heading order (one `h1` per page); semantic landmarks.
- All interactive targets ≥ 44×44 px. Menu fully keyboard operable (arrows optional, Tab required).
- Decorative sprites `aria-hidden="true"`; meaningful images have alt text; videos have captions or a transcript/summary.
- Language `en`. No text embedded in images without alt equivalent.
- Pixel fonts: text content must be reachable as real text (no text-as-image).

### 10.9 Two visual layers: site vs Tiger Run
Aritra's illustrated, Procreate-style Tiger Run identity (Baloo 2, yellow HUD pills, forest green) is **different** from the pixel-arcade site identity. This is intentional:
- **Site shell = pixel arcade.** Everything outside the game uses §10.2–10.5.
- **Inside `/play/` the game keeps its own look.** The shell frames it like a **cartridge**: a mint-bordered panel around the game, with the pixel HUD above it.
- In the "Making of" section, show the original illustration and the HUD in **their own colours** (don't recolour them to mint/pink). Use the `--run-*` and `--tiger-*` tokens only for tiger-themed illustrations and the tiger sprite.
- The pixel tiger sprite (Appendix A) is the **bridge** between the two layers; use it as the Tiger Run `LevelCard` icon.

### 10.10 Tone of voice
Short, concrete, first person. Gaming metaphors only in **labels** (levels, slots, menu), never in explanations of research or process. No buzzwords. Say what was real and what was simulated.

### 10.11 Print continuity (visiting card)
The card (90×50 mm trim + 3 mm bleed) uses the same tokens, fonts and sprites. Front = title screen (`PLAYER 1`, name, role, programme, hero on bricks, `PRESS START — FLIP THE CARD`). Back = menu screen: `PORTFOLIO` panel listing `PLAY TIGER RUN / VIEW RESUME / YEAR BY YEAR WORK`, QR → home, `SCAN TO ENTER`. If tokens change here, update the card files. Existing files: `Aritra_IGDC_Card_PROOF_v2.pdf` (placeholder QR, **do not print as is**) and the vector canvas.

---

## 11. Resume (new)

**Decision:** build a new resume. Single source of truth = `src/content/resume.yaml`; generate (a) the `/resume/` HTML view and (b) `/resume.pdf` from it, so they never drift.

**PDF rules:** A4, one page (two only if truly needed), single column, ATS-friendly (real text, no tables for layout, no images of text), 10–11 pt body in **Atkinson Hyperlegible**, headings in Silkscreen/Press Start 2P **sparingly** (name + section labels only), mint/pink only as small accents, strong black-on-white contrast (print-friendly: white background, not the black site theme).

**Sections:** Header (name, role line, email, portfolio URL, GitHub) · Profile (2–3 lines) · Education (BDes, Immersive Digital Environments, O.P. Jindal Global University, Aug 2024 – May 2028 expected) · Selected projects (Tiger Run, SoleSync, Spatial Narrative & Environment Design, Lighting) with 1–2 outcome lines each · Skills & tools (confirmed only) · Coursework highlights (optional) · Languages / interests (optional).
**Do not include:** student ID, phone, address, date of birth, photo.
**Content to collect (CONFIRM):** contact details, tools list, any awards/clubs/volunteering, languages, whether to list SoleSync as "simulated research".
**Fixed paths:** latest = `/resume.pdf`; archive = `/resume/archive/YYYY-MM.pdf`.

---

## 12. Build phases

**Phase 0 — ready before IGDC (static MVP):**
Home (3 options, 4 featured), `/play/` (Tiger Run consolidated), `/resume/` (page + PDF download once content is confirmed), `/work/` with **Tiger Run + SoleSync** complete, `/years/` index with the three slots, `/about`, `/contact`, 404, `CNAME`, sitemap, OG images. Real QR generated **after** the domain resolves, tested from a printed proof.
**Phase 1:** Spatial Narrative + Lighting case studies; year pages with archive items; compressed deck/video pipeline.
**Phase 2:** remaining case studies, Foundations archive, Reel page, accessibility audit, Lighthouse pass.
**Phase 3 (each new semester):** add semester items to the current year page; at each new academic year add `/years/<YYYY-YY>/` and a resume refresh.

### 12.1 Acceptance criteria
- `https://<DOMAIN>/` loads in ≤ 2 s on throttled 4G; Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95.
- Every contract URL in §4.1 returns 200; `/resume.pdf` downloads.
- QR scan from a **printed** proof opens home on iPhone and Android.
- Tiger Run runs on iOS Safari and Android Chrome with sound after first tap and best-score persistence.
- No page contains the student ID, phone, address or a claude.ai artifact link.
- Every simulated-data page shows the DATA NOTE.
- Keyboard-only walkthrough of Home → Work → a case study → Resume works.

---

## 13. Open items (answer these and fill the placeholders)

1. **Domain** (`<DOMAIN>`) and GitHub username/repo. (Blocks the QR.)
2. **Contact email** for card, site and resume; LinkedIn/other profiles.
3. **Role line wording** ("Game + Immersive Designer") and About copy.
4. **Tools list** to publish (Maya, Blender, SketchUp, AutoCAD, Unreal, Marmoset, Substance, Figma, Google Stitch, Procreate — confirm each).
5. **Three best images/frames per featured project**, plus narrative text for Spatial Narrative.
6. **Resume content** (new resume; see §11).
7. **Exact course titles** for each project (e.g. UCD, Human-AI Design) and Aritra's role (solo?).
8. **Figma links** in his decks: confirm they are public before linking.
9. Contents of Year-1 folders `Graphics` and `DigitalSkills` (not reviewed).
10. Analytics: yes/no.

---

## Appendix A — Sprites (original pixel art)

Render each map as crisp SVG rects. `.` = transparent. Unit size `u` = 2–3 px (small UI) or 6–9 px (hero on Home).

**Hero (14×20)** — palette: `H` #FFD23F hair, `S` #FFB38A skin, `E` #14141F eyes, `M` #E0507A mouth, `T` #3DDCD0 shirt, `Y` #FFD23F belt, `P` #3B3B52 trousers, `O` #CFCFE8 shoes
```
....HHHHHH....
...HHHHHHHH...
..HHHHHHHHHH..
..HHSSSSSSHH..
..HSSSSSSSSH..
..HSEESSEESH..
..HSSSSSSSSH..
...SSSMMSSS...
....SSSSSS....
...TTTSSTTT...
..TTTTTTTTTT..
.STTTTTTTTTTS.
.STTTTTTTTTTS.
.SSTTYYYYTTSS.
...PPPPPPPP...
...PPPPPPPP...
...PPP..PPP...
...PPP..PPP...
..OOOO..OOOO..
..OOOO..OOOO..
```
**Tree (14×16)** — `G` #21EF80, `D` #12B862, `I` #585EFF
```
....GGGGGG....
..GGGGGGGGGG..
.GGGGGDGGGGGG.
GGGDGGGGGGDGGG
GGGGGGGDGGGGGG
GGDGGGGGGGGDGG
.GGGGGGGGGGGG.
..GGGDGGGGGG..
....GGGGGG....
......II......
......II......
.....III......
......II......
......II......
.....IIII.....
....IIIIII....
```
**Heart (7×6)** `R` #FF63D8
```
.RR.RR.
RRRRRRR
RRRRRRR
.RRRRR.
..RRR..
...R...
```
**Menu arrow (3×5)** `X` #FF63D8
```
X..
XX.
XXX
XX.
X..
```
**Star (5×5)** `Y` #FFD23F
```
..Y..
..Y..
YYYYY
..Y..
..Y..
```
**Tiger (running, ~24×11)** — `O` #FF9F1C, `A` #B34700 stripes, `W` #FFFFFF eyes, `N` #FF63D8 nose, `F` #FFE7C2 cream (rows are right-padded with `.`)
```
..............O..O
..............OOOOOO
..OOOOOOOOO..OOWOOWO
.OOAOOAOOAOOOOOOOOOOO
OOOAOOAOOAOOOOONNOOO
O.OOAOOAOOAOOOOFFFFF
...OOOOOOOOOOOFFFFF
...OOOOOOOOOOOOOO
...OO.OO...OO.OO
..OO..OO...OO..OO
..FF..FF...FF..FF
```
**Brick strip:** generate per §10.5 (rows: `G`, `D`, then six rows of `I` with `M` mortar: mortar rows at index 4 and 7; vertical mortar every 6 units, offset 0 for rows 2–3 and 3 for rows 5–6).

## Appendix B — Kick-off prompt for Claude Code

> Read `PORTFOLIO_SPEC.md` fully. Scaffold an Astro static site matching §2.1 and §4 exactly (all contract URLs, empty but valid pages). Implement the tokens (§10.2–10.4), self-hosted fonts, and the components in §10.5 (HUD, Panel, MenuList, Button, LevelCard, SaveSlot, Chip, BrickFooter, Sprite). Build Home, `/work/` with two placeholder case studies, `/years/` with three save slots, and 404. Do not invent content: use `[PLACEHOLDER]` and list every gap in `OPEN_ITEMS.md`. Then consolidate Tiger Run per §9 and run the acceptance checks in §12.1. Ask me before choosing anything marked (CONFIRM).

## Appendix C — Source references (for provenance)

- Pixel-arcade style source: `Immersive Environments Presentation.pptx` (Doom/Quake deck; fonts in the original: Disket Mono, Arcade Gamer, Garet; this site uses free equivalents).
- SoleSync decks: `SoleSync_UCD_Analysis.pptx`, `DesignPitch_AritraMitra.pptx`, `SoleSync_Stage2_AritraMitra.pptx`.
- Tiger Run: temporary artifact `https://claude.ai/artifact/MTCsVbHae1SPDNdjzp1gVr`.
- Card files: `Aritra_IGDC_Card_PROOF_v2.pdf`, `Aritra_IGDC_Card_Handoff_Concept.pdf`.
