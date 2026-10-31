#!/usr/bin/env python3
"""Export the Bihar Museum XR gallery images from browser screenshots of the running floor.

The screenshots are 800x517 frames of the real experience, with the preview pane's own
fullscreen button burnt into the bottom-right corner: everything below y=462 is cropped away.

Inputs : paths passed on the command line, in the order hero, 01, 02, 03, 04.
Outputs: site/public/img/experiences/bihar-museum/*.webp
"""
from pathlib import Path
from PIL import Image
import sys

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'site' / 'public' / 'img' / 'experiences' / 'bihar-museum'
CROP = (0, 0, 800, 462)          # drop the pane's fullscreen button


def save(im, name, w, budget=300):
    im = im.convert('RGB')
    if im.width > w:
        im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    p = OUT / name
    for q in (88, 82, 76, 70, 62, 54):
        im.save(p, 'WEBP', quality=q, method=6)
        if p.stat().st_size <= budget * 1024:
            break
    print(name, im.size, p.stat().st_size // 1024, 'KB')


hero, g1, g2, g3, g4 = (Image.open(a).crop(CROP) for a in sys.argv[1:6])
save(hero, 'hero.webp', 800)
save(hero, 'thumb.webp', 720, 90)
for name, im in (('01.webp', g1), ('02.webp', g2), ('03.webp', g3), ('04.webp', g4)):
    save(im, name, 800)
