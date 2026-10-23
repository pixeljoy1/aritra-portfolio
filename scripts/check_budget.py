#!/usr/bin/env python3
"""Fail the build if anything heavy sneaks into the published site (spec section 8)."""
import sys
from pathlib import Path
pub = Path(__file__).resolve().parent.parent / 'site' / 'public'
LIMITS = {'.pdf': 4, '.webp': 0.6, '.png': 1, '.jpg': 1, '.jpeg': 1, '.mp4': 1, '.mov': 0, '.tm': 0, '.blend': 0, '.mb': 0}
bad = [(f, f.stat().st_size / 1e6) for f in pub.rglob('*') if f.is_file() and f.stat().st_size / 1e6 > LIMITS.get(f.suffix.lower(), 2)]
total = sum(f.stat().st_size for f in pub.rglob('*') if f.is_file()) / 1e6
for f, mb in bad: print(f'TOO BIG: {f.relative_to(pub)} ({mb:.1f} MB)')
print(f'public/ total: {total:.1f} MB')
sys.exit(1 if bad or total > 60 else 0)
