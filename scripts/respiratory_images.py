#!/usr/bin/env python3
"""Export the Human Respiratory XR images: real screenshots of the running build, saved as WebP.
Inputs : ~/Desktop/VSCODE/humanRespiratoryXR/screenshots/{hero,explode,lungs,bronchi}.png
Outputs: site/public/img/experiences/human-respiratory/*.webp"""
from pathlib import Path
from PIL import Image
ROOT = Path(__file__).resolve().parent.parent
SRC = Path.home() / 'Desktop' / 'VSCODE' / 'humanRespiratoryXR' / 'screenshots'
OUT = ROOT / 'site' / 'public' / 'img' / 'experiences' / 'human-respiratory'
def save(im, name, w, budget=300):
    im = im.convert('RGB')
    if im.width > w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    OUT.mkdir(parents=True, exist_ok=True); p = OUT / name
    for q in (88, 82, 76, 70, 62, 54, 46):
        im.save(p, 'WEBP', quality=q, method=6)
        if p.stat().st_size <= budget * 1024: break
    print(name, im.size, p.stat().st_size // 1024, 'KB')
hero = Image.open(SRC / 'hero.png'); save(hero, 'hero.webp', 1170); save(hero, 'thumb.webp', 720, 90)
save(Image.open(SRC / 'explode.png'), '01.webp', 1170)    # exploded, X-ray view
save(Image.open(SRC / 'lungs.png'), '02.webp', 1170)      # lungs isolated
save(Image.open(SRC / 'bronchi.png'), '03.webp', 1170)    # bronchial tree isolated, X-ray view
