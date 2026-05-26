"""Detector de injection em metadados do PDF."""

import re

import fitz

from ..models import Finding, Severity, Technique

# Padrões que sugerem instrução direcionada a IA
SUSPICIOUS_PATTERNS = [
    r"\b(ignore|ignor[ae])\b.*(instru[çc][ãa]o|coman?do|prompt)",
    r"\b(aten[çc][ãa]o|attention)\s+(ia|ai|gpt|claude|gemini)",
    r"\b(responda|reply|answer)\b.*(favor[áa]vel|positivo|aprovar)",
    r"\bn[ãa]o\s+(impugne|conteste|mencione)",
    r"\b(system|sistema):\s+",
    r"\bvoc[êe]\s+(deve|tem que|precisa)\b.*(ignorar|responder|aprovar)",
]

COMBINED = re.compile("|".join(SUSPICIOUS_PATTERNS), re.IGNORECASE)

METADATA_FIELDS = ["title", "author", "subject", "keywords", "producer", "creator"]


def detect_metadata_injection(doc: fitz.Document) -> list[Finding]:
    """Detecta padrões de injection nos metadados do PDF."""
    findings: list[Finding] = []
    meta = doc.metadata or {}

    for field in METADATA_FIELDS:
        value = meta.get(field) or ""
        if not value:
            continue
        if COMBINED.search(value):
            findings.append(
                Finding(
                    technique=Technique.METADATA,
                    severity=Severity.HIGH,
                    confidence=0.88,
                    page=None,
                    bbox=None,
                    text_excerpt=f"/{field.capitalize()}: {value[:200]}",
                    reconstructed_command=value,
                    notes=f"Campo {field} contém padrão de instrução para IA",
                )
            )
    return findings
