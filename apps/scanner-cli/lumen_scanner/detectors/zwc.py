"""Detector de zero-width characters e marcas Unicode invisíveis."""

import re

import fitz

from ..models import Finding, Severity, Technique

# Caracteres invisíveis problemáticos
# Inclui: soft hyphen, ZWSP, ZWNJ, ZWJ, LRM, RLM, formatting marks, BOM
INVISIBLE_PATTERN = re.compile(
    r"[­​-‏‪-‮⁠-⁤⁪-⁯﻿]"
)

THRESHOLD_COUNT = 3  # 3+ invisíveis = suspeito


def _scan_text(text: str, source: str, page_num: int | None) -> list[Finding]:
    """Roda detecção em um trecho de texto."""
    if not text:
        return []
    matches = list(INVISIBLE_PATTERN.finditer(text))
    if len(matches) < THRESHOLD_COUNT:
        return []
    chars_found = sorted(set(m.group(0) for m in matches))
    codepoints = ", ".join(f"U+{ord(c):04X}" for c in chars_found)
    # Mostra o texto limpo (sem ZWC) pra Red entender o que estava escondido
    cleaned = INVISIBLE_PATTERN.sub("", text)
    return [
        Finding(
            technique=Technique.ZERO_WIDTH_CHARS,
            severity=Severity.HIGH,
            confidence=0.85,
            page=page_num,
            bbox=None,
            text_excerpt=f"[{source}] {cleaned[:200]}",
            reconstructed_command=cleaned,
            notes=f"{len(matches)} chars invisíveis · codepoints: {codepoints}",
        )
    ]


def detect_zero_width_chars(doc: fitz.Document) -> list[Finding]:
    """Detecta zero-width chars em: texto, anotações e metadados."""
    findings: list[Finding] = []

    # 1. Texto principal de cada página
    for page_num, page in enumerate(doc, start=1):
        text = page.get_text("text")
        findings.extend(_scan_text(text, "page text", page_num))

        # 2. Anotações (free text, comentários, popups)
        for annot in page.annots() or []:
            annot_text = (annot.info.get("content") or "") + " " + (annot.info.get("title") or "")
            findings.extend(_scan_text(annot_text, f"annotation", page_num))

    # 3. Metadados (já coberto por metadata detector, mas redundância de defesa)
    meta = doc.metadata or {}
    combined_meta = " ".join(str(v) for v in meta.values() if v)
    findings.extend(_scan_text(combined_meta, "metadata", None))

    return findings
