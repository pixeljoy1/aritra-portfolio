#!/usr/bin/env python3
"""Add the (anonymised) live UX research project to the one-page résumé.
In : toPrint_/Aritra_Mitra_Resume_2026_v2.pdf   Out: toPrint_/Aritra_Mitra_Resume_2026_v3.pdf
Method: replace the SoleSync 'UX research' highlight with a live-project highlight, insert a new row into
Selected Projects (after Tiger Run) and shift the rest down by composing page regions (text stays real text)."""
import fitz
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'toPrint_' / 'Aritra_Mitra_Resume_2026_v2.pdf'; OUT = ROOT / 'toPrint_' / 'Aritra_Mitra_Resume_2026_v3.pdf'
AF = '/Applications/Affinity.app/Contents/Resources/'
REG, BOLD = AF + 'Lato-Regular.ttf', AF + 'Lato-Bold.ttf'
TEAL, INK, GREY, RULE = (0x1f/255, 0x8a/255, 0x91/255), (0x34/255, 0x39/255, 0x3e/255), (0x6b/255, 0x72/255, 0x80/255), (0.890, 0.902, 0.910)

src = fitz.open(SRC); p = src[0]; W, H = p.rect.width, p.rect.height
fr, fb = fitz.Font(fontfile=REG), fitz.Font(fontfile=BOLD)

# 1) highlight: replace the SoleSync "UX research" block (right column, 3 lines)
p.add_redact_annot(fitz.Rect(305, 230, 556, 272), fill=(1, 1, 1)); p.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE, graphics=fitz.PDF_REDACT_LINE_ART_NONE)
label, rest = 'Live UX research', ': special invitee on a real usability study of a government portal: note-taker, observer and test participant, with SUS scoring.'
x0, y, maxw, size, pitch = 308.6, 241.6, 245.0, 9.1, 12.4
tw = fitz.TextWriter(p.rect); tw2 = fitz.TextWriter(p.rect)
tw.append((x0, y), label, font=fr, fontsize=size)
x = x0 + fr.text_length(label, fontsize=size); line = ''
words = [w for w in rest.split(' ') if w]
for w in words:
    t = (line + ' ' + w) if line else w
    if x + fr.text_length(t, fontsize=size) > x0 + maxw and line:
        tw2.append((x, y), line, font=fr, fontsize=size); y += pitch; x = x0; line = w
    else: line = t
tw2.append((x, y), line, font=fr, fontsize=size)
tw.write_text(p, color=TEAL); tw2.write_text(p, color=INK)

# 2) new project row after Tiger Run: compose page regions
DELTA = 33.35; SPLIT, FOOT = 509.0, 790.0
out = fitz.open(); np_ = out.new_page(width=W, height=H)
np_.show_pdf_page(fitz.Rect(0, 0, W, SPLIT), src, 0, clip=fitz.Rect(0, 0, W, SPLIT))
np_.show_pdf_page(fitz.Rect(0, SPLIT + DELTA, W, FOOT + DELTA), src, 0, clip=fitz.Rect(0, SPLIT, W, FOOT))
np_.show_pdf_page(fitz.Rect(0, FOOT + 6, W, H + 6), src, 0, clip=fitz.Rect(0, FOOT, W, H))   # footer a touch lower
# year label: reuse the real "2025" glyphs from the Stuff and Space row
np_.show_pdf_page(fitz.Rect(42, 513.7 - 1.5, 66, 522.5 + 1.5), src, 0, clip=fitz.Rect(42, 649.6 - 1.5, 66, 658.5 + 1.5))
ty = 512.1 + 9.1   # baseline of the bold title, as in the other rows
t1, t2, t3 = fitz.TextWriter(np_.rect), fitz.TextWriter(np_.rect), fitz.TextWriter(np_.rect)
t1.append((112.0, ty), 'Live UX research project', font=fb, fontsize=9.7)
tx = 112.0 + fb.text_length('Live UX research project', fontsize=9.7)
t2.append((tx, ty + 0.6), ' · Special invitee, usability study of a national government portal', font=fr, fontsize=9.1)
t3.append((112.0, ty + 12.4), 'Note-taker, observer and participant for a month; logged sessions and scored SUS. Client confidential.', font=fr, fontsize=8.7)
t1.write_text(np_, color=(0x23/255, 0x27/255, 0x2b/255)); t2.write_text(np_, color=GREY); t3.write_text(np_, color=INK)
np_.draw_line((112.0, 507.0 + DELTA), (553.3, 507.0 + DELTA), color=RULE, width=0.5)
try: out.subset_fonts()
except Exception: pass
out.save(OUT, garbage=4, deflate=True)
print('saved', OUT.name, OUT.stat().st_size // 1024, 'KB')
fitz.open(OUT)[0].get_pixmap(dpi=90).save('/tmp/rebit/resume_v3.png')
