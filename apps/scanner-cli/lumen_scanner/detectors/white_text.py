"""Detector de texto branco (fonte na mesma cor do fundo)."""

import fitz  # PyMuPDF

from ..models import Finding, Severity, Technique

WHITE_THRESHOLD = 0.92  # canais R/G/B acima disso = considerado branco
MIN_TEXT_LENGTH = 10  # ignora spans muito curtos (provavelmente artefatos)


def _is_near_white(color_int: int) -> bool:
    """Verifica se a cor (formato sRGB int) é próxima do branco."""
    r = ((color_int >> 16) & 0xFF) / 255.0
    g = ((color_int >> 8) & 0xFF) / 255.0
    b = (color_int & 0xFF) / 255.0
    return r >= WHITE_THRESHOLD and g >= WHITE_THRESHOLD and b >= WHITE_THRESHOLD


def detect_white_text(doc: fitz.Document) -> list[Finding]:
    """Detecta texto com cor de fonte próxima ao branco em fundo branco.

    PDFs jurídicos têm fundo branco por padrão; texto branco = invisível.
    """
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
                    color = span.get("color", 0)
                    if _is_near_white(color):
                        findings.append(
                            Finding(
                                technique=Technique.WHITE_TEXT,
                                severity=Severity.CRITICAL,
                                confidence=0.98,
                                page=page_num,
                                bbox=tuple(span.get("bbox", (0, 0, 0, 0))),
                                text_excerpt=text[:300],
                                reconstructed_command=text,
                                notes=f"Cor RGB={color:#08x} (próxima do branco) sobre fundo branco padrão",
                            )
                        )
    return findings
