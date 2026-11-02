#!/usr/bin/env python3
"""Export the Kolkata Street VR images: four renders plus one live in-browser screenshot, saved as WebP.
Inputs : assets/work/kolkata/{5.png,6.webp,7.webp,8.webp,9.webp} (git-ignored).  Outputs: site/public/img/experiences/kolkata-street/*.webp"""
from pathlib import Path
from PIL import Image
ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'assets' / 'work' / 'kolkata'; OUT = ROOT / 'site' / 'public' / 'img' / 'experiences' / 'kolkata-street'
def save(im, name, w, budget=300):
    im = im.convert('RGB')
    if im.width > w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    OUT.mkdir(parents=True, exist_ok=True); p = OUT / name
    for q in (88, 82, 76, 70, 62, 54):
        im.save(p, 'WEBP', quality=q, method=6)
        if p.stat().st_size <= budget * 1024: break
    print(name, im.size, p.stat().st_size // 1024, 'KB')
def card(im, ratio=1170 / 850):
    w, h = im.size; cw = round(h * ratio); x = (w - cw) // 2
    return im.crop((x, 0, x + cw, h))
src = lambda f: Image.open(SRC / f)
hero = card(src('7.webp')); save(hero, 'hero.webp', 1170, 320); save(hero, 'thumb.webp', 720, 90)
save(card(src('6.webp')), '01.webp', 1170, 320)      # from a balcony, through the scaffold
save(card(src('8.webp')), '02.webp', 1170, 320)      # a hand-span above the wet road
save(card(src('9.webp')), '03.webp', 1170, 320)      # tram nose and taxi
save(card(src('5.png')), '04.webp', 960, 200)        # the live in-browser view, viewpoint menu showing
