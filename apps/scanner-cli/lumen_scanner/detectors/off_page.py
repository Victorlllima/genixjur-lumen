"""Detector de texto fora da área visível da página."""

import fitz

from ..models import Finding, Severity, Technique

MIN_TEXT_LENGTH = 10
MARGIN_TOLERANCE = 5.0  # pontos


def _bbox_outside(span_bbox: tuple, visible: fitz.Rect) -> bool:
    x0, y0, x1, y1 = span_bbox
    return (
        x1 < visible.x0 - MARGIN_TOLERANCE
        or x0 > visible.x1 + MARGIN_TOLERANCE
        or y1 < visible.y0 - MARGIN_TOLERANCE
        or y0 > visible.y1 + MARGIN_TOLERANCE
    )


def detect_off_page(doc: fitz.Document) -> list[Finding]:
    """Detecta texto cuja bbox está fora do cropbox/mediabox visível.

    Estratégia: expandir cropbox temporariamente para o tamanho do mediabox
    (ou maior), extrair todos os spans, e identificar quais estão fora do
    cropbox original (= área que o humano vê).
    """
    findings: list[Finding] = []

    for page_num, page in enumerate(doc, start=1):
        visible = fitz.Rect(page.cropbox if page.cropbox else page.mediabox)
        original_cropbox = fitz.Rect(page.cropbox)

        # Expande cropbox para mediabox (ou +1000pt em cada direção)
        expanded = fitz.Rect(
            min(page.mediabox.x0, visible.x0) - 1000,
            min(page.mediabox.y0, visible.y0) - 1000,
            max(page.mediabox.x1, visible.x1) + 1000,
            max(page.mediabox.y1, visible.y1) + 1000,
        )
        # set_cropbox só aceita rect dentro do mediabox; usamos mediabox como teto
        try:
            page.set_cropbox(page.mediabox)
        except Exception:
            continue

        try:
            blocks = page.get_text("dict").get("blocks", [])
            for block in blocks:
                if block.get("type") != 0:
                    continue
                for line in block.get("lines", []):
                    for span in line.get("spans", []):
                        text = span.get("text", "").strip()
                        if len(text) < MIN_TEXT_LENGTH:
                            continue
                        bbox = span.get("bbox", (0, 0, 0, 0))
                        if _bbox_outside(bbox, visible):
                            findings.append(
                                Finding(
                                    technique=Technique.OFF_PAGE,
                                    severity=Severity.HIGH,
                                    confidence=0.90,
                                    page=page_num,
                                    bbox=tuple(bbox),
                                    text_excerpt=text[:300],
                                    reconstructed_command=text,
                                    notes=(
                                        f"Span em bbox {tuple(round(b, 1) for b in bbox)} "
                                        f"fora do cropbox visível "
                                        f"({visible.x0:.0f},{visible.y0:.0f},{visible.x1:.0f},{visible.y1:.0f})"
                                    ),
                                )
                            )
        finally:
            # Restaura cropbox original
            try:
                page.set_cropbox(original_cropbox)
            except Exception:
                pass

    return findings
