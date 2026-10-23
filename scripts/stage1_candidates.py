#!/usr/bin/env python3
"""Stage 1: pull candidate images from the Drive export into contact sheets so the best can be chosen.
Reads only assets/drive/JSAA_Work; writes only assets/work/ (git-ignored). Nothing here is published."""
import hashlib, io, re, sys, zipfile
from pathlib import Path
import fitz
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'assets' / 'drive' / 'JSAA_Work'
OUT = ROOT / 'assets' / 'work'
IMG = ('.png', '.jpg', '.jpeg')

PROJECTS = {
  'spatial':  ['SEM4/EnvironmentDesign'],
  'lighting': ['SEM5/AdvancedLighting', 'SEM3/LightingForImmersive'],
  'solesync': ['SEM4/UserCenteredDesign/SoleSync_UCD_Analysis.pptx', 'SEM5/HumanAiDesign', 'SEM4/UserCenteredDesign/SystemDesign_Final.pdf'],
  'house':    ['SEM2/DigitalSkills2/FinalAssignment_RenderView', 'SEM2/DigitalSkills2/DigitalSkills_ExamFiles_AritraMitra', 'SEM2/DigitalSkills2/AritraMitra_3dsmaxAssignment.jpg'],
  'stuff':    ['SEM3/StuffandSpace'],
  'doomquake':['SEM3/ImmersiveTechnologies/Immersive Environments Presentation.pptx', 'SEM3/ImmersiveTechnologies/Screenshot 2025-10-07 235335.png'],
  'material': ['SEM4/MaterialTextureDesign', 'SEM4/SurfaceDesign'],
  'attendance':['SEM4/UserCenteredDesign/Attendance_Portal_UCD.pptx', 'SEM4/UserCenteredDesign/UCD_Assignment1.pptx'],
  'y1':       ['SEM2/DigitalSkills2/Digital Portfolio.pptx', 'SEM2/Freshman2/Kolkata.pptx', 'SEM2/IDEForensic ', 'SEM2/BuiltEnv/Assignment1pics'],
}
seen = set()

def ok(im): return im.width >= 500 and im.height >= 300

def from_pptx(p: Path):
    with zipfile.ZipFile(p) as z:
        names = set(z.namelist())
        slides = sorted((int(re.search(r'slide(\d+)\.xml', n).group(1)), n) for n in names if re.fullmatch(r'ppt/slides/slide\d+\.xml', n))
        for num, n in slides:
            rel = f'ppt/slides/_rels/slide{num}.xml.rels'
            if rel not in names: continue
            for t in re.findall(r'Target="\.\./media/([^"]+)"', z.read(rel).decode('utf8', 'ignore')):
                m = f'ppt/media/{t}'
                if m not in names or not m.lower().endswith(IMG) or z.getinfo(m).file_size < 40_000: continue
                data = z.read(m); h = hashlib.md5(data).hexdigest()
                if h in seen: continue
                try: im = Image.open(io.BytesIO(data)); im.load()
                except Exception: continue
                if not ok(im): continue
                seen.add(h); yield f'{p.stem[:18]} s{num}', im

def from_pdf(p: Path, limit=36):
    doc = fitz.open(p)
    for i in range(min(len(doc), limit)):
        pix = doc[i].get_pixmap(dpi=48)
        yield f'{p.stem[:18]} p{i+1}', Image.open(io.BytesIO(pix.tobytes('png')))

def from_img(p: Path):
    try: im = Image.open(p); im.load()
    except Exception: return
    if ok(im): yield p.stem[:22], im

def gather(rel):
    base = SRC / rel
    files = [base] if base.is_file() else sorted(base.rglob('*'))
    for f in files:
        if not f.is_file() or f.name.startswith('.'): continue
        s = f.suffix.lower()
        try:
            if s == '.pptx': yield from ((f'{f.parent.name[:10]}/{l}', im) for l, im in from_pptx(f))
            elif s == '.pdf': yield from ((f'{f.parent.name[:10]}/{l}', im) for l, im in from_pdf(f))
            elif s in IMG: yield from ((f'{f.parent.name[:10]}/{l}', im) for l, im in from_img(f))
        except Exception as e: print('  skip', f.name, e)

def sheet(key, items):
    if not items: return
    T, cols, per = 300, 5, 20
    for part in range(0, len(items), per):
        chunk = items[part:part + per]; rows = (len(chunk) + cols - 1) // cols
        sh = Image.new('RGB', (cols * T, rows * (T * 3 // 4 + 28)), (20, 20, 20)); d = ImageDraw.Draw(sh)
        for i, (idx, label, im) in enumerate(chunk):
            t = im.convert('RGB'); t.thumbnail((T - 6, T * 3 // 4 - 4))
            x, y = (i % cols) * T + 3, (i // cols) * (T * 3 // 4 + 28)
            sh.paste(t, (x, y + 24)); d.text((x, y + 4), f'#{idx} {label}'[:46], fill=(255, 255, 0))
        (OUT / key).mkdir(parents=True, exist_ok=True)
        sh.save(OUT / key / f'sheet{part // per + 1}.jpg', quality=70)

only = sys.argv[1:] or PROJECTS.keys()
for key in only:
    print('==', key); items = []
    cache = OUT / key / 'cands'; cache.mkdir(parents=True, exist_ok=True)
    for rel in PROJECTS[key]:
        for label, im in gather(rel):
            if len(items) >= 80: break
            idx = len(items); items.append((idx, label, im))
            im.convert('RGB').save(cache / f'{idx:03d}.jpg', quality=85)   # full-res kept locally for stage 2
    print(f'  {len(items)} candidates'); sheet(key, items)
    (OUT / key / 'labels.txt').write_text('\n'.join(f'{i}\t{l}\t{im.width}x{im.height}' for i, l, im in items))
