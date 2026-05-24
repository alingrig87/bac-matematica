"""
extract_problems.py  v2
-----------------------
Extrage fiecare problemă din subiectele EN VIII ca imagine PNG + JSON.

Algoritmul v2:
  - Colectăm TOȚI ancorele "5p" din TOATE paginile (cu x0 < 80pt).
  - Colectăm toți markerii de secțiune cu pozitia (page, y).
  - Fiecărei ancore îi atribuim secțiunea curentă prin "cel mai recent
    marker de secțiune de deasupra ei".
  - Cropuim fiecare problemă de la ancora sa până la următoarea ancoră
    din ACEEAȘI secțiune (sau sfârșitul paginii / paginii următoare).
"""

import fitz
import json
import os
import re
import glob
from pathlib import Path

SRC_DIR  = r"D:\bac-matematica\subiecte\en8"
OUT_DIR  = r"D:\bac-matematica\public\problems"
META_OUT = r"D:\bac-matematica\public\problems\problems.json"

ZOOM          = 2.5
MARGIN_TOP    = 3
MARGIN_BOTTOM = 6

os.makedirs(OUT_DIR, exist_ok=True)


def clip_image(page, rect, zoom=ZOOM):
    mat  = fitz.Matrix(zoom, zoom)
    clip = fitz.Rect(rect)
    pix  = page.get_pixmap(matrix=mat, clip=clip, colorspace=fitz.csRGB)
    return pix.tobytes("png")


def find_rects(page, needle):
    return page.search_for(needle)


# ─── Detectăm toate secțiunile și ancorele "5p" ───────────────────────────────

SECTION_MARKERS = {
    "I":   ["SUBIECTUL I"],
    "II":  ["SUBIECTUL al II-lea", "SUBIECTUL AL II-LEA"],
    "III": ["SUBIECTUL al III-lea", "SUBIECTUL AL III-LEA"],
}

def build_timeline(doc):
    """
    Returnează o listă sortată de events:
      { 'kind': 'section'|'anchor', 'page': int, 'y': float, 'section': str|None }
    """
    events = []

    for pi in range(len(doc)):
        page = doc[pi]

        # Secțiuni
        for sec, patterns in SECTION_MARKERS.items():
            for pat in patterns:
                hits = find_rects(page, pat)
                if hits:
                    events.append({'kind': 'section', 'page': pi, 'y': hits[0].y0, 'section': sec})
                    break  # primul match pe pagină

        # Ancore "5p" în coloana stângă (threshold 100 acoperă toate layout-urile)
        words = page.get_text("words")
        for w in words:
            x0, y0, x1, y1, text = w[0], w[1], w[2], w[3], w[4]
            if text.strip() == "5p" and x0 < 100:
                events.append({'kind': 'anchor', 'page': pi, 'y': y0})

    # Sortăm după (pagina, y)
    events.sort(key=lambda e: (e['page'], e['y']))
    return events


def assign_sections(events):
    """Atribuie fiecărei ancore secțiunea curentă."""
    current_section = None
    anchors = []
    for ev in events:
        if ev['kind'] == 'section':
            current_section = ev['section']
        elif ev['kind'] == 'anchor':
            if current_section:
                anchors.append({**ev, 'section': current_section})
    return anchors


# ─── Crop ─────────────────────────────────────────────────────────────────────

def crop_problem(doc, anchor, next_anchor_same_section):
    """
    Cropuiește enunțul problemei.
    - Dacă problema S.I/S.II: de la ancora până la cea următoare (aceeași pagină).
    - Dacă S.III: de la ancoră, detectăm primul gap mare (grila de răspuns) și tăiem acolo.
    """
    pi   = anchor['page']
    page = doc[pi]
    pw   = page.rect.width
    ph   = page.rect.height

    y_top = anchor['y'] - MARGIN_TOP

    section = anchor['section']

    if section in ("I", "II"):
        # Grila – probleme succesive pe aceeași pagină
        if next_anchor_same_section and next_anchor_same_section['page'] == pi:
            y_bot = next_anchor_same_section['y'] - 4
        else:
            y_bot = ph - 40
    else:
        # S.III – tăiem înainte de grila de răspuns (primul gap mare în text)
        words = page.get_text("words")
        text_ys = sorted(
            w[1] for w in words
            if w[1] > anchor['y'] + 5 and w[0] > 40
        )

        y_cut = anchor['y'] + 180  # fallback
        if text_ys:
            prev_y = text_ys[0]
            for ty in text_ys[1:]:
                if ty - prev_y > 22:      # gap = grila
                    y_cut = prev_y + 12
                    break
                prev_y = ty
            else:
                y_cut = text_ys[-1] + 12

        y_bot = min(y_cut + MARGIN_BOTTOM, ph - 30)

        # Prea mic? extinde
        if y_bot - y_top < 35:
            y_bot = min(anchor['y'] + 180, ph - 30)

    crop = fitz.Rect(28, y_top, pw - 18, y_bot + MARGIN_BOTTOM)
    return clip_image(page, crop)


# ─── Procesare PDF ─────────────────────────────────────────────────────────────

def process_pdf(pdf_path):
    name = Path(pdf_path).stem
    m = re.match(r"(\d{4})_([a-z0-9]+)_subiect", name)
    if not m:
        return []

    year, variant = m.group(1), m.group(2)
    doc  = fitz.open(pdf_path)
    print(f"\n{year} {variant} ({len(doc)} pag)")

    events  = build_timeline(doc)
    anchors = assign_sections(events)

    # Indexuri per secțiune (pentru next-anchor lookup)
    by_section = {'I': [], 'II': [], 'III': []}
    for a in anchors:
        by_section[a['section']].append(a)

    print(f"  S.I:{len(by_section['I'])}  S.II:{len(by_section['II'])}  S.III:{len(by_section['III'])}")

    all_problems = []

    for sec, sec_anchors in by_section.items():
        prob_type = "mc" if sec in ("I", "II") else "open"
        for i, anchor in enumerate(sec_anchors):
            next_a = sec_anchors[i + 1] if i + 1 < len(sec_anchors) else None
            img_bytes = crop_problem(doc, anchor, next_a)

            sec_num  = {'I': '1', 'II': '2', 'III': '3'}[sec]
            label    = f"en8_{year}_{variant}_s{sec_num}_{i+1:02d}"
            img_path = os.path.join(OUT_DIR, f"{label}.png")
            with open(img_path, "wb") as f:
                f.write(img_bytes)

            all_problems.append({
                "id":      label,
                "imgFile": f"{label}.png",
                "year":    int(year),
                "variant": variant,
                "section": sec,
                "prob_nr": i + 1,
                "type":    prob_type,
            })

    doc.close()
    return all_problems


# ─── main ─────────────────────────────────────────────────────────────────────

def main():
    pdfs = sorted(glob.glob(os.path.join(SRC_DIR, "*_subiect.pdf")))
    print(f"Procesez {len(pdfs)} subiecte EN VIII...")

    all_problems = []
    for pdf in pdfs:
        probs = process_pdf(pdf)
        all_problems.extend(probs)

    with open(META_OUT, "w", encoding="utf-8") as f:
        json.dump(all_problems, f, ensure_ascii=False, indent=2)

    print(f"\nExtrase {len(all_problems)} probleme total")

    from collections import Counter
    by_sec  = Counter(p["section"] for p in all_problems)
    by_year = Counter(p["year"]    for p in all_problems)
    print(f"Pe sectiuni: {dict(by_sec)}")
    print(f"Pe ani:      {dict(by_year)}")
    print(f"\nJSON: {META_OUT}")
    print(f"PNG: {OUT_DIR}/")


if __name__ == "__main__":
    main()
