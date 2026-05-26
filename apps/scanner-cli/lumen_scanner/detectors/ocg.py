"""Detector de Optional Content Groups (camadas ocultas do PDF)."""

import fitz

from ..models import Finding, Severity, Technique


def detect_ocg_layers(doc: fitz.Document) -> list[Finding]:
    """Detecta OCGs (camadas) ocultas ou marcadas como não-visíveis por padrão."""
    findings: list[Finding] = []

    try:
        ocgs = doc.get_ocgs()
    except Exception:
        return findings

    if not ocgs:
        return findings

    for xref, info in ocgs.items():
        name = info.get("name", f"OCG#{xref}")
        on = info.get("on", True)
        usage = info.get("usage", "")

        if not on or "hidden" in str(usage).lower():
            findings.append(
                Finding(
                    technique=Technique.OCG_LAYER,
                    severity=Severity.MEDIUM,
                    confidence=0.75,
                    page=None,
                    bbox=None,
                    text_excerpt=f"OCG '{name}' (xref {xref})",
                    reconstructed_command=f"Camada oculta: {name}",
                    notes=f"on={on}, usage={usage}. Camadas ocultas em PDFs jurídicos são incomuns e podem conter payload.",
                )
            )
    return findings
