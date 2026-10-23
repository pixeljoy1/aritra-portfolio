#!/usr/bin/env python3
"""Stage 2: publish the CHOSEN images only, optimised for the web (WebP, <=150 KB each).
Inputs : assets/work/<project>/cands (from stage 1) and a few source PDFs/videos in assets/drive.
Outputs: site/public/img/<slug>/*.webp, site/public/video/*.mp4 (6 s clips), site/src/data/media.json, artefacts.json.
The site never references assets/ (git-ignored)."""
import io, json, subprocess, shutil
from pathlib import Path
import fitz
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
W = ROOT / 'assets' / 'work'; D = ROOT / 'assets' / 'drive' / 'JSAA_Work'
PUB = ROOT / 'site' / 'public'; DATA = ROOT / 'site' / 'src' / 'data'
MAX = 140 * 1024

def save(im, dest, w):
    im = im.convert('RGB')
    if im.width > w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    for q in (80, 72, 64, 56, 48, 40, 32):
        im.save(dest, 'WEBP', quality=q, method=6)
        if dest.stat().st_size <= MAX: break
    return dest.stat().st_size

def cand(proj, i): return Image.open(W / proj / 'cands' / f'{i:03d}.jpg')
def pdfpage(rel, page, dpi=100):
    d = fitz.open(D / rel); pix = d[page - 1].get_pixmap(dpi=dpi)
    return Image.open(io.BytesIO(pix.tobytes('png')))
SD = 'SEM4/UserCenteredDesign/SystemDesign_Final.pdf'
SN = 'SEM4/EnvironmentDesign/Spatial Narrative and Environment Design (1).pdf'

# slug -> (hero, [(source, alt)])  source = ('c', project, idx) | ('p', pdf, page)
SET = {
 'spatial-narrative-environment': [
   (('c','spatial',12), 'Final render of the textured rooftop-dish building on a rocky base'),
   (('p',SN,2), 'Concept and narrative board with references and texture swatches'),
   (('p',SN,3), 'Initial blocking of the building in grey'),
   (('p',SN,4), 'Final modelling, two colour-coded views'),
   (('p',SN,5), 'Texturing process: weathered walls, crates and cage'),
   (('c','spatial',14), 'Render of the building front with crates and a rust-stained hut'),
   (('c','spatial',16), 'Close render of the wire cage and barrels against mossy walls'),
   (('c','spatial',17), 'Rooftop render with a rusted dish and vents')],
 'lighting-progression': [
   (('c','lighting',0), 'Unreal Engine night scene: a cabin on a moonlit lake'),
   (('c','lighting',1), 'Unreal Engine interior of a cabin lit in teal'),
   (('c','lighting',2), 'Unreal Engine interior with warm lamp light on a rug'),
   (('c','lighting',3), 'Moonlit cabin from a low angle'),
   (('c','lighting',4), 'Cabin exterior at night with scattered furniture'),
   (('c','lighting',5), 'Grass and cabin under a stormy sky'),
   (('c','lighting',28), 'Unreal Engine recreation of a real room with ceiling spotlights'),
   (('c','lighting',29), 'Same room in daylight')],
 'solesync': [
   (('c','solesync',2), 'SoleSync app screens: shop, product page and care flow'),
   (('c','solesync',0), 'SoleSync splash screen'),
   (('c','solesync',3), 'Stage 2 iteration: screens critiqued against research'),
   (('c','solesync',4), 'Stage 2 iteration: revised screens'),
   (('p',SD,13), 'Concept slide: SoleSync as a sneaker marketplace and care service'),
   (('p',SD,14), 'Research and design process diagram'),
   (('p',SD,15), 'USP slide with app screens'),
   (('p',SD,16), 'UI design: product, wishlist and care tracking screens')],
 'stuff-and-space': [
   (('c','stuff',6), 'Maya forest environment with a whirlpool'),
   (('c','stuff',2), 'Moodboard of dark, misty, lamp-lit scenes'),
   (('c','stuff',4), 'SketchUp layout of the forest clearing'),
   (('c','stuff',5), 'Moon asset with a cratered texture'),
   (('c','stuff',7), 'Whirlpool in the engine')],
 'attendance-portal': [
   (('c','attendance',0), 'Attendance portal sign-up screen'),
   (('p',SD,9), 'User journeys for students and professors'),
   (('p',SD,10), 'Five-layer anti-cheating system'),
   (('p',SD,8), 'Problem statement: manual attendance wastes class time')],
 'house': [
   (('c','y1',28), 'SketchUp model of a three-storey house with a roof terrace'),
   (('c','y1',9), 'Rendered house exterior with a person for scale'),
   (('c','y1',7), 'Coloured floor plan of the house'),
   (('c','y1',40), 'Rendered bedroom interior'),
   (('c','house',0), 'Final exterior render at dusk'),
   (('c','house',3), 'Final render of the living room'),
   (('c','house',4), 'Final render of the bedroom')],
}
# year-page artefacts: (year, sem, topic, title, source, work-slug or None)
ART = [
 ('2024-25','S1','Perspective + digital skills','Furniture modelling in SketchUp',('c','y1',26),None),
 ('2024-25','S2','Digital Skills 2','House: SketchUp to render',('c','y1',28),'house'),
 ('2024-25','S2','IDE Forensic','Year 1 jury presentation: Unity set and AR test',('c','y1',49),None),
 ('2024-25','S2','Built Environments','Campus architecture study',('c','y1',66),None),
 ('2025-26','S3','Lighting for Immersive Environments','Lighting progression',('c','lighting',28),'lighting-progression'),
 ('2025-26','S3','Stuff and Space','Forest environment in Maya',('c','stuff',6),'stuff-and-space'),
 ('2025-26','S3','Immersive Technologies','Sofa modelling in Maya',('c','doomquake',10),None),
 ('2025-26','S4','Environment Design','Spatial Narrative and Environment Design',('c','spatial',12),'spatial-narrative-environment'),
 ('2025-26','S4','User-Centred Design','SoleSync UCD analysis',('c','solesync',2),'solesync'),
 ('2025-26','S4','User-Centred Design','Attendance Portal',('c','attendance',0),'attendance-portal'),
 ('2025-26','S4','User-Centred Design','Integrated mobile creative station',('c','attendance',6),None),
 ('2025-26','S4','Material and Texture Design','Procedural wood and pattern textures',('c','material',0),None),
 ('2025-26','S4','Surface Design','Surface textures on cubes',('c','material',23),None),
 ('2026-27','S5','Human-AI Design','SoleSync Stage 2: AI-assisted prototype',('c','solesync',3),'solesync'),
 ('2026-27','S5','Advanced Lighting','Unreal Engine lighting studies',('c','lighting',3),'lighting-progression'),
]
VIDEOS = [  # slug, rel path, start s, year, sem, topic, title
 ('house-render','SEM2/DigitalSkills2/FinalAssignment_HouseVideoRender.mp4',20,'2024-25','S2','Digital Skills 2','House walkthrough render (clip)'),
 ('motion-1','SEM4/Motiongraphics/Assignment1_MotionGraphics.mp4',2,'2025-26','S4','Motion Graphics','Motion graphics assignment 1 (clip)'),
 ('motion-3','SEM4/Motiongraphics/Assignment3_1.mp4',2,'2025-26','S4','Motion Graphics','Motion graphics assignment 3 (clip)'),
 ('use-of-space-pan','SEM5/Filmmaking/Assignment2_AritraMitra_UseofSpace/PanandTilt.mov',3,'2026-27','S5','Filmmaking','Use of Space: pan and tilt (clip)'),
]
def get(src):
    return cand(src[1], src[2]) if src[0] == 'c' else pdfpage(src[1], src[2])

media, artefacts = {}, []
for slug, items in SET.items():
    out = PUB / 'img' / slug
    if out.exists(): shutil.rmtree(out)
    gal = []
    for n, (src, alt) in enumerate(items):
        im = get(src); name = 'hero' if n == 0 else f'{n:02d}'
        sz = save(im, out / f'{name}.webp', 1400 if n == 0 else 1100)
        if n == 0: save(im, out / 'thumb.webp', 640)
        gal.append({'src': f'/img/{slug}/{name}.webp', 'alt': alt})
        print(f'{slug}/{name}: {sz//1024} KB')
    media[slug] = {'hero': gal[0]['src'], 'thumb': f'/img/{slug}/thumb.webp', 'heroAlt': items[0][1], 'gallery': gal[1:]}
tdir = PUB / 'img' / 'year'
if tdir.exists(): shutil.rmtree(tdir)
for i, (y, s, topic, title, src, work) in enumerate(ART):
    f = f'{y}-{s}-{i:02d}.webp'; im = get(src); save(im, tdir / f, 640)
    fl = f.replace('.webp', '-lg.webp'); save(im, tdir / fl, 1200)          # large version for the modal
    artefacts.append({'year': y, 'semester': s, 'topic': topic, 'title': title, 'image': f'/img/year/{f}', 'large': f'/img/year/{fl}', 'pdf': None, 'work': work, 'pages': None})
vdir = PUB / 'video'
if vdir.exists(): shutil.rmtree(vdir)
vdir.mkdir(parents=True)
for slug, rel, ss, y, s, topic, title in VIDEOS:
    src = D / rel
    poster = vdir / f'{slug}.webp'; tmp = vdir / 'tmp.png'
    subprocess.run(['ffmpeg','-y','-loglevel','error','-ss',str(ss+2),'-i',str(src),'-frames:v','1','-vf','scale=960:-2',str(tmp)], check=True)
    save(Image.open(tmp), poster, 960); tmp.unlink()
    clip = vdir / f'{slug}.mp4'
    subprocess.run(['ffmpeg','-y','-loglevel','error','-ss',str(ss),'-t','6','-i',str(src),'-vf','scale=-2:480,fps=24','-c:v','libx264','-crf','31','-preset','slow','-an','-movflags','+faststart',str(clip)], check=True)
    print(f'{slug}: poster {poster.stat().st_size//1024} KB, clip {clip.stat().st_size//1024} KB')
    artefacts.append({'year': y, 'semester': s, 'topic': topic, 'title': title, 'image': f'/video/{slug}.webp', 'large': f'/video/{slug}.webp', 'video': f'/video/{slug}.mp4', 'pdf': None, 'work': None, 'pages': None})
DATA.mkdir(parents=True, exist_ok=True)
(DATA / 'media.json').write_text(json.dumps(media, indent=2)); (DATA / 'artefacts.json').write_text(json.dumps(artefacts, indent=2))
print('done:', sum(f.stat().st_size for f in PUB.rglob('*') if f.is_file()) // 1024, 'KB in public/')
