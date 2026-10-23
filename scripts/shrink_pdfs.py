#!/usr/bin/env python3
"""Shrink the two full decks to site/public/pdf (<4 MB, text kept). Re-run after Drive changes."""
import fitz
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
D = ROOT / 'assets' / 'drive' / 'JSAA_Work' / 'SEM4'
OUT = ROOT / 'site' / 'public' / 'pdf'; OUT.mkdir(parents=True, exist_ok=True)
JOBS = {'spatial-narrative-environment': D / 'EnvironmentDesign/Spatial Narrative and Environment Design (1).pdf',
        'system-design-final': D / 'UserCenteredDesign/SystemDesign_Final.pdf'}
for name, src in JOBS.items():
    for dpi, q in ((100, 60), (80, 50), (72, 40)):
        d = fitz.open(src); d.rewrite_images(dpi_threshold=dpi + 10, dpi_target=dpi, quality=q)
        t = OUT / f'{name}.pdf'; d.save(t, garbage=4, deflate=True, clean=True)
        mb = t.stat().st_size / 1e6; print(name, dpi, q, f'{mb:.2f} MB')
        if mb <= 3.9: break
