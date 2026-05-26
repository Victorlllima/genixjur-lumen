"""Detector de fontes muito pequenas (invisíveis a olho nu)."""

import fitz

from ..models import Finding, Severity, Technique

MICRO_FONT_THRESHOLD = 2.0  # pontos
MIN_TEXT_LENGTH = 10


def detect_micro_font(doc: fitz.Document) -> list[Finding]:
    """Detecta texto com fonte abaixo de 2pt (humano não consegue ler)."""
    findings: list[Finding] = []

    for page_num, page in enumerate(doc, start=1):
        blocks = page.get_text("dict")
        for block in blocks.get("blocks", []):
            if block.get("type") != 0:
                continue
            for line in block.get("lines", []):
                for span in line.get("spans", []):
                    text = span.get("text", "").strip()
                    if len(text) < MIN_TEXT_LENGTH:
                        continue
                    size = span.get("size", 12)
                    if size < MICRO_FONT_THRESHOLD:
                        findings.append(
                            Finding(
                                technique=Technique.MICRO_FONT,
                                severity=Severity.CRITICAL,
                                confidence=0.95,
                                page=page_num,
                                bbox=tuple(span.get("bbox", (0, 0, 0, 0))),
                                text_excerpt=text[:300],
                                reconstructed_command=text,
                                notes=f"Fonte de {size:.2f}pt — abaixo do limite humano de leitura (2pt)",
                            )
                        )
    return findings
