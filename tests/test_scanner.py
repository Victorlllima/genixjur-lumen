"""Testes do pipeline principal — scan() e ScanReport."""

import fitz
import pytest

from lumen_scanner.models import Severity
from lumen_scanner.scanner import scan


class TestScanPipeline:
    def test_clean_pdf_no_injection(self, pdf_clean):
        report = scan(str(pdf_clean))
        assert not report.has_injection
        assert report.overall_severity == Severity.INFO
        assert report.findings == []

    def test_white_text_pdf_has_injection(self, pdf_white_text):
        report = scan(str(pdf_white_text))
        assert report.has_injection
        assert report.overall_severity == Severity.CRITICAL

    def test_micro_font_pdf_has_injection(self, pdf_micro_font):
        report = scan(str(pdf_micro_font))
        assert report.has_injection
        assert report.overall_severity == Severity.CRITICAL

    def test_metadata_pdf_has_injection(self, pdf_metadata):
        report = scan(str(pdf_metadata))
        assert report.has_injection

    def test_report_has_sha256(self, pdf_clean):
        report = scan(str(pdf_clean))
        assert len(report.sha256) == 64
        assert all(c in "0123456789abcdef" for c in report.sha256)

    def test_report_has_page_count(self, pdf_clean):
        report = scan(str(pdf_clean))
        assert report.page_count >= 1

    def test_report_duration_ms_positive(self, pdf_clean):
        report = scan(str(pdf_clean))
        assert report.duration_ms >= 0

    def test_report_to_dict_structure(self, pdf_clean):
        report = scan(str(pdf_clean))
        d = report.to_dict()
        required_keys = {
            "file_path", "sha256", "file_size_bytes", "page_count",
            "scanned_at", "duration_ms", "has_injection", "overall_severity", "findings",
        }
        assert required_keys.issubset(d.keys())

    def test_finding_to_dict_structure(self, pdf_white_text):
        report = scan(str(pdf_white_text))
        assert report.findings
        d = report.findings[0].to_dict()
        required_keys = {"technique", "severity", "confidence", "page", "bbox",
                         "text_excerpt", "reconstructed_command", "notes"}
        assert required_keys.issubset(d.keys())

    def test_file_not_found_raises(self, tmp_path):
        with pytest.raises(FileNotFoundError):
            scan(str(tmp_path / "inexistente.pdf"))

    def test_scan_returns_scan_report(self, pdf_clean):
        from lumen_scanner.models import ScanReport
        report = scan(str(pdf_clean))
        assert isinstance(report, ScanReport)

    def test_all_fixtures(self, fixtures_dir):
        """Smoke test em todos os fixtures — nenhum deve lançar exceção."""
        pdfs = list(fixtures_dir.glob("*.pdf"))
        # Exclui pareceres gerados pelos testes
        pdfs = [p for p in pdfs if not p.name.startswith("parecer")]
        assert len(pdfs) >= 7, f"Esperado ≥7 fixtures, encontrei {len(pdfs)}: {[p.name for p in pdfs]}"
        for pdf_path in sorted(pdfs):
            report = scan(str(pdf_path))
            assert report.sha256  # Sem exceção e com hash válido


class TestScanReportProperties:
    def test_has_injection_true_for_critical(self, pdf_white_text):
        report = scan(str(pdf_white_text))
        assert report.has_injection is True

    def test_has_injection_false_for_info(self, pdf_clean):
        report = scan(str(pdf_clean))
        assert report.has_injection is False

    def test_overall_severity_worst_wins(self, pdf_white_text):
        """Severidade geral = pior severidade dentre os findings."""
        report = scan(str(pdf_white_text))
        assert report.overall_severity == Severity.CRITICAL

    def test_file_size_bytes_positive(self, pdf_clean):
        report = scan(str(pdf_clean))
        assert report.file_size_bytes > 0
