#!/usr/bin/env python3
"""Stage 2: publish the CHOSEN images only, optimised for the web (WebP, <=150 KB each).
Inputs : assets/work/<project>/cands (from stage 1) and a few source PDFs/videos in assets/drive.
Outputs: site/public/img/<slug>/*.webp, site/public/video/*.mp4 (6 s clips), site/src/data/media.json, artefacts.json.
The site never references assets/ (git-ignored)."""
import io, json, subprocess, shutil, sys, zipfile
from pathlib import Path
import fitz
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
W = ROOT / 'assets' / 'work'; D = ROOT / 'assets' / 'drive' / 'JSAA_Work'
PUB = ROOT / 'site' / 'public'; DATA = ROOT / 'site' / 'src' / 'data'
MAX = 140 * 1024

def save(im, dest, w, hq=False):
    im = im.convert('RGB')
    if im.width > w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    # hq = legible UI screenshots: keep native resolution and high quality (up to ~560 KB)
    for q in ((92, 88, 84, 80, 76, 72, 68) if hq else (80, 72, 64, 56, 48, 40, 32)):
        im.save(dest, 'WEBP', quality=q, method=6)
        if dest.stat().st_size <= (560 * 1024 if hq else MAX): break
    return dest.stat().st_size

def cand(proj, i): return Image.open(W / proj / 'cands' / f'{i:03d}.jpg')
def pdfpage(rel, page, dpi=100):
    d = fitz.open(D / rel); pix = d[page - 1].get_pixmap(dpi=dpi)
    return Image.open(io.BytesIO(pix.tobytes('png')))
SD = 'SEM4/UserCenteredDesign/SystemDesign_Final.pdf'
SN = 'SEM4/EnvironmentDesign/Spatial Narrative and Environment Design (1).pdf'

# slug -> (hero, [(source, alt)])  source = ('c', project, idx) | ('p', pdf, page)
SET = {
 'live-project-ux-research': [
   (('x','live-thumb'), 'Illustration: a magnifying glass over rows of findings, for the live UX research project (no client material)')],
 'doom-and-quake': [
   (('x','doomquake-compare'), 'Doom on the left, Quake on the right: flat sprites in a 2.5D corridor against polygon monsters in a true 3D level'),
   (('f','assets/photos/intro-slide.webp',(0,0,2000,552)), 'The report\'s Introduction slide in pixel-arcade style, with arcade-button arrows, a trophy and the opening paragraph on id Software, Doom and Quake'),
   (('c','doomquake',4), 'Doom (1993): a dark, maze-like corridor with sprite enemies'),
   (('c','doomquake',9), 'Quake (1996): a lit, textured 3D corridor'),
   (('c','doomquake',8), 'Quake (1996): a polygonal monster seen from below')],
 'tiger-run': [
   (('f','assets/tiger/concept-illustration.png'), 'Original Tiger Run concept illustration: a tiger runs a forest road past traps, boar and poachers')],
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
   (('mx','SEM5/HumanAiDesign/SoleSync_Stage2_AritraMitra.pptx','image8.png'), 'SoleSync Stage 2 prototype: shop and product screens, generated from the design brief', 'hq'),
   (('mx','SEM5/HumanAiDesign/SoleSync_Stage2_AritraMitra.pptx','image7.png'), 'Stage 2, iteration 1: first generated screens', 'hq'),
   (('mx','SEM5/HumanAiDesign/SoleSync_Stage2_AritraMitra.pptx','image9.png'), 'Stage 2, iteration 2: screens after critique against the research', 'hq'),
   (('mx','SEM5/HumanAiDesign/SoleSync_Stage2_AritraMitra.pptx','image10.png'), 'Stage 2, iteration 3: revised screens', 'hq'),
   (('pimg','SEM4/UserCenteredDesign/SystemDesign_Final.pdf',16,[134,135,136,137]), 'The SoleSync UI: home, product, wishlist and care tracking screens', 'hq'),
   (('pimg','SEM4/UserCenteredDesign/SystemDesign_Final.pdf',15,[127,128]), 'USP screens: care service and verified shop', 'hq'),
   (('pimg','SEM4/UserCenteredDesign/SystemDesign_Final.pdf',14,[122]), 'Research and design process diagram', 'hq'),
   (('pp','SEM4/UserCenteredDesign/SystemDesign_Final.pdf',13,2.0), 'Concept slide: SoleSync as a sneaker marketplace and care service', 'hq'),
   (('mx','SEM4/UserCenteredDesign/SoleSync_UCD_Analysis.pptx','image1.png'), 'SoleSync splash screen', 'hq')],
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
 ('2025-26','S3','Immersive Environments','Impact of Doom and Quake on PC gaming graphics',('x','doomquake-compare'),'doom-and-quake'),
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
def live_thumb():
    """Original abstract card art: a pixel magnifier over bars of 'findings' (no client screens, no numbers)."""
    from PIL import ImageDraw
    W, H = 1280, 720
    im = Image.new('RGB', (W, H), (4, 18, 10)); d = ImageDraw.Draw(im)
    lens = ['...MMMMM....', '..MGGGGGM...', '.MGGGGGGGM..', '.MGGGGGGGM..', '.MGGGGGGGM..', '.MGGGGGGGM..', '..MGGGGGM...', '...MMMMMBB..', '........BBB.', '.........BBB', '..........BB']
    pal = {'M': (33, 239, 128), 'G': (255, 255, 255), 'B': (88, 94, 255)}
    u = 30; ox, oy = 150, 150
    for y, row in enumerate(lens):
        for x, ch in enumerate(row):
            if ch in pal: d.rectangle([ox + x * u, oy + y * u, ox + (x + 1) * u - 1, oy + (y + 1) * u - 1], fill=pal[ch])
    cols = [(33, 239, 128), (255, 99, 216), (88, 94, 255), (255, 210, 63)]
    for i, (w, c) in enumerate([(380, cols[0]), (300, cols[1]), (450, cols[2]), (240, cols[3]), (340, cols[0])]):
        y = 130 + i * 100
        d.rectangle([640, y, 640 + w, y + 40], fill=c); d.rectangle([640, y + 40, 1180, y + 44], fill=(46, 51, 184))
    return im

def compare():
    """Doom | Quake, each centre-cropped to 8:9 so the pair is 16:9 (card thumbnails keep both)."""
    h = 560; w = (h * 8) // 9
    def crop(im):
        im = im.convert('RGB'); r = w / h; cw = round(im.height * r)
        if cw > im.width: cw = im.width; ch = round(cw / r)
        else: ch = im.height
        x = (im.width - cw) // 2; y = (im.height - ch) // 2
        return im.crop((x, y, x + cw, y + ch)).resize((w, h), Image.LANCZOS)
    a, b = crop(cand('doomquake', 6)), crop(cand('doomquake', 7))
    im = Image.new('RGB', (2 * w + 12, h), (33, 239, 128)); im.paste(a, (0, 0)); im.paste(b, (w + 12, 0)); return im

def pimg(rel, page, xrefs):
    d = fitz.open(D / rel); ims = []
    for x in xrefs:
        pix = fitz.Pixmap(d, x)
        if pix.n - pix.alpha >= 4: pix = fitz.Pixmap(fitz.csRGB, pix)
        ims.append(Image.frombytes('RGBA' if pix.alpha else 'RGB', (pix.width, pix.height), pix.samples).convert('RGB'))
    if len(ims) == 1: return ims[0]
    h = max(i.height for i in ims); ims = [i.resize((round(i.width * h / i.height), h), Image.LANCZOS) for i in ims]
    out = Image.new('RGB', (sum(i.width for i in ims) + 16 * (len(ims) - 1), h), (4, 18, 10)); x0 = 0
    for i in ims: out.paste(i, (x0, 0)); x0 += i.width + 16
    return out

def get(src):
    if src[0] == 'mx': return Image.open(io.BytesIO(zipfile.ZipFile(D / src[1]).read('ppt/media/' + src[2])))
    if src[0] == 'pimg': return pimg(src[1], src[2], src[3])
    if src[0] == 'pp':
        d = fitz.open(D / src[1]); pix = d[src[2] - 1].get_pixmap(matrix=fitz.Matrix(src[3], src[3]))
        return Image.open(io.BytesIO(pix.tobytes('png')))
    if src[0] == 'x': return live_thumb() if src[1] == 'live-thumb' else compare()
    if src[0] == 'f':
        im = Image.open(ROOT / src[1]).convert('RGB')
        return im.crop(src[2]) if len(src) > 2 else im
    return cand(src[1], src[2]) if src[0] == 'c' else pdfpage(src[1], src[2])

media, artefacts = {}, []
for slug, items in SET.items():
    out = PUB / 'img' / slug
    if out.exists() and slug != 'live-project-ux-research': shutil.rmtree(out)   # the live project also holds the separately exported photos
    gal = []
    for n, item in enumerate(items):
        src, alt = item[0], item[1]; hq = len(item) > 2
        im = get(src); name = 'hero' if n == 0 else f'{n:02d}'
        sz = save(im, out / f'{name}.webp', (1800 if hq else 1400) if n == 0 else (2200 if hq else 1100), hq)
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
if '--photos' in sys.argv:   # only when explicitly asked: this reads the confidential REBIT originals
    # Live-project photos: cropped to the action; every face that is not the subject is pixelated; screens never shown.
    REBIT = ROOT / 'assets' / 'drive' / 'REBIT_UX_LIVEPROJECT_JAN2024'
    REBIT_PHOTOS = [  # key, file, crop (rel x0,y0,x1,y1; square rel box = 4:3 crop), pixelate boxes (rel to the FULL image), alt
     # Aritra = the person in the hoodie (green hoodie on the participant day, maroon hoodie when facilitating).
     ('think-aloud', '1736696037772.jpg', (0.12, 0.0, 0.92, 0.8), [(0.55, 0.03, 0.90, 0.42), (0.22, 0.31, 0.42, 0.64), (0.10, 0.0, 0.22, 0.24)], 'Aritra, as a test participant, talking a task through out loud while using a tablet'),
     ('think-aloud-close', '1736696037823.jpg', (0.05, 0.1, 0.95, 1.0), [(0.40, 0.05, 0.66, 0.34), (0.05, 0.40, 0.37, 0.75), (0.50, 0.0, 0.68, 0.22), (0.70, 0.34, 0.95, 0.90)], 'Close view of Aritra pointing at the tablet while explaining what he sees'),
     # 'at-the-laptop' (1736696037441.jpg) is parked: whiteboard heading and lanyard print were still readable after blurring. Re-add only after checking the result.
     # Aritra is the note-taker at the back (beside the phone on a tripod): his face stays clear. The colleague in the foreground (maroon hoodie), the laptop screen and his ID card are blurred.
     ('facilitating', 'IMG_20250115_105406.jpg', (0.0, 0.08, 0.7, 0.78), [(0.10, 0.095, 0.27, 0.335), (0.53, 0.25, 0.72, 0.48), (0.2, 0.64, 0.32, 0.76)], 'Aritra taking handwritten notes beside a phone on a tripod that records the session, while a colleague guides a participant at a laptop'),
     ('the-room', '1736785934348.jpg', (0.0, 0.0, 1.0, 1.0), [(0.32, 0.24, 0.46, 0.42), (0.63, 0.25, 0.78, 0.42), (0.0, 0.0, 0.31, 0.5)], 'The session space: a moderator and a participant at a table, with Aritra working nearby'),
    ]
    def rebit_photo(f, crop, boxes):
        from PIL import ImageOps
        im = ImageOps.exif_transpose(Image.open(REBIT / f)).convert('RGB'); W, H = im.size
        for (a, b, c, d) in boxes:   # pixelate in place (blocky, on-brand), before cropping
            box = (round(a * W), round(b * H), round(c * W), round(d * H)); reg = im.crop(box)
            blk = max(48, min(reg.width, reg.height) // 7)     # block size in full-resolution pixels: coarse enough to destroy small print
            reg = reg.resize((max(1, reg.width // blk), max(1, reg.height // blk)), Image.BILINEAR).resize(reg.size, Image.NEAREST)
            im.paste(reg, box[:2])
        x0, y0, x1, y1 = crop
        return im.crop((round(x0 * W), round(y0 * H), round(x1 * W), round(y1 * H)))
    lpdir = PUB / 'img' / 'live-project-ux-research'
    lp = {}
    for key, f, crop, boxes, alt in REBIT_PHOTOS:
        im = rebit_photo(f, crop, boxes)
        sz = save(im, lpdir / f'ph-{key}.webp', 1100); save(im, lpdir / f'ph-{key}-sm.webp', 480)
        lp[key] = alt; print(f'live photo {key}: {sz//1024} KB')

    # Short, wide header for the live-project page: the same magnifier-over-findings art as the card, cropped to a low band.
    def live_wide():
        from PIL import ImageDraw
        W, H = 1400, 260
        im = Image.new('RGB', (W, H), (4, 18, 10)); d = ImageDraw.Draw(im)
        lens = ['...MMMMM....', '..MGGGGGM...', '.MGGGGGGGM..', '.MGGGGGGGM..', '.MGGGGGGGM..', '.MGGGGGGGM..', '..MGGGGGM...', '...MMMMMBB..', '........BBB.', '.........BBB', '..........BB']
        pal = {'M': (33, 239, 128), 'G': (255, 255, 255), 'B': (88, 94, 255)}
        u = 18; ox, oy = 150, (H - 11 * u) // 2
        for y, row in enumerate(lens):
            for x, ch in enumerate(row):
                if ch in pal: d.rectangle([ox + x * u, oy + y * u, ox + (x + 1) * u - 1, oy + (y + 1) * u - 1], fill=pal[ch])
        cols = [(33, 239, 128), (255, 99, 216), (88, 94, 255), (255, 210, 63), (33, 239, 128)]
        for i, (w, c) in enumerate([(520, cols[0]), (400, cols[1]), (620, cols[2]), (320, cols[3]), (470, cols[4])]):
            y = 34 + i * 44
            d.rectangle([560, y, 560 + w, y + 24], fill=c); d.rectangle([560, y + 24, 1300, y + 27], fill=(46, 51, 184))
        im.save(lpdir / 'wide.webp', 'WEBP', quality=84, method=6)
    live_wide()

# Round-masked photos: stored as square crops, masked with CSS (border-radius 50%).
PHOTOS = [  # key, file, crop box (square), alt
 ('portrait', 'portrait.jpg', (150, 300, 790, 940), 'Aritra Mitra smiling beside the Jindal School of Art and Architecture sign'),
 ('vr-wide', 'vr-lab-wide.jpg', (300, 0, 1794, 1494), 'A student in a VR headset in the green university VR lab, with a headset, PC and a walkthrough model on screen'),
 ('vr-close', 'vr-lab-closeup.jpg', (80, 60, 1080, 1060), 'Close view of the student holding VR controllers in the lab'),
]
pdir = PUB / 'img' / 'photos'
if pdir.exists(): shutil.rmtree(pdir)
media['photos'] = {}
for key, f, box, alt in PHOTOS:
    im = Image.open(ROOT / 'assets' / 'photos' / f).convert('RGB').crop(box)
    sz = save(im, pdir / f'{key}.webp', 800); save(im, pdir / f'{key}-sm.webp', 320)
    media['photos'][key] = {'src': f'/img/photos/{key}.webp', 'sm': f'/img/photos/{key}-sm.webp', 'alt': alt}
    print(f'photos/{key}: {sz//1024} KB')
# Origin banner (home + about): the report's Introduction slide, text-only part (no third-party photos).
odir = PUB / 'img' / 'origin'
if odir.exists(): shutil.rmtree(odir)
ban = get(('f', 'assets/photos/intro-slide.webp', (0, 0, 2000, 552)))
sz = save(ban, odir / 'intro-banner.webp', 1400); save(ban, odir / 'intro-banner-sm.webp', 640)
media['origin'] = {'src': '/img/origin/intro-banner.webp', 'sm': '/img/origin/intro-banner-sm.webp',
  'alt': 'The Doom and Quake report\'s Introduction slide: a pixel-arcade title with arrows, a trophy and star sprites above the opening paragraph'}
print(f'origin banner: {sz//1024} KB')
DATA.mkdir(parents=True, exist_ok=True)
(DATA / 'media.json').write_text(json.dumps(media, indent=2)); (DATA / 'artefacts.json').write_text(json.dumps(artefacts, indent=2))
print('done:', sum(f.stat().st_size for f in PUB.rglob('*') if f.is_file()) // 1024, 'KB in public/')
