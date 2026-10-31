#!/usr/bin/env python3
"""Export the Kerala House VR images: crop the Blender viewport screenshots to the model only, save as WebP.
Inputs : assets/work/vr/{1.jpg,2.webp,3.webp,4.webp} (git-ignored).  Outputs: site/public/img/experiences/kerala-house/*.webp"""
from pathlib import Path
from PIL import Image
import sys
sys.path.insert(0, str(Path(__file__).parent))
ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'assets' / 'work' / 'vr'; OUT = ROOT / 'site' / 'public' / 'img' / 'experiences' / 'kerala-house'
VIEW = (70, 170, 1240, 1020)   # inside the Blender window: no toolbars, labels, gizmo or add-on panel
def save(im, name, w, budget=300):
    im = im.convert('RGB')
    if im.width > w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    OUT.mkdir(parents=True, exist_ok=True); p = OUT / name
    for q in (88, 82, 76, 70, 62, 54):
        im.save(p, 'WEBP', quality=q, method=6)
        if p.stat().st_size <= budget * 1024: break
    print(name, im.size, p.stat().st_size // 1024, 'KB')
v = lambda f: Image.open(SRC / f).crop(VIEW)
hero = v('2.webp'); save(hero, 'hero.webp', 1600); save(hero, 'thumb.webp', 720, 90)
save(v('4.webp'), '01.webp', 1600)                     # close-up, flat colour
save(v('3.webp'), '02.webp', 1600)                     # grey overview
save(Image.open(SRC / '1.jpg'), '03.webp', 767, 120)   # grey blockout (source is small, kept native)
