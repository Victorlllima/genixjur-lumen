"""Modelos compartilhados entre detectores."""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum


class Severity(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    INFO = "INFO"


class Technique(str, Enum):
    WHITE_TEXT = "white_text"
    MICRO_FONT = "micro_font"
    OFF_PAGE = "off_page"
    ZERO_WIDTH_CHARS = "zero_width_chars"
    METADATA = "metadata"
    OCG_LAYER = "ocg_layer"


@dataclass
class Finding:
    technique: Technique
    severity: Severity
    confidence: float  # 0.0 a 1.0
    page: int | None
    bbox: tuple[float, float, float, float] | None
    text_excerpt: str
    reconstructed_command: str
    notes: str = ""
    # Campos preenchidos pela camada semântica (opcional)
    semantic_verdict: str | None = None        # injection | watermark_legitimo | falso_positivo
    semantic_confidence: float | None = None
    semantic_reasoning: str | None = None

    def to_dict(self) -> dict:
        d = {
            "technique": self.technique.value,
            "severity": self.severity.value,
            "confidence": self.confidence,
            "page": self.page,
            "bbox": list(self.bbox) if self.bbox else None,
            "text_excerpt": self.text_excerpt,
            "reconstructed_command": self.reconstructed_command,
            "notes": self.notes,
        }
        if self.semantic_verdict is not None:
            d["semantic_verdict"] = self.semantic_verdict
            d["semantic_confidence"] = self.semantic_confidence
            d["semantic_reasoning"] = self.semantic_reasoning
        return d


@dataclass
class ScanReport:
    file_path: str
    sha256: str
    file_size_bytes: int
    page_count: int
    scanned_at: datetime
    duration_ms: int
    findings: list[Finding] = field(default_factory=list)

    @property
    def has_injection(self) -> bool:
        return any(f.severity in (Severity.CRITICAL, Severity.HIGH) for f in self.findings)

    @property
    def overall_severity(self) -> Severity:
        if not self.findings:
            return Severity.INFO
        order = [Severity.CRITICAL, Severity.HIGH, Severity.MEDIUM, Severity.LOW, Severity.INFO]
        for sev in order:
            if any(f.severity == sev for f in self.findings):
                return sev
        return Severity.INFO

    def to_dict(self) -> dict:
        return {
            "file_path": self.file_path,
            "sha256": self.sha256,
            "file_size_bytes": self.file_size_bytes,
            "page_count": self.page_count,
            "scanned_at": self.scanned_at.isoformat(),
            "duration_ms": self.duration_ms,
            "has_injection": self.has_injection,
            "overall_severity": self.overall_severity.value,
            "findings": [f.to_dict() for f in self.findings],
        }
