#!/usr/bin/env python3
"""Turn a local copy of the Drive folder JSAA_Work into web artefacts.

  python3 scripts/process_artefacts.py [assets/drive]

Input : assets/drive/**/SEM1..SEM5/<topic>/*.pdf|*.pptx  (never committed)
Output: site/public/artefacts/<year>/*.pdf|*.webp   (PDF shrunk, preview = page 1 / best slide image)
        site/src/data/artefacts.json                (read by the year pages)
Needs : pip install pymupdf pillow.  PPTX files get a preview from their embedded images only;
        for a PDF of a deck, export it from Drive (File > Download > PDF) and drop it beside the .pptx.
Rules : nothing over 10 MB is published; videos and 3D/source files are ignored (spec section 8).
"""
import io, json, re, sys, zipfile
from pathlib import Path
import fitz
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'assets' / 'drive'
OUT = ROOT / 'site' / 'public' / 'artefacts'
DATA = ROOT / 'site' / 'src' / 'data' / 'artefacts.json'
YEAR = {1: '2024-25', 2: '2024-25', 3: '2025-26', 4: '2025-26', 5: '2026-27', 6: '2026-27'}
MAX_PDF = 10 * 1024 * 1024
SKIP = re.compile(r'(identity|passport|aadhaar|aadhar|medical|undertaking|marksheet|transcript|invoice|fee)', re.I)

def slugify(s): return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')[:60] or 'file'
def webp(img: Image.Image, dest: Path, w=1200):
    img = img.convert('RGB')
    if img.width > w: img = img.resize((w, round(img.height * w / img.width)))
    dest.parent.mkdir(parents=True, exist_ok=True); img.save(dest, 'WEBP', quality=80)

def pdf_artefact(p: Path, year: str, slug: str):
    doc = fitz.open(p)
    pix = doc[0].get_pixmap(dpi=110)
    prev = OUT / year / f'{slug}.webp'
    webp(Image.open(io.BytesIO(pix.tobytes('png'))), prev)
    pdf = None
    tmp = OUT / year / f'{slug}.pdf'; tmp.parent.mkdir(parents=True, exist_ok=True)
    try: doc.rewrite_images(dpi_threshold=150, dpi_target=110, quality=70)
    except Exception: pass
    doc.save(tmp, garbage=4, deflate=True, clean=True)
    if tmp.stat().st_size <= MAX_PDF: pdf = tmp
    else: tmp.unlink(); print(f'  ! {p.name}: still >10 MB after shrinking, preview only')
    return pdf, prev, len(doc)

def pptx_preview(p: Path, year: str, slug: str):
    best = None
    with zipfile.ZipFile(p) as z:
        media = [n for n in z.namelist() if n.startswith('ppt/media/') and n.lower().endswith(('.png', '.jpg', '.jpeg'))]
        for n in media:
            info = z.getinfo(n)
            if info.file_size < 30_000: continue   # skip icons/decoration
            if best is None or info.file_size > best[1]: best = (n, info.file_size)
        if best is None: return None
        img = Image.open(io.BytesIO(z.read(best[0])))
    prev = OUT / year / f'{slug}.webp'; webp(img, prev); return prev

items = []
for p in sorted(SRC.rglob('*')):
    if p.suffix.lower() not in ('.pdf', '.pptx') or p.name.startswith('.') or SKIP.search(str(p)): continue
    m = re.search(r'SEM\s*(\d)', str(p.relative_to(SRC)), re.I)
    if not m: continue
    sem = int(m.group(1)); year = YEAR[sem]
    parts = p.relative_to(SRC).parts
    topic = next((x for x in parts[:-1] if not re.fullmatch(r'(JSAA_Work|SEM\s*\d)', x, re.I)), 'Other')
    slug = slugify(f'{sem}-{p.stem}')
    print(f'{year} S{sem} {topic}: {p.name}')
    try:
        if p.suffix.lower() == '.pdf': pdf, prev, pages = pdf_artefact(p, year, slug)
        else: pdf, prev, pages = None, pptx_preview(p, year, slug), None
    except Exception as e:
        print('  ! failed:', e); continue
    rel = lambda f: f'/artefacts/{year}/{f.name}' if f else None
    items.append({'year': year, 'semester': f'S{sem}', 'topic': topic, 'title': re.sub(r'[_]+', ' ', p.stem),
                  'pdf': rel(pdf), 'image': rel(prev), 'pages': pages})
# a deck's PDF export beside its pptx: merge into one entry
DATA.parent.mkdir(parents=True, exist_ok=True)
DATA.write_text(json.dumps(items, indent=2))
print(f'\n{len(items)} artefacts -> {DATA.relative_to(ROOT)}')
