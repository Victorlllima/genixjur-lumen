"""Pipeline principal — orquestra todos os detectores."""

import hashlib
import os
import time
from datetime import datetime
from pathlib import Path

import fitz

from .detectors import (
    detect_white_text,
    detect_micro_font,
    detect_off_page,
    detect_zero_width_chars,
    detect_metadata_injection,
    detect_ocg_layers,
)
from .models import ScanReport
from .semantic import enrich_findings


def _sha256_of_file(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def scan(file_path: str, semantic: bool = False, api_key: str | None = None) -> ScanReport:
    """Roda todos os detectores no arquivo e devolve um relatório.

    Args:
        file_path: caminho do PDF a analisar
        semantic: se True, enriquece findings com classificação via Claude Haiku
        api_key: Anthropic API key (usa env ANTHROPIC_API_KEY se None)
    """
    path = Path(file_path).resolve()
    if not path.exists():
        raise FileNotFoundError(f"Arquivo não encontrado: {path}")

    start = time.perf_counter()
    doc = fitz.open(str(path))

    findings = []
    findings.extend(detect_white_text(doc))
    findings.extend(detect_micro_font(doc))
    findings.extend(detect_off_page(doc))
    findings.extend(detect_zero_width_chars(doc))
    findings.extend(detect_metadata_injection(doc))
    findings.extend(detect_ocg_layers(doc))

    if semantic and findings:
        enrich_findings(findings, api_key=api_key)

    duration_ms = int((time.perf_counter() - start) * 1000)

    report = ScanReport(
        file_path=str(path),
        sha256=_sha256_of_file(str(path)),
        file_size_bytes=os.path.getsize(path),
        page_count=doc.page_count,
        scanned_at=datetime.now().astimezone(),
        duration_ms=duration_ms,
        findings=findings,
    )
    doc.close()
    return report
